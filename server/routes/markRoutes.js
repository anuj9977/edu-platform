const express = require("express");

const {
    createStudentMark
} = require("../controllers/markController");

const { protect } = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();

router.post(
    "/",
    protect,
    authorize("admin", "teacher"),
    createStudentMark
);

module.exports = router;