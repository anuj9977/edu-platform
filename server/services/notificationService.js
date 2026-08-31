const Notification = require("../models/Notification");
const User = require("../models/User");
const Student = require("../models/Student");
const ClassSubject = require("../models/ClassSubject");

const createAnnouncementNotifications = async (
    announcement
) => {
    try {
        const {
            institutionId,
            targetType,
            targetClassId,
            targetStudentId,
            title,
            message,
            type,
            _id: announcementId
        } = announcement;

        let userIds = [];

        // ==========================================
        // 1. Institution-wide announcement
        // ==========================================

        if (targetType === "institution") {

            const users = await User.find({
                institutionId,
                isActive: true
            }).select("_id");

            userIds = users.map(
                user => user._id
            );
        }

        // ==========================================
        // 2. Class announcement
        // ==========================================

        else if (targetType === "class") {

            const Teacher = require("../models/Teacher");

            const students = await Student.find({
                institutionId,
                classId: targetClassId,
                status: "active"
            }).select(
                "_id userId parentId"
            );

            for (const student of students) {

                if (student.userId) {
                    userIds.push(student.userId);
                }

                if (student.parentId) {
                    userIds.push(student.parentId);
                }
            }

            const assignments =
                await ClassSubject.find({
                    institutionId,
                    classId: targetClassId,
                    isActive: true
                }).select("teacherId");

            const teacherIds = assignments
                .filter(item => item.teacherId)
                .map(item => item.teacherId);

            const teachers = await Teacher.find({
                _id: {
                    $in: teacherIds
                },
                institutionId,
                status: "active"
            }).select("userId");

            for (const teacher of teachers) {

                if (teacher.userId) {
                    userIds.push(
                        teacher.userId
                    );
                }
            }
        }

        // ==========================================
        // 3. Student-specific announcement
        // ==========================================

        else if (targetType === "student") {

            const student = await Student.findOne({
                _id: targetStudentId,
                institutionId,
                status: "active"
            }).select(
                "userId parentId"
            );

            if (student) {

                if (student.userId) {
                    userIds.push(
                        student.userId
                    );
                }

                if (student.parentId) {
                    userIds.push(
                        student.parentId
                    );
                }
            }
        }

        // Remove duplicate users
        const uniqueUserIds = [
            ...new Set(
                userIds.map(id =>
                    id.toString()
                )
            )
        ];

        if (uniqueUserIds.length === 0) {
            return [];
        }

        const notifications =
            uniqueUserIds.map(userId => ({
                institutionId,
                userId,
                announcementId,
                title,
                message,
                type,
                isRead: false
            }));

        return await Notification.insertMany(
            notifications
        );

    } catch (error) {
        console.error(
            "Create announcement notifications error:",
            error
        );

        throw error;
    }
};

module.exports = {
    createAnnouncementNotifications
};