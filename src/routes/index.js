const express = require("express");

const router = express.Router();

// Mount route groups
router.use("/auth", require("./auth.routes"));
router.use("/stories", require("./story.routes"));
router.use("/comments", require("./comment.routes"));
router.use("/likes", require("./like.routes"));
router.use("/admin", require("./admin.routes"));

// Health check
router.get("/health", (req, res) => {
  res.json({ success: true, message: "API is healthy" });
});

module.exports = router;
