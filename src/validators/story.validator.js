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

// Validate story creation/update
const validateStory = (data) => {
  const schema = Joi.object({
    title: Joi.string().required().min(3).max(255),
    synopsis: Joi.string().allow("").max(1000),
    genre: Joi.string()
      .valid(...GENRES)
      .required(),
    is_episodic: Joi.boolean().required(),
    content: Joi.when("is_episodic", {
      is: false,
      then: Joi.string().required().min(10),
      otherwise: Joi.string().allow("").optional(),
    }),
  });

  return schema.validate(data);
};

module.exports = {
  validateStory,
  GENRES,
};
