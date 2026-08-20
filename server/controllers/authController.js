const bcrypt = require("bcryptjs");

const Institution = require("../models/Institution");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");

const registerAdmin = async (req, res) => {
    try {
        const {
            institutionName,
            institutionType,
            institutionEmail,
            institutionPhone,
            institutionAddress,
            adminName,
            adminEmail,
            password
        } = req.body;

        if (
            !institutionName ||
            !institutionType ||
            !institutionEmail ||
            !institutionPhone ||
            !adminName ||
            !adminEmail ||
            !password
        ) {
            return res.status(400).json({
                success: false,
                message: "Please provide all required fields"
            });
        }

        const existingInstitution = await Institution.findOne({
            email: institutionEmail.toLowerCase()
        });

        if (existingInstitution) {
            return res.status(400).json({
                success: false,
                message: "Institution already registered"
            });
        }

        const existingUser = await User.findOne({
            email: adminEmail.toLowerCase()
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "Admin email already registered"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const institution = await Institution.create({
            name: institutionName,
            type: institutionType,
            email: institutionEmail,
            phone: institutionPhone,
            address: institutionAddress
        });

        const admin = await User.create({
            institutionId: institution._id,
            name: adminName,
            email: adminEmail,
            password: hashedPassword,
            role: "admin"
        });

        const token = generateToken(admin);

        return res.status(201).json({
            success: true,
            message: "Institution and admin registered successfully",
            token,
            user: {
                id: admin._id,
                name: admin.name,
                email: admin.email,
                role: admin.role,
                institutionId: admin.institutionId
            }
        });

    } catch (error) {
        console.error("Registration error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error during registration"
        });
    }
};


// LOGIN USER
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Validate input
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }

        // 2. Find user
        const user = await User.findOne({
            email: email.toLowerCase()
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        // 3. Check if user is active
        if (!user.isActive) {
            return res.status(403).json({
                success: false,
                message: "Your account has been deactivated"
            });
        }

        // 4. Compare password
        const isPasswordCorrect = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordCorrect) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        // 5. Update last login
        user.lastLogin = new Date();
        await user.save();

        // 6. Generate JWT
        const token = generateToken(user);

        // 7. Send response
        return res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                institutionId: user.institutionId
            }
        });

    } catch (error) {
        console.error("Login error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error during login"
        });
    }
};

// GET CURRENT USER
const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId)
            .select("-password");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        return res.status(200).json({
            success: true,
            user
        });

    } catch (error) {
        console.error("Get user error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


module.exports = {
    registerAdmin,
    loginUser,
    getMe   
};