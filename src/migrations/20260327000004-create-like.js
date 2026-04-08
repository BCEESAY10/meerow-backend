"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Likes", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      content_id: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      content_type: {
        type: Sequelize.ENUM("story", "episode"),
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });

    // Add single composite unique index
    await queryInterface.addIndex(
      "Likes",
      ["user_id", "content_id", "content_type"],
      {
        unique: true,
        name: "unique_user_content_like",
      },
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Likes");
  },
};
