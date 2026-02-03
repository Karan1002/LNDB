const express = require("express");
const BankAccount = require("../models/BankAccount");
const router = express.Router();

router.post("/open", async (req, res) => {
    const account = await BankAccount.create(req.body);
    res.json({ message: "Account Opening Request Submitted", account });
});

module.exports = router;
