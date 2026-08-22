const express = require("express");

const {
    createStudent,
    getStudents,
} = require("../controllers/studentController");

const { protect } = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();

router.get(
    "/",
    protect,
    authorize("admin", "teacher"),
    getStudents
);

router.post(
    "/",
    protect,
    authorize("admin"),
    createStudent
);


module.exports = router;