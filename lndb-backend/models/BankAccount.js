const mongoose = require("mongoose");

const bankAccountSchema = new mongoose.Schema({
    fullName: String,
    email: String,
    mobile: String,
    accountType: String,
    address: String,
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("BankAccount", bankAccountSchema);
