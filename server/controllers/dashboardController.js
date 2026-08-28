
const User = require("../models/User");
const Student = require("../models/Student");
const ClassSubject = require("../models/ClassSubject");
const AttendanceRecord = require("../models/AttendanceRecord");

const getStudentDashboard = async (req, res) => {
    try {
        const institutionId = req.user.institutionId;
        const userId = req.user.userId;

        // Find student profile
        const student = await Student.findOne({
            userId,
            institutionId,
            status: "active"
        })
            .populate("userId", "name email phone")
            .populate(
                "classId",
                "name section academicYear"
            );

        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student profile not found"
            });
        }

        // Get subjects assigned to student's class
        const classSubjects = await ClassSubject.find({
            institutionId,
            classId: student.classId._id,
            isActive: true
        })
            .populate("subjectId", "name code")
            .populate({
                path: "teacherId",
                populate: {
                    path: "userId",
                    select: "name email"
                }
            });

        // Attendance
        const attendanceRecords =
            await AttendanceRecord.find({
                institutionId,
                studentId: student._id
            });

        const totalClasses = attendanceRecords.length;

        const present = attendanceRecords.filter(
            record => record.status === "present"
        ).length;

        const absent = attendanceRecords.filter(
            record => record.status === "absent"
        ).length;

        const late = attendanceRecords.filter(
            record => record.status === "late"
        ).length;

        const attendancePercentage =
            totalClasses > 0
                ? ((present + late) / totalClasses) * 100
                : 0;

        return res.status(200).json({
            success: true,

            student: {
                id: student._id,
                name: student.userId.name,
                email: student.userId.email,
                phone: student.userId.phone,
                class: student.classId
            },

            subjects: classSubjects.map(item => ({
                id: item.subjectId._id,
                name: item.subjectId.name,
                code: item.subjectId.code,
                teacher: item.teacherId?.userId?.name || null
            })),

            attendance: {
                totalClasses,
                present,
                absent,
                late,
                percentage: Number(
                    attendancePercentage.toFixed(2)
                )
            }
        });

    } catch (error) {
        console.error(
            "Student dashboard error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Server error while loading dashboard"
        });
    }
};

const Parent = require("../models/Parent");

const getParentDashboard = async (req, res) => {
    try {
        const institutionId = req.user.institutionId;
        const userId = req.user.userId;

        const parent = await Parent.findOne({
            userId,
            institutionId,
            status: "active"
        }).populate(
            "userId",
            "name email phone"
        );

        if (!parent) {
            return res.status(404).json({
                success: false,
                message: "Parent profile not found"
            });
        }

        const children = await Student.find({
            institutionId,
            parentId: userId,
            status: "active"
        })
            .populate(
                "userId",
                "name email phone"
            )
            .populate(
                "classId",
                "name section academicYear"
            );

        return res.status(200).json({
            success: true,

            parent: {
                id: parent._id,
                name: parent.userId.name,
                email: parent.userId.email,
                phone: parent.userId.phone
            },

            children: children.map(child => ({
                id: child._id,
                name: child.userId.name,
                email: child.userId.email,
                class: child.classId
            }))
        });

    } catch (error) {
        console.error(
            "Parent dashboard error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Server error while loading dashboard"
        });
    }
};

const Teacher = require("../models/Teacher");

const getTeacherDashboard = async (req, res) => {
    try {
        const institutionId = req.user.institutionId;
        const userId = req.user.userId;

        const teacher = await Teacher.findOne({
            userId,
            institutionId,
            status: "active"
        }).populate(
            "userId",
            "name email phone"
        );

        if (!teacher) {
            return res.status(404).json({
                success: false,
                message: "Teacher profile not found"
            });
        }

        const assignments = await ClassSubject.find({
            institutionId,
            teacherId: teacher._id,
            isActive: true
        })
            .populate(
                "classId",
                "name section academicYear"
            )
            .populate(
                "subjectId",
                "name code"
            );

        return res.status(200).json({
            success: true,

            teacher: {
                id: teacher._id,
                name: teacher.userId.name,
                email: teacher.userId.email,
                phone: teacher.userId.phone
            },

            assignments: assignments.map(item => ({
                id: item._id,

                class: item.classId,

                subject: item.subjectId
            }))
        });

    } catch (error) {
        console.error(
            "Teacher dashboard error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Server error while loading dashboard"
        });
    }
};

module.exports = {
    getStudentDashboard,
    getParentDashboard,
    getTeacherDashboard
};