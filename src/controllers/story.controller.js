const storyService = require("../services/story.service");
const likeService = require("../services/like.service");
const { validateStory } = require("../validators/story.validator");
const { successResponse, errorResponse } = require("../utils/apiResponse");
const {
  buildPaginationParams,
  buildPaginationMeta,
} = require("../utils/pagination");

// Helper function to augment a single story with like metadata
const augmentStoryWithLikes = async (story, userId) => {
  if (!story) return story;

  const storyData = story.toJSON ? story.toJSON() : story;
  const storyId = storyData.id || story.id; // Ensure we get the ID from storyData

  const likeCount = await likeService.getLikeCount(storyId, "story");
  const userHasLiked = userId
    ? await likeService.hasUserLiked(userId, storyId, "story")
    : false;

  console.log("[DEBUG] augmentStoryWithLikes:", {
    storyId,
    userId,
    likeCount,
    userHasLiked,
  });

  return {
    ...storyData,
    likeCount,
    userHasLiked,
  };
};

// Helper function to augment array of stories with like metadata
const augmentStoriesWithLikes = async (stories, userId) => {
  if (!Array.isArray(stories)) return stories;

  return Promise.all(
    stories.map(async (story) => {
      const storyData = story.toJSON ? story.toJSON() : story;
      const storyId = storyData.id || story.id; // Ensure we get the ID from storyData
      const likeCount = await likeService.getLikeCount(storyId, "story");
      const userHasLiked = userId
        ? await likeService.hasUserLiked(userId, storyId, "story")
        : false;

      return {
        ...storyData,
        likeCount,
        userHasLiked,
      };
    }),
  );
};

// Create new story
const createStory = async (req, res, next) => {
  try {
    const { title, synopsis, genre, is_episodic, content } = req.body;
    const authorId = req.user.id;

    // Validate request
    const { error, value } = validateStory({
      title,
      synopsis,
      genre,
      is_episodic,
      content,
    });

    if (error) {
      return errorResponse(res, error.details[0].message, 400);
    }

    const story = await storyService.createStory(authorId, value);
    const storyWithLikes = await augmentStoryWithLikes(story, authorId);

    return successResponse(
      res,
      storyWithLikes,
      "Story created successfully",
      201,
    );
  } catch (error) {
    next(error);
  }
};

// Get story by slug (for reading)
const getStoryBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const userId = req.user?.id;

    const story = await storyService.getStoryBySlug(slug);

    if (!story) {
      return errorResponse(res, "Story not found", 404);
    }

    const storyWithLikes = await augmentStoryWithLikes(story, userId);
    return successResponse(res, storyWithLikes, "Story retrieved successfully");
  } catch (error) {
    next(error);
  }
};

// List approved stories with filters
const listStories = async (req, res, next) => {
  try {
    const { page, limit, genre, author, title, sort } = req.query;
    const userId = req.user?.id;

    const { page: pageNum, limit: limitNum } = buildPaginationParams(
      page,
      limit,
    );

    const result = await storyService.listStories({
      page: pageNum,
      limit: limitNum,
      genre,
      author,
      title,
      sort,
    });

    const storiesWithLikes = await augmentStoriesWithLikes(
      result.stories,
      userId,
    );

    const meta = buildPaginationMeta(
      storiesWithLikes,
      (pageNum - 1) * limitNum,
      limitNum,
      result.total,
    );

    return successResponse(
      res,
      storiesWithLikes,
      "Stories retrieved successfully",
      200,
      meta,
    );
  } catch (error) {
    next(error);
  }
};

// Get author's own stories
const getAuthorStories = async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const authorId = req.user.id;

    const { page: pageNum, limit: limitNum } = buildPaginationParams(
      page,
      limit,
    );

    const result = await storyService.getAuthorStories(
      authorId,
      pageNum,
      limitNum,
    );

    const storiesWithLikes = await augmentStoriesWithLikes(
      result.stories,
      authorId,
    );

    const meta = buildPaginationMeta(
      storiesWithLikes,
      (pageNum - 1) * limitNum,
      limitNum,
      result.total,
    );

    return successResponse(
      res,
      storiesWithLikes,
      "Your stories retrieved successfully",
      200,
      meta,
    );
  } catch (error) {
    next(error);
  }
};

// Handle GET story by ID (for author) or slug (for public)
const handleGetStory = async (req, res, next) => {
  try {
    const { idOrSlug } = req.params;
    const userId = req.user?.id;

    // UUID regex pattern
    const uuidRegex =
      /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;
    const isUUID = uuidRegex.test(idOrSlug);

    // If it's a UUID and user is authenticated, treat as story ID
    if (isUUID && userId) {
      const story = await storyService.getStoryById(idOrSlug);

      if (!story) {
        return errorResponse(res, "Story not found", 404);
      }

      if (story.author_id !== userId) {
        return errorResponse(
          res,
          "You do not have permission to view this story",
          403,
        );
      }

      const storyWithLikes = await augmentStoryWithLikes(story, userId);
      return successResponse(
        res,
        storyWithLikes,
        "Story retrieved successfully",
      );
    }

    // Otherwise, treat as slug (public, approved only)
    const story = await storyService.getStoryBySlug(idOrSlug);

    if (!story) {
      return errorResponse(res, "Story not found", 404);
    }

    const storyWithLikes = await augmentStoryWithLikes(story, userId);
    return successResponse(res, storyWithLikes, "Story retrieved successfully");
  } catch (error) {
    next(error);
  }
};

// Get story by ID for author (to view rejection reason and edit)
const getStoryById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const authorId = req.user.id;

    const story = await storyService.getStoryById(id);

    if (!story) {
      return errorResponse(res, "Story not found", 404);
    }

    if (story.author_id !== authorId) {
      return errorResponse(
        res,
        "You do not have permission to view this story",
        403,
      );
    }

    const storyWithLikes = await augmentStoryWithLikes(story, authorId);
    return successResponse(res, storyWithLikes, "Story retrieved successfully");
  } catch (error) {
    next(error);
  }
};

// Update story
const updateStory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const authorId = req.user.id;
    const { title, synopsis, genre, content } = req.body;

    // Validate request
    const { error, value } = validateStory({
      title,
      synopsis,
      genre,
      is_episodic: false, // Doesn't validate content requirement strictly for update
      content,
    });

    if (error) {
      return errorResponse(res, error.details[0].message, 400);
    }

    const story = await storyService.updateStory(id, authorId, value);
    const storyWithLikes = await augmentStoryWithLikes(story, authorId);

    return successResponse(res, storyWithLikes, "Story updated successfully");
  } catch (error) {
    if (error.status === 404) {
      return errorResponse(res, error.message, 404);
    }
    if (error.status === 400) {
      return errorResponse(res, error.message, 400);
    }
    next(error);
  }
};

// Delete story
const deleteStory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const authorId = req.user.id;

    const result = await storyService.deleteStory(id, authorId);

    return successResponse(res, result, "Story deleted successfully");
  } catch (error) {
    if (error.status === 404) {
      return errorResponse(res, error.message, 404);
    }
    if (error.status === 400) {
      return errorResponse(res, error.message, 400);
    }
    next(error);
  }
};

module.exports = {
  createStory,
  getStoryBySlug,
  listStories,
  getAuthorStories,
  handleGetStory,
  getStoryById,
  updateStory,
  deleteStory,
};
