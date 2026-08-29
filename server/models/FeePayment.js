const mongoose = require("mongoose");

const feePaymentSchema = new mongoose.Schema(
    {
        institutionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Institution",
            required: true
        },

        invoiceId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "FeeInvoice",
            required: true
        },

        studentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Student",
            required: true
        },

        amount: {
            type: Number,
            required: true,
            min: 1
        },

        paymentMethod: {
            type: String,
            enum: [
                "cash",
                "upi",
                "card",
                "bank_transfer",
                "online"
            ],
            required: true
        },

        transactionId: {
            type: String,
            trim: true
        },

        paidAt: {
            type: Date,
            default: Date.now
        },

        remarks: {
            type: String,
            trim: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model(
    "FeePayment",
    feePaymentSchema
);
