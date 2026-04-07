const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    minlength: 5,
    maxlength: 100,
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    minlength: 20,
    maxlength: 2000,
  },
  category: {
    type: String,
    required: true,
    enum: ['pollution', 'traffic', 'waste', 'housing', 'infrastructure', 'overcrowding', 'other'],
  },
  city: {
    type: String,
    required: [true, 'City is required'],
    trim: true,
  },
  state: {
    type: String,
    required: [true, 'State is required'],
    trim: true,
  },
  locality: { type: String, trim: true },
  images: [{ type: String }], // file paths
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  adminNote: { type: String, default: '' },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  upvotes: { type: Number, default: 0 },
  upvotedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

reportSchema.index({ category: 1, status: 1 });
reportSchema.index({ userId: 1 });
reportSchema.index({ city: 1 });

module.exports = mongoose.model('Report', reportSchema);
