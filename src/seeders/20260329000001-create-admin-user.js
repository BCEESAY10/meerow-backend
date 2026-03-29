"use strict";

const bcrypt = require("bcryptjs");

module.exports = {
  async up(queryInterface, Sequelize) {
    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash("Bceesay10", salt);

    await queryInterface.bulkInsert("users", [
      {
        id: Sequelize.literal("UUID()"),
        name: "Bamfa Ceesay",
        email: "bamfaceesay30@gmail.com",
        password_hash: passwordHash,
        role: "admin",
        agreed_to_terms: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("users", {
      email: "bamfaceesay30@gmail.com",
    });
  },
};
