const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5001/api/auth/google/callback',
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      // Try to find existing user by googleId
      let user = await User.findOne({ googleId: profile.id });

      if (!user) {
        const email = profile.emails?.[0]?.value;
        if (email) {
          // Link to existing account with same email
          user = await User.findOne({ email });
          if (user) {
            user.googleId = profile.id;
            if (!user.avatar && profile.photos?.[0]?.value) {
              user.avatar = profile.photos[0].value;
            }
            await user.save();
          }
        }
        // Create brand new user
        if (!user) {
          user = await User.create({
            name: profile.displayName || 'Google User',
            email: profile.emails?.[0]?.value || '',
            googleId: profile.id,
            avatar: profile.photos?.[0]?.value || '',
          });
        }
      }

      return done(null, user);
    } catch (err) {
      return done(err, null);
    }
  }));
}

module.exports = passport;
