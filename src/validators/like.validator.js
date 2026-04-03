const Joi = require('joi');

const likeValidator = Joi.object({
  content_id: Joi.string().uuid().required().messages({
    'string.guid': 'Invalid content_id format',
    'any.required': 'content_id is required',
  }),
  content_type: Joi.string()
    .valid('story', 'episode')
    .required()
    .messages({
      'any.only': 'content_type must be "story" or "episode"',
      'any.required': 'content_type is required',
    }),
});

const unlikeValidator = Joi.object({
  content_id: Joi.string().uuid().required().messages({
    'string.guid': 'Invalid content_id format',
    'any.required': 'content_id is required',
  }),
  content_type: Joi.string()
    .valid('story', 'episode')
    .required()
    .messages({
      'any.only': 'content_type must be "story" or "episode"',
      'any.required': 'content_type is required',
    }),
});

module.exports = {
  likeValidator,
  unlikeValidator,
};
