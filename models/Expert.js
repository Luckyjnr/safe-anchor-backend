const mongoose = require('mongoose');

const ExpertSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  specialization: [String],
  credentials: [String],
  verificationStatus: { type: String, enum: ['pending', 'verified', 'rejected'], default: 'pending' },
  kycDocuments: [{
    fullName: String,
    dateOfBirth: String,
    address: String,
    phoneNumber: String,
    idType: String,
    idNumber: String,
    submittedAt: { type: Date, default: Date.now }
  }],
  availability: Object,
  sessionHistory: [Object],
  rating: { type: Number, default: 0 },
  totalSessions: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Expert', ExpertSchema);