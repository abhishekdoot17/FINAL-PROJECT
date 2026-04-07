const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const passport = require('../config/passport');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET || 'secret', {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });

const sendToken = (res, user, statusCode = 200) => {
  const token = signToken(user._id);
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  res.status(statusCode).json({ token, user });
};

// ── REGISTER ─────────────────────────────────────────────────
router.post('/register', [
  body('name').trim().isLength({ min: 2, max: 50 }).withMessage('Name must be 2–50 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Enter a valid email address'),
  body('password')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
    .matches(/[0-9]/).withMessage('Password must contain at least one number'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: errors.array()[0].msg,
      errors: errors.array().reduce((acc, e) => ({ ...acc, [e.path]: e.msg }), {}),
    });
  }

  try {
    const { name, email, password, city, state } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ message: 'Email already registered', errors: { email: 'Email already registered' } });

    const user = await User.create({ name, email, password, city: city || '', state: state || '' });
    sendToken(res, user, 201);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── LOGIN ─────────────────────────────────────────────────────
router.post('/login', [
  body('email').isEmail().normalizeEmail().withMessage('Enter a valid email address'),
  body('password').notEmpty().withMessage('Password is required'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: errors.array()[0].msg,
      errors: errors.array().reduce((acc, e) => ({ ...acc, [e.path]: e.msg }), {}),
    });
  }

  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user) return res.status(401).json({ message: 'No account found with this email', errors: { email: 'No account found with this email' } });
    if (!user.password) return res.status(401).json({ message: 'This account uses Google sign-in. Please continue with Google.', errors: { email: 'This account uses Google sign-in' } });

    const match = await user.comparePassword(password);
    if (!match) return res.status(401).json({ message: 'Incorrect password', errors: { password: 'Incorrect password' } });

    sendToken(res, user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── GOOGLE OAUTH ──────────────────────────────────────────────
// GET /api/auth/google/status — check if Google OAuth is configured
router.get('/google/status', (req, res) => {
  res.json({ configured: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) });
});

router.get('/google', (req, res, next) => {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/login?error=google_not_configured`);
  }
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })(req, res, next);
});

router.get('/google/callback',
  (req, res, next) => {
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/login?error=google_not_configured`);
    }
    passport.authenticate('google', { session: false, failureRedirect: `${process.env.CLIENT_URL || 'http://localhost:3000'}/login?error=google_failed` })(req, res, next);
  },
  (req, res) => {
    const token = signToken(req.user._id);
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
    res.redirect(`${clientUrl}/auth/callback?token=${token}`);
  }
);

// ── ME ────────────────────────────────────────────────────────
router.get('/me', protect, (req, res) => {
  res.json({ user: req.user });
});

// ── LOGOUT ───────────────────────────────────────────────────
router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out' });
});

// ── UPDATE PROFILE ────────────────────────────────────────────
router.put('/profile', protect, [
  body('name').optional().trim().isLength({ min: 2, max: 50 }).withMessage('Name must be 2–50 characters'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg });

  try {
    const updates = {};
    const allowed = ['name', 'city', 'state', 'bio', 'avatar'];
    allowed.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
