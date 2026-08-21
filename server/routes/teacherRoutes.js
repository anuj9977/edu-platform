const express = require("express");

const {
    createTeacher
} = require("../controllers/teacherController");

const { protect } = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();

router.post(
    "/",
    protect,
    authorize("admin"),
    createTeacher
);

module.exports = router;