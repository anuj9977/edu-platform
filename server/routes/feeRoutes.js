const express = require("express");

const {
    createFeeStructure,
    generateStudentInvoice,
    recordPayment,
    getStudentFees,
    getFeeStructures,
    getParentFees
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

router.get(
    "/student/:studentId",
    protect,
    authorize("admin", "teacher"),
    getStudentFees
);

router.get(
    "/parent",
    protect,
    authorize("parent"),
    getParentFees
);

router.get(
    "/structures",
    protect,
    authorize("admin"),
    getFeeStructures
);

module.exports = router;