const express = require("express");

const {
    createClass,
    getClasses,
    updateClass,
    
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

router.get(
    "/",
    protect,
    authorize("admin", "teacher"),
    getClasses
);

router.put(
    "/:id",
    protect,
    authorize("admin"),
    updateClass
);



module.exports = router;