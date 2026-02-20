// server.js - FULLY FIXED FOR PRODUCTION ✅

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

// 🔥 FIXED CORS - Added Vercel + Wildcard for all subdomains
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

// Health endpoints
app.get("/", (req, res) => {
  res.json({
    message: "LNDB Backend LIVE ✅",
    environment: process.env.NODE_ENV,
    port: process.env.PORT || 5000,
    mongodb: mongoose.connection.readyState === 1 ? "Connected" : "Connecting",
    timestamp: new Date().toISOString()
  });
});

app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    mongodb: mongoose.connection.readyState === 1 ? "Connected" : "Disconnected",
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use("/api/admin", adminRoutes);
app.use("/api/accounts", accountRoutes);
app.use("/api/loans", loanRoutes);
app.use("/api/cards", cardRoutes);
app.use("/api/investments", investmentRoutes);

// MongoDB Connection
const connectDB = async () => {
  try {
    const MONGO_URI = process.env.MONGO_URI;

    if (!MONGO_URI) {
      console.error("❌ MONGO_URI missing!");
      return;
    }

    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 60000,
      socketTimeoutMS: 60000,
      maxPoolSize: 5,
      bufferMaxEntries: 0,
      family: 4
    });

    console.log("✅ MongoDB Connected!");

  } catch (error) {
    console.error("❌ MongoDB Error:", error.message);
    setTimeout(connectDB, 10000);
  }
};

connectDB();

// Error handling
app.use((err, req, res, next) => {
  console.error("ERROR:", err);
  res.status(500).json({
    success: false,
    error: "Server error"
  });
});

// Start server
const PORT = process.env.PORT || 5000;
const HOST = "0.0.0.0";

app.listen(PORT, HOST, () => {
  console.log(`🚀 Server on ${HOST}:${PORT}`);
  console.log(`🔍 Health: http://${HOST}:${PORT}/health`);
});

// Graceful shutdown
const gracefulShutdown = async () => {
  await mongoose.connection.close();
  process.exit(0);
};

process.on("SIGINT", gracefulShutdown);
process.on("SIGTERM", gracefulShutdown);

module.exports = app;
