const express = require("express");

const {
    createAttendanceSession,
    markAttendance,
    getSessionAttendance,
    updateAttendance,
    getStudentAttendanceSummary

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

router.put(
    "/records/:recordId",
    protect,
    authorize("admin", "teacher"),
    updateAttendance
);

router.get(
    "/sessions/:sessionId",
    protect,
    authorize("admin", "teacher"),
    getSessionAttendance
);

router.get(
    "/students/:studentId/summary",
    protect,
    authorize("admin", "teacher"),
    getStudentAttendanceSummary
);

module.exports = router;