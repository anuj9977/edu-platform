const express = require("express");

const {
    createAnnouncement,
    getStudentAnnouncements,
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

module.exports = router;