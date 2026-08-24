const express = require("express");

const {
    createExam,
    addSubjectToExam
} = require("../controllers/examController");

const { protect } = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();

router.post(
    "/",
    protect,
    authorize("admin"),
    createExam
);
router.post(
    "/:examId/subjects",
    protect,
    authorize("admin"),
    addSubjectToExam
);

module.exports = router;