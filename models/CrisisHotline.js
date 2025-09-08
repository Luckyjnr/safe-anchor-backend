const mongoose = require('mongoose');

const CrisisHotlineSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  country: String,
  description: String,
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('CrisisHotline', CrisisHotlineSchema);