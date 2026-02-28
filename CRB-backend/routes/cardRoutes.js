const express = require("express");
const Card = require("../models/Card");
const router = express.Router();

// 🔥 ✅ SINGLE ROUTE FOR BOTH Debit + Credit Card
router.post("/apply", async (req, res) => {
    try {
        console.log("📤 Card Application:", req.body.applicationType, req.body.refNo);

        // ✅ Frontend se data with proper defaults
        const cardData = {
            ...req.body,
            status: req.body.status || 'pending',
            dob: new Date(req.body.dob),  // Date fix
            createdAt: new Date(),
            updatedAt: new Date()
        };

        // ✅ MongoDB save
        const card = await Card.create(cardData);
        console.log(`✅ ${card.applicationType} Saved:`, card.refNo);

        res.json({
            success: true,
            refNo: card.refNo,
            cardId: card._id,
            message: `${card.applicationType === 'creditCard' ? 'Credit' : 'Debit'} Card Application Submitted Successfully!`
        });

    } catch (error) {
        console.error("❌ Card Error:", error);

        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                error: "Reference number already exists!"
            });
        }

        res.status(400).json({
            success: false,
            error: error.message || "Failed to submit application"
        });
    }
});

// ✅ GET ALL APPLICATIONS (Debit + Credit) - Admin Panel
router.get("/", async (req, res) => {
    try {
        const { status, type, limit = 50 } = req.query;
        let query = {};

        // Filter by applicationType
        if (type === 'debit' || type === 'credit') {
            query.applicationType = type === 'debit' ? 'debitCard' : 'creditCard';
        }

        if (status) query.status = status;

        const cards = await Card.find(query)
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .select('-__v');

        res.json({
            success: true,
            count: cards.length,
            data: cards
        });
    } catch (error) {
        console.error("❌ Cards List Error:", error);
        res.status(500).json({ error: error.message });
    }
});

// ✅ GET SINGLE APPLICATION by refNo
router.get("/:ref", async (req, res) => {
    try {
        const card = await Card.findOne({
            $or: [{ _id: req.params.ref }, { refNo: req.params.ref }]
        });

        if (!card) {
            return res.status(404).json({
                success: false,
                error: 'Application not found'
            });
        }

        res.json({
            success: true,
            data: card
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ✅ APPROVE APPLICATION
router.put("/:id/approve", async (req, res) => {
    try {
        const card = await Card.findByIdAndUpdate(
            req.params.id,
            { status: "approved", updatedAt: new Date() },
            { new: true }
        );

        if (!card) {
            return res.status(404).json({ error: "Application not found" });
        }

        const type = card.applicationType === 'creditCard' ? 'Credit' : 'Debit';
        res.json({
            success: true,
            message: `${type} Card Approved!`,
            data: card
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ✅ REJECT APPLICATION
router.put("/:id/reject", async (req, res) => {
    try {
        const card = await Card.findByIdAndUpdate(
            req.params.id,
            { status: "rejected", updatedAt: new Date() },
            { new: true }
        );

        if (!card) {
            return res.status(404).json({ error: "Application not found" });
        }

        const type = card.applicationType === 'creditCard' ? 'Credit' : 'Debit';
        res.json({
            success: true,
            message: `${type} Card Rejected!`,
            data: card
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
