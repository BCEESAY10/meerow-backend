const jwt = require("jsonwebtoken");
const env = require("../config/env");

// Generate JWT token
const generateToken = (userId, email, role) => {
  return jwt.sign(
    {
      id: userId,
      email,
      role,
    },
    env.jwt.secret,
    {
      expiresIn: env.jwt.expiresIn,
    },
  );
};

// Verify JWT token
const verifyToken = (token) => {
  try {
    return jwt.verify(token, env.jwt.secret);
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      const err = new Error("Token has expired");
      err.status = 401;
      throw err;
    }
    if (error.name === "JsonWebTokenError") {
      const err = new Error("Invalid token");
      err.status = 401;
      throw err;
    }
    throw error;
  }
};

// Decode token without verification (for testing)
const decodeToken = (token) => {
  return jwt.decode(token);
};

module.exports = {
  generateToken,
  verifyToken,
  decodeToken,
};
