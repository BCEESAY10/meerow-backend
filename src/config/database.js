const { Sequelize } = require("sequelize");
const env = require("./env");

// Create Sequelize instance
const sequelize = new Sequelize(
  env.database.name,
  env.database.user,
  env.database.password,
  {
    host: env.database.host,
    port: env.database.port,
    dialect: "mysql",
    logging: env.nodeEnv === "development" ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  },
);

// Test the connection
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log("✓ Database connection established successfully");
  } catch (error) {
    console.error("✗ Unable to connect to the database:", error.message);
    process.exit(1);
  }
};

module.exports = {
  sequelize,
  testConnection,
};
