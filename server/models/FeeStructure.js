const mongoose = require("mongoose");

const feeStructureSchema = new mongoose.Schema(
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

        amount: {
            type: Number,
            required: true,
            min: 0
        },

        dueDate: {
            type: Date,
            required: true
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

feeStructureSchema.index(
    {
        institutionId: 1,
        classId: 1,
        name: 1,
        academicYear: 1
    },
    {
        unique: true
    }
);

module.exports = mongoose.model(
    "FeeStructure",
    feeStructureSchema
);