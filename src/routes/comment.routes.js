const express = require("express");

const router = express.Router();

// Placeholder routes - to be implemented in Phase 4 (Reactions)

router.get("/", (req, res) => {
  res.status(501).json({ success: false, message: "Not implemented yet" });
});

router.post("/", (req, res) => {
  res.status(501).json({ success: false, message: "Not implemented yet" });
});

router.delete("/:id", (req, res) => {
  res.status(501).json({ success: false, message: "Not implemented yet" });
});

module.exports = router;
