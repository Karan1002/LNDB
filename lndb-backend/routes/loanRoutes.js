const express = require("express");
const Loan = require("../models/Loan");
const router = express.Router();

/* =====================================================
   ✅ APPLY LOAN (5 Types: Business/Car/Education/Gold/Home)
===================================================== */
router.post("/apply", async (req, res) => {
    try {
        console.log("📤 Loan Application:", req.body);

        const loanType = req.body.loanType;

        const typeMapping = {
            "Business Loan": "businessLoan",
            "Car Loan": "carLoan",
            "Education Loan": "educationLoan",
            "Gold Loan": "goldLoan",
            "Home Loan": "homeLoan"  // ✅ HOME LOAN ADDED!
        };

        if (!loanType || !typeMapping[loanType]) {
            return res.status(400).json({
                success: false,
                error: "Invalid loan type. Supported: Business Loan, Car Loan, Education Loan, Gold Loan, Home Loan"
            });
        }

        const applicationType = typeMapping[loanType];

        /* ---------- Common Fields ---------- */
        let loanData = {
            refNo: req.body.refNo,
            email: req.body.email,
            phone: req.body.phone,
            loanAmount: Number(req.body.amount || req.body.loanAmount),
            loanType,
            applicationType,
            status: "pending",
            submittedOn: new Date()
        };

        /* ---------- Loan Specific Fields ---------- */
        if (applicationType === "businessLoan") {
            loanData.ownerName = req.body.ownerName || req.body.name;
            loanData.businessName = req.body.businessName;
            loanData.businessType = req.body.businessType;
        }

        if (applicationType === "carLoan") {
            loanData.applicantName = req.body.applicantName || req.body.name;
            loanData.carBrand = req.body.carBrand;
            loanData.carModel = req.body.carModel;
            loanData.carPrice = Number(req.body.carPrice);
        }

        if (applicationType === "educationLoan") {
            loanData.studentName = req.body.studentName || req.body.name;
            loanData.course = req.body.course;
            loanData.institution = req.body.institution;
        }

        if (applicationType === "goldLoan") {
            loanData.applicantName = req.body.applicantName || req.body.name;
            loanData.goldWeight = Number(req.body.goldWeight);
            loanData.goldPurity = req.body.goldPurity;
        }

        if (applicationType === "homeLoan") {  // ✅ HOME LOAN ADDED!
            loanData.applicantName = req.body.applicantName || req.body.name;
            loanData.propertyType = req.body.propertyType;
            loanData.propertyValue = Number(req.body.propertyValue);
            loanData.loanPurpose = req.body.loanPurpose;
        }

        const loan = await Loan.create(loanData);

        console.log(`✅ ${loanType} saved | Ref: ${loan.refNo}`);

        res.status(201).json({
            success: true,
            refNo: loan.refNo,
            loanId: loan._id,
            message: `${loanType} submitted successfully`
        });

    } catch (error) {
        console.error("❌ Loan Error:", error);

        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                error: "Reference number already exists"
            });
        }

        if (error.name === "ValidationError") {
            const errors = Object.values(error.errors).map(e => e.message);
            return res.status(400).json({
                success: false,
                error: errors.join(", ")
            });
        }

        res.status(500).json({
            success: false,
            error: "Failed to process loan application"
        });
    }
});

/* =====================================================
   ✅ GET ALL LOANS (Admin) - 5 Types Support
===================================================== */
router.get("/", async (req, res) => {
    try {
        const { status, loanType, limit = 50, page = 1 } = req.query;
        const skip = (page - 1) * limit;

        let query = {};

        if (status) query.status = status;

        if (loanType) {
            const typeMap = {
                "Business Loan": "businessLoan",
                "Car Loan": "carLoan",
                "Education Loan": "educationLoan",
                "Gold Loan": "goldLoan",
                "Home Loan": "homeLoan"  // ✅ HOME LOAN ADDED!
            };
            query.applicationType = typeMap[loanType];
        }

        const loans = await Loan.find(query)
            .sort({ createdAt: -1 })
            .skip(Number(skip))
            .limit(Number(limit))
            .select("-__v");

        const total = await Loan.countDocuments(query);

        res.json({
            success: true,
            total,
            page: Number(page),
            count: loans.length,
            data: loans
        });

    } catch (error) {
        console.error("❌ Fetch Loans Error:", error);
        res.status(500).json({
            success: false,
            error: "Failed to fetch loans"
        });
    }
});

/* =====================================================
   ✅ GET SINGLE LOAN
===================================================== */
router.get("/:id", async (req, res) => {
    try {
        const loan = await Loan.findOne({
            $or: [{ _id: req.params.id }, { refNo: req.params.id }]
        }).select("-__v");

        if (!loan) {
            return res.status(404).json({
                success: false,
                error: "Loan not found"
            });
        }

        res.json({ success: true, data: loan });

    } catch (error) {
        console.error("❌ Single loan error:", error);
        res.status(500).json({
            success: false,
            error: "Failed to fetch loan"
        });
    }
});

/* =====================================================
   ✅ APPROVE LOAN
===================================================== */
router.put("/:id/approve", async (req, res) => {
    try {
        const loan = await Loan.findByIdAndUpdate(
            req.params.id,
            {
                status: "approved",
                approvedAt: new Date(),
                updatedAt: new Date()
            },
            { new: true, runValidators: true }
        ).select("-__v");

        if (!loan) {
            return res.status(404).json({
                success: false,
                error: "Loan not found"
            });
        }

        res.json({
            success: true,
            message: `${loan.loanType} approved successfully!`,
            data: loan
        });

    } catch (error) {
        console.error("❌ Approve error:", error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/* =====================================================
   ✅ REJECT LOAN
===================================================== */
router.put("/:id/reject", async (req, res) => {
    try {
        const loan = await Loan.findByIdAndUpdate(
            req.params.id,
            {
                status: "rejected",
                rejectedAt: new Date(),
                updatedAt: new Date()
            },
            { new: true, runValidators: true }
        ).select("-__v");

        if (!loan) {
            return res.status(404).json({
                success: false,
                error: "Loan not found"
            });
        }

        res.json({
            success: true,
            message: `${loan.loanType} rejected successfully!`,
            data: loan
        });

    } catch (error) {
        console.error("❌ Reject error:", error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;
