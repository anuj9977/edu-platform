const mongoose = require("mongoose");

const announcementSchema = new mongoose.Schema(
    {
        institutionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Institution",
            required: true
        },

        title: {
            type: String,
            required: true,
            trim: true
        },

        message: {
            type: String,
            required: true,
            trim: true
        },

        type: {
            type: String,
            enum: [
                "general",
                "academic",
                "exam",
                "fee",
                "event",
                "holiday",
                "emergency"
            ],
            default: "general"
        },

        targetType: {
            type: String,
            enum: [
                "institution",
                "class",
                "student"
            ],
            default: "institution"
        },

        targetClassId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Class",
            default: null
        },

        targetStudentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Student",
            default: null
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        isPublished: {
            type: Boolean,
            default: true
        },

        publishedAt: {
            type: Date,
            default: Date.now
        }
    },
    {
        timestamps: true
    }
);

announcementSchema.index({
    institutionId: 1,
    createdAt: -1
});

module.exports = mongoose.model(
    "Announcement",
    announcementSchema
);