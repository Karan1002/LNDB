const express = require("express");
const BankAccount = require("../models/BankAccount");
const router = express.Router();

// 🔥 Form से नया account बनाओ (पहले से है)
router.post("/open", async (req, res) => {
    try {
        const account = await BankAccount.create(req.body);
        res.json({ message: "Account Opening Request Submitted", account });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// 🔥 Admin के लिए सभी accounts लिस्ट
router.get("/", async (req, res) => {
    try {
        const accounts = await BankAccount.find();
        res.json(accounts);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 🔥 Admin approve account
router.put("/:id/approved", async (req, res) => {
    try {
        const account = await BankAccount.findByIdAndUpdate(
            req.params.id,
            { status: "Approved" },
            { new: true }
        );

        if (!account) {
            return res.status(404).json({ error: "Account not found" });
        }

        res.json({ message: "Account Approved!", account });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 🔥 Admin reject account
router.put("/:id/rejected", async (req, res) => {
    try {
        const account = await BankAccount.findByIdAndUpdate(
            req.params.id,
            { status: "Rejected" },
            { new: true }
        );

        if (!account) {
            return res.status(404).json({ error: "Account not found" });
        }

        res.json({ message: "Account Rejected!", account });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
