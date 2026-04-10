const { Story, Episode, User, Comment, Like } = require("../models");
const { Op } = require("sequelize");
const { generateSlug } = require("../utils/slug");
const { calculateReadTime } = require("../utils/readTime");

// Create a new story
const createStory = async (authorId, storyData) => {
  try {
    const { title, synopsis, genre, is_episodic, content } = storyData;

    // Generate unique slug
    let slug = generateSlug(title);
    let slugExists = await Story.findOne({ where: { slug } });
    let counter = 1;
    while (slugExists) {
      slug = `${generateSlug(title)}-${counter}`;
      slugExists = await Story.findOne({ where: { slug } });
      counter++;
    }

    // Calculate read time if not episodic
    let readTime = null;
    if (!is_episodic && content) {
      readTime = calculateReadTime(content);
    }

    const story = await Story.create({
      author_id: authorId,
      title,
      slug,
      synopsis,
      genre,
      is_episodic,
      content: is_episodic ? null : content,
      read_time_minutes: readTime,
      status: "pending",
    });

    return story;
  } catch (error) {
    throw error;
  }
};

// Get story by ID with author details
const getStoryById = async (id) => {
  try {
    const story = await Story.findByPk(id, {
      include: [
        {
          model: User,
          as: "author",
          attributes: ["id", "name", "email"],
        },
        {
          model: Episode,
          as: "episodes",
          attributes: [
            "id",
            "title",
            "episode_number",
            "status",
            "read_time_minutes",
          ],
        },
      ],
    });

    return story;
  } catch (error) {
    throw error;
  }
};

// Get story by slug (for reading)
const getStoryBySlug = async (slug) => {
  try {
    const story = await Story.findOne({
      where: { slug, status: "approved" },
      include: [
        {
          model: User,
          as: "author",
          attributes: ["id", "name", "email"],
        },
        {
          model: Episode,
          as: "episodes",
          where: { status: "approved" },
          required: false,
          attributes: [
            "id",
            "title",
            "episode_number",
            "read_time_minutes",
            "created_at",
          ],
        },
      ],
    });

    return story;
  } catch (error) {
    throw error;
  }
};

// List all approved stories with filtering and pagination
const listStories = async (filters = {}) => {
  try {
    const {
      page = 1,
      limit = 10,
      genre,
      author,
      title,
      sort = "newest",
    } = filters;

    const offset = (page - 1) * limit;
    const where = { status: "approved" };

    // Apply filters
    if (genre) {
      where.genre = genre;
    }
    if (title) {
      where.title = { [Op.iLike]: `%${title}%` };
    }

    const include = [
      {
        model: User,
        as: "author",
        attributes: ["id", "name", "email"],
        where: author ? { name: { [Op.iLike]: `%${author}%` } } : {},
      },
    ];

    // Determine sort order
    let order = [["created_at", "DESC"]]; // Default: newest
    if (sort === "popular") {
      // Popular: sort by combined likes + comments (this needs to be calculated)
      order = [["created_at", "DESC"]]; // For now, fallback to newest
    }

    const { count, rows } = await Story.findAndCountAll({
      where,
      include,
      offset,
      limit,
      order,
      distinct: true,
    });

    return {
      total: count,
      stories: rows,
      page,
      limit,
      totalPages: Math.ceil(count / limit),
    };
  } catch (error) {
    throw error;
  }
};

// Get author's own stories (all statuses)
const getAuthorStories = async (authorId, page = 1, limit = 10) => {
  try {
    const offset = (page - 1) * limit;

    const { count, rows } = await Story.findAndCountAll({
      where: { author_id: authorId },
      offset,
      limit,
      order: [["created_at", "DESC"]],
      include: [
        {
          model: Episode,
          as: "episodes",
          attributes: ["id", "title", "status"],
        },
      ],
    });

    return {
      total: count,
      stories: rows,
      page,
      limit,
      totalPages: Math.ceil(count / limit),
    };
  } catch (error) {
    throw error;
  }
};

// Update story (only pending or rejected)
const updateStory = async (storyId, authorId, updateData) => {
  try {
    const story = await Story.findOne({
      where: { id: storyId, author_id: authorId },
    });

    if (!story) {
      const error = new Error("Story not found or you do not have permission");
      error.status = 404;
      throw error;
    }

    // Can only edit pending or rejected stories
    if (!["pending", "rejected"].includes(story.status)) {
      const error = new Error("Can only edit pending or rejected stories");
      error.status = 400;
      throw error;
    }

    const { title, synopsis, genre, content } = updateData;

    // Update read time if content changed
    let readTime = story.read_time_minutes;
    if (content && !story.is_episodic) {
      readTime = calculateReadTime(content);
    }

    await story.update({
      title: title || story.title,
      synopsis: synopsis !== undefined ? synopsis : story.synopsis,
      genre: genre || story.genre,
      content: story.is_episodic ? null : content || story.content,
      read_time_minutes: readTime,
      status: "pending", // Reset to pending on resubmit
      rejection_reason: null,
    });

    return story;
  } catch (error) {
    throw error;
  }
};

// Delete story (only if pending or rejected)
const deleteStory = async (storyId, authorId) => {
  try {
    const story = await Story.findOne({
      where: { id: storyId, author_id: authorId },
    });

    if (!story) {
      const error = new Error("Story not found or you do not have permission");
      error.status = 404;
      throw error;
    }

    if (!["pending", "rejected"].includes(story.status)) {
      const error = new Error("Can only delete pending or rejected stories");
      error.status = 400;
      throw error;
    }

    // Get all episodes for this story to delete their associated comments and likes
    const episodes = await Episode.findAll({
      where: { story_id: storyId },
      attributes: ["id"],
    });

    const episodeIds = episodes.map((ep) => ep.id);

    // Delete all comments and likes for episodes in this story
    if (episodeIds.length > 0) {
      await Comment.destroy({
        where: {
          [Op.or]: [
            { content_id: storyId, content_type: "story" },
            { content_id: { [Op.in]: episodeIds }, content_type: "episode" },
          ],
        },
      });

      await Like.destroy({
        where: {
          [Op.or]: [
            { content_id: storyId, content_type: "story" },
            { content_id: { [Op.in]: episodeIds }, content_type: "episode" },
          ],
        },
      });
    } else {
      // If no episodes, just delete comments and likes for the story itself
      await Comment.destroy({
        where: { content_id: storyId, content_type: "story" },
      });

      await Like.destroy({
        where: { content_id: storyId, content_type: "story" },
      });
    }

    // Delete all episodes associated with the story (cascade delete)
    await Episode.destroy({
      where: { story_id: storyId },
    });

    // Finally, delete the story
    await story.destroy();
    return { message: "Story deleted successfully" };
  } catch (error) {
    throw error;
  }
};

module.exports = {
  createStory,
  getStoryById,
  getStoryBySlug,
  listStories,
  getAuthorStories,
  updateStory,
  deleteStory,
};
