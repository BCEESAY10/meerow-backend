const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Episode = sequelize.define(
  "Episode",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    story_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "stories",
        key: "id",
      },
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    episode_number: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    read_time_minutes: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("pending", "approved", "rejected"),
      defaultValue: "pending",
      allowNull: false,
    },
    rejection_reason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    reviewed_by: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "users",
        key: "id",
      },
    },
    reviewed_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    published_at: {
      type: DataTypes.DATE,
      allowNull: true,
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
    tableName: "episodes",
    timestamps: true,
    underscored: true,
  },
);

module.exports = Episode;
