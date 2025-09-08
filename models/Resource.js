const mongoose = require('mongoose');

const ResourceSchema = new mongoose.Schema({
  type: { type: String, enum: ['article', 'survivor-story'], required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  author: String,
  category: { type: String, default: 'general' },
  isPublished: { type: Boolean, default: true },
  publishedAt: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Resource', ResourceSchema);