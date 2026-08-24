const mongoose = require("mongoose");

const examSubjectSchema = new mongoose.Schema(
    {
        institutionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Institution",
            required: true
        },

        examId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Exam",
            required: true
        },

        classSubjectId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "ClassSubject",
            required: true
        },

        maxMarks: {
            type: Number,
            required: true,
            min: 1
        },

        passingMarks: {
            type: Number,
            required: true,
            min: 0
        }
    },
    {
        timestamps: true
    }
);

examSubjectSchema.index(
    {
        institutionId: 1,
        examId: 1,
        classSubjectId: 1
    },
    {
        unique: true
    }
);

module.exports = mongoose.model(
    "ExamSubject",
    examSubjectSchema
);