const mongoose = require('mongoose');

const VictimSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  matchedExperts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Expert' }],
  expertPreferences: {
    specialization: [String],
    experience: String,
    languages: [String],
    gender: String,
    ageRange: String
  },
  emergencyContacts: [{
    name: String,
    phone: String,
    relationship: String,
    isPrimary: { type: Boolean, default: false }
  }],
  sessionHistory: [{
    sessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Session' },
    expertId: { type: mongoose.Schema.Types.ObjectId, ref: 'Expert' },
    date: Date,
    status: String,
    notes: String
  }],
  anonymousSessions: [{
    sessionId: String,
    questionnaire: Object,
    createdAt: { type: Date, default: Date.now }
  }],
  isAnonymous: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Victim', VictimSchema);