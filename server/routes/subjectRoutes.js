const express = require("express");

const {
    getSubjects
} = require("../controllers/subjectController");

const { protect } = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();

router.get(
    "/",
    protect,
    authorize("admin", "teacher"),
    getSubjects
);

module.exports = router;