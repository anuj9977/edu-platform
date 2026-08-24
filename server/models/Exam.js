const mongoose = require("mongoose");

const examSchema = new mongoose.Schema(
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

        academicYear: {
            type: String,
            required: true,
            trim: true
        },

        startDate: {
            type: Date,
            required: true
        },

        endDate: {
            type: Date,
            required: true
        },

        status: {
            type: String,
            enum: [
                "upcoming",
                "ongoing",
                "completed"
            ],
            default: "upcoming"
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

examSchema.index(
    {
        institutionId: 1,
        name: 1,
        academicYear: 1
    },
    {
        unique: true
    }
);

module.exports = mongoose.model("Exam", examSchema);