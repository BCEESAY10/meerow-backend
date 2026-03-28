// Global error handler middleware
const errorHandler = (err, req, res, next) => {
  console.error("Error:", err);

  // Get status code (default to 500)
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  res.status(status).json({
    success: false,
    message,
    data: null,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

module.exports = errorHandler;
