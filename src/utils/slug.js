const slugify = require("slugify");

// Generate URL-safe slug from title
const generateSlug = (title) => {
  if (!title) throw new Error("Title is required to generate slug");

  const slug = slugify(title, {
    lower: true,
    trim: true,
    strict: true,
  });

  // Add timestamp to ensure uniqueness
  const timestamp = Date.now();
  return `${slug}-${timestamp}`;
};

module.exports = { generateSlug };
