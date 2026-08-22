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



module.exports = {
    getSubjects
};