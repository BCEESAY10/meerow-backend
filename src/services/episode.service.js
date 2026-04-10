const { Episode, Story, User, Comment, Like } = require("../models");
const { Op } = require("sequelize");
const { calculateReadTime } = require("../utils/readTime");

// Create a new episode
const createEpisode = async (storyId, authorId, episodeData) => {
  try {
    const { title, episode_number, content } = episodeData;

    // Verify story exists and belongs to author
    const story = await Story.findOne({
      where: { id: storyId, author_id: authorId, is_episodic: true },
    });

    if (!story) {
      const error = new Error("Story not found or is not episodic");
      error.status = 404;
      throw error;
    }

    // Check if episode number already exists
    const existingEpisode = await Episode.findOne({
      where: { story_id: storyId, episode_number },
    });

    if (existingEpisode) {
      const error = new Error(`Episode ${episode_number} already exists`);
      error.status = 400;
      throw error;
    }

    // Calculate read time
    const readTime = calculateReadTime(content);

    const episode = await Episode.create({
      story_id: storyId,
      title,
      episode_number,
      content,
      read_time_minutes: readTime,
      status: "pending",
    });

    return episode;
  } catch (error) {
    throw error;
  }
};

// Get episode by ID
const getEpisodeById = async (episodeId) => {
  try {
    const episode = await Episode.findByPk(episodeId, {
      include: [
        {
          model: Story,
          as: "story",
          attributes: ["id", "title", "slug", "author_id"],
          include: [
            {
              model: User,
              as: "author",
              attributes: ["id", "name"],
            },
          ],
        },
      ],
    });

    return episode;
  } catch (error) {
    throw error;
  }
};

// Get story for episode checks (to verify author)
const getStoryForEpisodes = async (storyId) => {
  try {
    const story = await Story.findByPk(storyId, {
      attributes: ["id", "author_id"],
    });

    return story;
  } catch (error) {
    throw error;
  }
};

// Get approved episodes for a story
const getEpisodesByStoryId = async (storyId, page = 1, limit = 20) => {
  try {
    const offset = (page - 1) * limit;

    const { count, rows } = await Episode.findAndCountAll({
      where: { story_id: storyId, status: "approved" },
      offset,
      limit,
      order: [["episode_number", "ASC"]],
    });

    return {
      total: count,
      episodes: rows,
      page,
      limit,
      totalPages: Math.ceil(count / limit),
    };
  } catch (error) {
    throw error;
  }
};

// Get all episodes for a story (for author - includes all statuses)
const getEpisodesByStoryIdForAuthor = async (
  storyId,
  authorId,
  page = 1,
  limit = 20,
) => {
  try {
    // Verify author owns the story
    const story = await Story.findOne({
      where: { id: storyId, author_id: authorId },
    });

    if (!story) {
      const error = new Error("Story not found or you do not have permission");
      error.status = 404;
      throw error;
    }

    const offset = (page - 1) * limit;

    const { count, rows } = await Episode.findAndCountAll({
      where: { story_id: storyId },
      offset,
      limit,
      order: [["episode_number", "ASC"]],
    });

    return {
      total: count,
      episodes: rows,
      page,
      limit,
      totalPages: Math.ceil(count / limit),
    };
  } catch (error) {
    throw error;
  }
};

// Update episode (only if pending or rejected)
const updateEpisode = async (episodeId, authorId, updateData) => {
  try {
    const episode = await Episode.findByPk(episodeId, {
      include: [
        {
          model: Story,
          as: "story",
          attributes: ["id", "author_id"],
        },
      ],
    });

    if (!episode || episode.story.author_id !== authorId) {
      const error = new Error(
        "Episode not found or you do not have permission",
      );
      error.status = 404;
      throw error;
    }

    // Can only edit pending or rejected episodes
    if (!["pending", "rejected"].includes(episode.status)) {
      const error = new Error("Can only edit pending or rejected episodes");
      error.status = 400;
      throw error;
    }

    const { title, episode_number, content } = updateData;

    // Check if new episode number conflicts with existing
    if (episode_number && episode_number !== episode.episode_number) {
      const conflict = await Episode.findOne({
        where: {
          story_id: episode.story_id,
          episode_number,
          id: { [require("sequelize").Op.ne]: episodeId },
        },
      });

      if (conflict) {
        const error = new Error(`Episode ${episode_number} already exists`);
        error.status = 400;
        throw error;
      }
    }

    // Build update object with only provided fields
    const updateObject = {
      status: "pending", // Reset to pending on resubmit
      rejection_reason: null,
    };

    // Only update fields that are provided
    if (title !== undefined) {
      updateObject.title = title;
    }

    if (episode_number !== undefined) {
      updateObject.episode_number = episode_number;
    }

    if (content !== undefined) {
      updateObject.content = content;
      // Recalculate read time only if content is updated
      updateObject.read_time_minutes = calculateReadTime(content);
    }

    await episode.update(updateObject);

    return episode;
  } catch (error) {
    throw error;
  }
};

// Delete episode (only if pending or rejected)
const deleteEpisode = async (episodeId, authorId) => {
  try {
    const episode = await Episode.findByPk(episodeId, {
      include: [
        {
          model: Story,
          as: "story",
          attributes: ["id", "author_id"],
        },
      ],
    });

    if (!episode || episode.story.author_id !== authorId) {
      const error = new Error(
        "Episode not found or you do not have permission",
      );
      error.status = 404;
      throw error;
    }

    if (!["pending", "rejected"].includes(episode.status)) {
      const error = new Error("Can only delete pending or rejected episodes");
      error.status = 400;
      throw error;
    }

    // Delete all comments and likes for this episode first (cascade delete)
    await Comment.destroy({
      where: { content_id: episodeId, content_type: "episode" },
    });

    await Like.destroy({
      where: { content_id: episodeId, content_type: "episode" },
    });

    // Then delete the episode
    await episode.destroy();
    return { message: "Episode deleted successfully" };
  } catch (error) {
    throw error;
  }
};

module.exports = {
  createEpisode,
  getEpisodeById,
  getStoryForEpisodes,
  getEpisodesByStoryId,
  getEpisodesByStoryIdForAuthor,
  updateEpisode,
  deleteEpisode,
};
