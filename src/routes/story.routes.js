const express = require("express");
const storyController = require("../controllers/story.controller");
const episodeController = require("../controllers/episode.controller");
const authenticate = require("../middlewares/authenticate");

const router = express.Router();

// Public routes - List all approved stories
router.get("/", storyController.listStories);

// Protected route - Get own stories (must be before /:slug to avoid matching "me" as slug)
router.get("/me", authenticate, storyController.getAuthorStories);

// Protected routes - Author story management
router.post("/", authenticate, storyController.createStory);
router.put("/:id", authenticate, storyController.updateStory);
router.delete("/:id", authenticate, storyController.deleteStory);

// Public route - Get single story by slug (for reading) - must be last
router.get("/:slug", storyController.getStoryBySlug);

// Episode routes - Public (approved episodes only)
router.get("/:storyId/episodes", episodeController.getEpisodesByStory);
router.get("/:storyId/episodes/:episodeId", episodeController.getEpisodeById);

// Episode routes - Protected (author only)
router.post(
  "/:storyId/episodes",
  authenticate,
  episodeController.createEpisode,
);
router.put(
  "/:storyId/episodes/:episodeId",
  authenticate,
  episodeController.updateEpisode,
);
router.delete(
  "/:storyId/episodes/:episodeId",
  authenticate,
  episodeController.deleteEpisode,
);

module.exports = router;
