const express = require("express");

const {
    createFeeStructure,
    generateStudentInvoice,
    recordPayment
} = require("../controllers/feeController");

const { protect } = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();

router.post(
    "/structures",
    protect,
    authorize("admin"),
    createFeeStructure
);

router.post(
    "/invoices",
    protect,
    authorize("admin"),
    generateStudentInvoice
);

router.post(
    "/invoices/:invoiceId/payments",
    protect,
    authorize("admin"),
    recordPayment
);

module.exports = router;