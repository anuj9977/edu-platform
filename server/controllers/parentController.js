const bcrypt = require("bcryptjs");
const Student = require("../models/Student");
const User = require("../models/User");
const Parent = require("../models/Parent");

const createParent = async (req, res) => {
    try {
        const {
            name,
            email,
            password,
            phone,
            occupation,
            address,
            emergencyPhone
        } = req.body;

        if (
            !name ||
            !email ||
            !password ||
            !phone
        ) {
            return res.status(400).json({
                success: false,
                message: "Name, email, password and phone are required"
            });
        }

        const institutionId = req.user.institutionId;

        // Check email
        const existingUser = await User.findOne({
            email: email.toLowerCase()
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "Email already registered"
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create User
        const user = await User.create({
            institutionId,
            name,
            email: email.toLowerCase(),
            password: hashedPassword,
            role: "parent",
            phone
        });

        // Create Parent profile
        const parent = await Parent.create({
            institutionId,
            userId: user._id,
            occupation,
            address,
            emergencyPhone
        });

        return res.status(201).json({
            success: true,
            message: "Parent created successfully",
            parent: {
                id: parent._id,
                userId: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                institutionId: parent.institutionId
            }
        });

    } catch (error) {
        console.error("Create parent error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error while creating parent"
        });
    }
};
const linkStudentToParent = async (req, res) => {
    try {
        const {
            parentId,
            studentId
        } = req.params;

        const institutionId = req.user.institutionId;

        // Find parent
        const parent = await Parent.findOne({
            _id: parentId,
            institutionId
        });

        if (!parent) {
            return res.status(404).json({
                success: false,
                message: "Parent not found"
            });
        }

        // Find student
        const student = await Student.findOne({
            _id: studentId,
            institutionId
        });

        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student not found"
            });
        }

        // Link parent
        student.parentId = parent.userId;

        await student.save();

        return res.status(200).json({
            success: true,
            message: "Student linked to parent successfully"
        });

    } catch (error) {
        console.error("Link parent error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error while linking parent"
        });
    }
};

module.exports = {
    createParent,
    linkStudentToParent
};