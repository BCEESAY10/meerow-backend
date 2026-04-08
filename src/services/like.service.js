const { Like, Story, Episode, User } = require("../models");

// Like a story or episode
const likeContent = async (userId, contentId, contentType) => {
  try {
    // Validate content type
    if (!["story", "episode"].includes(contentType)) {
      const error = new Error(
        'Invalid content type. Must be "story" or "episode"',
      );
      error.status = 400;
      throw error;
    }

    // Verify the content exists and is approved
    if (contentType === "story") {
      const story = await Story.findOne({
        where: { id: contentId, status: "approved" },
      });
      if (!story) {
        const error = new Error("Story not found or not approved");
        error.status = 404;
        throw error;
      }
    } else {
      const episode = await Episode.findOne({
        where: { id: contentId, status: "approved" },
      });
      if (!episode) {
        const error = new Error("Episode not found or not approved");
        error.status = 404;
        throw error;
      }
    }

    // Check if user already liked this content
    const existingLike = await Like.findOne({
      where: {
        user_id: userId,
        content_id: contentId,
        content_type: contentType,
      },
    });

    if (existingLike) {
      const error = new Error("You have already liked this content");
      error.status = 409;
      throw error;
    }

    // Create the like
    const like = await Like.create({
      user_id: userId,
      content_id: contentId,
      content_type: contentType,
    });

    console.log("[DEBUG] Like created:", {
      id: like.id,
      user_id: userId,
      content_id: contentId,
      content_type: contentType,
    });

    return like;
  } catch (error) {
    throw error;
  }
};

// Unlike a story or episode
const unlikeContent = async (userId, contentId, contentType) => {
  try {
    // Validate content type
    if (!["story", "episode"].includes(contentType)) {
      const error = new Error(
        'Invalid content type. Must be "story" or "episode"',
      );
      error.status = 400;
      throw error;
    }

    const like = await Like.findOne({
      where: {
        user_id: userId,
        content_id: contentId,
        content_type: contentType,
      },
    });

    if (!like) {
      const error = new Error("You have not liked this content");
      error.status = 404;
      throw error;
    }

    await like.destroy();
    return { message: "Unlike successful" };
  } catch (error) {
    throw error;
  }
};

// Get like count for content
const getLikeCount = async (contentId, contentType) => {
  try {
    const count = await Like.count({
      where: {
        content_id: contentId,
        content_type: contentType,
      },
    });

    console.log("[DEBUG] getLikeCount query:", {
      contentId,
      contentType,
      count,
    });

    return count;
  } catch (error) {
    throw error;
  }
};

// Get all likes for content
const getLikesForContent = async (
  contentId,
  contentType,
  page = 1,
  limit = 10,
) => {
  try {
    const offset = (page - 1) * limit;

    const { count, rows } = await Like.findAndCountAll({
      where: {
        content_id: contentId,
        content_type: contentType,
      },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "email"],
        },
      ],
      offset,
      limit,
      order: [["created_at", "DESC"]],
    });

    return {
      total: count,
      likes: rows,
      page,
      limit,
      totalPages: Math.ceil(count / limit),
    };
  } catch (error) {
    throw error;
  }
};

// Check if user liked content
const hasUserLiked = async (userId, contentId, contentType) => {
  try {
    const like = await Like.findOne({
      where: {
        user_id: userId,
        content_id: contentId,
        content_type: contentType,
      },
    });

    console.log("[DEBUG] hasUserLiked query:", {
      userId,
      contentId,
      contentType,
      found: !!like,
    });

    return !!like;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  likeContent,
  unlikeContent,
  getLikeCount,
  getLikesForContent,
  hasUserLiked,
};
