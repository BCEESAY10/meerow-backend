const express = require("express");
const passport = require("passport");
const authController = require("../controllers/auth.controller");
const authenticate = require("../middlewares/authenticate");

const router = express.Router();

// Public routes
router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/logout", authController.logout);

// Protected routes
router.get("/me", authenticate, authController.me);

// Google OAuth routes
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  }),
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/auth/login",
    session: false,
  }),
  authController.googleCallback,
);

module.exports = router;
