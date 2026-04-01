// Calculate read time in minutes from text content
// Average reading speed: 200 words per minute

const calculateReadTime = (text) => {
  if (!text) return 0;

  // Count words (rough estimate)
  const words = text.trim().split(/\s+/).length;

  // Calculate read time (round up)
  const readTime = Math.ceil(words / 200);

  return Math.max(1, readTime); // Minimum 1 minute
};

module.exports = { calculateReadTime };
