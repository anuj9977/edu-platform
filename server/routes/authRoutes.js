const express = require("express");

const {
    registerAdmin,
    loginUser,
    getMe
} = require("../controllers/authController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", registerAdmin);
router.post("/login", loginUser);

router.get("/me", protect, getMe);

module.exports = router;