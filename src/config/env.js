// Load environment variables from .env files
require("dotenv").config({
  path:
    process.env.NODE_ENV === "production"
      ? ".env.production"
      : ".env.development",
});

// Validate and export environment variables
const env = {
  // Server
  nodeEnv: process.env.NODE_ENV || "development",
  port: parseInt(process.env.PORT, 10) || 5000,

  // Database
  database: {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    name: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  },

  // JWT
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  },

  // Google OAuth
  googleOAuth: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackUrl: process.env.GOOGLE_CALLBACK_URL,
  },

  // Client URL
  clientUrl: process.env.CLIENT_URL,
};

// Validate critical environment variables
const requiredVars = [
  "database.host",
  "database.name",
  "database.user",
  "jwt.secret",
  "clientUrl",
];

const validateEnv = () => {
  const errors = [];

  requiredVars.forEach((varPath) => {
    const keys = varPath.split(".");
    let value = env;
    for (const key of keys) {
      value = value[key];
    }
    if (!value) {
      errors.push(`Missing required environment variable: ${varPath}`);
    }
  });

  if (errors.length > 0) {
    console.error("Environment validation failed:");
    errors.forEach((err) => console.error(`  - ${err}`));
    process.exit(1);
  }
};

// Validate on module load (but not during testing)
if (process.env.NODE_ENV !== "test") {
  validateEnv();
}

module.exports = env;
