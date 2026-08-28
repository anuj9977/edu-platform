const express = require("express");

const {
    getStudentDashboard,
    getParentDashboard,
    getTeacherDashboard
} = require("../controllers/dashboardController");

const {
    protect
} = require("../middleware/authMiddleware");

const authorize = require("../middleware/roleMiddleware");

const router = express.Router();

router.get(
    "/student",
    protect,
    authorize("student"),
    getStudentDashboard
);

router.get(
    "/parent",
    protect,
    authorize("parent"),
    getParentDashboard
);

router.get(
    "/teacher",
    protect,
    authorize("teacher"),
    getTeacherDashboard
);

module.exports = router;