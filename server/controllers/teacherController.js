const bcrypt = require("bcryptjs");

const User = require("../models/User");
const Teacher = require("../models/Teacher");

const createTeacher = async (req, res) => {
    try {
        const {
            name,
            email,
            password,
            employeeId,
            qualification,
            specialization,
            joiningDate,
            phone
        } = req.body;

        // Validate required fields
        if (
            !name ||
            !email ||
            !password ||
            !employeeId
        ) {
            return res.status(400).json({
                success: false,
                message: "Name, email, password and employee ID are required"
            });
        }

        // Always get institution from authenticated admin
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

        // Check employee ID inside this institution
        const existingTeacher = await Teacher.findOne({
            institutionId,
            employeeId
        });

        if (existingTeacher) {
            return res.status(400).json({
                success: false,
                message: "Employee ID already exists"
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
            role: "teacher"
        });

        // Create Teacher Profile
        const teacher = await Teacher.create({
            institutionId,
            userId: user._id,
            employeeId,
            qualification,
            specialization,
            joiningDate,
            phone
        });

        return res.status(201).json({
            success: true,
            message: "Teacher created successfully",
            teacher: {
                id: teacher._id,
                userId: user._id,
                name: user.name,
                email: user.email,
                employeeId: teacher.employeeId,
                qualification: teacher.qualification,
                specialization: teacher.specialization,
                institutionId: teacher.institutionId
            }
        });

    } catch (error) {
        console.error("Create teacher error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error while creating teacher"
        });
    }
};

const getTeachers = async (req, res) => {
    try {
        const institutionId = req.user.institutionId;

        const teachers = await Teacher.find({
            institutionId,
            status: "active"
        })
            .populate("userId", "name email phone")
            .sort({
                createdAt: -1
            });

        return res.status(200).json({
            success: true,
            count: teachers.length,
            teachers
        });

    } catch (error) {
        console.error("Get teachers error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error while fetching teachers"
        });
    }
};

module.exports = {
    createTeacher,
    getTeachers
};