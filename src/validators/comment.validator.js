const Joi = require("joi");

const createCommentValidator = Joi.object({
  content_id: Joi.string().uuid().required().messages({
    "string.guid": "Invalid content_id format",
    "any.required": "content_id is required",
  }),
  content_type: Joi.string().valid("story", "episode").required().messages({
    "any.only": 'content_type must be "story" or "episode"',
    "any.required": "content_type is required",
  }),
  body: Joi.string().min(1).max(5000).required().messages({
    "string.empty": "Comment body cannot be empty",
    "string.max": "Comment body cannot exceed 5000 characters",
    "any.required": "Comment body is required",
  }),
});

const updateCommentValidator = Joi.object({
  body: Joi.string().min(1).max(5000).required().messages({
    "string.empty": "Comment body cannot be empty",
    "string.max": "Comment body cannot exceed 5000 characters",
    "any.required": "Comment body is required",
  }),
});

const getCommentsValidator = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  content_id: Joi.string().uuid().required().messages({
    "string.guid": "Invalid content_id format",
    "any.required": "content_id is required",
  }),
  content_type: Joi.string().valid("story", "episode").required().messages({
    "any.only": 'content_type must be "story" or "episode"',
    "any.required": "content_type is required",
  }),
});

module.exports = {
  createCommentValidator,
  updateCommentValidator,
  getCommentsValidator,
};
