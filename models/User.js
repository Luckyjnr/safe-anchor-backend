const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  userType: { type: String, enum: ['victim', 'expert', 'admin'], required: true },
  firstName: String,
  lastName: String,
  phone: String,
  isAnonymous: { type: Boolean, default: false },
  isVerified: { type: Boolean, default: false },
  emailVerificationToken: String, // Added for email verification
  privacySettings: Object,
  resetPasswordToken: String,
  resetPasswordCode: String, // 6-digit code for password reset
  resetPasswordExpires: Date,
  emergencyContacts: [Object],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);