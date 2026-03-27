const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");
const env = require("./config/env");

// Create Express app
const app = express();

// Security middleware
app.use(helmet());

// CORS middleware
app.use(
  cors({
    origin: env.clientUrl,
    credentials: true,
  }),
);

// Request logging
app.use(morgan("combined"));

// Body parser middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// Request logging middleware for debugging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString() });
});

// API routes will be mounted here
app.use("/api", require("./routes"));

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Not Found",
    data: null,
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Error:", err);

  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  res.status(status).json({
    success: false,
    message,
    data: null,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

module.exports = app;
