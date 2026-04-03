const express = require("express");
const authenticate = require("../middlewares/authenticate");
const likeController = require("../controllers/like.controller");

const router = express.Router();

// Like content
router.post("/", authenticate, likeController.likeContent);

// Unlike content
router.delete("/", authenticate, likeController.unlikeContent);

// Get likes for content with pagination
router.get("/", likeController.getLikesForContent);

// Get like count for content
router.get("/count", likeController.getLikeCount);

module.exports = router;
