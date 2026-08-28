const express = require("express");

const {
    createAttendanceSession,
    markAttendance
} = require("../controllers/attendanceController");

const { protect } = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();

router.post(
    "/sessions",
    protect,
    authorize("admin", "teacher"),
    createAttendanceSession
);

router.post(
    "/sessions/:sessionId/records",
    protect,
    authorize("admin", "teacher"),
    markAttendance
);

module.exports = router;