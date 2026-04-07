const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { body, validationResult } = require('express-validator');
const Report = require('../models/Report');
const { protect } = require('../middleware/auth');

// Multer setup
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) return cb(new Error('Only images allowed'));
    cb(null, true);
  },
});

// GET /api/reports  — public (approved only unless logged-in user)
router.get('/', async (req, res) => {
  try {
    const { category, city, status, page = 1, limit = 12 } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (city) filter.city = new RegExp(city, 'i');
    filter.status = status || 'approved';

    const total = await Report.countDocuments(filter);
    const reports = await Report.find(filter)
      .populate('userId', 'name avatar')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ reports, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/reports/my  — user's own reports
router.get('/my', protect, async (req, res) => {
  try {
    const reports = await Report.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json({ reports });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/reports/stats  — category stats
router.get('/stats', async (req, res) => {
  try {
    const stats = await Report.aggregate([
      { $match: { status: 'approved' } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]);
    res.json({ stats });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/reports/:id
router.get('/:id', async (req, res) => {
  try {
    const report = await Report.findById(req.params.id).populate('userId', 'name avatar city state');
    if (!report) return res.status(404).json({ message: 'Report not found' });
    res.json({ report });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/reports
router.post('/', protect, upload.array('images', 5), [
  body('title').trim().isLength({ min: 5, max: 100 }),
  body('description').isLength({ min: 20, max: 2000 }),
  body('category').isIn(['pollution', 'traffic', 'waste', 'housing', 'infrastructure', 'overcrowding', 'other']),
  body('city').notEmpty(),
  body('state').notEmpty(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const images = (req.files || []).map(f => `/uploads/${f.filename}`);
    const report = await Report.create({
      ...req.body,
      images,
      userId: req.user._id,
    });
    res.status(201).json({ report });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/reports/:id/upvote  — toggle upvote
router.post('/:id/upvote', protect, async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ message: 'Report not found' });
    if (report.status !== 'approved') return res.status(403).json({ message: 'Can only upvote approved reports' });

    const uid = req.user._id.toString();
    const idx = report.upvotedBy.findIndex(id => id.toString() === uid);
    if (idx === -1) {
      report.upvotedBy.push(req.user._id);
      report.upvotes = report.upvotedBy.length;
    } else {
      report.upvotedBy.splice(idx, 1);
      report.upvotes = report.upvotedBy.length;
    }
    await report.save();
    res.json({ upvotes: report.upvotes, upvoted: idx === -1 });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/reports/:id  — owner or admin
router.delete('/:id', protect, async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ message: 'Not found' });
    if (report.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }
    // Remove image files
    report.images.forEach(img => {
      const full = path.join(__dirname, '..', img);
      if (fs.existsSync(full)) fs.unlinkSync(full);
    });
    await report.deleteOne();
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
