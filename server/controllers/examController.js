const Exam = require("../models/Exam");
const ExamSubject = require("../models/ExamSubject");
const ClassSubject = require("../models/ClassSubject");

const createExam = async (req, res) => {
    try {
        const {
            name,
            academicYear,
            startDate,
            endDate
        } = req.body;

        if (!name || !academicYear || !startDate || !endDate) {
            return res.status(400).json({
                success: false,
                message: "Name, academic year, start date and end date are required"
            });
        }

        if (new Date(startDate) > new Date(endDate)) {
            return res.status(400).json({
                success: false,
                message: "Start date cannot be after end date"
            });
        }

        const institutionId = req.user.institutionId;

        const existingExam = await Exam.findOne({
            institutionId,
            name,
            academicYear
        });

        if (existingExam) {
            return res.status(400).json({
                success: false,
                message: "Exam already exists for this academic year"
            });
        }

        const exam = await Exam.create({
            institutionId,
            name,
            academicYear,
            startDate,
            endDate
        });

        return res.status(201).json({
            success: true,
            message: "Exam created successfully",
            exam
        });

    } catch (error) {
        console.error("Create exam error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error while creating exam"
        });
    }
};

const addSubjectToExam = async (req, res) => {
    try {
        const { examId } = req.params;

        const {
            classSubjectId,
            maxMarks,
            passingMarks
        } = req.body;

        const institutionId = req.user.institutionId;

        if (
            !classSubjectId ||
            maxMarks === undefined ||
            passingMarks === undefined
        ) {
            return res.status(400).json({
                success: false,
                message: "Class subject, max marks and passing marks are required"
            });
        }

        if (maxMarks <= 0 || passingMarks < 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid marks configuration"
            });
        }

        if (passingMarks > maxMarks) {
            return res.status(400).json({
                success: false,
                message: "Passing marks cannot be greater than maximum marks"
            });
        }

        // Verify exam
        const exam = await Exam.findOne({
            _id: examId,
            institutionId,
            isActive: true
        });

        if (!exam) {
            return res.status(404).json({
                success: false,
                message: "Exam not found"
            });
        }

        // Verify class-subject assignment
        const classSubject = await ClassSubject.findOne({
            _id: classSubjectId,
            institutionId,
            isActive: true
        });

        if (!classSubject) {
            return res.status(404).json({
                success: false,
                message: "Class subject assignment not found"
            });
        }

        // Check duplicate
        const existingExamSubject = await ExamSubject.findOne({
            institutionId,
            examId,
            classSubjectId
        });

        if (existingExamSubject) {
            return res.status(400).json({
                success: false,
                message: "This subject is already added to the exam"
            });
        }

        const examSubject = await ExamSubject.create({
            institutionId,
            examId,
            classSubjectId,
            maxMarks,
            passingMarks
        });

        return res.status(201).json({
            success: true,
            message: "Subject added to exam successfully",
            examSubject
        });

    } catch (error) {
        console.error("Add subject to exam error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error while adding subject to exam"
        });
    }
};

module.exports = {
    createExam,
    addSubjectToExam
};