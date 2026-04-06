const { Story, Episode } = require("../models");
const { Op } = require("sequelize");

// Get all pending stories and episodes with pagination
const getQueue = async (page = 1, limit = 10) => {
  try {
    const offset = (page - 1) * limit;

    // Get pending stories
    const { count: storyCount, rows: stories } = await Story.findAndCountAll({
      where: { status: "pending" },
      attributes: [
        "id",
        "title",
        "status",
        "created_at",
        "is_episodic",
        "author_id",
      ],
      include: [
        {
          association: "author",
          attributes: ["id", "name", "email"],
        },
      ],
      order: [["created_at", "ASC"]],
      offset,
      limit,
    });

    // Get pending episodes
    const { count: episodeCount, rows: episodes } =
      await Episode.findAndCountAll({
        where: { status: "pending" },
        attributes: [
          "id",
          "title",
          "episode_number",
          "status",
          "created_at",
          "story_id",
          "author_id",
        ],
        include: [
          {
            association: "author",
            attributes: ["id", "name", "email"],
          },
          {
            association: "story",
            attributes: ["id", "title"],
          },
        ],
        order: [["created_at", "ASC"]],
        offset,
        limit,
      });

    // Combine and sort by date
    const combined = [
      ...stories.map((s) => ({
        ...s.toJSON(),
        type: "story",
      })),
      ...episodes.map((e) => ({
        ...e.toJSON(),
        type: "episode",
      })),
    ].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

    const totalCount = storyCount + episodeCount;
    const totalPages = Math.ceil(totalCount / limit);

    return {
      queue: combined.slice(0, limit),
      total: totalCount,
      page,
      limit,
      totalPages,
      storyCount,
      episodeCount,
    };
  } catch (error) {
    throw error;
  }
};

// Get single pending item (story or episode)
const getQueueItem = async (type, id) => {
  try {
    if (!["story", "episode"].includes(type)) {
      const error = new Error(
        'Invalid content type. Must be "story" or "episode"',
      );
      error.status = 400;
      throw error;
    }

    if (type === "story") {
      const story = await Story.findOne({
        where: { id, status: "pending" },
        include: [
          {
            association: "author",
            attributes: ["id", "name", "email"],
          },
          {
            association: "episodes",
            attributes: ["id", "title", "episode_number", "status"],
          },
        ],
      });

      if (!story) {
        const error = new Error("Pending story not found");
        error.status = 404;
        throw error;
      }

      return story;
    } else {
      const episode = await Episode.findOne({
        where: { id, status: "pending" },
        include: [
          {
            association: "author",
            attributes: ["id", "name", "email"],
          },
          {
            association: "story",
            attributes: ["id", "title", "genre"],
          },
        ],
      });

      if (!episode) {
        const error = new Error("Pending episode not found");
        error.status = 404;
        throw error;
      }

      return episode;
    }
  } catch (error) {
    throw error;
  }
};

// Approve story or episode
const approveContent = async (type, id, adminId) => {
  try {
    if (!["story", "episode"].includes(type)) {
      const error = new Error(
        'Invalid content type. Must be "story" or "episode"',
      );
      error.status = 400;
      throw error;
    }

    const model = type === "story" ? Story : Episode;

    // Check if content exists and is pending
    const content = await model.findByPk(id);
    if (!content) {
      const error = new Error(
        `${type.charAt(0).toUpperCase() + type.slice(1)} not found`,
      );
      error.status = 404;
      throw error;
    }

    if (content.status !== "pending") {
      const error = new Error(`Cannot approve a ${type} that is not pending`);
      error.status = 400;
      throw error;
    }

    // Update status to approved
    await content.update({
      status: "approved",
      reviewed_by: adminId,
      reviewed_at: new Date(),
      published_at: new Date(),
    });

    return content;
  } catch (error) {
    throw error;
  }
};

// Reject story or episode with reason
const rejectContent = async (type, id, adminId, rejectionReason) => {
  try {
    if (!["story", "episode"].includes(type)) {
      const error = new Error(
        'Invalid content type. Must be "story" or "episode"',
      );
      error.status = 400;
      throw error;
    }

    if (!rejectionReason || rejectionReason.trim().length === 0) {
      const error = new Error("Rejection reason is required");
      error.status = 400;
      throw error;
    }

    const model = type === "story" ? Story : Episode;

    // Check if content exists and is pending
    const content = await model.findByPk(id);
    if (!content) {
      const error = new Error(
        `${type.charAt(0).toUpperCase() + type.slice(1)} not found`,
      );
      error.status = 404;
      throw error;
    }

    if (content.status !== "pending") {
      const error = new Error(`Cannot reject a ${type} that is not pending`);
      error.status = 400;
      throw error;
    }

    // Update status to rejected with reason
    await content.update({
      status: "rejected",
      rejection_reason: rejectionReason.trim(),
      reviewed_by: adminId,
      reviewed_at: new Date(),
    });

    return content;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  getQueue,
  getQueueItem,
  approveContent,
  rejectContent,
};
