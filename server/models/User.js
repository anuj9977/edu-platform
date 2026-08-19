const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
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

        email: {
            type: String,
            unique: true,
            required: true,
            lowercase: true,
            trim: true
        },

        password: {
            type: String,
            required: true,
            minlength: 6
        },

        role: {
            type: String,
            enum: ["admin", "teacher", "student", "parent"],
            required: true
        },

        phone: {
            type: String,
            trim: true
        },

        profileImage: {
            type: String,
            default: ""
        },

        isActive: {
            type: Boolean,
            default: true
        },

        lastLogin: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true
    }
);


module.exports = mongoose.model("User", userSchema);