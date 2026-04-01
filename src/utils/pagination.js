// Build pagination metadata and query parameters
const buildPaginationParams = (page = 1, limit = 10) => {
  const pageNum = Math.max(1, parseInt(page) || 1);
  const limitNum = Math.max(1, Math.min(100, parseInt(limit) || 10)); // Max 100 per page

  return {
    offset: (pageNum - 1) * limitNum,
    limit: limitNum,
    page: pageNum,
  };
};

// Build pagination metadata response
const buildPaginationMeta = (data, offset, limit, total) => {
  const page = Math.floor(offset / limit) + 1;
  const totalPages = Math.ceil(total / limit);

  return {
    total,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
};

module.exports = {
  buildPaginationParams,
  buildPaginationMeta,
};
