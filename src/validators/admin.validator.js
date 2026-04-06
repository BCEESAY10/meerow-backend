const Joi = require("joi");

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

module.exports = {
  rejectValidator,
  queueItemValidator,
};
