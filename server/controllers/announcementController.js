const Announcement = require("../models/Announcement");
const Class = require("../models/Class");
const Student = require("../models/Student");

const createAnnouncement = async (req, res) => {
    try {
        const {
            title,
            message,
            type,
            targetType,
            targetClassId,
            targetStudentId
        } = req.body;

        const institutionId = req.user.institutionId;
        const createdBy = req.user.userId;

        if (!title || !message) {
            return res.status(400).json({
                success: false,
                message: "Title and message are required"
            });
        }

        const allowedTargetTypes = [
            "institution",
            "class",
            "student"
        ];

        if (
            targetType &&
            !allowedTargetTypes.includes(targetType)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid target type"
            });
        }

        const finalTargetType =
            targetType || "institution";

        // Validate class target
        if (finalTargetType === "class") {

            if (!targetClassId) {
                return res.status(400).json({
                    success: false,
                    message: "Class ID is required"
                });
            }

            const classData = await Class.findOne({
                _id: targetClassId,
                institutionId,
                isActive: true
            });

            if (!classData) {
                return res.status(404).json({
                    success: false,
                    message: "Class not found"
                });
            }
        }

        // Validate student target
        if (finalTargetType === "student") {

            if (!targetStudentId) {
                return res.status(400).json({
                    success: false,
                    message: "Student ID is required"
                });
            }

            const student = await Student.findOne({
                _id: targetStudentId,
                institutionId,
                status: "active"
            });

            if (!student) {
                return res.status(404).json({
                    success: false,
                    message: "Student not found"
                });
            }
        }

        const announcement =
            await Announcement.create({
                institutionId,
                title,
                message,
                type: type || "general",
                targetType: finalTargetType,

                targetClassId:
                    finalTargetType === "class"
                        ? targetClassId
                        : null,

                targetStudentId:
                    finalTargetType === "student"
                        ? targetStudentId
                        : null,

                createdBy,
                isPublished: true,
                publishedAt: new Date()
            });

        return res.status(201).json({
            success: true,
            message: "Announcement created successfully",
            announcement
        });

    } catch (error) {
        console.error(
            "Create announcement error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Server error while creating announcement"
        });
    }
};
const getStudentAnnouncements = async (req, res) => {
    try {
        const institutionId = req.user.institutionId;
        const userId = req.user.userId;

        const student = await Student.findOne({
            userId,
            institutionId,
            status: "active"
        });

        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student profile not found"
            });
        }

        const announcements =
            await Announcement.find({
                institutionId,
                isPublished: true,

                $or: [
                    {
                        targetType: "institution"
                    },
                    {
                        targetType: "class",
                        targetClassId: student.classId
                    },
                    {
                        targetType: "student",
                        targetStudentId: student._id
                    }
                ]
            })
                .populate(
                    "createdBy",
                    "name role"
                )
                .sort({
                    publishedAt: -1
                });

        return res.status(200).json({
            success: true,
            count: announcements.length,
            announcements
        });

    } catch (error) {
        console.error(
            "Get student announcements error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Server error while fetching announcements"
        });
    }
};
module.exports = {
    createAnnouncement,
    getStudentAnnouncements
};