const express = require("express");
const Loan = require("../models/Loan");
const router = express.Router();

router.post("/apply", async (req, res) => {
    const loan = await Loan.create(req.body);
    res.json({ message: "Loan Application Submitted", loan });
});

module.exports = router;
