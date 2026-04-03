const express = require("express");
const authenticate = require("../middlewares/authenticate");
const commentController = require("../controllers/comment.controller");

const router = express.Router();

// Get comments for content with pagination
router.get("/", commentController.getCommentsByContent);

// Get single comment
router.get("/:commentId", commentController.getCommentById);

// Create comment
router.post("/", authenticate, commentController.createComment);

// Update comment
router.put("/:commentId", authenticate, commentController.updateComment);

// Delete comment
router.delete("/:commentId", authenticate, commentController.deleteComment);

module.exports = router;
