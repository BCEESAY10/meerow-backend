const User = require("./User");
const Story = require("./Story");
const Episode = require("./Episode");
const Comment = require("./Comment");
const Like = require("./Like");

// Setup associations
// User -> Story (author relationship)
User.hasMany(Story, { foreignKey: "author_id", as: "stories" });
Story.belongsTo(User, { foreignKey: "author_id", as: "author" });

// User -> Story (reviewer relationship for moderation)
User.hasMany(Story, { foreignKey: "reviewed_by", as: "reviewed_stories" });
Story.belongsTo(User, { foreignKey: "reviewed_by", as: "reviewer" });

// Story -> Episode
Story.hasMany(Episode, { foreignKey: "story_id", as: "episodes" });
Episode.belongsTo(Story, { foreignKey: "story_id", as: "story" });

// User -> Episode (reviewer relationship)
User.hasMany(Episode, { foreignKey: "reviewed_by", as: "reviewed_episodes" });
Episode.belongsTo(User, { foreignKey: "reviewed_by", as: "reviewer" });

// User -> Comment
User.hasMany(Comment, { foreignKey: "user_id", as: "comments" });
Comment.belongsTo(User, { foreignKey: "user_id", as: "author" });

// User -> Like
User.hasMany(Like, { foreignKey: "user_id", as: "likes" });
Like.belongsTo(User, { foreignKey: "user_id", as: "user" });

module.exports = {
  User,
  Story,
  Episode,
  Comment,
  Like,
};
