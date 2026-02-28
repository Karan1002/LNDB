// server.js - FULLY FIXED FOR CAR LOAN ✅
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

// ✅ FIXED CORS - Added ALL frontend URLs
app.use(cors({
  origin: [
    "http://localhost:3000",
    "http://127.0.0.1:5500",
    "http://localhost:5500",
    "https://lndb-frontend.vercel.app",
    "https://lndb-1.onrender.com",        // ✅ ADDED
    "https://lndb-zp1n-37axnpq2d-karas-projects-0e89f8c3.vercel.app"
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
      db: "connected",
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(503).json({
      status: "unhealthy",
      db: "disconnected",
      timestamp: new Date().toISOString()
    });
  }
});

// ✅ NEW: Car Loan Application Endpoint
app.post("/api/loans/car-apply", async (req, res) => {
  try {
    const { applicantName, email, phoneNumber, carBrand } = req.body;

    // Basic validation
    if (!applicantName || !email || !phoneNumber || !carBrand) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    // ✅ Save to MongoDB (add your Loan schema here)
    const loanApplication = {
      applicantName,
      email,
      phoneNumber,
      carBrand,
      applicationType: "car_loan",
      status: "pending",
      appliedAt: new Date(),
      approved: false
    };

    // TODO: Save to your loans collection
    // await Loan.create(loanApplication);

    console.log("🚗 New Car Loan Application:", loanApplication);

    res.json({
      success: true,
      message: "Car loan application submitted successfully!",
      application: loanApplication
    });

  } catch (error) {
    console.error("Car loan error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during application"
    });
  }
});

// API Routes
app.use("/api/admin", adminRoutes);
app.use("/api/accounts", accountRoutes);
app.use("/api/loans", loanRoutes);
app.use("/api/cards", cardRoutes);
app.use("/api/investments", investmentRoutes);

// MongoDB Connection (✅ NO bufferMaxEntries)
const connectDB = async () => {
  try {
    const MONGO_URI = process.env.MONGO_URI;
    if (!MONGO_URI) {
      console.error("❌ MONGO_URI missing!");
      process.exit(1);
    }

    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      maxPoolSize: process.env.NODE_ENV === 'production' ? 3 : 5,
      family: 4
    });

    console.log("✅ MongoDB Connected!");

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
