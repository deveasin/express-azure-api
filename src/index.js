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

// App Info — reads from environment variables
app.get("/api/info", (req, res) => {
  res.status(200).json({
    environment: process.env.NODE_ENV || "not set",
    version: process.env.APP_VERSION || "not set",
    port: process.env.PORT || "not set",
    timestamp: new Date().toISOString(),
  });
});

// proves Key Vault secrets are resolving correctly
app.get('/api/secret', (req, res) => {
  const dbPassword = process.env.DB_PASSWORD || 'not set';
  const apiKey = process.env.API_KEY || 'not set';

  res.status(200).json({
    // NEVER show full secret in real app!
    // Only showing first 3 chars to prove it works
    db_password_preview: dbPassword.substring(0, 3) + '...',
    api_key_preview: apiKey.substring(0, 3) + '...',
    source: 'Azure Key Vault via Managed Identity',
    message: 'Secrets resolved successfully! ✅'
  });
});


// ─── Start Server ─────────────────────────────────────────
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
