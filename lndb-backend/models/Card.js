const mongoose = require("mongoose");

const cardSchema = new mongoose.Schema({
    fullName: String,
    email: String,
    cardType: String,
    income: Number,
    status: { type: String, default: "Pending" },
    appliedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Card", cardSchema);

