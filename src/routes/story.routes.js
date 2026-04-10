const express = require("express");
const storyController = require("../controllers/story.controller");
const episodeController = require("../controllers/episode.controller");
const authenticate = require("../middlewares/authenticate");
const { authenticateOptional } = require("../middlewares/authenticate");

const router = express.Router();

// Public routes - List all approved stories
router.get("/", storyController.listStories);

// Protected route - Get own stories (must be before /:slug to avoid matching "me" as slug)
router.get("/me", authenticate, storyController.getAuthorStories);

// Protected routes - Author story management
router.post("/", authenticate, storyController.createStory);

// Handle GET story by ID (authenticated, any status) or slug (public, approved only)
router.get(
  "/:idOrSlug",
  (req, res, next) => {
    // Check if it looks like a UUID
    const uuidRegex =
      /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;
    if (uuidRegex.test(req.params.idOrSlug)) {
      // UUID - require authentication
      authenticate(req, res, next);
    } else {
      // Slug - proceed without authentication
      next();
    }
  },
  storyController.handleGetStory,
);

router.put("/:id", authenticate, storyController.updateStory);
router.delete("/:id", authenticate, storyController.deleteStory);

// Public route - Get single story by slug (for reading) - must be last
router.get("/:slug", storyController.getStoryBySlug);

// Episode routes - Public (approved episodes only) / Private pending for author
router.get(
  "/:storyId/episodes",
  authenticateOptional,
  episodeController.getEpisodesByStory,
);
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
