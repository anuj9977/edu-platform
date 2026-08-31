const express = require("express");

const {
    createAnnouncement,
    getStudentAnnouncements,
    getParentAnnouncements,
    getTeacherAnnouncements
} = require("../controllers/announcementController");

const {
    protect
} = require("../middleware/authMiddleware");

const authorize = require("../middleware/roleMiddleware");

const router = express.Router();

router.post(
    "/",
    protect,
    authorize("admin"),
    createAnnouncement
);
router.get(
    "/student",
    protect,
    authorize("student"),
    getStudentAnnouncements
);

router.get(
    "/parent",
    protect,
    authorize("parent"),
    getParentAnnouncements
);

router.get(
    "/teacher",
    protect,
    authorize("teacher"),
    getTeacherAnnouncements
);


module.exports = router;