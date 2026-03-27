const express = require("express");

const router = express.Router({ mergeParams: true });

// Placeholder routes - Episodes are nested under stories
// Actual implementation will be in story.routes.js

router.get("/", (req, res) => {
  res.status(501).json({ success: false, message: "Not implemented yet" });
});

router.post("/", (req, res) => {
  res.status(501).json({ success: false, message: "Not implemented yet" });
});

router.get("/:episodeId", (req, res) => {
  res.status(501).json({ success: false, message: "Not implemented yet" });
});

router.put("/:episodeId", (req, res) => {
  res.status(501).json({ success: false, message: "Not implemented yet" });
});

router.delete("/:episodeId", (req, res) => {
  res.status(501).json({ success: false, message: "Not implemented yet" });
});

module.exports = router;
