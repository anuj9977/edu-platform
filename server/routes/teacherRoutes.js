const express = require("express");

const {
    createTeacher,
    getTeachers
} = require("../controllers/teacherController");

const { protect } = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();

router.get(
    "/",
    protect,
    authorize("admin", "teacher"),
    getTeachers
);

router.post(
    "/",
    protect,
    authorize("admin"),
    createTeacher
);

module.exports = router;