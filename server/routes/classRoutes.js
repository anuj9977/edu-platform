const express = require("express");

const {
    createClass
} = require("../controllers/classController");

const { protect } = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();

router.post(
    "/",
    protect,
    authorize("admin"),
    createClass
);

module.exports = router;