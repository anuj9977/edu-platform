const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
    {
        institutionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Institution",
            required: true
        },

        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true
        },

        admissionNumber: {
            type: String,
            required: true,
            trim: true
        },

        rollNumber: {
            type: String,
            trim: true
        },

        dateOfBirth: {
            type: Date
        },

        gender: {
            type: String,
            enum: ["male", "female", "other"]
        },

        address: {
            type: String,
            trim: true
        },

        classId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Class",
            default: null
        },

        parentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        },

        admissionDate: {
            type: Date,
            default: Date.now
        },

        status: {
            type: String,
            enum: ["active", "inactive", "graduated"],
            default: "active"
        }
    },
    {
        timestamps: true
    }
);

studentSchema.index(
    { institutionId: 1, admissionNumber: 1 },
    { unique: true }
);

module.exports = mongoose.model("Student", studentSchema);