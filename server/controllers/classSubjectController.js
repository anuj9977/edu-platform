const ClassSubject = require("../models/ClassSubject");
const Class = require("../models/Class");
const Subject = require("../models/Subject");
const Teacher = require("../models/Teacher");

const assignSubjectToClass = async (req, res) => {
    try {
        const {
            classId,
            subjectId,
            teacherId
        } = req.body;

        const institutionId = req.user.institutionId;

        if (!classId || !subjectId || !teacherId) {
            return res.status(400).json({
                success: false,
                message: "Class, subject and teacher are required"
            });
        }

        // Verify class
        const classData = await Class.findOne({
            _id: classId,
            institutionId
        });

        if (!classData) {
            return res.status(400).json({
                success: false,
                message: "Invalid class"
            });
        }

        // Verify subject
        const subject = await Subject.findOne({
            _id: subjectId,
            institutionId
        });

        if (!subject) {
            return res.status(400).json({
                success: false,
                message: "Invalid subject"
            });
        }

        // Verify teacher
        const teacher = await Teacher.findOne({
            _id: teacherId,
            institutionId,
            status: "active"
        });

        if (!teacher) {
            return res.status(400).json({
                success: false,
                message: "Invalid teacher"
            });
        }

        // Check duplicate assignment
        const existingAssignment = await ClassSubject.findOne({
            institutionId,
            classId,
            subjectId
        });

        if (existingAssignment) {
            return res.status(400).json({
                success: false,
                message: "Subject is already assigned to this class"
            });
        }

        // Create assignment
        const assignment = await ClassSubject.create({
            institutionId,
            classId,
            subjectId,
            teacherId
        });

        return res.status(201).json({
            success: true,
            message: "Subject assigned to class successfully",
            assignment
        });

    } catch (error) {
        console.error("Assign subject error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error while assigning subject"
        });
    }
};

module.exports = {
    assignSubjectToClass
};