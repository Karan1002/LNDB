// server.js — FINAL STABLE VERSION ✅
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

/* ======================================================
   ENV + CONSTANTS
====================================================== */
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || "development";

const FRONTEND_URL =
  NODE_ENV === "production"
    ? (process.env.RENDER_FRONTEND_URL || process.env.VERCEL_FRONTEND_URL)
    : "http://localhost:3000";

/* ======================================================
   MIDDLEWARE
====================================================== */
app.use(cors({
  origin: [
    "http://localhost:3000",
    "http://127.0.0.1:5500",
    "http://localhost:5500",
    process.env.VERCEL_FRONTEND_URL,
    process.env.RENDER_FRONTEND_URL,
    FRONTEND_URL
  ].filter(Boolean),
  credentials: true
}));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

/* ======================================================
   HEALTH ROUTES
====================================================== */
app.get("/", (req, res) => {
  res.json({
    status: "LNDB Backend Running ✅",
    env: NODE_ENV,
    mongodb:
      mongoose.connection.readyState === 1
        ? "Connected"
        : "Disconnected",
    time: new Date().toISOString()
  });
});

app.get("/health", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      throw new Error("Mongo not connected");
    }

    await mongoose.connection.db.admin().ping();

    res.json({
      status: "healthy",
      db: "connected",
      uptime: process.uptime()
    });

  } catch (err) {
    res.status(503).json({
      status: "unhealthy",
      db: "disconnected"
    });
  }
});

/* ======================================================
   API ROUTES
====================================================== */
app.use("/api/admin", adminRoutes);
app.use("/api/accounts", accountRoutes);
app.use("/api/loans", loanRoutes);
app.use("/api/cards", cardRoutes);
app.use("/api/investments", investmentRoutes);

/* ======================================================
   DATABASE CONNECTION
====================================================== */
async function connectDB(retry = 0) {
  try {
    if (!process.env.MONGO_URI)
      throw new Error("MONGO_URI missing");

    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      maxPoolSize: NODE_ENV === "production" ? 5 : 10,
      family: 4
    });

    console.log("✅ MongoDB Connected");
    console.log("📊 Database:", mongoose.connection.name);

  } catch (err) {
    console.error("❌ MongoDB Error:", err.message);

    const delay = Math.min(5000 * (retry + 1), 30000);
    console.log(`🔁 Retrying in ${delay / 1000}s...`);

    setTimeout(() => connectDB(retry + 1), delay);
  }
}

/* ======================================================
   GLOBAL ERROR HANDLER
====================================================== */
app.use((err, req, res, next) => {
  console.error("🚨 SERVER ERROR:", err.stack);
  res.status(500).json({
    success: false,
    message: "Internal Server Error"
  });
});

/* ======================================================
   404 HANDLER
====================================================== */
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Route Not Found"
  });
});

/* ======================================================
   START SERVER
====================================================== */
const HOST = NODE_ENV === "production" ? "0.0.0.0" : "localhost";

app.listen(PORT, HOST, () => {
  console.log(`🚀 Server running → http://${HOST}:${PORT}`);
  console.log(`🔎 Health check → http://${HOST}:${PORT}/health`);
});

connectDB();

/* ======================================================
   GRACEFUL SHUTDOWN
====================================================== */
process.on("SIGINT", async () => {
  console.log("🛑 Shutting down server...");
  await mongoose.connection.close();
  process.exit(0);
});