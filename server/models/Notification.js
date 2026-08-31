const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
    {
        institutionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Institution",
            required: true
        },

        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        announcementId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Announcement",
            default: null
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

        isRead: {
            type: Boolean,
            default: false
        },

        readAt: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true
    }
);

notificationSchema.index({
    institutionId: 1,
    userId: 1,
    isRead: 1,
    createdAt: -1
});

module.exports = mongoose.model(
    "Notification",
    notificationSchema
);