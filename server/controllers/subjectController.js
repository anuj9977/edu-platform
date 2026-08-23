const Subject = require("../models/Subject");

const getSubjects = async (req, res) => {
    try {
        const institutionId = req.user.institutionId;

        const subjects = await Subject.find({
            institutionId,
            isActive: true
        }).sort({
            name: 1
        });

        return res.status(200).json({
            success: true,
            count: subjects.length,
            subjects
        });

    } catch (error) {
        console.error("Get subjects error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error while fetching subjects"
        });
    }
};

const createSubject = async (req, res) => {
    try {
        const {
            name,
            code,
            description
        } = req.body;

        if (!name) {
            return res.status(400).json({
                success: false,
                message: "Subject name is required"
            });
        }

        const institutionId = req.user.institutionId;

        const existingSubject = await Subject.findOne({
            institutionId,
            name
        });

        if (existingSubject) {
            return res.status(400).json({
                success: false,
                message: "Subject already exists"
            });
        }

        const subject = await Subject.create({
            institutionId,
            name,
            code,
            description
        });

        return res.status(201).json({
            success: true,
            message: "Subject created successfully",
            subject
        });

    } catch (error) {
        console.error("Create subject error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error while creating subject"
        });
    }
};



module.exports = {
    getSubjects,
    createSubject
};