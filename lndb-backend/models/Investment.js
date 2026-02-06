const mongoose = require("mongoose");

const investmentSchema = new mongoose.Schema({
    // ✅ Core Identification
    refNo: {
        type: String,
        required: [true, 'Reference number required'],
        unique: true,
        index: true
    },

    // ✅ Applicant Details
    applicantName: {
        type: String,
        required: [true, 'Applicant name required'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email required'],
        lowercase: true,
        trim: true
    },
    phone: {
        type: String,
        required: [true, 'Phone required']
        // Remove strict regex - frontend handles validation
    },

    // ✅ Financial Details
    loanAmount: {
        type: Number,
        required: [true, 'Amount required'],
        min: [1000, 'Minimum ₹1000 required']
    },
    accountNumber: {
        type: String,
        required: [true, 'Account number required']
        // Remove strict regex - frontend handles validation
    },

    // ✅ EXACT FRONTEND MATCH - NO CASE ISSUES!
    investmentType: {
        type: String,
        required: [true, 'Investment type required'],
        enum: ['mutualfund', 'sip', 'goldbond', 'nps', 'stocks']
    },

    tenure: {
        type: String,
        required: [true, 'Tenure required']
    },

    // ✅ Optional Details
    goal: {
        type: String,
        default: 'Not specified',
        maxlength: 500
    },
    remarks: {
        type: String,
        default: 'None',
        maxlength: 1000
    },

    // ✅ Status & Workflow
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    applicationType: {
        type: String,
        default: 'investmentPlan'
    },

    // ✅ Timestamps
    submittedOn: { type: Date, default: Date.now },
    approvedAt: Date,
    rejectedAt: Date,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
}, {
    // ✅ DISABLE STRICT VALIDATION for flexible saving
    strict: false
});

// ✅ Indexes only (no complex middleware causing issues)
investmentSchema.index({ status: 1, submittedOn: -1 });
investmentSchema.index({ investmentType: 1 });

module.exports = mongoose.model("Investment", investmentSchema);
