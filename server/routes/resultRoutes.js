const express = require("express");

const {
    getStudentResult
} = require("../controllers/resultController");

const { protect } = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();

router.get(
    "/student/:studentId",
    protect,
    authorize("admin", "teacher"),
    getStudentResult
);

module.exports = router;