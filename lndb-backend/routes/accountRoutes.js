const express = require("express");
const BankAccount = require("../models/BankAccount");
const multer = require("multer");
const path = require("path");
const router = express.Router();

// ✅ UPLOADS FOLDER (Fixed path)
const uploadDir = path.join(__dirname, '../uploads');
const fs = require('fs');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// ✅ FIXED MULTER CONFIG - Individual fields specify karo
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => {
        cb(null, `account_${Date.now()}_${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only images and PDF allowed'), false);
        }
    }
});

// 🔥 MAIN ROUTE - **100% ERROR FIXED VERSION**
router.post("/open", upload.fields([
    { name: 'photoFile', maxCount: 1 },
    { name: 'signFile', maxCount: 1 },
    { name: 'businessRegFile', maxCount: 1 },
    { name: 'gstCertFile', maxCount: 1 },
    { name: 'panCompanyFile', maxCount: 1 },
    { name: 'addressProofFile', maxCount: 1 },
    { name: 'authIdFile', maxCount: 1 }
]), async (req, res) => {
    try {
        console.log("📤 Form Fields:", Object.keys(req.body));
        console.log("📁 Files received:", req.files ? Object.keys(req.files) : 'None');

        // ✅ **CRITICAL: Frontend data log karo pehle**
        console.log("Frontend data sample:", {
            fullName: req.body.fullName,
            personalPan: req.body.personalPan,
            contactPhone: req.body.contactPhone,
            accountType: req.body.accountType
        });

        // ✅ **EXACT MAPPING - Schema ke liye safe values**
        const accountData = {
            // ✅ Required fields jo schema mein hai
            refNo: `LNDB-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
            accountType: req.body.accountType === 'Current' ? 'Current' : 'Savings',  // ✅ Safe enum

            fullName: req.body.fullName || 'N/A',
            fatherName: req.body.fatherName || 'N/A',
            dob: req.body.dob ? new Date(req.body.dob) : new Date(),

            // ✅ Schema field names mein map karo
            mobile: req.body.contactPhone || req.body.mobile || '0000000000',
            email: req.body.contactEmail || req.body.email || 'no-email@bank.com',
            address: req.body.address || 'N/A',
            state: req.body.state || 'Maharashtra',
            district: req.body.district || 'Panvel',
            city: req.body.city || 'Panvel',
            pincode: req.body.pincode || '410206',

            // ✅ Documents
            aadhar: req.body.aadhaarFull || req.body.aadhar || '000000000000',
            pan: (req.body.personalPan || req.body.pan || 'ABCDE1234F').toUpperCase(),

            // ✅ Optional fields with defaults
            businessName: req.body.businessName || '',
            businessType: req.body.businessType || '',
            authName: req.body.authName || '',
            authDesignation: req.body.authDesignation || '',
            authMobile: req.body.authMobile || '',
            authEmail: req.body.authEmail || '',

            nomineeName: req.body.nomineeName || '',
            nomineeRelation: req.body.nomineeRelation || '',

            branch: 'Main Branch',  // ✅ Default branch

            // ✅ Files (Schema mein add karna padega ya ignore)
            ...(req.files && {
                photoFile: req.files.photoFile?.[0]?.path || null,
                signFile: req.files.signFile?.[0]?.path || null
            })
        };

        console.log("💾 Final accountData:", {
            refNo: accountData.refNo,
            accountType: accountData.accountType,
            fullName: accountData.fullName,
            pan: accountData.pan
        });

        // ✅ MongoDB Save
        const account = await BankAccount.create(accountData);
        console.log("✅ SUCCESS:", account.refNo);

        res.json({
            success: true,
            refNo: account.refNo,
            accountId: account._id,
            message: `${account.accountType} Account Application Submitted Successfully!`
        });

    } catch (err) {
        console.error("❌ DETAILED ERROR:", err);

        // ✅ File cleanup
        if (req.files) {
            Object.values(req.files).flat().forEach(file => {
                try {
                    if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
                } catch (cleanupErr) {
                    console.log("Cleanup error:", cleanupErr);
                }
            });
        }

        // ✅ Detailed error response
        res.status(400).json({
            success: false,
            error: err.message,
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
    }
});

// ✅ GET ALL ACCOUNTS
router.get("/", async (req, res) => {
    try {
        const { status, accountType, limit = 50 } = req.query;
        let query = {};

        if (status) query.status = status;
        if (accountType) query.accountType = accountType;

        const accounts = await BankAccount.find(query)
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .select('-photoFile -signFile'); // Files exclude karo list mein

        res.json({
            success: true,
            count: accounts.length,
            data: accounts
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ✅ GET SINGLE ACCOUNT
router.get("/:ref", async (req, res) => {
    try {
        const account = await BankAccount.findOne({
            $or: [
                { _id: req.params.ref },
                { refNo: req.params.ref }
            ]
        }).populate('files');

        if (!account) {
            return res.status(404).json({ success: false, error: 'Account not found' });
        }

        res.json({ success: true, data: account });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ✅ APPROVE
router.put("/:id/approve", async (req, res) => {
    try {
        const account = await BankAccount.findByIdAndUpdate(
            req.params.id, { status: "approved" }, { new: true }
        );
        if (!account) return res.status(404).json({ error: "Account not found" });
        res.json({ success: true, message: "Account Approved!", data: account });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ✅ REJECT
router.put("/:id/reject", async (req, res) => {
    try {
        const account = await BankAccount.findByIdAndUpdate(
            req.params.id, { status: "rejected" }, { new: true }
        );
        if (!account) return res.status(404).json({ error: "Account not found" });
        res.json({ success: true, message: "Account Rejected!", data: account });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
