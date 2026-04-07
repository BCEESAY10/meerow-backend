const Joi = require("joi");

const GENRES = [
  "Fantasy",
  "Science Fiction",
  "Romance",
  "Thriller",
  "Horror",
  "Mystery",
  "Adventure",
  "Historical Fiction",
  "Drama",
  "Comedy",
  "Slice of Life",
  "Poetry",
  "Other",
];

const rejectValidator = Joi.object({
  rejection_reason: Joi.string().min(5).max(1000).required().messages({
    "string.min": "Rejection reason must be at least 5 characters",
    "string.max": "Rejection reason cannot exceed 1000 characters",
    "string.empty": "Rejection reason is required",
    "any.required": "Rejection reason is required",
  }),
});

const queueItemValidator = Joi.object({
  type: Joi.string().valid("story", "episode").required().messages({
    "any.only": 'Type must be "story" or "episode"',
    "any.required": "Type is required",
  }),
  id: Joi.string().uuid().required().messages({
    "string.guid": "Invalid ID format",
    "any.required": "ID is required",
  }),
});

// Validate admin edits for stories
const editStoryValidator = Joi.object({
  title: Joi.string().min(3).max(255).messages({
    "string.min": "Title must be at least 3 characters",
    "string.max": "Title cannot exceed 255 characters",
  }),
  synopsis: Joi.string().max(1000).allow("").messages({
    "string.max": "Synopsis cannot exceed 1000 characters",
  }),
  genre: Joi.string()
    .valid(...GENRES)
    .messages({
      "any.only": "Invalid genre",
    }),
});

// Validate admin edits for episodes
const editEpisodeValidator = Joi.object({
  title: Joi.string().min(3).max(255).messages({
    "string.min": "Title must be at least 3 characters",
    "string.max": "Title cannot exceed 255 characters",
  }),
  content: Joi.string().min(10).messages({
    "string.min": "Content must be at least 10 characters",
  }),
});

module.exports = {
  rejectValidator,
  queueItemValidator,
  editStoryValidator,
  editEpisodeValidator,
};
