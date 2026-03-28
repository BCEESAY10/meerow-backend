// Authorize middleware - checks user role(s)
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
        data: null,
      });
    }

    // Check if user has one of the allowed roles
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Insufficient permissions",
        data: null,
      });
    }

    next();
  };
};

module.exports = authorize;
