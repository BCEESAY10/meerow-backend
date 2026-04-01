// Standardized API response helper
const successResponse = (
  res,
  data,
  message = "Success",
  statusCode = 200,
  meta = null,
) => {
  const response = {
    success: true,
    message,
    data,
  };

  if (meta) {
    response.meta = meta;
  }

  return res.status(statusCode).json(response);
};

const errorResponse = (
  res,
  message = "Error",
  statusCode = 500,
  error = null,
) => {
  const response = {
    success: false,
    message,
  };

  if (process.env.NODE_ENV === "development" && error) {
    response.error = error.message;
  }

  return res.status(statusCode).json(response);
};

module.exports = {
  successResponse,
  errorResponse,
};
