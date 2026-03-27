const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const GENRES = [
  "Fantasy",
  "Science Fiction",
  "Romance",
  "Thriller",
  "Horror",
  "Mystery",
  "Adventure",
  "Historical Fiction",
  "Drama",
  "Comedy",
  "Slice of Life",
  "Poetry",
  "Other",
];

const Story = sequelize.define(
  "Story",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    author_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "users",
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
    slug: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    synopsis: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    genre: {
      type: DataTypes.ENUM(...GENRES),
      allowNull: false,
    },
    is_episodic: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: true, // null if episodic
    },
    read_time_minutes: {
      type: DataTypes.INTEGER,
      allowNull: true, // null if episodic
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
    tableName: "stories",
    timestamps: true,
    underscored: true,
  },
);

module.exports = Story;
