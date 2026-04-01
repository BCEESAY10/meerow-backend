const express = require("express");

const router = express.Router({ mergeParams: true });

// Note: Episodes are fully integrated into story.routes.js
// This file is kept for reference but all episode endpoints
// are handled as nested routes under stories

module.exports = router;
