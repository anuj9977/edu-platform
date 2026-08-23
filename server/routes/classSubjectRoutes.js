const express = require("express");

const {
    assignSubjectToClass
} = require("../controllers/classSubjectController");

const { protect } = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();

router.post(
    "/",
    protect,
    authorize("admin"),
    assignSubjectToClass
);

module.exports = router;