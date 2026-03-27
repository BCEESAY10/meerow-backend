const app = require("./app");
const { sequelize, testConnection } = require("./config/database");
const env = require("./config/env");

// Main startup function
const startServer = async () => {
  try {
    // Load models before testing connection
    require("./models");

    // Test database connection
    await testConnection();

    // Sync database (in development only)
    if (env.nodeEnv === "development") {
      console.log("Syncing database models...");
      await sequelize.sync({ alter: true });
      console.log("✓ Database models synced");
    } else {
      // In production, just ensure models are ready
      await sequelize.sync({ alter: false });
      console.log("✓ Database models ready");
    }

    // Start HTTP server
    const server = app.listen(env.port, () => {
      console.log(`\n✓ Server running on http://localhost:${env.port}`);
      console.log(`✓ Environment: ${env.nodeEnv}\n`);
    });

    // Graceful shutdown
    const gracefulShutdown = async (signal) => {
      console.log(`\n${signal} received, shutting down gracefully...`);
      server.close(async () => {
        try {
          await sequelize.close();
          console.log("✓ Database connection closed");
          process.exit(0);
        } catch (error) {
          console.error("Error during shutdown:", error);
          process.exit(1);
        }
      });
    };

    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
    process.on("SIGINT", () => gracefulShutdown("SIGINT"));
  } catch (error) {
    console.error("✗ Failed to start server:", error.message);
    process.exit(1);
  }
};

// Start the server
startServer();
