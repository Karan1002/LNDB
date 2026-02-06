const mongoose = require("mongoose");

const cardSchema = new mongoose.Schema({
    // ✅ Frontend se aane wale fields (REQUIRED)
    refNo: {
        type: String,
        required: true,
        unique: true  // ✅ ONLY YEHI - Auto index banega
    },
    accountNumber: {
        type: String,
        required: true
    },
    fullName: {
        type: String,
        required: true
    },
    dob: {
        type: Date,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    cardType: {
        type: String,
        required: true
    },

    // ✅ CREDIT CARD fields (optional for debit)
    income: Number,
    annualLimit: String,
    pan: String,
    aadhaar: String,

    // ✅ Status & Type
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    applicationType: {
        type: String,
        enum: ['debitCard', 'creditCard'],
        required: true
    },

    // ✅ Timestamps
    appliedAt: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// ✅ Pre-save hook
cardSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    if (this.pan) this.pan = this.pan.toUpperCase();
    next();
});

// ✅ ✅ NO REFNO INDEX - Already unique: true se hai!
// ✅ ONLY COMPOUND INDEXES:
cardSchema.index({ status: 1, appliedAt: -1 });           // Admin sorting
cardSchema.index({ applicationType: 1, status: 1 });     // Type filter
cardSchema.index({ accountNumber: 1 });                  // Account search

module.exports = mongoose.model("Card", cardSchema);
