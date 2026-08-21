const mongoose = require("mongoose");

const classSchema = new mongoose.Schema(
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

        section: {
            type: String,
            trim: true,
            uppercase: true
        },

        academicYear: {
            type: String,
            required: true,
            trim: true
        },

        classTeacherId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
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

classSchema.index(
    {
        institutionId: 1,
        name: 1,
        section: 1,
        academicYear: 1
    },
    {
        unique: true
    }
);

module.exports = mongoose.model("Class", classSchema);