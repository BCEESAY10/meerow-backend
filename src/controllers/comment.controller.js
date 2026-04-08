const commentService = require("../services/comment.service");
const {
  createCommentValidator,
  updateCommentValidator,
  getCommentsValidator,
} = require("../validators/comment.validator");
const { successResponse, errorResponse } = require("../utils/apiResponse");

// Create comment
const createComment = async (req, res) => {
  try {
    const { error, value } = createCommentValidator.validate(req.body);
    if (error) {
      return errorResponse(
        res,
        error.details[0].message,
        400,
        process.env.NODE_ENV === "development" ? error : undefined,
      );
    }

    const { content_id, content_type, body } = value;
    const userId = req.user.id;

    const comment = await commentService.createComment(
      userId,
      content_id,
      content_type,
      body,
    );

    return successResponse(res, comment, "Comment created successfully", 201);
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

// Get comments for content
const getCommentsByContent = async (req, res) => {
  try {
    const { content_id, content_type, page = 1, limit = 10 } = req.query;

    const { error, value } = getCommentsValidator.validate({
      content_id,
      content_type,
      page,
      limit,
    });

    if (error) {
      return errorResponse(
        res,
        error.details[0].message,
        400,
        process.env.NODE_ENV === "development" ? error : undefined,
      );
    }

    const result = await commentService.getCommentsByContent(
      value.content_id,
      value.content_type,
      value.page,
      value.limit,
    );

    const meta = {
      page: result.page,
      limit: result.limit,
      total: result.total,
      totalPages: result.totalPages,
    };

    return successResponse(
      res,
      result.comments,
      "Comments retrieved successfully",
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

// Get single comment
const getCommentById = async (req, res) => {
  try {
    const { commentId } = req.params;

    const comment = await commentService.getCommentById(commentId);

    if (!comment) {
      return errorResponse(res, "Comment not found", 404);
    }

    return successResponse(res, comment, "Comment retrieved successfully", 200);
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

// Update comment
const updateComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { error, value } = updateCommentValidator.validate(req.body);

    if (error) {
      return errorResponse(
        res,
        error.details[0].message,
        400,
        process.env.NODE_ENV === "development" ? error : undefined,
      );
    }

    const userId = req.user.id;
    const comment = await commentService.updateComment(
      commentId,
      userId,
      value.body,
    );

    return successResponse(res, comment, "Comment updated successfully", 200);
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

// Delete comment
const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.id;

    await commentService.deleteComment(commentId, userId);

    return successResponse(res, null, "Comment deleted successfully", 200);
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
  createComment,
  getCommentsByContent,
  getCommentById,
  updateComment,
  deleteComment,
};
