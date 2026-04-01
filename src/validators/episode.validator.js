const Joi = require("joi");

// Validate episode creation/update
const validateEpisode = (data) => {
  const schema = Joi.object({
    title: Joi.string().required().min(3).max(255),
    episode_number: Joi.number().integer().positive().required(),
    content: Joi.string().required().min(10),
  });

  return schema.validate(data);
};

module.exports = {
  validateEpisode,
};
