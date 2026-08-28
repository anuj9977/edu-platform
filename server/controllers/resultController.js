const Student = require("../models/Student");
const User = require("../models/User");
const ExamSubject = require("../models/ExamSubject");
const StudentMark = require("../models/StudentMark");
const ClassSubject = require("../models/ClassSubject");
const Exam = require("../models/Exam");
const Subject = require("../models/Subject");

const getStudentResult = async (req, res) => {
    try {
        const { studentId } = req.params;
        const { examId } = req.query;

        const institutionId = req.user.institutionId;

        if (!examId) {
            return res.status(400).json({
                success: false,
                message: "Exam ID is required"
            });
        }

        // 1. Find student
        const student = await Student.findOne({
            _id: studentId,
            institutionId
        })
            .populate("userId", "name email")
            .populate("classId", "name section academicYear");

        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student not found"
            });
        }

        // 2. Find exam
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

        // 3. Find all subjects configured for student's class
        const examSubjects = await ExamSubject.find({
            examId,
            institutionId
        }).populate({
            path: "classSubjectId",
            populate: {
                path: "subjectId",
                select: "name code"
            }
        });

        // 4. Find student's marks
        const marks = await StudentMark.find({
            studentId,
            institutionId,
            examSubjectId: {
                $in: examSubjects.map(item => item._id)
            }
        });

        // Convert marks into quick lookup
        const marksMap = new Map();

        marks.forEach(mark => {
            marksMap.set(
                mark.examSubjectId.toString(),
                mark
            );
        });

        // 5. Build subject-wise result
        const subjects = [];

        let totalMarks = 0;
        let obtainedMarks = 0;
        let hasFailedSubject = false;

        for (const examSubject of examSubjects) {
            const mark = marksMap.get(
                examSubject._id.toString()
            );

            const classSubject = examSubject.classSubjectId;

            if (!classSubject || !classSubject.subjectId) {
                continue;
            }

            const subject = classSubject.subjectId;

            const marksObtained = mark
                ? mark.marksObtained
                : 0;

            const percentage =
                (marksObtained / examSubject.maxMarks) * 100;

            const passed =
                mark &&
                mark.status === "present" &&
                marksObtained >= examSubject.passingMarks;

            if (!passed) {
                hasFailedSubject = true;
            }

            totalMarks += examSubject.maxMarks;
            obtainedMarks += marksObtained;

            subjects.push({
                subject: {
                    id: subject._id,
                    name: subject.name,
                    code: subject.code
                },

                marksObtained,

                maxMarks: examSubject.maxMarks,

                passingMarks: examSubject.passingMarks,

                percentage: Number(
                    percentage.toFixed(2)
                ),

                status: mark
                    ? mark.status
                    : "not_appeared",

                result: passed ? "PASS" : "FAIL",

                remarks: mark
                    ? mark.remarks
                    : null
            });
        }

        // 6. Overall percentage
        const overallPercentage =
            totalMarks > 0
                ? (obtainedMarks / totalMarks) * 100
                : 0;

        const overallResult =
            !hasFailedSubject &&
            subjects.length > 0 &&
            subjects.every(
                subject => subject.status === "present"
            )
                ? "PASS"
                : "FAIL";

        // 7. Final response
        return res.status(200).json({
            success: true,

            student: {
                id: student._id,
                name: student.userId.name,
                email: student.userId.email,
                class: student.classId
            },

            exam: {
                id: exam._id,
                name: exam.name,
                academicYear: exam.academicYear,
                startDate: exam.startDate,
                endDate: exam.endDate
            },

            subjects,

            summary: {
                totalMarks,
                obtainedMarks,
                percentage: Number(
                    overallPercentage.toFixed(2)
                ),
                result: overallResult
            }
        });

    } catch (error) {
        console.error("Get student result error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error while generating result"
        });
    }
};

module.exports = {
    getStudentResult
};