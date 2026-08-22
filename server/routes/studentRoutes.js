const express = require("express");

const {
    createStudent,
    getStudents,
    updateStudent,
    deactivateStudent
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
router.put(
    "/:id",
    protect,
    authorize("admin"),
    updateStudent
);

router.delete(
    "/:id",
    protect,
    authorize("admin"),
    deactivateStudent
);

module.exports = router;