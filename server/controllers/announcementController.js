const Announcement = require("../models/Announcement");
const Class = require("../models/Class");
const Student = require("../models/Student");
const Parent = require("../models/Parent");
const Teacher = require("../models/Teacher");
const {
    createAnnouncementNotifications
} = require("../services/notificationService");
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

            const notifications =
            await createAnnouncementNotifications(
                announcement
            );
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


const getParentAnnouncements = async (req, res) => {
    try {
        const institutionId = req.user.institutionId;
        const userId = req.user.userId;

        const parent = await Parent.findOne({
            userId,
            institutionId,
            status: "active"
        });

        if (!parent) {
            return res.status(404).json({
                success: false,
                message: "Parent profile not found"
            });
        }

        const children = await Student.find({
            institutionId,
            parentId: userId,
            status: "active"
        });

        const childIds = children.map(
            child => child._id
        );

        const classIds = children
            .filter(child => child.classId)
            .map(child => child.classId);

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
                        targetClassId: {
                            $in: classIds
                        }
                    },
                    {
                        targetType: "student",
                        targetStudentId: {
                            $in: childIds
                        }
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
            "Get parent announcements error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Server error while fetching announcements"
        });
    }
};




const getTeacherAnnouncements = async (req, res) => {
    try {
        const institutionId = req.user.institutionId;
        const userId = req.user.userId;

        const teacher = await Teacher.findOne({
            userId,
            institutionId,
            status: "active"
        });

        if (!teacher) {
            return res.status(404).json({
                success: false,
                message: "Teacher profile not found"
            });
        }

        const assignments = await ClassSubject.find({
            institutionId,
            teacherId: teacher._id,
            isActive: true
        });

        const classIds = assignments.map(
            assignment => assignment.classId
        );

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
                        targetClassId: {
                            $in: classIds
                        }
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
            "Get teacher announcements error:",
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
    getStudentAnnouncements,
    getParentAnnouncements,
    getTeacherAnnouncements 
    
};