const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// 🔥 COMPLETE DASHBOARD STATS - ALL 5 COLLECTIONS
router.get('/stats', async (req, res) => {
    try {
        const db = mongoose.connection.db;
        const stats = await Promise.all([
            db.collection('accounts').countDocuments({ status: 'pending' }),
            db.collection('loans').countDocuments({ status: 'Pending' }),
            db.collection('applications').countDocuments({ status: 'pending' }), // Debit cards
            db.collection('creditcardapplications').countDocuments({ status: 'pending' }), // Credit cards
            db.collection('investments').countDocuments({ status: 'pending' })
        ]);

        res.json({
            totalPending: stats[0] + stats[1] + stats[2] + stats[3] + stats[4],
            accounts: { pending: stats[0] },
            loans: { pending: stats[1] },
            cards: { pending: stats[2] + stats[3] },
            investments: { pending: stats[4] }
        });
    } catch (e) {
        res.json({
            totalPending: 0,
            accounts: { pending: 0 },
            loans: { pending: 0 },
            cards: { pending: 0 },
            investments: { pending: 0 }
        });
    }
});

// 🔥 RECENT PENDING - Quick Actions Dashboard
router.get('/recent', async (req, res) => {
    try {
        const db = mongoose.connection.db;
        const recent = await Promise.all([
            db.collection('accounts').find({ status: 'pending' }).sort({ createdAt: -1 }).limit(3).toArray(),
            db.collection('loans').find({ status: 'Pending' }).sort({ createdAt: -1 }).limit(3).toArray(),
            db.collection('investments').find({ status: 'pending' }).sort({ submittedOn: -1 }).limit(3).toArray()
        ]);

        const combined = [
            ...recent[0].map(a => ({ ...a, module: 'accounts', type: a.accountType || 'Savings' })),
            ...recent[1].map(l => ({ ...l, module: 'loans', type: l.loanType || 'Personal' })),
            ...recent[2].map(i => ({ ...i, module: 'investments', type: i.investmentType || 'Mutual Fund' }))
        ].sort((a, b) => new Date(b.createdAt || b.submittedOn) - new Date(a.createdAt || a.submittedOn))
            .slice(0, 10);

        res.json(combined);
    } catch (e) {
        res.json([]);
    }
});

// 🔥 ACCOUNTS - All Status
router.get('/accounts', async (req, res) => {
    try {
        // Combine savings + current accounts
        const [savings, current] = await Promise.all([
            mongoose.connection.db.collection('lndbSavingAccounts').find({}).sort({ createdAt: -1 }).limit(50).toArray(),
            mongoose.connection.db.collection('lndbCurrentAccounts').find({}).sort({ createdAt: -1 }).limit(50).toArray()
        ]);
        res.json([...savings, ...current]);
    } catch (e) {
        // Fallback to single accounts collection
        const accounts = await mongoose.connection.db
            .collection('accounts')
            .find({})
            .sort({ createdAt: -1 })
            .limit(100)
            .toArray();
        res.json(accounts);
    }
});

router.put('/accounts/:id/:status', async (req, res) => {
    try {
        const { id, status } = req.params;
        const collections = ['lndbSavingAccounts', 'lndbCurrentAccounts', 'accounts'];

        let updated = false;
        for (const coll of collections) {
            const result = await mongoose.connection.db.collection(coll).updateOne(
                { _id: mongoose.Types.ObjectId(id) },
                { $set: { status, updatedAt: new Date() } }
            );
            if (result.modifiedCount > 0) {
                updated = true;
                break;
            }
        }
        res.json({ success: updated });
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

// 🔥 LOANS
router.get('/loans', async (req, res) => {
    try {
        const loans = await mongoose.connection.db
            .collection('loans')
            .find({})
            .sort({ createdAt: -1 })
            .limit(100)
            .toArray();
        res.json(loans);
    } catch (e) { res.json([]); }
});

router.put('/loans/:id/:status', async (req, res) => {
    try {
        const { id, status } = req.params;
        await mongoose.connection.db.collection('loans').updateOne(
            { _id: mongoose.Types.ObjectId(id) },
            { $set: { status, updatedAt: new Date() } }
        );
        res.json({ success: true });
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

// 🔥 CARDS - Debit + Credit COMBINED
router.get('/cards', async (req, res) => {
    try {
        const [debit, credit] = await Promise.all([
            mongoose.connection.db.collection('applications').find({}).sort({ createdAt: -1 }).limit(50).toArray(),
            mongoose.connection.db.collection('creditcardapplications').find({}).sort({ createdAt: -1 }).limit(50).toArray()
        ]);
        res.json([
            ...debit.map(c => ({ ...c, type: 'Debit' })),
            ...credit.map(c => ({ ...c, type: 'Credit' }))
        ]);
    } catch (e) { res.json([]); }
});

router.put('/cards/:id/:status', async (req, res) => {
    try {
        const { id, status } = req.params;
        const collections = ['applications', 'creditcardapplications'];
        let updated = false;

        for (const coll of collections) {
            const result = await mongoose.connection.db.collection(coll).updateOne(
                { _id: mongoose.Types.ObjectId(id) },
                { $set: { status, updatedAt: new Date() } }
            );
            if (result.modifiedCount > 0) {
                updated = true;
                break;
            }
        }
        res.json({ success: updated });
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

// 🔥 INVESTMENTS
router.get('/investments', async (req, res) => {
    try {
        const investments = await mongoose.connection.db
            .collection('investments')
            .find({})
            .sort({ submittedOn: -1 })
            .limit(100)
            .toArray();
        res.json(investments);
    } catch (e) { res.json([]); }
});

router.put('/investments/:id/:status', async (req, res) => {
    try {
        const { id, status } = req.params;
        await mongoose.connection.db.collection('investments').updateOne(
            { _id: mongoose.Types.ObjectId(id) },
            { $set: { status, updatedAt: new Date() } }
        );
        res.json({ success: true });
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

// 🔥 SEARCH - Global search across all collections
router.get('/search', async (req, res) => {
    const { q } = req.query;
    if (!q) return res.json([]);

    try {
        const db = mongoose.connection.db;
        const searchResults = await Promise.all([
            db.collection('loans').find({ $text: { $search: q } }).limit(5).toArray(),
            db.collection('accounts').find({ $or: [{ fullName: { $regex: q, $options: 'i' } }, { phone: { $regex: q } }] }).limit(5).toArray(),
            db.collection('investments').find({ $or: [{ applicantName: { $regex: q, $options: 'i' } }, { refNo: { $regex: q } }] }).limit(5).toArray()
        ]);

        res.json({
            query: q,
            results: [...searchResults[0], ...searchResults[1], ...searchResults[2]]
        });
    } catch (e) {
        res.json([]);
    }
});

router.get('/test', (req, res) => {
    res.json({
        message: "✅ FULL MongoDB Admin Panel LIVE!",
        collections: ['accounts', 'loans', 'cards', 'investments'],
        endpoints: ['/stats', '/recent', '/accounts', '/loans', '/cards', '/investments'],
        timestamp: new Date().toISOString()
    });
});

module.exports = router;
