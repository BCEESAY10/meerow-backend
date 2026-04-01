const User = require("./User");
const Story = require("./Story");
const Episode = require("./Episode");
const Comment = require("./Comment");
const Like = require("./Like");

// Setup associations
// Foreign key constraints are NOT enforced in DB to prevent hitting MySQL's 64-key limit
// We handle referential integrity at the application layer

// User -> Story (author relationship)
User.hasMany(Story, {
  foreignKey: "author_id",
  as: "stories",
  constraints: false,
});
Story.belongsTo(User, {
  foreignKey: "author_id",
  as: "author",
  constraints: false,
});

// User -> Story (reviewer relationship for moderation)
User.hasMany(Story, {
  foreignKey: "reviewed_by",
  as: "reviewed_stories",
  constraints: false,
});
Story.belongsTo(User, {
  foreignKey: "reviewed_by",
  as: "reviewer",
  constraints: false,
});

// Story -> Episode
Story.hasMany(Episode, {
  foreignKey: "story_id",
  as: "episodes",
  constraints: false,
});
Episode.belongsTo(Story, {
  foreignKey: "story_id",
  as: "story",
  constraints: false,
});

// User -> Episode (reviewer relationship)
User.hasMany(Episode, {
  foreignKey: "reviewed_by",
  as: "reviewed_episodes",
  constraints: false,
});
Episode.belongsTo(User, {
  foreignKey: "reviewed_by",
  as: "reviewer",
  constraints: false,
});

// User -> Comment
User.hasMany(Comment, {
  foreignKey: "user_id",
  as: "comments",
  constraints: false,
});
Comment.belongsTo(User, {
  foreignKey: "user_id",
  as: "author",
  constraints: false,
});

// User -> Like
User.hasMany(Like, { foreignKey: "user_id", as: "likes", constraints: false });
Like.belongsTo(User, { foreignKey: "user_id", as: "user", constraints: false });

module.exports = {
  User,
  Story,
  Episode,
  Comment,
  Like,
};
