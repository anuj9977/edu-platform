const Class = require("../models/Class");

const createClass = async (req, res) => {
    try {
        const {
            name,
            section,
            academicYear
        } = req.body;

        if (!name || !academicYear) {
            return res.status(400).json({
                success: false,
                message: "Class name and academic year are required"
            });
        }

        const institutionId = req.user.institutionId;

        const existingClass = await Class.findOne({
            institutionId,
            name,
            section: section || "",
            academicYear
        });

        if (existingClass) {
            return res.status(400).json({
                success: false,
                message: "This class already exists"
            });
        }

        const newClass = await Class.create({
            institutionId,
            name,
            section,
            academicYear
        });

        return res.status(201).json({
            success: true,
            message: "Class created successfully",
            class: newClass
        });

    } catch (error) {
        console.error("Create class error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error while creating class"
        });
    }
};

module.exports = {
    createClass
};