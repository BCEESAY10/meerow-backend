const bcrypt = require("bcryptjs");
const { User } = require("../models");
const { generateToken } = require("../utils/tokenUtils");

// Hash password
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

// Compare password with hash
const comparePassword = async (password, passwordHash) => {
  return bcrypt.compare(password, passwordHash);
};

// Register new user
const register = async (name, email, password, agreementStatus) => {
  try {
    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      const error = new Error("User with this email already exists");
      error.status = 409;
      throw error;
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create new user
    const user = await User.create({
      name,
      email,
      password_hash: passwordHash,
      agreed_to_terms: agreementStatus,
      role: "author", // Default role
    });

    // Generate JWT token
    const token = generateToken(user.id, user.email, user.role);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    };
  } catch (error) {
    throw error;
  }
};

// Login user
const login = async (email, password) => {
  try {
    // Find user by email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      const error = new Error("Invalid email or password");
      error.status = 401;
      throw error;
    }

    // Check if password is correct
    const isPasswordValid = await comparePassword(password, user.password_hash);
    if (!isPasswordValid) {
      const error = new Error("Invalid email or password");
      error.status = 401;
      throw error;
    }

    // Generate JWT token
    const token = generateToken(user.id, user.email, user.role);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    };
  } catch (error) {
    throw error;
  }
};

// Get user by ID
const getUserById = async (userId) => {
  try {
    const user = await User.findByPk(userId, {
      attributes: { exclude: ["password_hash"] },
    });
    if (!user) {
      const error = new Error("User not found");
      error.status = 404;
      throw error;
    }
    return user;
  } catch (error) {
    throw error;
  }
};

// Find or create user (for Google OAuth)
const findOrCreateOAuthUser = async (googleId, email, name) => {
  try {
    let user = await User.findOne({
      where: { google_id: googleId },
    });

    if (!user) {
      // Check if email exists
      user = await User.findOne({ where: { email } });
      if (user) {
        // Link Google account
        user.google_id = googleId;
        await user.save();
      } else {
        // Create new user
        user = await User.create({
          name,
          email,
          google_id: googleId,
          role: "author",
          agreed_to_terms: true,
        });
      }
    }

    // Generate JWT token
    const token = generateToken(user.id, user.email, user.role);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    };
  } catch (error) {
    throw error;
  }
};

module.exports = {
  register,
  login,
  getUserById,
  findOrCreateOAuthUser,
  hashPassword,
  comparePassword,
};
