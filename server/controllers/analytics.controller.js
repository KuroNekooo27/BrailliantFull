const mongoose = require('mongoose');
const BookRead = require('../models/book_read.model');
const Student = require("../models/students.model");
const Section = require("../models/section.model");
require("dotenv").config();

const getReadsPerSection = async (req, res) => {
    try {
        const userId = req.params.id; // <-- passed from route
        const result = await BookRead.aggregate([
            // Join BookRead → Student
            {
                $lookup: {
                    from: 'students',
                    localField: 'book_read_student_id',
                    foreignField: '_id',
                    as: 'student'
                }
            },
            { $unwind: '$student' },

            // Join Student → Section
            {
                $lookup: {
                    from: 'sections',
                    localField: 'student.student_section',
                    foreignField: '_id',
                    as: 'section'
                }
            },
            { $unwind: '$section' },

            // ✅ Filter by section_instructor = userId
            {
                $match: {
                    'section.section_instructor': new mongoose.Types.ObjectId(userId)
                }
            },

            // Group by section
            {
                $group: {
                    _id: '$section._id',
                    sectionName: { $first: '$section.section_name' },
                    totalReads: { $sum: 1 }
                }
            },

            // Sort descending by reads
            { $sort: { totalReads: -1 } }
        ]);

        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};


const getTopBooksWithAvgTime = async (req, res) => {
    try {
        const result = await BookRead.aggregate([
            {
                $group: {
                    _id: "$book_read_title",  // group by title string
                    book_count: { $sum: 1 },
                    avg_time: { $avg: "$book_read_time_elapsed" }
                }
            },
            {
                $lookup: {
                    from: "books",
                    localField: "_id",        // the grouped title
                    foreignField: "book_title", // match against Book.book_title
                    as: "book"
                }
            },
            { $unwind: "$book" },  // ensures only existing books remain
            { $sort: { book_count: -1 } },
            { $limit: 5 },
            {
                $project: {
                    _id: 0,
                    book_id: "$book._id",
                    book_title: "$book.book_title",
                    book_count: 1,
                    avg_time: 1
                }
            }
        ]);

        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
};




const getSectionParticipation = async (req, res) => {
    try {
        const userId = req.params.id;

        const result = await Section.aggregate([
            // 1. Match sections owned by this instructor
            {
                $match: {
                    section_instructor: new mongoose.Types.ObjectId(userId),
                },
            },

            // 2. Attach students
            {
                $lookup: {
                    from: "students",
                    localField: "_id",
                    foreignField: "student_section",
                    as: "students",
                },
            },

            // 3. Attach reads
            {
                $lookup: {
                    from: "bookreads",
                    localField: "students._id",
                    foreignField: "book_read_student_id",
                    as: "reads",
                },
            },

            // 4. Calculate participation per section
            {
                $project: {
                    section_name: 1,
                    total_students: { $size: "$students" },
                    participated_students: {
                        $size: {
                            $setIntersection: ["$students._id", "$reads.book_read_student_id"],
                        },
                    },
                },
            },
            {
                $addFields: {
                    participation_rate: {
                        $cond: [
                            { $eq: ["$total_students", 0] },
                            0,
                            {
                                $multiply: [
                                    { $divide: ["$participated_students", "$total_students"] },
                                    100,
                                ],
                            },
                        ],
                    },
                },
            },

            // 5. Average across all sections
            {
                $group: {
                    _id: null,
                    avgParticipation: { $avg: "$participation_rate" },
                },
            },

            // 6. Return just the number (not an array)
            {
                $project: {
                    _id: 0,
                    avgParticipation: { $round: ["$avgParticipation", 2] }, // round to 2 decimals
                },
            },
        ]);

        // Send single number instead of array
        res.json(result.length > 0 ? result[0].avgParticipation : 0);
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
};


const axios = require('axios');

const HF_API_URL = "https://api-inference.huggingface.co/models/facebook/bart-large-cnn";
const HF_API_KEY = process.env.HF_API_TOKEN;

const summarizeBookProgress = async (req, res) => {
    try {
        const { student_id } = req.body;

        if (!student_id) {
            return res.status(400).json({ error: "No student_id provided" });
        }

        // 1️⃣ Fetch all reading records for the student
        const bookReads = await BookRead.find({
            book_read_student_id: new mongoose.Types.ObjectId(student_id),
        });

        if (!bookReads.length) {
            return res.status(404).json({ error: "No reading data found for this student" });
        }

        // 2️⃣ Format the data into readable text
        const data = bookReads
            .map(
                (r, idx) =>
                    `Book ${idx + 1}: "${r.book_read_title}" - Time Elapsed: ${r.book_read_time_elapsed} seconds - Date: ${r.book_read_date || "N/A"}`
            )
            .join("\n");

        // 3️⃣ Build the prompt
        const prompt = `Donlad Trump Found Dead `;

        console.log("Final prompt being sent to HF:", prompt);

        // 4️⃣ Send to Hugging Face Inference API
        const response = await axios.post(
            HF_API_URL,
            { inputs: prompt },
            {
                headers: {
                    Authorization: `Bearer ${HF_API_KEY}`,
                    "Content-Type": "application/json",
                },
            }
        );

        console.log("HF response:", response.data);

        // 5️⃣ Extract summary (bart-large-cnn returns summary_text)
        if (Array.isArray(response.data) && response.data[0]?.summary_text) {
            return res.json({
                status: "ok",
                student_id,
                original: data,
                summary: response.data[0].summary_text,
            });
        } else {
            return res.status(500).json({
                error: "Unexpected response from Hugging Face",
                details: response.data,
            });
        }
    } catch (error) {
        console.error("Error summarizing:", error.response?.data || error.message);
        return res.status(500).json({
            error: "Failed to summarize",
            details: error.response?.data || error.message,
        });
    }
};








module.exports = { getReadsPerSection, getTopBooksWithAvgTime, getSectionParticipation, summarizeBookProgress };
