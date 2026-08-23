const mongoose = require("mongoose");

const classSubjectSchema = new mongoose.Schema(
    {
        institutionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Institution",
            required: true
        },

        classId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Class",
            required: true
        },

        subjectId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Subject",
            required: true
        },

        teacherId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Teacher",
            required: true
        },

        isActive: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);

classSubjectSchema.index(
    {
        institutionId: 1,
        classId: 1,
        subjectId: 1
    },
    {
        unique: true
    }
);

module.exports = mongoose.model(
    "ClassSubject",
    classSubjectSchema
);