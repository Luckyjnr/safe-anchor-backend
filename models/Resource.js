const mongoose = require('mongoose');

const ResourceSchema = new mongoose.Schema({
  type: { type: String, enum: ['article', 'survivor-story'], required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  author: String,
  publishedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Resource', ResourceSchema);