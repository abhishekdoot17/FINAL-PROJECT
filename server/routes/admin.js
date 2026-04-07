const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Report = require('../models/Report');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/admin');

// All admin routes need auth + admin role
router.use(protect, adminOnly);

// GET /api/admin/stats — dashboard overview
router.get('/stats', async (req, res) => {
  try {
    const [totalUsers, totalReports, pending, approved, rejected] = await Promise.all([
      User.countDocuments(),
      Report.countDocuments(),
      Report.countDocuments({ status: 'pending' }),
      Report.countDocuments({ status: 'approved' }),
      Report.countDocuments({ status: 'rejected' }),
    ]);

    const categoryStats = await Report.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const recentReports = await Report.find()
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({ totalUsers, totalReports, pending, approved, rejected, categoryStats, recentReports });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/admin/reports — all reports with filters
router.get('/reports', async (req, res) => {
  try {
    const { status, category, search, page = 1, limit = 15 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (search) filter.$or = [
      { title: new RegExp(search, 'i') },
      { city: new RegExp(search, 'i') },
    ];

    const total = await Report.countDocuments(filter);
    const reports = await Report.find(filter)
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ reports, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/admin/reports/:id/status
router.patch('/reports/:id/status', async (req, res) => {
  try {
    const { status, adminNote } = req.body;
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    const report = await Report.findByIdAndUpdate(
      req.params.id,
      { status, adminNote: adminNote || '' },
      { new: true }
    ).populate('userId', 'name email');
    if (!report) return res.status(404).json({ message: 'Not found' });
    res.json({ report });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/admin/reports/:id
router.delete('/reports/:id', async (req, res) => {
  try {
    const report = await Report.findByIdAndDelete(req.params.id);
    if (!report) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/admin/users
router.get('/users', async (req, res) => {
  try {
    const { search, page = 1, limit = 15 } = req.query;
    const filter = {};
    if (search) filter.$or = [
      { name: new RegExp(search, 'i') },
      { email: new RegExp(search, 'i') },
    ];

    const total = await User.countDocuments(filter);
    const users = await User.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ users, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/admin/users/:id/role
router.patch('/users/:id/role', async (req, res) => {
  try {
    const { role } = req.body;
    if (!['user', 'admin'].includes(role)) return res.status(400).json({ message: 'Invalid role' });
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
    if (!user) return res.status(404).json({ message: 'Not found' });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/admin/users/:id
router.delete('/users/:id', async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot delete yourself' });
    }
    await User.findByIdAndDelete(req.params.id);
    await Report.deleteMany({ userId: req.params.id });
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
