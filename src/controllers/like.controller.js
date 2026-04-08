const likeService = require("../services/like.service");
const {
  likeValidator,
  unlikeValidator,
} = require("../validators/like.validator");
const { successResponse, errorResponse } = require("../utils/apiResponse");

// Like content
const likeContent = async (req, res) => {
  try {
    const { error, value } = likeValidator.validate(req.body);
    if (error) {
      return errorResponse(
        res,
        error.details[0].message,
        400,
        process.env.NODE_ENV === "development" ? error : undefined,
      );
    }

    const { content_id, content_type } = value;
    const userId = req.user.id;

    const like = await likeService.likeContent(
      userId,
      content_id,
      content_type,
    );

    return successResponse(res, like, "Content liked successfully", 201);
  } catch (error) {
    const status = error.status || 500;
    return errorResponse(
      res,
      error.message,
      status,
      process.env.NODE_ENV === "development" ? error : undefined,
    );
  }
};

// Unlike content
const unlikeContent = async (req, res) => {
  try {
    const { error, value } = unlikeValidator.validate(req.body);
    if (error) {
      return errorResponse(
        res,
        error.details[0].message,
        400,
        process.env.NODE_ENV === "development" ? error : undefined,
      );
    }

    const { content_id, content_type } = value;
    const userId = req.user.id;

    await likeService.unlikeContent(userId, content_id, content_type);

    return successResponse(res, null, "Content unliked successfully", 200);
  } catch (error) {
    const status = error.status || 500;
    return errorResponse(
      res,
      error.message,
      status,
      process.env.NODE_ENV === "development" ? error : undefined,
    );
  }
};

// Get likes for content
const getLikesForContent = async (req, res) => {
  try {
    const { content_id, content_type, page = 1, limit = 10 } = req.query;

    if (!content_id || !content_type) {
      return errorResponse(
        res,
        "content_id and content_type are required",
        400,
      );
    }

    if (!["story", "episode"].includes(content_type)) {
      return errorResponse(
        res,
        'content_type must be "story" or "episode"',
        400,
      );
    }

    const result = await likeService.getLikesForContent(
      content_id,
      content_type,
      parseInt(page),
      parseInt(limit),
    );

    const meta = {
      page: result.page,
      limit: result.limit,
      total: result.total,
      totalPages: result.totalPages,
    };

    return successResponse(
      res,
      result.likes,
      "Likes retrieved successfully",
      200,
      meta,
    );
  } catch (error) {
    const status = error.status || 500;
    return errorResponse(
      res,
      error.message,
      status,
      process.env.NODE_ENV === "development" ? error : undefined,
    );
  }
};

// Get like count for content
const getLikeCount = async (req, res) => {
  try {
    const { content_id, content_type } = req.query;

    if (!content_id || !content_type) {
      return errorResponse(
        res,
        "content_id and content_type are required",
        400,
      );
    }

    if (!["story", "episode"].includes(content_type)) {
      return errorResponse(
        res,
        'content_type must be "story" or "episode"',
        400,
      );
    }

    const count = await likeService.getLikeCount(content_id, content_type);

    return successResponse(
      res,
      { count },
      "Like count retrieved successfully",
      200,
    );
  } catch (error) {
    const status = error.status || 500;
    return errorResponse(
      res,
      error.message,
      status,
      process.env.NODE_ENV === "development" ? error : undefined,
    );
  }
};

module.exports = {
  likeContent,
  unlikeContent,
  getLikesForContent,
  getLikeCount,
};
