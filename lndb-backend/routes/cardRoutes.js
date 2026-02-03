const express = require("express");
const Card = require("../models/Card");
const router = express.Router();

router.post("/apply", async (req, res) => {
    const card = await Card.create(req.body);
    res.json({ message: "Card Application Submitted", card });
});

module.exports = router;

