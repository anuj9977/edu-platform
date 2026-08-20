const express = require("express");

const {
    registerAdmin,
    loginUser,
    getMe,
    adminTest
} = require("../controllers/authController");

const { protect } = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();

router.post("/register", registerAdmin);
router.post("/login", loginUser);

router.get("/me", protect, getMe);
router.get(
    "/admin-test",
    protect,
    authorize("admin"),
    adminTest
);

module.exports = router;