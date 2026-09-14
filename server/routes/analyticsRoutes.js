const express = require("express");
const authorize = require("../middleware/roleMiddleware");
const router = express.Router();

const {
    getAdminAnalytics
} = require("../controllers/analyticsController");

const {
    protect,
} = require("../middleware/authMiddleware");

router.get(
    "/admin/analytics",
    protect,
    authorize("admin"),
    getAdminAnalytics
);

module.exports = router;