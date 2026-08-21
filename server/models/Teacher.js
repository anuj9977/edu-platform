const mongoose = require("mongoose");

const teacherSchema = new mongoose.Schema(
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

        employeeId: {
            type: String,
            required: true,
            trim: true
        },

        qualification: {
            type: String,
            trim: true
        },

        specialization: {
            type: String,
            trim: true
        },

        joiningDate: {
            type: Date,
            default: Date.now
        },

        phone: {
            type: String,
            trim: true
        },

        status: {
            type: String,
            enum: ["active", "inactive"],
            default: "active"
        }
    },
    {
        timestamps: true
    }
);

teacherSchema.index(
    {
        institutionId: 1,
        employeeId: 1
    },
    {
        unique: true
    }
);

module.exports = mongoose.model("Teacher", teacherSchema);