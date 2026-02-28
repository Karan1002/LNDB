const mongoose = require("mongoose");

const bankAccountSchema = new mongoose.Schema({
    // ✅ Reference Number (Auto-generate) - unique: true = index auto-create
    refNo: { type: String, required: true, unique: true },

    // ✅ Account Type (Simple - Savings ya Current)
    accountType: {
        type: String,
        required: true,
        enum: ['Savings', 'Current']
    },

    // ✅ Personal Details (Common for both)
    fullName: { type: String, required: true },
    fatherName: { type: String, required: true },
    dob: { type: Date, required: true },
    gender: String,
    maritalStatus: String,

    // ✅ Contact Information (Common)
    mobile: { type: String, required: true },
    email: { type: String, required: true },
    address: { type: String, required: true },
    state: { type: String, required: true },
    district: { type: String, required: true },
    city: { type: String, required: true },
    pincode: { type: String, required: true },

    // ✅ Documents (Common)
    aadhar: { type: String, required: true },
    pan: { type: String, required: true, uppercase: true },  // ✅ Added uppercase

    // ✅ Savings Account Fields (Optional)
    nomineeName: String,
    nomineeRelation: String,
    nomineeDOB: { type: Date },

    // ✅ Current Account Fields (Optional)
    businessName: String,
    businessType: String,
    registrationNumber: String,
    natureOfBusiness: String,
    gstNumber: String,
    panCompany: String,

    // ✅ Authorized Signatory (Current Account only)
    authName: String,
    authDesignation: String,
    authMobile: String,
    authEmail: String,

    // ✅ Common Fields
    branch: { type: String, default: 'Main Branch' },

    // ✅ Status
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// ✅ Auto-update timestamp
bankAccountSchema.pre('save', function (next) {
    this.updatedAt = Date.now();

    // ✅ Auto-uppercase PAN
    if (this.pan) {
        this.pan = this.pan.toUpperCase();
    }

    next();
});

// ✅ ✅ ONLY COMPOUND INDEX - No duplicates! 
// refNo ka index already unique: true se ban gaya
bankAccountSchema.index({ status: 1, createdAt: -1 });  // Recent pending first
bankAccountSchema.index({ accountType: 1, status: 1 });  // Account type + status

module.exports = mongoose.model("BankAccount", bankAccountSchema);
