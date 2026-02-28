const express = require("express");
const Investment = require("../models/Investment");
const router = express.Router();

/* =====================================================
   ✅ APPLY INVESTMENT - Full Validation + Error Handling
===================================================== */
router.post("/apply", async (req, res) => {
    try {
        console.log("📥 Investment Application:", req.body);

        // ✅ Smart field mapping (frontend compatibility)
        const investmentData = {
            refNo: req.body.refNo,
            applicantName: req.body.applicantName || req.body.name || req.body.fullname,
            email: req.body.email,
            phone: req.body.phone,
            loanAmount: Number(req.body.amount || req.body.loanAmount || req.body.investmentAmount),
            accountNumber: req.body.accountNumber || req.body.account,
            investmentType: req.body.investmentType,
            tenure: req.body.tenure,
            goal: req.body.goal || 'Not specified',
            remarks: req.body.remarks || 'None',
            status: 'pending',
            applicationType: 'investmentPlan',
            submittedOn: new Date()
        };

        const investment = await Investment.create(investmentData);
        console.log(`✅ Investment saved | Ref: ${investment.refNo}`);

        res.status(201).json({
            success: true,
            refNo: investment.refNo,
            investmentId: investment._id,
            message: "Investment application submitted successfully!"
        });

    } catch (error) {
        console.error("❌ Investment Error:", error);

        // ✅ Duplicate refNo
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                error: "Reference number already exists. Please try again."
            });
        }

        // ✅ Validation errors
        if (error.name === "ValidationError") {
            const errors = Object.values(error.errors).map(e => e.message);
            return res.status(400).json({
                success: false,
                error: errors.join(", ")
            });
        }

        // ✅ Generic server error
        res.status(500).json({
            success: false,
            error: "Failed to process investment application"
        });
    }
});

/* =====================================================
   ✅ GET ALL INVESTMENTS (Admin Dashboard)
===================================================== */
router.get("/", async (req, res) => {
    try {
        const { status, investmentType, limit = 50, page = 1 } = req.query;
        const skip = (page - 1) * Number(limit);

        let query = {};

        if (status) query.status = status;
        if (investmentType) query.investmentType = investmentType;

        const investments = await Investment.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit))
            .select("-__v");

        const total = await Investment.countDocuments(query);

        res.json({
            success: true,
            total,
            page: Number(page),
            count: investments.length,
            data: investments
        });

    } catch (error) {
        console.error("❌ Fetch Investments Error:", error);
        res.status(500).json({
            success: false,
            error: "Failed to fetch investments"
        });
    }
});

/* =====================================================
   ✅ GET SINGLE INVESTMENT
===================================================== */
router.get("/:id", async (req, res) => {
    try {
        const investment = await Investment.findOne({
            $or: [{ _id: req.params.id }, { refNo: req.params.id }]
        }).select("-__v");

        if (!investment) {
            return res.status(404).json({
                success: false,
                error: "Investment not found"
            });
        }

        res.json({
            success: true,
            data: investment
        });

    } catch (error) {
        console.error("❌ Single investment error:", error);
        res.status(500).json({
            success: false,
            error: "Failed to fetch investment"
        });
    }
});

/* =====================================================
   ✅ APPROVE INVESTMENT
===================================================== */
router.put("/:id/approve", async (req, res) => {
    try {
        const investment = await Investment.findByIdAndUpdate(
            req.params.id,
            {
                status: "approved",
                approvedAt: new Date(),
                updatedAt: new Date()
            },
            { new: true, runValidators: true }
        ).select("-__v");

        if (!investment) {
            return res.status(404).json({
                success: false,
                error: "Investment not found"
            });
        }

        res.json({
            success: true,
            message: `${investment.investmentType} investment approved successfully!`,
            data: investment
        });

    } catch (error) {
        console.error("❌ Approve investment error:", error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/* =====================================================
   ✅ REJECT INVESTMENT
===================================================== */
router.put("/:id/reject", async (req, res) => {
    try {
        const investment = await Investment.findByIdAndUpdate(
            req.params.id,
            {
                status: "rejected",
                rejectedAt: new Date(),
                updatedAt: new Date()
            },
            { new: true, runValidators: true }
        ).select("-__v");

        if (!investment) {
            return res.status(404).json({
                success: false,
                error: "Investment not found"
            });
        }

        res.json({
            success: true,
            message: `${investment.investmentType} investment rejected`,
            data: investment
        });

    } catch (error) {
        console.error("❌ Reject investment error:", error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;
