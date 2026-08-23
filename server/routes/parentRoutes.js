const express = require("express");

const {
    createParent,
    linkStudentToParent
} = require("../controllers/parentController");

const { protect } = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();

router.post(
    "/",
    protect,
    authorize("admin"),
    createParent
);
router.post(
    "/:parentId/students/:studentId",
    protect,
    authorize("admin"),
    linkStudentToParent
);

module.exports = router;