const mongoose = require("mongoose");

const loanSchema = new mongoose.Schema({
    fullName: String,
    email: String,
    loanType: String,
    amount: Number,
    income: Number,
    status: { type: String, default: "Pending" },
    appliedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Loan", loanSchema);
