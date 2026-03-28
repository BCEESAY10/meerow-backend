const {
  validateRegister,
  validateLogin,
} = require("../validators/auth.validator");
const authService = require("../services/auth.service");
const { generateToken } = require("../utils/tokenUtils");

// Register endpoint
const register = async (req, res, next) => {
  try {
    const { name, email, password, agreed_to_terms } = req.body;

    // Validate request
    const { error, value } = validateRegister({
      name,
      email,
      password,
      agreed_to_terms,
    });

    if (error) {
      const validationError = new Error(error.details[0].message);
      validationError.status = 400;
      throw validationError;
    }

    // Register user
    const result = await authService.register(
      value.name,
      value.email,
      value.password,
      value.agreed_to_terms,
    );

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        user: result.user,
        token: result.token,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Login endpoint
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate request
    const { error, value } = validateLogin({ email, password });

    if (error) {
      const validationError = new Error(error.details[0].message);
      validationError.status = 400;
      throw validationError;
    }

    // Login user
    const result = await authService.login(value.email, value.password);

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        user: result.user,
        token: result.token,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get current user profile
const me = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Get user by ID
    const user = await authService.getUserById(userId);

    res.status(200).json({
      success: true,
      message: "User profile retrieved",
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// Logout endpoint (client-side token deletion)
const logout = (req, res) => {
  res.status(200).json({
    success: true,
    message:
      "Logout successful. Please delete the token from client-side storage.",
    data: null,
  });
};

// Google OAuth callback
const googleCallback = async (req, res, next) => {
  try {
    const user = req.user;

    // Generate JWT token
    const token = generateToken(user.id, user.email, user.role);

    // Redirect to frontend with token (adjust URL based on your frontend setup)
    const frontendUrl = process.env.CLIENT_URL || "http://localhost:3000";
    res.redirect(`${frontendUrl}/auth/callback?token=${token}`);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  me,
  logout,
  googleCallback,
};
