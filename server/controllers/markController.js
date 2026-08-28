const StudentMark = require("../models/StudentMark");
const Student = require("../models/Student");
const ExamSubject = require("../models/ExamSubject");
const ClassSubject = require("../models/ClassSubject");
const Exam = require("../models/Exam");

const createStudentMark = async (req, res) => {
    try {
        const {
            examSubjectId,
            studentId,
            marksObtained,
            remarks,
            status
        } = req.body;

        const institutionId = req.user.institutionId;

        // 1. Validate required fields
        if (
            !examSubjectId ||
            !studentId ||
            marksObtained === undefined
        ) {
            return res.status(400).json({
                success: false,
                message: "Exam subject, student and marks are required"
            });
        }

        // 2. Find exam subject
        const examSubject = await ExamSubject.findOne({
            _id: examSubjectId,
            institutionId
        });

        if (!examSubject) {
            return res.status(404).json({
                success: false,
                message: "Exam subject not found"
            });
        }

        // 3. Find exam
        const exam = await Exam.findOne({
            _id: examSubject.examId,
            institutionId,
            isActive: true
        });

        if (!exam) {
            return res.status(404).json({
                success: false,
                message: "Exam not found"
            });
        }

        // 4. Find student
        const student = await Student.findOne({
            _id: studentId,
            institutionId,
            status: "active"
        });

        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student not found"
            });
        }

        // 5. Find class-subject assignment
        const classSubject = await ClassSubject.findOne({
            _id: examSubject.classSubjectId,
            institutionId,
            isActive: true
        });

        if (!classSubject) {
            return res.status(404).json({
                success: false,
                message: "Class subject assignment not found"
            });
        }

        // 6. Verify student belongs to same class
        if (
            !student.classId ||
            student.classId.toString() !==
            classSubject.classId.toString()
        ) {
            return res.status(400).json({
                success: false,
                message: "Student does not belong to this class"
            });
        }

        // 7. Validate marks
        if (
            marksObtained < 0 ||
            marksObtained > examSubject.maxMarks
        ) {
            return res.status(400).json({
                success: false,
                message: `Marks must be between 0 and ${examSubject.maxMarks}`
            });
        }

        // 8. Check duplicate
        const existingMark = await StudentMark.findOne({
            institutionId,
            examSubjectId,
            studentId
        });

        if (existingMark) {
            return res.status(400).json({
                success: false,
                message: "Marks already entered for this student"
            });
        }

        // 9. Create marks
        const studentMark = await StudentMark.create({
            institutionId,
            examSubjectId,
            studentId,
            marksObtained,
            remarks,
            status: status || "present"
        });

        return res.status(201).json({
            success: true,
            message: "Student marks added successfully",
            studentMark
        });

    } catch (error) {
        console.error("Create student mark error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error while adding student marks"
        });
    }
};

module.exports = {
    createStudentMark
};