const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Comment = sequelize.define(
  "Comment",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    content_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    content_type: {
      type: DataTypes.ENUM("story", "episode"),
      allowNull: false,
    },
    body: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "comments",
    timestamps: true,
    underscored: true,
  },
);

module.exports = Comment;
