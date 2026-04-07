const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  try {
    let token = req.cookies?.token || req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Not authenticated' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) return res.status(401).json({ message: 'User not found or deactivated' });

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

const optionalAuth = async (req, res, next) => {
  try {
    let token = req.cookies?.token || req.headers.authorization?.split(' ')[1];
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
      req.user = await User.findById(decoded.id);
    }
  } catch (_) {}
  next();
};

module.exports = { protect, optionalAuth };
