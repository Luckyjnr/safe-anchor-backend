const User = require('../models/User');
const Expert = require('../models/Expert');
const RefreshToken = require('../models/RefreshToken');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sendEmail = require('../config/email'); // ✅ Resend version
const AWS = require('aws-sdk');
const { generateOTP } = require('../utils/otpGenerator');
const { generateOTPEmailTemplate } = require('../utils/emailTemplates');
const { storeOTP } = require('../utils/otpStorage');

// ✅ AWS S3 setup
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

// ==========================
// 🧩 REGISTER EXPERT
// ==========================
const registerExpert = async (req, res) => {
  try {
    const { email, username, password, confirmPassword, firstName, lastName, phone, specialization } = req.body;

    if (password !== confirmPassword) {
      return res.status(400).json({ msg: 'Passwords do not match' });
    }

    // Check for existing user
    let user = await User.findOne({ $or: [{ email }, { username }] });
    if (user) {
      return res.status(400).json({ msg: user.email === email ? 'Email already exists' : 'Username already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const otp = generateOTP();

    // Create user and expert profile
    user = new User({
      email,
      username,
      password: hashedPassword,
      userType: 'expert',
      firstName,
      lastName,
      phone,
      isVerified: false
    });
    await user.save();

    await new Expert({ userId: user._id, specialization }).save();

    // Store OTP temporarily
    storeOTP(user.email, otp, 'expert', firstName || 'Expert');

    // Generate and send OTP email via Resend
    const emailTemplate = generateOTPEmailTemplate(otp, firstName || 'Expert', 'expert');
    await sendEmail(user.email, '🔐 Verify Your Email - Safe Anchor Expert', {
      html: emailTemplate,
      text: `Your Safe Anchor expert verification code is ${otp}`
    });

    res.status(201).json({
      msg: 'Registration successful. Please check your email to verify your account.',
      expert: {
        userId: user._id,
        email: user.email,
        username: user.username,
        userType: user.userType,
        firstName: user.firstName,
        lastName: user.lastName
      }
    });
  } catch (err) {
    console.error('❌ Expert register error:', err.message);
    console.error(err.stack);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// ==========================
// 🧩 VERIFY EMAIL
// ==========================
const verifyExpertEmail = async (req, res) => {
  try {
    const { token } = req.query;
    const user = await User.findOne({ emailVerificationToken: token, userType: 'expert' });
    if (!user) return res.status(400).json({ msg: 'Invalid or expired verification token' });

    user.isVerified = true;
    user.emailVerificationToken = undefined;
    await user.save();

    res.json({ msg: 'Email verified successfully. You can now log in as an expert.' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// ==========================
// 🧩 LOGIN EXPERT
// ==========================
const loginExpert = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email, userType: 'expert' });
    if (!user) return res.status(400).json({ msg: 'Invalid credentials' });
    if (!user.isVerified) return res.status(401).json({ msg: 'Please verify your email before logging in.' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

    const payload = { userId: user._id, userType: user.userType };
    const accessToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
    const refreshTokenValue = crypto.randomBytes(40).toString('hex');

    await new RefreshToken({
      userId: user._id,
      token: refreshTokenValue,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    }).save();

    res.json({
      token: accessToken,
      refreshToken: refreshTokenValue,
      expert: {
        ...payload,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      }
    });
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// ==========================
// 🧩 LOGOUT / REFRESH / RESET
// ==========================
const logoutExpert = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) await RefreshToken.deleteOne({ token: refreshToken });
    res.json({ msg: 'Logged out successfully' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

const refreshTokenExpert = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    const stored = await RefreshToken.findOne({ token: refreshToken });
    if (!stored || stored.expiresAt < Date.now()) return res.status(401).json({ msg: 'Invalid or expired refresh token' });

    const user = await User.findById(stored.userId);
    if (!user || user.userType !== 'expert') return res.status(401).json({ msg: 'User not found or not expert' });

    const payload = { userId: user._id, userType: user.userType };
    const accessToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
    const newRefreshToken = crypto.randomBytes(40).toString('hex');

    await RefreshToken.deleteOne({ token: refreshToken });
    await new RefreshToken({
      userId: user._id,
      token: newRefreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    }).save();

    res.json({ token: accessToken, refreshToken: newRefreshToken });
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// ==========================
// 🧩 FORGOT / RESET PASSWORD
// ==========================
const forgotPasswordExpert = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email, userType: 'expert' });
    if (!user) return res.status(400).json({ msg: 'User not found' });

    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetPasswordCode = resetCode;
    user.resetPasswordExpires = Date.now() + 3600000;
    await user.save();

    const html = `
      <p>You requested a password reset for your Safe Anchor expert account.</p>
      <p>Copy the code below to reset your password:</p>
      <h2>${resetCode}</h2>
      <p>If you did not request this, please ignore this email.</p>
    `;

    await sendEmail(user.email, 'Expert Password Reset Code', { html, text: `Your reset code is ${resetCode}` });
    res.json({ msg: 'Reset code sent' });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

const resetPasswordExpert = async (req, res) => {
  try {
    const { resetCode, password, confirmPassword } = req.body;
    if (password !== confirmPassword) return res.status(400).json({ msg: 'Passwords do not match' });

    const user = await User.findOne({
      resetPasswordCode: resetCode,
      resetPasswordExpires: { $gt: Date.now() },
      userType: 'expert'
    });

    if (!user) return res.status(400).json({ msg: 'Invalid or expired code' });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    user.resetPasswordCode = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ msg: 'Password reset successful' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// ==========================
// 🧩 PLACEHOLDER ROUTES (Prevent Crash)
// ==========================
const testToken = (req, res) => res.json({ msg: 'Token is valid (placeholder)' });
const kycVerification = (req, res) => res.json({ msg: 'KYC verification pending implementation' });
const uploadCredentials = (req, res) => res.json({ msg: 'Upload credentials pending implementation' });
const updateVerificationStatus = (req, res) => res.json({ msg: 'Update verification status pending implementation' });
const getExpertProfile = (req, res) => res.json({ msg: 'Get expert profile pending implementation' });
const updateExpertProfile = (req, res) => res.json({ msg: 'Update expert profile pending implementation' });
const getPublicExpertProfile = (req, res) => res.json({ msg: 'Get public expert profile pending implementation' });

// ==========================
// 🔍 EXPORT MODULES
// ==========================
module.exports = {
  registerExpert,
  verifyExpertEmail,
  loginExpert,
  logoutExpert,
  refreshTokenExpert,
  forgotPasswordExpert,
  resetPasswordExpert,
  testToken,
  kycVerification,
  uploadCredentials,
  updateVerificationStatus,
  getExpertProfile,
  updateExpertProfile,
  getPublicExpertProfile
};
