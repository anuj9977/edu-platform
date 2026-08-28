const AttendanceSession = require("../models/AttendanceSession");
const AttendanceRecord = require("../models/AttendanceRecord");
const ClassSubject = require("../models/ClassSubject");
const Student = require("../models/Student");

const createAttendanceSession = async (req, res) => {
    try {
        const {
            classSubjectId,
            date,
            sessionType,
            remarks
        } = req.body;

        const institutionId = req.user.institutionId;

        if (!classSubjectId || !date) {
            return res.status(400).json({
                success: false,
                message: "Class subject and date are required"
            });
        }

        // Verify class-subject
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

        // Check duplicate session
        const existingSession = await AttendanceSession.findOne({
            institutionId,
            classSubjectId,
            date: new Date(date)
        });

        if (existingSession) {
            return res.status(400).json({
                success: false,
                message: "Attendance session already exists for this date"
            });
        }

        const session = await AttendanceSession.create({
            institutionId,
            classSubjectId,
            date: new Date(date),
            sessionType: sessionType || "regular",
            remarks,
            createdBy: req.user.userId
        });

        return res.status(201).json({
            success: true,
            message: "Attendance session created successfully",
            session
        });

    } catch (error) {
        console.error(
            "Create attendance session error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Server error while creating attendance session"
        });
    }
};


const markAttendance = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const { records } = req.body;

        const institutionId = req.user.institutionId;

        if (
            !records ||
            !Array.isArray(records) ||
            records.length === 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Attendance records are required"
            });
        }

        // Find session
        const session = await AttendanceSession.findOne({
            _id: sessionId,
            institutionId
        });

        if (!session) {
            return res.status(404).json({
                success: false,
                message: "Attendance session not found"
            });
        }

        // Find class subject
        const classSubject = await ClassSubject.findOne({
            _id: session.classSubjectId,
            institutionId,
            isActive: true
        });

        if (!classSubject) {
            return res.status(404).json({
                success: false,
                message: "Class subject not found"
            });
        }

        const attendanceRecords = [];

        for (const record of records) {

            const {
                studentId,
                status,
                remarks
            } = record;

            if (!studentId || !status) {
                return res.status(400).json({
                    success: false,
                    message: "Student ID and status are required"
                });
            }

            // Verify student belongs to same institution
            // and same class
            const student = await Student.findOne({
                _id: studentId,
                institutionId,
                classId: classSubject.classId,
                status: "active"
            });

            if (!student) {
                return res.status(400).json({
                    success: false,
                    message:
                        `Invalid student: ${studentId}`
                });
            }

            attendanceRecords.push({
                institutionId,
                sessionId,
                studentId,
                status,
                remarks
            });
        }

        // Insert all records
        const createdRecords =
            await AttendanceRecord.insertMany(
                attendanceRecords
            );

        return res.status(201).json({
            success: true,
            message: "Attendance marked successfully",
            count: createdRecords.length,
            records: createdRecords
        });

    } catch (error) {
        console.error(
            "Mark attendance error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Server error while marking attendance"
        });
    }
};

const getSessionAttendance = async (req, res) => {
    try {
        const { sessionId } = req.params;

        const institutionId = req.user.institutionId;

        // Find session
        const session = await AttendanceSession.findOne({
            _id: sessionId,
            institutionId
        }).populate({
            path: "classSubjectId",
            populate: [
                {
                    path: "classId",
                    select: "name section academicYear"
                },
                {
                    path: "subjectId",
                    select: "name code"
                },
                {
                    path: "teacherId",
                    populate: {
                        path: "userId",
                        select: "name email"
                    }
                }
            ]
        });

        if (!session) {
            return res.status(404).json({
                success: false,
                message: "Attendance session not found"
            });
        }

        // Get attendance records
        const records = await AttendanceRecord.find({
            sessionId,
            institutionId
        })
            .populate({
                path: "studentId",
                populate: {
                    path: "userId",
                    select: "name email"
                }
            })
            .sort({
                createdAt: 1
            });

        return res.status(200).json({
            success: true,
            session,
            count: records.length,
            records
        });

    } catch (error) {
        console.error(
            "Get session attendance error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Server error while fetching attendance"
        });
    }
};
const updateAttendance = async (req, res) => {
    try {
        const { recordId } = req.params;

        const {
            status,
            remarks
        } = req.body;

        const institutionId = req.user.institutionId;

        const allowedStatuses = [
            "present",
            "absent",
            "late",
            "excused"
        ];

        if (!status || !allowedStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid attendance status"
            });
        }

        const record = await AttendanceRecord.findOne({
            _id: recordId,
            institutionId
        });

        if (!record) {
            return res.status(404).json({
                success: false,
                message: "Attendance record not found"
            });
        }

        record.status = status;

        if (remarks !== undefined) {
            record.remarks = remarks;
        }

        await record.save();

        return res.status(200).json({
            success: true,
            message: "Attendance updated successfully",
            record
        });

    } catch (error) {
        console.error(
            "Update attendance error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Server error while updating attendance"
        });
    }
};

const getStudentAttendanceSummary = async (req, res) => {
    try {
        const { studentId } = req.params;

        const institutionId = req.user.institutionId;

        // Verify student
        const student = await Student.findOne({
            _id: studentId,
            institutionId
        }).populate({
            path: "userId",
            select: "name email"
        }).populate({
            path: "classId",
            select: "name section academicYear"
        });

        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student not found"
            });
        }

        const records = await AttendanceRecord.find({
            studentId,
            institutionId
        }).populate({
            path: "sessionId",
            populate: {
                path: "classSubjectId",
                populate: {
                    path: "subjectId",
                    select: "name code"
                }
            }
        });

        const totalClasses = records.length;

        const present = records.filter(
            record => record.status === "present"
        ).length;

        const absent = records.filter(
            record => record.status === "absent"
        ).length;

        const late = records.filter(
            record => record.status === "late"
        ).length;

        const excused = records.filter(
            record => record.status === "excused"
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
                class: student.classId
            },

            summary: {
                totalClasses,
                present,
                absent,
                late,
                excused,
                attendancePercentage: Number(
                    attendancePercentage.toFixed(2)
                )
            },

            records
        });

    } catch (error) {
        console.error(
            "Attendance summary error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Server error while calculating attendance"
        });
    }
};


module.exports = {
    createAttendanceSession,
    markAttendance,
    getSessionAttendance,
    updateAttendance,
    getStudentAttendanceSummary
};