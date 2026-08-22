const express = require("express");

const {
    createTeacher,
    getTeachers,
    updateTeacher,
    deactivateTeacher
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

router.put(
    "/:id",
    protect,
    authorize("admin"),
    updateTeacher
);

router.delete(
    "/:id",
    protect,
    authorize("admin"),
    deactivateTeacher
);

module.exports = router;