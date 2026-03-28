const { verifyToken } = require("../utils/tokenUtils");

// Extract JWT token from Authorization header or cookies
const extractToken = (req) => {
  // Check Authorization header (Bearer token)
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    return req.headers.authorization.slice(7);
  }

  // Check cookies (httpOnly cookie)
  if (req.cookies && req.cookies.token) {
    return req.cookies.token;
  }

  return null;
};

// Authenticate middleware - verifies JWT token
const authenticate = (req, res, next) => {
  const token = extractToken(req);

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "No token provided",
      data: null,
    });
  }

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: error.message || "Invalid token",
      data: null,
    });
  }
};

module.exports = authenticate;
