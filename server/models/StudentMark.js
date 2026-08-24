const mongoose = require("mongoose");

const studentMarkSchema = new mongoose.Schema(
    {
        institutionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Institution",
            required: true
        },

        examSubjectId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "ExamSubject",
            required: true
        },

        studentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Student",
            required: true
        },

        marksObtained: {
            type: Number,
            required: true,
            min: 0
        },

        remarks: {
            type: String,
            trim: true
        },

        status: {
            type: String,
            enum: [
                "present",
                "absent",
                "not_appeared"
            ],
            default: "present"
        }
    },
    {
        timestamps: true
    }
);

studentMarkSchema.index(
    {
        institutionId: 1,
        examSubjectId: 1,
        studentId: 1
    },
    {
        unique: true
    }
);

module.exports = mongoose.model(
    "StudentMark",
    studentMarkSchema
);