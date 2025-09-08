const mongoose = require('mongoose');

const SupportGroupSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  category: { type: String, default: 'general' },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SupportGroup', SupportGroupSchema);