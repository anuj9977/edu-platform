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

const getClasses = async (req, res) => {
    try {
        const institutionId = req.user.institutionId;

        const classes = await Class.find({
            institutionId,
            isActive: true
        })
            .populate("classTeacherId", "name email")
            .sort({
                name: 1,
                section: 1
            });

        return res.status(200).json({
            success: true,
            count: classes.length,
            classes
        });

    } catch (error) {
        console.error("Get classes error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error while fetching classes"
        });
    }
};

module.exports = {
    createClass,
    getClasses
};