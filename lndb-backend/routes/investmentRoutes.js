const express = require("express");
const Investment = require("../models/Investment");
const router = express.Router();

router.post("/apply", async (req, res) => {
    const investment = await Investment.create(req.body);
    res.json({ message: "Investment Submitted", investment });
});

module.exports = router;
