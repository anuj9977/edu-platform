const mongoose = require("mongoose");

const attendanceSessionSchema = new mongoose.Schema(
    {
        institutionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Institution",
            required: true
        },

        classSubjectId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "ClassSubject",
            required: true
        },

        date: {
            type: Date,
            required: true
        },

        sessionType: {
            type: String,
            enum: ["regular", "extra_class", "exam"],
            default: "regular"
        },

        remarks: {
            type: String,
            trim: true
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        }
    },
    {
        timestamps: true
    }
);

attendanceSessionSchema.index(
    {
        institutionId: 1,
        classSubjectId: 1,
        date: 1
    },
    {
        unique: true
    }
);

module.exports = mongoose.model(
    "AttendanceSession",
    attendanceSessionSchema
);