const mongoose = require("mongoose");

const loanSchema = new mongoose.Schema({
    refNo: { type: String, required: true, unique: true },  // ✅ UNIQUE handles index
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: {
        type: String,
        required: true,
        match: [/^\d{10}$/, 'Invalid phone']
    },
    loanAmount: { type: Number, required: true, min: 0 },

    // ✅ ALL 5 LOAN TYPES
    loanType: {
        type: String,
        enum: ['Business Loan', 'Car Loan', 'Education Loan', 'Gold Loan', 'Home Loan'],
        required: true
    },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    applicationType: {
        type: String,
        enum: ['businessLoan', 'carLoan', 'educationLoan', 'goldLoan', 'homeLoan'],
        required: true
    },
    submittedOn: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },

    // ✅ Business Loan
    ownerName: {
        type: String,
        required: [function () { return this.applicationType === 'businessLoan'; }]
    },
    businessName: {
        type: String,
        required: [function () { return this.applicationType === 'businessLoan'; }]
    },
    businessType: {
        type: String,
        required: [function () { return this.applicationType === 'businessLoan'; }]
    },

    // ✅ Car + Gold + Home Loan (applicantName)
    applicantName: {
        type: String,
        required: [function () {
            return this.applicationType === 'carLoan' ||
                this.applicationType === 'goldLoan' ||
                this.applicationType === 'homeLoan';
        }]
    },

    // ✅ Car Loan
    carBrand: { type: String, required: [function () { return this.applicationType === 'carLoan'; }] },
    carModel: { type: String, required: [function () { return this.applicationType === 'carLoan'; }] },
    carPrice: { type: Number, required: [function () { return this.applicationType === 'carLoan'; }] },

    // ✅ Education Loan
    studentName: {
        type: String,
        required: [function () { return this.applicationType === 'educationLoan'; }]
    },
    course: { type: String, required: [function () { return this.applicationType === 'educationLoan'; }] },
    institution: { type: String, required: [function () { return this.applicationType === 'educationLoan'; }] },

    // ✅ Gold Loan
    goldWeight: {
        type: Number,
        required: [function () { return this.applicationType === 'goldLoan'; }]
    },
    goldPurity: {
        type: String,
        required: [function () { return this.applicationType === 'goldLoan'; }]
    },

    // ✅ Home Loan
    propertyType: {
        type: String,
        required: [function () { return this.applicationType === 'homeLoan'; }]
    },
    propertyValue: {
        type: Number,
        required: [function () { return this.applicationType === 'homeLoan'; }]
    },
    loanPurpose: {
        type: String,
        required: [function () { return this.applicationType === 'homeLoan'; }]
    }
});

// ✅ ONLY these indexes (NO refNo duplicate)
loanSchema.index({ status: 1, submittedOn: -1 });
loanSchema.index({ applicationType: 1, status: 1 });
loanSchema.index({ email: 1 });

// ✅ Timestamps
loanSchema.pre('save', function (next) {
    this.updatedAt = new Date();
    next();
});

loanSchema.pre('findOneAndUpdate', function (next) {
    this.options.runValidators = true;
    next();
});

module.exports = mongoose.model("Loan", loanSchema);
