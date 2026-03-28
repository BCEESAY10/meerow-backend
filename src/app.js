const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");
const passport = require("passport");
const env = require("./config/env");
const errorHandler = require("./middlewares/errorHandler");

// Initialize Passport
require("./config/passport");

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

// Passport middleware
app.use(passport.initialize());

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

// Global error handler (must be last)
app.use(errorHandler);

module.exports = app;
