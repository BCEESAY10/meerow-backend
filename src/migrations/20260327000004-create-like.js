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
      story_id: {
        type: Sequelize.UUID,
        allowNull: true,
      },
      episode_id: {
        type: Sequelize.UUID,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });

    // Add separate unique indices for story and episode likes
    await queryInterface.addIndex("Likes", ["user_id", "story_id"], {
      unique: true,
      where: { story_id: { [Sequelize.Op.not]: null } },
      name: "unique_user_story_like",
    });

    await queryInterface.addIndex("Likes", ["user_id", "episode_id"], {
      unique: true,
      where: { episode_id: { [Sequelize.Op.not]: null } },
      name: "unique_user_episode_like",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Likes");
  },
};
