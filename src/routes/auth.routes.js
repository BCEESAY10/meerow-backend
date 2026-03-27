const express = require("express");

const router = express.Router();

// Placeholder routes - to be implemented in Phase 2 (Authentication)

router.post("/register", (req, res) => {
  res.status(501).json({ success: false, message: "Not implemented yet" });
});

router.post("/login", (req, res) => {
  res.status(501).json({ success: false, message: "Not implemented yet" });
});

router.get("/me", (req, res) => {
  res.status(501).json({ success: false, message: "Not implemented yet" });
});

router.get("/google", (req, res) => {
  res.status(501).json({ success: false, message: "Not implemented yet" });
});

router.get("/google/callback", (req, res) => {
  res.status(501).json({ success: false, message: "Not implemented yet" });
});

module.exports = router;
