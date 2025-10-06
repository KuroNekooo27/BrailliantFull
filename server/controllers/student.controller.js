const Student = require("../models/students.model")
const mongoose = require('mongoose');
const BookRead = require("../models/book_read.model")


const testconnection = (req, res) => {
    res.json({ status: "Okay connection" })
}

const findAllStudent = (req, res) => {
    Student.find()
        .then((allStudents) => {
            res.json({ students: allStudents })
        })
        .catch((err) => {
            res.json({ message: 'Something went wrong', err })
        })
}

const deleteBookReadWithMissingStudents = async (req, res) => {
    try {
        // Step 1: Get all existing student _ids
        const allStudents = await Student.find({}, '_id');
        const studentIds = allStudents.map(student => student._id.toString());

        // Step 2: Get all BookRead records
        const allBookReads = await BookRead.find({}, 'book_read_student_id');
        const bookReadIds = allBookReads.map(book => book.book_read_student_id.toString());

        // Step 3: Identify bookRead records with student IDs not existing in Student
        const invalidBookReadIds = bookReadIds.filter(id => !studentIds.includes(id));

        if (invalidBookReadIds.length === 0) {
            return res.json({ message: 'No invalid BookRead records found.' });
        }

        // Step 4: Delete BookRead records with invalid student references
        const result = await BookRead.deleteMany({
            book_read_student_id: { $in: invalidBookReadIds }
        });

        res.json({
            message: 'Deleted BookRead records with missing students.',
            deletedCount: result.deletedCount,
            invalidStudentIds: invalidBookReadIds
        });
    } catch (err) {
        console.error('Error deleting invalid BookRead records:', err);
        res.status(500).json({ message: 'Error deleting invalid BookRead records', error: err });
    }
};

const findStudentByName = (req, res) => {
    Student.findOne({ name: req.params.namex })
        .then((theStudent) => {
            res.json({ student: theStudent })
        })
        .catch((err) => {
            res.json({ message: 'Something went wrong', err })
        })
}

const findStudentById = (req, res) => {
    Student.findOne({ _id: req.params.id })
        .then((theStudent) => {
            res.json({ student: theStudent })
        })
        .catch((err) => {
            res.json({ message: 'Something went wrong', err })
        })
}

const findStudentByTeacher = (req, res) => {
    Student.find({ student_instructor: req.params.namex })
        .then((theStudent) => {
            res.json({ students: theStudent })
        })
        .catch((err) => {
            res.json({ message: 'Something went wrong', err })
        })
}

const findStudentsBySection = (req, res) => {
    Student.find({ student_section: req.params.namex })
        .then((theStudent) => {
            res.json({ students: theStudent })
        })
        .catch((err) => {
            res.json({ message: 'Something went wrong', err })
        })
}

const calculateAge = (dob) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }

    return age;
};

const generateUniqueStudentId = async () => {
    const year = new Date().getFullYear();
    let studentId;
    let exists = true;

    while (exists) {
        const randomDigits = Math.floor(100000 + Math.random() * 900000); // 6 digits
        studentId = `${year}-${randomDigits}`;
        const existingStudent = await Student.findOne({ student_id: studentId });
        exists = !!existingStudent;
    }

    return studentId;
};

const createStudent = async (req, res) => {
    try {
        const studentDob = new Date(req.body.student_dob);
        const studentAge = calculateAge(studentDob);

        const studentId = await generateUniqueStudentId();

        const studentData = {
            ...req.body,
            student_id: studentId,
            student_dob: studentDob,
            student_age: studentAge,
            student_section: new mongoose.Types.ObjectId(req.body.student_section),
            student_instructor: new mongoose.Types.ObjectId(req.body.student_instructor)
        };

        const newStudent = await Student.create(studentData);
        res.json({ student: newStudent, status: 'Okay' });

    } catch (error) {
        console.error("Error creating student:", error);
        res.status(500).json({ message: 'Something went wrong with creating student', error });
    }
};

const updateStudent = (req, res) => {
    Student.findByIdAndUpdate(
        { _id: req.params.id },
        req.body,
        { new: true, runValidators: true })
        .then((updatedStudent) => {
            res.json({ student: updatedStudent, status: 'Updated Successfuly' })
        })
        .catch((err) => {
            res.json({ message: 'Something went wrong with creating', err })
        })
}

const deleteStudent = (req, res) => {
    Student.findByIdAndDelete({ _id: req.params.id })
        .then((result) => {
            res.json({ useRef: result, status: 'Deleted Successfuly' })
        })
        .catch((err) => {
            res.json({ message: 'Something went wrong with creating', err })
        })
    BookRead.findById({ book_read_student_id: req.params.id })
        .then((result) => {
            res.json({ useRef: result, status: 'Deleted Successfuly' })
        })
        .catch((err) => {
            res.json({ message: 'Something went wrong with creating', err })
        })
}

const deleteStudentBySection = (req, res) => {

    Student.deleteMany({ student_section: new mongoose.Types.ObjectId(req.params.namex) })
        .then((result) => {
            res.json({ result, status: 'Deleted Successfully', eto: req.params.namex });
        })
        .catch((err) => {
            res.status(500).json({ message: 'Something went wrong with deleting students', err });
        });
};

const getStudentCount = async (req, res) => {
    try {
        const count = await Student.countDocuments();
        res.json({ count });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = { findAllStudent, testconnection, createStudent, updateStudent, deleteStudent, findStudentByName, getStudentCount, deleteStudentBySection, findStudentByTeacher, findStudentsBySection, findStudentById, deleteBookReadWithMissingStudents}