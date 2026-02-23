// server.js - FIXED: bufferMaxEntries REMOVED ✅
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

// Dynamic Frontend URL
const FRONTEND_URL = process.env.NODE_ENV === 'production'
  ? (process.env.RENDER_FRONTEND_URL || process.env.VERCEL_FRONTEND_URL)
  : 'http://localhost:3000';

// ✅ FIXED CORS - No duplicates
app.use(cors({
  origin: [
    "http://localhost:3000",
    "http://127.0.0.1:5500",
    "http://localhost:5500",
    process.env.VERCEL_FRONTEND_URL,
    process.env.RENDER_FRONTEND_URL,
    FRONTEND_URL
  ].filter(Boolean),
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Health endpoints
app.get("/", (req, res) => {
  res.json({
    message: "LNDB Backend LIVE ✅",
    environment: process.env.NODE_ENV || "development",
    port: process.env.PORT || 5000,
    mongodb: mongoose.connection.readyState === 1 ? "Connected" : "Disconnected",
    timestamp: new Date().toISOString()
  });
});

app.get("/health", async (req, res) => {
  try {
    await mongoose.connection.db.admin().ping();
    res.json({
      status: "healthy",
      mongodb: "Connected",
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(503).json({
      status: "unhealthy",
      mongodb: "Disconnected",
      timestamp: new Date().toISOString()
    });
  }
});

// Routes
app.use("/api/admin", adminRoutes);
app.use("/api/accounts", accountRoutes);
app.use("/api/loans", loanRoutes);
app.use("/api/cards", cardRoutes);
app.use("/api/investments", investmentRoutes);

// 🚨 CRITICAL FIX: bufferMaxEntries COMPLETELY REMOVED
const connectDB = async () => {
  try {
    const MONGO_URI = process.env.MONGO_URI;

    if (!MONGO_URI) {
      console.error("❌ MONGO_URI missing!");
      process.exit(1);
    }

    await mongoose.connect(MONGO_URI, {
      // ✅ NO bufferMaxEntries - completely removed!
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      maxPoolSize: process.env.NODE_ENV === 'production' ? 3 : 5,
      family: 4  // IPv4 only
    });

    console.log("✅ MongoDB Connected!");
    console.log(`📊 DB: ${mongoose.connection.name}`);

  } catch (error) {
    console.error("❌ MongoDB Error:", error.message);
    setTimeout(connectDB, 5000);
  }
};

// Error handlers
app.use((err, req, res, next) => {
  console.error("🚨 ERROR:", err.stack);
  res.status(500).json({ success: false, message: "Server error" });
});

app.use("*", (req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

connectDB();

const PORT = process.env.PORT || 5000;
const HOST = process.env.NODE_ENV === 'production' ? "0.0.0.0" : "localhost";

app.listen(PORT, HOST, () => {
  console.log(`🚀 Server: http://${HOST}:${PORT}`);
  console.log(`🔍 Health: http://${HOST}:${PORT}/health`);
});

process.on("SIGINT", async () => {
  await mongoose.connection.close();
  process.exit(0);
});
