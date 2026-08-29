const FeeStructure = require("../models/FeeStructure");
const FeeInvoice = require("../models/FeeInvoice");
const FeePayment = require("../models/FeePayment");
const Class = require("../models/Class");
const Student = require("../models/Student");

const createFeeStructure = async (req, res) => {
    try {
        const {
            classId,
            name,
            academicYear,
            amount,
            dueDate,
            description
        } = req.body;

        const institutionId = req.user.institutionId;

        if (
            !classId ||
            !name ||
            !academicYear ||
            amount === undefined ||
            !dueDate
        ) {
            return res.status(400).json({
                success: false,
                message: "Required fee fields are missing"
            });
        }

        if (amount < 0) {
            return res.status(400).json({
                success: false,
                message: "Fee amount cannot be negative"
            });
        }

        const classData = await Class.findOne({
            _id: classId,
            institutionId,
            isActive: true
        });

        if (!classData) {
            return res.status(404).json({
                success: false,
                message: "Class not found"
            });
        }

        const existingFee = await FeeStructure.findOne({
            institutionId,
            classId,
            name,
            academicYear
        });

        if (existingFee) {
            return res.status(400).json({
                success: false,
                message: "Fee structure already exists"
            });
        }

        const feeStructure = await FeeStructure.create({
            institutionId,
            classId,
            name,
            academicYear,
            amount,
            dueDate,
            description
        });

        return res.status(201).json({
            success: true,
            message: "Fee structure created successfully",
            feeStructure
        });

    } catch (error) {
        console.error("Create fee structure error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error while creating fee structure"
        });
    }
};


const generateStudentInvoice = async (req, res) => {
    try {
        const {
            studentId,
            feeStructureId
        } = req.body;

        const institutionId = req.user.institutionId;

        if (!studentId || !feeStructureId) {
            return res.status(400).json({
                success: false,
                message: "Student and fee structure are required"
            });
        }

        const student = await Student.findOne({
            _id: studentId,
            institutionId,
            status: "active"
        });

        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student not found"
            });
        }

        const feeStructure = await FeeStructure.findOne({
            _id: feeStructureId,
            institutionId,
            isActive: true
        });

        if (!feeStructure) {
            return res.status(404).json({
                success: false,
                message: "Fee structure not found"
            });
        }

        if (
            !student.classId ||
            student.classId.toString() !==
            feeStructure.classId.toString()
        ) {
            return res.status(400).json({
                success: false,
                message: "Fee structure does not belong to student's class"
            });
        }

        const existingInvoice = await FeeInvoice.findOne({
            institutionId,
            studentId,
            feeStructureId
        });

        if (existingInvoice) {
            return res.status(400).json({
                success: false,
                message: "Invoice already exists for this student"
            });
        }

        const invoice = await FeeInvoice.create({
            institutionId,
            studentId,
            feeStructureId,
            totalAmount: feeStructure.amount,
            dueDate: feeStructure.dueDate
        });

        return res.status(201).json({
            success: true,
            message: "Student invoice generated successfully",
            invoice
        });

    } catch (error) {
        console.error("Generate invoice error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error while generating invoice"
        });
    }
};


const recordPayment = async (req, res) => {
    try {
        const { invoiceId } = req.params;

        const {
            amount,
            paymentMethod,
            transactionId,
            remarks
        } = req.body;

        const institutionId = req.user.institutionId;

        if (!amount || amount <= 0 || !paymentMethod) {
            return res.status(400).json({
                success: false,
                message: "Valid amount and payment method are required"
            });
        }

        const invoice = await FeeInvoice.findOne({
            _id: invoiceId,
            institutionId
        });

        if (!invoice) {
            return res.status(404).json({
                success: false,
                message: "Invoice not found"
            });
        }

        const remainingAmount =
            invoice.totalAmount - invoice.paidAmount;

        if (amount > remainingAmount) {
            return res.status(400).json({
                success: false,
                message: `Payment cannot exceed remaining amount ${remainingAmount}`
            });
        }

        const payment = await FeePayment.create({
            institutionId,
            invoiceId: invoice._id,
            studentId: invoice.studentId,
            amount,
            paymentMethod,
            transactionId,
            remarks
        });

        invoice.paidAmount += amount;

        if (invoice.paidAmount >= invoice.totalAmount) {
            invoice.status = "paid";
        } else if (invoice.paidAmount > 0) {
            invoice.status = "partial";
        }

        await invoice.save();

        return res.status(201).json({
            success: true,
            message: "Payment recorded successfully",
            payment,
            invoice
        });

    } catch (error) {
        console.error("Record payment error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error while recording payment"
        });
    }
};


module.exports = {
    createFeeStructure,
    generateStudentInvoice,
    recordPayment
};