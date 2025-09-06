const mongoose = require('mongoose');

const VictimSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  expertPreferences: Object, // e.g. { specialization: [], language: '', ... }
  matchedExperts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Expert' }],
  sessionHistory: [Object],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Victim', VictimSchema);