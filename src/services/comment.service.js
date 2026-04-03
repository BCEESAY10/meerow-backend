const { Comment, User } = require("../models");

// Create a comment
const createComment = async (userId, contentId, contentType, body) => {
  try {
    // Validate content type
    if (!["story", "episode"].includes(contentType)) {
      const error = new Error(
        'Invalid content type. Must be "story" or "episode"',
      );
      error.status = 400;
      throw error;
    }

    if (!body || body.trim().length === 0) {
      const error = new Error("Comment body cannot be empty");
      error.status = 400;
      throw error;
    }

    const comment = await Comment.create({
      user_id: userId,
      content_id: contentId,
      content_type: contentType,
      body: body.trim(),
    });

    // Return comment with user info
    const populatedComment = await Comment.findByPk(comment.id, {
      include: [
        {
          model: User,
          as: "author",
          attributes: ["id", "name", "email"],
        },
      ],
    });

    return populatedComment;
  } catch (error) {
    throw error;
  }
};

// Get comments for content
const getCommentsByContent = async (
  contentId,
  contentType,
  page = 1,
  limit = 10,
) => {
  try {
    // Validate content type
    if (!["story", "episode"].includes(contentType)) {
      const error = new Error(
        'Invalid content type. Must be "story" or "episode"',
      );
      error.status = 400;
      throw error;
    }

    const offset = (page - 1) * limit;

    const { count, rows } = await Comment.findAndCountAll({
      where: {
        content_id: contentId,
        content_type: contentType,
      },
      include: [
        {
          model: User,
          as: "author",
          attributes: ["id", "name", "email"],
        },
      ],
      offset,
      limit,
      order: [["created_at", "DESC"]],
    });

    return {
      total: count,
      comments: rows,
      page,
      limit,
      totalPages: Math.ceil(count / limit),
    };
  } catch (error) {
    throw error;
  }
};

// Get single comment
const getCommentById = async (commentId) => {
  try {
    const comment = await Comment.findByPk(commentId, {
      include: [
        {
          model: User,
          as: "author",
          attributes: ["id", "name", "email"],
        },
      ],
    });

    return comment;
  } catch (error) {
    throw error;
  }
};

// Update comment (only own comments)
const updateComment = async (commentId, userId, body) => {
  try {
    const comment = await Comment.findByPk(commentId);

    if (!comment) {
      const error = new Error("Comment not found");
      error.status = 404;
      throw error;
    }

    if (comment.user_id !== userId) {
      const error = new Error("You can only edit your own comments");
      error.status = 403;
      throw error;
    }

    if (!body || body.trim().length === 0) {
      const error = new Error("Comment body cannot be empty");
      error.status = 400;
      throw error;
    }

    await comment.update({
      body: body.trim(),
    });

    const updatedComment = await Comment.findByPk(commentId, {
      include: [
        {
          model: User,
          as: "author",
          attributes: ["id", "name", "email"],
        },
      ],
    });

    return updatedComment;
  } catch (error) {
    throw error;
  }
};

// Delete comment (only own comments)
const deleteComment = async (commentId, userId) => {
  try {
    const comment = await Comment.findByPk(commentId);

    if (!comment) {
      const error = new Error("Comment not found");
      error.status = 404;
      throw error;
    }

    if (comment.user_id !== userId) {
      const error = new Error("You can only delete your own comments");
      error.status = 403;
      throw error;
    }

    await comment.destroy();
    return { message: "Comment deleted successfully" };
  } catch (error) {
    throw error;
  }
};

// Get comment count for content
const getCommentCount = async (contentId, contentType) => {
  try {
    const count = await Comment.count({
      where: {
        content_id: contentId,
        content_type: contentType,
      },
    });

    return count;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  createComment,
  getCommentsByContent,
  getCommentById,
  updateComment,
  deleteComment,
  getCommentCount,
};
