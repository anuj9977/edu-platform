const mongoose = require("mongoose");

const attendanceRecordSchema = new mongoose.Schema(
    {
        institutionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Institution",
            required: true
        },

        sessionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "AttendanceSession",
            required: true
        },

        studentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Student",
            required: true
        },

        status: {
            type: String,
            enum: ["present", "absent", "late", "excused"],
            required: true
        },

        remarks: {
            type: String,
            trim: true
        }
    },
    {
        timestamps: true
    }
);

attendanceRecordSchema.index(
    {
        institutionId: 1,
        sessionId: 1,
        studentId: 1
    },
    {
        unique: true
    }
);

module.exports = mongoose.model(
    "AttendanceRecord",
    attendanceRecordSchema
);