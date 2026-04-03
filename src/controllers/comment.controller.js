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
      return res
        .status(400)
        .json(
          errorResponse(
            error.details[0].message,
            400,
            process.env.NODE_ENV === "development" ? error : undefined,
          ),
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

    return res
      .status(201)
      .json(successResponse(comment, "Comment created successfully"));
  } catch (error) {
    const status = error.status || 500;
    return res
      .status(status)
      .json(
        errorResponse(
          error.message,
          status,
          process.env.NODE_ENV === "development" ? error : undefined,
        ),
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
      return res
        .status(400)
        .json(
          errorResponse(
            error.details[0].message,
            400,
            process.env.NODE_ENV === "development" ? error : undefined,
          ),
        );
    }

    const result = await commentService.getCommentsByContent(
      value.content_id,
      value.content_type,
      value.page,
      value.limit,
    );

    return res.status(200).json(
      successResponse(result.comments, "Comments retrieved successfully", {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      }),
    );
  } catch (error) {
    const status = error.status || 500;
    return res
      .status(status)
      .json(
        errorResponse(
          error.message,
          status,
          process.env.NODE_ENV === "development" ? error : undefined,
        ),
      );
  }
};

// Get single comment
const getCommentById = async (req, res) => {
  try {
    const { commentId } = req.params;

    const comment = await commentService.getCommentById(commentId);

    if (!comment) {
      return res.status(404).json(errorResponse("Comment not found", 404));
    }

    return res
      .status(200)
      .json(successResponse(comment, "Comment retrieved successfully"));
  } catch (error) {
    const status = error.status || 500;
    return res
      .status(status)
      .json(
        errorResponse(
          error.message,
          status,
          process.env.NODE_ENV === "development" ? error : undefined,
        ),
      );
  }
};

// Update comment
const updateComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { error, value } = updateCommentValidator.validate(req.body);

    if (error) {
      return res
        .status(400)
        .json(
          errorResponse(
            error.details[0].message,
            400,
            process.env.NODE_ENV === "development" ? error : undefined,
          ),
        );
    }

    const userId = req.user.id;
    const comment = await commentService.updateComment(
      commentId,
      userId,
      value.body,
    );

    return res
      .status(200)
      .json(successResponse(comment, "Comment updated successfully"));
  } catch (error) {
    const status = error.status || 500;
    return res
      .status(status)
      .json(
        errorResponse(
          error.message,
          status,
          process.env.NODE_ENV === "development" ? error : undefined,
        ),
      );
  }
};

// Delete comment
const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.id;

    await commentService.deleteComment(commentId, userId);

    return res
      .status(200)
      .json(successResponse(null, "Comment deleted successfully"));
  } catch (error) {
    const status = error.status || 500;
    return res
      .status(status)
      .json(
        errorResponse(
          error.message,
          status,
          process.env.NODE_ENV === "development" ? error : undefined,
        ),
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
