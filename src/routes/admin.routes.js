const express = require("express");
const authenticate = require("../middlewares/authenticate");
const authorize = require("../middlewares/authorize");
const adminController = require("../controllers/admin.controller");

const router = express.Router();

// All admin routes require authentication and admin role

// Get moderation queue (all pending items)
router.get(
  "/queue",
  authenticate,
  authorize("admin"),
  adminController.getQueue,
);

// Get single item from queue for detailed review
router.get(
  "/queue/:type/:id",
  authenticate,
  authorize("admin"),
  adminController.getQueueItem,
);

// Approve a story or episode
router.patch(
  "/approve/:type/:id",
  authenticate,
  authorize("admin"),
  adminController.approveContent,
);

// Reject a story or episode with reason
router.patch(
  "/reject/:type/:id",
  authenticate,
  authorize("admin"),
  adminController.rejectContent,
);

// Edit pending story or episode (admin corrections)
router.patch(
  "/queue/:type/:id",
  authenticate,
  authorize("admin"),
  adminController.editContent,
);

module.exports = router;
