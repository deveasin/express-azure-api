"use strict";

const express = require("express");

// ─── App Setup ───────────────────────────────────────────
const app = express();
const PORT = process.env.PORT || 3000;

// ─── Middleware ───────────────────────────────────────────
app.use(express.json());

// ─── Routes ───────────────────────────────────────────────

// Health check — App Service pings this to know app is alive
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    timestamp: new Date().toISOString(),
  });
});

// Root route
app.get("/", (req, res) => {
  res.status(200).json({
    message: "Express Azure API is running!",
    version: "1.0.0",
  });
});

// ─── Start Server ─────────────────────────────────────────
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
