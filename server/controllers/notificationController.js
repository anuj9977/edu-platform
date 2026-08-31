const Notification = require("../models/Notification");

const getMyNotifications = async (req, res) => {
    try {
        const institutionId = req.user.institutionId;
        const userId = req.user.userId;

        const notifications =
            await Notification.find({
                institutionId,
                userId
            })
                .populate(
                    "announcementId",
                    "title type"
                )
                .sort({
                    createdAt: -1
                })
                .limit(50);

        const unreadCount =
            notifications.filter(
                notification =>
                    !notification.isRead
            ).length;

        return res.status(200).json({
            success: true,
            unreadCount,
            notifications
        });

    } catch (error) {
        console.error(
            "Get notifications error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Server error while fetching notifications"
        });
    }
};

const markNotificationAsRead = async (req, res) => {
    try {
        const { notificationId } = req.params;

        const institutionId = req.user.institutionId;
        const userId = req.user.userId;

        const notification =
            await Notification.findOne({
                _id: notificationId,
                institutionId,
                userId
            });

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: "Notification not found"
            });
        }

        notification.isRead = true;
        notification.readAt = new Date();

        await notification.save();

        return res.status(200).json({
            success: true,
            message: "Notification marked as read",
            notification
        });

    } catch (error) {
        console.error(
            "Mark notification read error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Server error while updating notification"
        });
    }
};

module.exports = {
    getMyNotifications,
    markNotificationAsRead
};