// server.js - FULLY FIXED FOR PRODUCTION ✅ (Updated Feb 2026)

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

// CORS Configuration
app.use(cors({
  origin: [
    "http://localhost:3000",
    "http://127.0.0.1:5500",
    "http://localhost:5500",
    "https://lndb-frontend.vercel.app",
    "https://lndb-zp1n-37axnpq2d-karas-projects-0e89f8c3.vercel.app",
    "https://lndb-banking-1.onrender.com"
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Health Endpoints
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
    // Real DB ping for accurate health status
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
      error: err.message,
      timestamp: new Date().toISOString()
    });
  }
});

// API Routes
app.use("/api/admin", adminRoutes);
app.use("/api/accounts", accountRoutes);
app.use("/api/loans", loanRoutes);
app.use("/api/cards", cardRoutes);
app.use("/api/investments", investmentRoutes);

// MongoDB Connection (FIXED: Removed deprecated bufferMaxEntries)
const connectDB = async () => {
  try {
    const MONGO_URI = process.env.MONGO_URI;

    if (!MONGO_URI) {
      console.error("❌ MONGO_URI missing from .env file!");
      process.exit(1);
    }

    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 10000,  // Fast timeout
      socketTimeoutMS: 45000,
      maxPoolSize: process.env.NODE_ENV === 'production' ? 3 : 5,
      family: 4,  // Force IPv4
      // ✅ Removed: bufferMaxEntries (deprecated/unsupported in modern drivers)
    });

    console.log("✅ MongoDB Connected Successfully!");
    console.log(`📊 Database: ${mongoose.connection.name}`);
    console.log(`🔗 Host: ${mongoose.connection.host}:${mongoose.connection.port}`);

  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error.message);
    console.log("🔄 Retrying in 5 seconds...");
    setTimeout(connectDB, 5000);
  }
};

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error("🚨 SERVER ERROR:", err.stack);
  res.status(500).json({
    success: false,
    message: "Internal Server Error",
    error: process.env.NODE_ENV === 'production' ? "Something went wrong" : err.message
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found"
  });
});

// Initialize DB connection BEFORE starting server
connectDB();

// Start Server
const PORT = process.env.PORT || 5000;
const HOST = process.env.NODE_ENV === 'production' ? "0.0.0.0" : "localhost";

app.listen(PORT, HOST, () => {
  console.log(`🚀 LNDB Server running on ${HOST}:${PORT}`);
  console.log(`🔍 Health Check: http://${HOST}:${PORT}/health`);
  console.log(`📱 Root: http://${HOST}:${PORT}/`);
});

// Graceful Shutdown
const gracefulShutdown = async () => {
  console.log("\n🛑 Shutting down gracefully...");
  await mongoose.connection.close();
  console.log("✅ MongoDB connection closed.");
  process.exit(0);
};

process.on("SIGINT", gracefulShutdown);   // Ctrl+C
process.on("SIGTERM", gracefulShutdown);  // Kill command

module.exports = app;
