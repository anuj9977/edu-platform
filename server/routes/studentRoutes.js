const express = require("express");

const {
    createStudent
} = require("../controllers/studentController");

const { protect } = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();

router.post(
    "/",
    protect,
    authorize("admin"),
    createStudent
);

module.exports = router;