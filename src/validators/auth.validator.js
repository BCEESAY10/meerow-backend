const Joi = require("joi");

// Register validation schema
const registerSchema = Joi.object({
  name: Joi.string().min(2).max(100).required().messages({
    "string.empty": "Name is required",
    "string.min": "Name must be at least 2 characters",
    "string.max": "Name must not exceed 100 characters",
  }),
  email: Joi.string().email().required().messages({
    "string.email": "Please provide a valid email address",
    "string.empty": "Email is required",
  }),
  password: Joi.string().min(8).required().messages({
    "string.min": "Password must be at least 8 characters",
    "string.empty": "Password is required",
  }),
  agreed_to_terms: Joi.boolean().valid(true).required().messages({
    "any.only": "You must agree to the Terms & Conditions",
    "boolean.base": "Terms & Conditions agreement must be boolean",
  }),
}).strict();

// Login validation schema
const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Please provide a valid email address",
    "string.empty": "Email is required",
  }),
  password: Joi.string().required().messages({
    "string.empty": "Password is required",
  }),
}).strict();

// Validate register request
const validateRegister = (data) => {
  return registerSchema.validate(data);
};

// Validate login request
const validateLogin = (data) => {
  return loginSchema.validate(data);
};

module.exports = {
  validateRegister,
  validateLogin,
};
