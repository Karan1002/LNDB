const mongoose = require("mongoose");

const investmentSchema = new mongoose.Schema({
    fullName: String,
    email: String,
    investmentType: String,
    amount: Number,
    duration: String,
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Investment", investmentSchema);
