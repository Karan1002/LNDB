// ================================
// LNDB Backend - FULLY PRODUCTION READY ✅
// ATOM ATLAS + RENDER FIXED
// ================================

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const accountRoutes = require("./routes/accountRoutes");
const loanRoutes = require("./routes/loanRoutes");
const cardRoutes = require("./routes/cardRoutes");
const investmentRoutes = require("./routes/investmentRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();

// ================================
// 🔹 CORS CONFIG - Dynamic + Local + Render + Vercel
// ================================
const allowedOrigins = [
  // Local Development
  "http://127.0.0.1:5500",
  "http://localhost:5500",
  "http://localhost:3000",
  "http://localhost:8080",

  // Production Frontend URLs
  "https://lndb-1.onrender.com",
  "https://lndb-frontend.vercel.app"
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error(`CORS blocked for origin: ${origin}`));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
}));

// ================================
// 🔹 Body Parser + Security
// ================================
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ================================
// 🔹 Health / Test Endpoints
// ================================
app.get("/", (req, res) => {
  const PORT = process.env.PORT || 5000;
  res.json({
    message: "🚀 LNDB Backend LIVE with ADMIN PANEL! ✅",
    environment: process.env.NODE_ENV || "development",
    port: PORT,
    timestamp: new Date().toISOString(),
    cors_origin: req.headers.origin,
    mongodb_status: mongoose.connection.readyState === 1 ? "✅ Connected" : "❌ Disconnected",
    routes: {
      admin: "/api/admin/*",
      loans: "/api/loans/apply (POST)",
      accounts: "/api/accounts",
      investments: "/api/investments",
      cards: "/api/cards",
      health: "/health"
    }
  });
});

app.get("/health", (req, res) => {
  res.json({
    status: "healthy ✅",
    mongodb: mongoose.connection.readyState === 1 ? "✅ Connected" : "❌ Disconnected",
    port: process.env.PORT || 5000,
    cors_origin: req.headers.origin,
    timestamp: new Date().toISOString(),
    mongo_uri_set: !!process.env.MONGO_URI
  });
});

// ================================
// 🔹 API Routes
// ================================
app.use("/api/admin", adminRoutes);
app.use("/api/accounts", accountRoutes);
app.use("/api/loans", loanRoutes);
app.use("/api/cards", cardRoutes);
app.use("/api/investments", investmentRoutes);

// ================================
// 🔥 FIXED MongoDB Atlas Connection - Mongoose 8+ READY
// ================================
const connectDB = async () => {
  try {
    const MONGO_URI = process.env.MONGO_URI;

    if (!MONGO_URI) {
      console.error("❌ MONGO_URI not found in environment variables!");
      return;
    }

    console.log("🔄 Connecting to MongoDB Atlas...");

    await mongoose.connect(MONGO_URI, {
      // ✅ REMOVED deprecated options (Mongoose 8+)
      serverSelectionTimeoutMS: 60000,  // 60s - Render cold starts
      socketTimeoutMS: 60000,
      maxPoolSize: 5,                   // Render free tier
      bufferMaxEntries: 0,              // No buffering
      family: 4,                        // IPv4 only (faster)
      authSource: 'admin',              // Atlas default
      retryWrites: true,
      w: 'majority'
    });

    console.log("✅ MongoDB Atlas Connected - Admin Panel Ready!");

  } catch (error) {
    console.error("❌ MongoDB Connection Error:");
    console.error("Error Name:", error.name);
    console.error("Error Message:", error.message);
    console.log("⚠️ Check: 1) MONGO_URI 2) Atlas IP Whitelist (0.0.0.0/0) 3) Atlas User Password");

    // 🔄 Auto-retry every 10s (Render cold starts)
    setTimeout(connectDB, 10000);
  }
};

// 🔥 CONNECT ON STARTUP
connectDB();

// ================================
// 🔹 Error Handling Middleware
// ================================
app.use((err, req, res, next) => {
  console.error("❌ ERROR:", err.stack);
  res.status(500).json({
    error: "Something went wrong!",
    message: process.env.NODE_ENV === 'production' ? 'Server error' : err.message
  });
});

// ================================
// 🔹 Server Start - Dynamic for Render
// ================================
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || "0.0.0.0";

app.listen(PORT, HOST, () => {
  console.log(`🚀 Server LIVE on ${HOST}:${PORT}`);
  console.log(`🔍 Health Check: http://${HOST}:${PORT}/health`);
  console.log("🌐 CORS Origins: Local + Render + Vercel");
  console.log("📊 MongoDB Status:", mongoose.connection.readyState === 1 ? "✅ Connected" : "🔄 Connecting...");
});

// ================================
// 🔹 Graceful Shutdown
// ================================
const gracefulShutdown = async () => {
  console.log("🔴 Graceful shutdown...");
  await mongoose.connection.close();
  console.log("Server stopped");
  process.exit(0);
};

process.on("SIGINT", gracefulShutdown);   // Ctrl+C
process.on("SIGTERM", gracefulShutdown);  // Render termination

module.exports = app;
