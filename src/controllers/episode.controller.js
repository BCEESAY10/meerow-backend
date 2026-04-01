const episodeService = require("../services/episode.service");
const { validateEpisode } = require("../validators/episode.validator");
const { successResponse, errorResponse } = require("../utils/apiResponse");
const {
  buildPaginationParams,
  buildPaginationMeta,
} = require("../utils/pagination");

// Create new episode
const createEpisode = async (req, res, next) => {
  try {
    const { storyId } = req.params;
    const authorId = req.user.id;
    const { title, episode_number, content } = req.body;

    // Validate request
    const { error, value } = validateEpisode({
      title,
      episode_number,
      content,
    });

    if (error) {
      return errorResponse(res, error.details[0].message, 400);
    }

    const episode = await episodeService.createEpisode(
      storyId,
      authorId,
      value,
    );

    return successResponse(res, episode, "Episode created successfully", 201);
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

// Get episodes for a story (approved only)
const getEpisodesByStory = async (req, res, next) => {
  try {
    const { storyId } = req.params;
    const { page, limit } = req.query;

    const { page: pageNum, limit: limitNum } = buildPaginationParams(
      page,
      limit,
    );

    const result = await episodeService.getEpisodesByStoryId(
      storyId,
      pageNum,
      limitNum,
    );

    const meta = buildPaginationMeta(
      result.episodes,
      (pageNum - 1) * limitNum,
      limitNum,
      result.total,
    );

    return successResponse(
      res,
      result.episodes,
      "Episodes retrieved successfully",
      200,
      meta,
    );
  } catch (error) {
    next(error);
  }
};

// Get episode by ID (for reading)
const getEpisodeById = async (req, res, next) => {
  try {
    const { episodeId } = req.params;

    const episode = await episodeService.getEpisodeById(episodeId);

    if (!episode) {
      return errorResponse(res, "Episode not found", 404);
    }

    return successResponse(res, episode, "Episode retrieved successfully");
  } catch (error) {
    next(error);
  }
};

// Update episode
const updateEpisode = async (req, res, next) => {
  try {
    const { episodeId } = req.params;
    const authorId = req.user.id;
    const { title, episode_number, content } = req.body;

    // Validate request
    const { error, value } = validateEpisode({
      title,
      episode_number,
      content,
    });

    if (error) {
      return errorResponse(res, error.details[0].message, 400);
    }

    const episode = await episodeService.updateEpisode(
      episodeId,
      authorId,
      value,
    );

    return successResponse(res, episode, "Episode updated successfully");
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

// Delete episode
const deleteEpisode = async (req, res, next) => {
  try {
    const { episodeId } = req.params;
    const authorId = req.user.id;

    const result = await episodeService.deleteEpisode(episodeId, authorId);

    return successResponse(res, result, "Episode deleted successfully");
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
  createEpisode,
  getEpisodesByStory,
  getEpisodeById,
  updateEpisode,
  deleteEpisode,
};
