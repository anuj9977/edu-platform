const bcrypt = require("bcryptjs");

const User = require("../models/User");
const Student = require("../models/Student");
const Class = require("../models/Class");

const createStudent = async (req, res) => {
    try {
        const {
            name,
            email,
            password,
            admissionNumber,
            rollNumber,
            dateOfBirth,
            gender,
            address,
            classId,
            parentId
        } = req.body;

        // 1. Validate required fields
        if (
            !name ||
            !email ||
            !password ||
            !admissionNumber
        ) {
            return res.status(400).json({
                success: false,
                message: "Name, email, password and admission number are required"
            });
        }

        // 2. Get institution from logged-in admin
        const institutionId = req.user.institutionId;

        // 3. Check if email already exists
        const existingUser = await User.findOne({
            email: email.toLowerCase()
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "Email already registered"
            });
        }

        // 4. Check admission number
        const existingStudent = await Student.findOne({
            institutionId,
            admissionNumber
        });

        if (existingStudent) {
            return res.status(400).json({
                success: false,
                message: "Admission number already exists"
            });
        }

        // 5. If class is provided, verify it belongs to same institution
        if (classId) {
            const studentClass = await Class.findOne({
                _id: classId,
                institutionId
            });

            if (!studentClass) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid class"
                });
            }
        }

        // 6. Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // 7. Create User
        const user = await User.create({
            institutionId,
            name,
            email: email.toLowerCase(),
            password: hashedPassword,
            role: "student"
        });

        // 8. Create Student Profile
        const student = await Student.create({
            institutionId,
            userId: user._id,
            admissionNumber,
            rollNumber,
            dateOfBirth,
            gender,
            address,
            classId: classId || null,
            parentId: parentId || null
        });

        // 9. Response
        return res.status(201).json({
            success: true,
            message: "Student created successfully",
            student: {
                id: student._id,
                userId: user._id,
                name: user.name,
                email: user.email,
                admissionNumber: student.admissionNumber,
                rollNumber: student.rollNumber,
                classId: student.classId,
                institutionId: student.institutionId
            }
        });

    } catch (error) {
        console.error("Create student error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error while creating student"
        });
    }
};

const getStudents = async (req, res) => {
    try {
        const institutionId = req.user.institutionId;

        const students = await Student.find({
            institutionId,
            status: "active"
        })
            .populate("userId", "name email phone")
            .populate("classId", "name section academicYear")
            .sort({
                createdAt: -1
            });

        return res.status(200).json({
            success: true,
            count: students.length,
            students
        });

    } catch (error) {
        console.error("Get students error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error while fetching students"
        });
    }
};

module.exports = {
    createStudent,
    getStudents
};