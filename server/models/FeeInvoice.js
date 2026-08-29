const mongoose = require("mongoose");

const feeInvoiceSchema = new mongoose.Schema(
    {
        institutionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Institution",
            required: true
        },

        studentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Student",
            required: true
        },

        feeStructureId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "FeeStructure",
            required: true
        },

        totalAmount: {
            type: Number,
            required: true,
            min: 0
        },

        paidAmount: {
            type: Number,
            default: 0,
            min: 0
        },

        dueDate: {
            type: Date,
            required: true
        },

        status: {
            type: String,
            enum: [
                "pending",
                "partial",
                "paid",
                "overdue"
            ],
            default: "pending"
        }
    },
    {
        timestamps: true
    }
);

feeInvoiceSchema.index(
    {
        institutionId: 1,
        studentId: 1,
        feeStructureId: 1
    },
    {
        unique: true
    }
);

module.exports = mongoose.model(
    "FeeInvoice",
    feeInvoiceSchema
);