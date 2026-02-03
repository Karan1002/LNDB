const mongoose = require("mongoose");

const bankAccountSchema = new mongoose.Schema({
    // Personal Details (Complete Form Fields)
    fullName: { type: String, required: true },
    fatherName: { type: String, required: true },
    motherName: { type: String, required: true },
    dob: { type: Date, required: true },
    gender: { type: String, required: true },
    maritalStatus: { type: String, required: true },

    // Contact Information
    mobile: { type: String, required: true },
    email: { type: String, required: true },
    address: { type: String, required: true },
    state: { type: String, required: true },
    district: { type: String, required: true },
    city: { type: String, required: true },
    pincode: { type: String, required: true },

    // Identity Documents
    aadhar: { type: String, required: true },
    pan: { type: String, required: true },

    // Account Preferences
    branch: { type: String, required: true },
    nomineeName: { type: String, required: true },
    nomineeRelation: { type: String, required: true },
    nomineeDOB: { type: Date },

    // Account Details
    accountType: {
        type: String,
        required: true,
        enum: ['Savings Account', 'Joint Savings', 'Current Account']
    },

    // Status Management (Admin Panel के लिए)
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending'
    },

    // Timestamps
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Auto-update updatedAt field
bankAccountSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model("BankAccount", bankAccountSchema);
