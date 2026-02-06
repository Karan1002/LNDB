const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const accountRoutes = require("./routes/accountRoutes");
const loanRoutes = require("./routes/loanRoutes");
const cardRoutes = require("./routes/cardRoutes");
const investmentRoutes = require("./routes/investmentRoutes");
const adminRoutes = require("./routes/adminRoutes");  // ✅ ADMIN ENABLED!

const app = express();

// 🔥 PERFECT CORS - Frontend + Admin Panel
app.use(cors({
  origin: [
    'http://127.0.0.1:5500',
    'http://localhost:5500',
    'http://localhost:3000',
    'http://localhost:8080',
    'http://192.168.1.0/24',
    'http://192.168.0.0/24',
    'http://192.168.8.0/24'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Test route - FULL ADMIN PANEL VERSION
app.get("/", (req, res) => {
  const PORT = process.env.PORT || 5000;
  res.json({
    message: "🚀 LNDB Backend LIVE with ADMIN PANEL! ✅",
    port: PORT,
    timestamp: new Date().toISOString(),
    adminPanel: "http://localhost:5500/admin.html",
    routes: {
      admin: "/api/admin/stats, /api/admin/accounts, /api/admin/loans",
      loans: "/api/loans/apply (POST)",
      accounts: "/api/accounts",
      investments: "/api/investments",
      cards: "/api/cards",
      health: "/health"
    }
  });
});

// ✅ Health check - MongoDB + Admin status
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    mongodb: mongoose.connection.readyState === 1 ? "✅ Connected" : "❌ Disconnected",
    adminPanel: "✅ LIVE - /api/admin/stats",
    timestamp: new Date().toISOString()
  });
});

// 🔥 ALL ROUTES - ADMIN FIRST!
app.use("/api/admin", adminRoutes);        // ✅ ADMIN PANEL ROUTES
app.use("/api/accounts", accountRoutes);
app.use("/api/loans", loanRoutes);
app.use("/api/cards", cardRoutes);
app.use("/api/investments", investmentRoutes);

// 🔥 ADMIN TEST ROUTE
app.get("/api/admin/test", (req, res) => {
  res.json({
    message: "✅ FULL MongoDB Admin Panel LIVE!",
    endpoints: [
      "/api/admin/stats",
      "/api/admin/recent",
      "/api/admin/accounts",
      "/api/admin/loans",
      "/api/admin/cards",
      "/api/admin/investments"
    ]
  });
});

// 🔥 MongoDB connection
mongoose
  .connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/loanDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log("✅ MongoDB Connected - Admin Panel Ready!");
    console.log("🌐 Admin Panel: http://localhost:5500/admin.html");
  })
  .catch((err) => {
    console.error("❌ MongoDB Error:", err.message);
    console.log("⚠️ Starting without DB - Admin will show empty tables");
  });

// ✅ Server start
const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server LIVE on http://localhost:${PORT}`);
  console.log(`📱 Mobile: http://${getLocalIP()}:${PORT}`);
  console.log(`🖥️ Admin Panel: http://localhost:5500/admin.html`);
  console.log(`🔍 Test: http://localhost:${PORT}/health`);
  console.log(`📊 Admin Stats: http://localhost:${PORT}/api/admin/stats`);
});

// 🔥 Get local IP for mobile testing
function getLocalIP() {
  const os = require('os');
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const interface of interfaces[name]) {
      if (interface.family === 'IPv4' && !interface.internal) {
        return interface.address;
      }
    }
  }
  return 'localhost';
}

// Graceful shutdown
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('🔴 Server stopped gracefully');
  process.exit(0);
});
