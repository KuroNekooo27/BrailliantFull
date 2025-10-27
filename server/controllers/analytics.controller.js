const mongoose = require('mongoose');
const BookRead = require('../models/book_read.model');
const Student = require("../models/students.model");
const Section = require("../models/section.model");
require("dotenv").config();

const getReadsPerSection = async (req, res) => {
    try {
        const userId = req.params.id;
        const result = await BookRead.aggregate([
            {
                $lookup: {
                    from: 'students',
                    localField: 'book_read_student_id',
                    foreignField: '_id',
                    as: 'student'
                }
            },
            { $unwind: '$student' },

            {
                $lookup: {
                    from: 'sections',
                    localField: 'student.student_section',
                    foreignField: '_id',
                    as: 'section'
                }
            },
            { $unwind: '$section' },

            {
                $match: {
                    'section.section_instructor': new mongoose.Types.ObjectId(userId)
                }
            },

            {
                $group: {
                    _id: '$section._id',
                    sectionName: { $first: '$section.section_name' },
                    totalReads: { $sum: 1 }
                }
            },

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
                    _id: "$book_read_title",  
                    book_count: { $sum: 1 },
                    avg_time: { $avg: "$book_read_time_elapsed" }
                }
            },
            {
                $lookup: {
                    from: "books",
                    localField: "_id",       
                    foreignField: "book_title", 
                    as: "book"
                }
            },
            { $unwind: "$book" }, 
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
            {
                $match: {
                    section_instructor: new mongoose.Types.ObjectId(userId),
                },
            },

            {
                $lookup: {
                    from: "students",
                    localField: "_id",
                    foreignField: "student_section",
                    as: "students",
                },
            },

            {
                $lookup: {
                    from: "bookreads",
                    localField: "students._id",
                    foreignField: "book_read_student_id",
                    as: "reads",
                },
            },

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

            {
                $group: {
                    _id: null,
                    avgParticipation: { $avg: "$participation_rate" },
                },
            },

            {
                $project: {
                    _id: 0,
                    avgParticipation: { $round: ["$avgParticipation", 2] }, 
                },
            },
        ]);

        res.json(result.length > 0 ? result[0].avgParticipation : 0);
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
};


const formatTime = (secs) => {
    secs = Math.floor(secs); 
    const h = String(Math.floor(secs / 3600)).padStart(2, "0");
    const m = String(Math.floor((secs % 3600) / 60)).padStart(2, "0");
    const s = String(secs % 60).padStart(2, "0");
    return `${h}:${m}:${s}`;
};



const summarizeBookProgress = async (req, res) => {
    try {
        const { student_id } = req.body;

        if (!student_id) {
            return res.status(400).json({ error: "No student_id provided" });
        }

        const student = await Student.findById(student_id);
        if (!student) {
            return res.status(404).json({ error: "Student not found" });
        }

        const bookReads = await BookRead.find({
            book_read_student_id: new mongoose.Types.ObjectId(student_id),
        }).sort({ book_read_date: 1 });

        if (!bookReads.length) {
            return res.status(404).json({ error: "No reading data found for this student" });
        }

        const times = bookReads.map(r => r.book_read_time_elapsed);
        const totalTime = times.reduce((a, b) => a + b, 0);
        const avgTime = totalTime / times.length;

        let trendMessage = "Performance data is not available.";
        if (times.length === 1) {
            trendMessage = "This is the student's first recorded book, no trend can be determined yet.";
        } else {
            const first = times[0];
            const last = times[times.length - 1];

            if (last < first) {
                trendMessage = "The student is improving — reading faster over time.";
            } else if (last > first) {
                trendMessage = "The student is struggling — reading is taking longer over time.";
            } else {
                trendMessage = "The student's performance is stable.";
            }
        }

        const summary = `
The student has read ${bookReads.length} book(s). \n
Total reading time: ${formatTime(totalTime)} \n
Average reading time per book: ${formatTime(avgTime)} \n
${trendMessage}
        `.trim();

        student.student_analytics = summary;
        await student.save();

        return res.json({
            status: "ok",
            student_id,
            summary,
            saved_in: "student.student_analytics"
        });
    } catch (error) {
        console.error("Error analyzing book progress:", error.message);
        return res.status(500).json({
            error: "Failed to analyze book progress",
            details: error.message,
        });
    }
};








module.exports = { getReadsPerSection, getTopBooksWithAvgTime, getSectionParticipation, summarizeBookProgress };
