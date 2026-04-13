require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const path = require('path');
const passport = require('./config/passport');

const authRoutes = require('./routes/auth');
const reportRoutes = require('./routes/reports');
const issueRoutes = require('./routes/issues');
const adminRoutes = require('./routes/admin');

const app = express();

// Security middleware
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.set('trust proxy', 1);

// CORS — allow localhost dev + production Vercel URL
const allowedOrigins = [
  'http://localhost:3000',
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
}));

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(passport.initialize());

// Static uploads (only useful locally; use cloud storage in full production)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/issues', issueRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (req, res) =>
  res.json({ status: 'ok', env: process.env.NODE_ENV, time: new Date() })
);

// 404
app.use((req, res) => res.status(404).json({ message: 'Route not found' }));

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ message: err.message || 'Internal Server Error' });
});

// ── MongoDB connection (cached for serverless) ─────────────────
let isConnected = false;

const connectDB = async () => {
  if (isConnected) return;
  await mongoose.connect(
    process.env.MONGODB_URI || 'mongodb://localhost:27017/urban-awareness'
  );
  isConnected = true;
  console.log('✅ MongoDB connected');
};

// ── Serverless handler (Vercel) ──────────────────────────────
const handler = async (req, res) => {
  await connectDB();
  return app(req, res);
};

// ── Local dev server ─────────────────────────────────────────
if (require.main === module) {
  const PORT = process.env.PORT || 5001;
  connectDB()
    .then(() => app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`)))
    .catch(err => { console.error('❌', err.message); process.exit(1); });
}

module.exports = handler;
