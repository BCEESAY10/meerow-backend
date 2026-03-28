const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const { User } = require("../models");
const authService = require("../services/auth.service");
const env = require("./env");

// Configure Local Strategy (email + password)
passport.use(
  "local",
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    async (email, password, done) => {
      try {
        const user = await User.findOne({ where: { email } });
        if (!user) {
          return done(null, false, {
            message: "Invalid email or password",
          });
        }

        const isPasswordValid = await authService.comparePassword(
          password,
          user.password_hash,
        );
        if (!isPasswordValid) {
          return done(null, false, {
            message: "Invalid email or password",
          });
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    },
  ),
);

// Configure Google OAuth Strategy
passport.use(
  "google",
  new GoogleStrategy(
    {
      clientID: env.googleOAuth.clientId,
      clientSecret: env.googleOAuth.clientSecret,
      callbackURL: env.googleOAuth.callbackUrl,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const { id, displayName, emails } = profile;
        const email = emails[0].value;

        let user = await User.findOne({
          where: { google_id: id },
        });

        if (!user) {
          // Try to find by email
          user = await User.findOne({ where: { email } });
          if (user) {
            // Link Google account
            user.google_id = id;
            await user.save();
          } else {
            // Create new user
            user = await User.create({
              name: displayName,
              email,
              google_id: id,
              role: "author",
              agreed_to_terms: true,
            });
          }
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    },
  ),
);

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findByPk(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

module.exports = passport;
