const mongoose = require("mongoose");

const subjectSchema = new mongoose.Schema(
    {
        institutionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Institution",
            required: true
        },

        name: {
            type: String,
            required: true,
            trim: true
        },

        code: {
            type: String,
            trim: true,
            uppercase: true
        },

        description: {
            type: String,
            trim: true
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

subjectSchema.index(
    {
        institutionId: 1,
        name: 1
    },
    {
        unique: true
    }
);

module.exports = mongoose.model("Subject", subjectSchema);