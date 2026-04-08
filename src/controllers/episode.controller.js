const episodeService = require("../services/episode.service");
const likeService = require("../services/like.service");
const { validateEpisode } = require("../validators/episode.validator");
const { successResponse, errorResponse } = require("../utils/apiResponse");
const {
  buildPaginationParams,
  buildPaginationMeta,
} = require("../utils/pagination");

// Helper function to augment a single episode with like metadata
const augmentEpisodeWithLikes = async (episode, userId) => {
  if (!episode) return episode;

  const episodeData = episode.toJSON ? episode.toJSON() : episode;
  const episodeId = episodeData.id || episode.id; // Ensure we get the ID from episodeData
  const likeCount = await likeService.getLikeCount(episodeId, "episode");
  const userHasLiked = userId
    ? await likeService.hasUserLiked(userId, episodeId, "episode")
    : false;

  console.log("[DEBUG] augmentEpisodeWithLikes:", {
    episodeId,
    userId,
    likeCount,
    userHasLiked,
  });

  return {
    ...episodeData,
    likeCount,
    userHasLiked,
  };
};

// Helper function to augment array of episodes with like metadata
const augmentEpisodesWithLikes = async (episodes, userId) => {
  if (!Array.isArray(episodes)) return episodes;

  return Promise.all(
    episodes.map(async (episode) => {
      const episodeData = episode.toJSON ? episode.toJSON() : episode;
      const episodeId = episodeData.id || episode.id; // Ensure we get the ID from episodeData
      const likeCount = await likeService.getLikeCount(episodeId, "episode");
      const userHasLiked = userId
        ? await likeService.hasUserLiked(userId, episodeId, "episode")
        : false;

      return {
        ...episodeData,
        likeCount,
        userHasLiked,
      };
    }),
  );
};

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

    const episodeWithLikes = await augmentEpisodeWithLikes(episode, authorId);
    return successResponse(
      res,
      episodeWithLikes,
      "Episode created successfully",
      201,
    );
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
    const userId = req.user?.id;

    const { page: pageNum, limit: limitNum } = buildPaginationParams(
      page,
      limit,
    );

    const result = await episodeService.getEpisodesByStoryId(
      storyId,
      pageNum,
      limitNum,
    );

    const episodesWithLikes = await augmentEpisodesWithLikes(
      result.episodes,
      userId,
    );

    const meta = buildPaginationMeta(
      episodesWithLikes,
      (pageNum - 1) * limitNum,
      limitNum,
      result.total,
    );

    return successResponse(
      res,
      episodesWithLikes,
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
    const userId = req.user?.id;

    const episode = await episodeService.getEpisodeById(episodeId);

    if (!episode) {
      return errorResponse(res, "Episode not found", 404);
    }

    const episodeWithLikes = await augmentEpisodeWithLikes(episode, userId);
    return successResponse(
      res,
      episodeWithLikes,
      "Episode retrieved successfully",
    );
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

    const episodeWithLikes = await augmentEpisodeWithLikes(episode, authorId);
    return successResponse(
      res,
      episodeWithLikes,
      "Episode updated successfully",
    );
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
