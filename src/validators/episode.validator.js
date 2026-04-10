const Joi = require("joi");

// Validate episode creation - all fields required
const validateEpisodeCreate = (data) => {
  const schema = Joi.object({
    title: Joi.string().required().trim().min(3).max(255),
    episode_number: Joi.number().integer().positive().required(),
    content: Joi.string().required().trim().min(10),
  });

  return schema.validate(data);
};

// Validate episode update - all fields optional but must be valid if provided
const validateEpisodeUpdate = (data) => {
  const schema = Joi.object({
    title: Joi.string().trim().min(3).max(255),
    episode_number: Joi.number().integer().positive(),
    content: Joi.string().trim().min(10),
  });

  return schema.validate(data);
};

// Legacy function for backward compatibility
const validateEpisode = (data) => {
  return validateEpisodeCreate(data);
};

module.exports = {
  validateEpisode,
  validateEpisodeCreate,
  validateEpisodeUpdate,
};
