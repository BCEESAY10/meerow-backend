const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Like = sequelize.define(
  "Like",
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
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "likes",
    timestamps: false,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ["user_id", "content_id", "content_type"],
      },
    ],
  },
);

module.exports = Like;
