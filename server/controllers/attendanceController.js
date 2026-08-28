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

module.exports = {
    createAttendanceSession,
    markAttendance
};