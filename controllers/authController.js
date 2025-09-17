const User = require('../models/User');
const Victim = require('../models/Victim'); // <-- Add this import
const RefreshToken = require('../models/RefreshToken');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const transporter = require('../config/email'); // Nodemailer config
const { generateOTP } = require('../utils/otpGenerator');
const { generateOTPEmailTemplate } = require('../utils/emailTemplates');
const { storeOTP, verifyOTP, hasValidOTP, removeOTP } = require('../utils/otpStorage');

// Helper to generate tokens
const generateTokens = (user) => {
  const payload = { userId: user._id, userType: user.userType };
  const accessToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
  const refreshToken = crypto.randomBytes(40).toString('hex');
  return { accessToken, refreshToken };
};

// Victim registration with email verification
const register = async (req, res) => {
  try {
    const { email, password, confirmPassword, firstName, lastName, phone } = req.body;

    if (password !== confirmPassword) {
      return res.status(400).json({ msg: 'Passwords do not match' });
    }

    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate OTP for email verification (not stored in database)
    const emailVerificationOTP = generateOTP();

    user = new User({
      email,
      password: hashedPassword,
      userType: 'victim',
      firstName,
      lastName,
      phone,
      isVerified: false
      // OTP is NOT stored in database - only sent via email
    });

    await user.save();

    // Create Victim document after user registration
    await new Victim({ userId: user._id }).save();

    // Store OTP in memory (not database)
    storeOTP(user.email, emailVerificationOTP, 'victim', firstName || 'User');

    // Send OTP verification email
    const emailTemplate = generateOTPEmailTemplate(
      emailVerificationOTP, 
      firstName || 'User', 
      'victim'
    );
    
    await transporter.sendMail({
      from: `"Safe Anchor" <${process.env.GMAIL_FROM_EMAIL || process.env.EMAIL_USER}>`,
      to: user.email,
      subject: '🔐 Verify Your Email - Safe Anchor',
      html: emailTemplate
    });

    res.status(201).json({
      msg: 'Registration successful. Please check your email to verify your account.',
      user: { 
        userId: user._id, 
        userType: user.userType,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      }
    });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

// Email verification endpoint - OTP only (no email required)
const verifyEmail = async (req, res) => {
  try {
    const { otp } = req.body;

    if (!otp) {
      return res.status(400).json({ msg: 'OTP is required' });
    }

    // Validate OTP from memory storage (finds user by OTP)
    const validation = verifyOTP(otp);
    
    if (!validation.success) {
      return res.status(400).json({ msg: validation.message });
    }

    // Find user by email (returned from OTP validation)
    const user = await User.findOne({ email: validation.email });
    if (!user) {
      return res.status(400).json({ msg: 'User not found' });
    }

    // Check if user is already verified
    if (user.isVerified) {
      return res.status(400).json({ msg: 'Email is already verified' });
    }

    // Verify user (OTP is automatically removed from memory after verification)
    user.isVerified = true;
    await user.save();

    res.json({ 
      msg: 'Email verified successfully. You can now log in.',
      user: {
        userId: user._id,
        email: user.email,
        userType: user.userType,
        isVerified: user.isVerified
      }
    });
  } catch (err) {
    console.error('Email verification error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Victim login (only if verified)
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'Invalid credentials' });

    if (!user.isVerified) {
      return res.status(401).json({ msg: 'Please verify your email before logging in.' });
    }

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
      user: {
        ...payload,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      }
    });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

const logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    console.log('Logout request:', { refreshToken: refreshToken ? 'provided' : 'missing' });
    
    if (refreshToken) {
      await RefreshToken.deleteOne({ token: refreshToken });
    }
    
    res.json({ msg: 'Logged out successfully' });
  } catch (err) {
    console.error('Logout error:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    const storedToken = await RefreshToken.findOne({ token: refreshToken });
    if (!storedToken || storedToken.expiresAt < Date.now()) {
      return res.status(401).json({ msg: 'Invalid or expired refresh token' });
    }
    const user = await User.findById(storedToken.userId);
    if (!user) return res.status(401).json({ msg: 'User not found' });

    const tokens = generateTokens(user);

    await RefreshToken.deleteOne({ token: refreshToken });
    await new RefreshToken({
      userId: user._id,
      token: tokens.refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    }).save();

    res.json({ token: tokens.accessToken, refreshToken: tokens.refreshToken });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

// Forgot password with 6-digit code email integration
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'User not found' });

    // Generate a random 6-digit code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetPasswordCode = resetCode;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    await transporter.sendMail({
      from: `"Safe Anchor" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: 'Password Reset Code',
      html: `
        <p>You requested a password reset for your Safe Anchor account.</p>
        <p>Copy the code below to reset your password:</p>
        <h2>${resetCode}</h2>
        <p>If you did not request this, please ignore this email.</p>
      `
    });

    res.json({ msg: 'reset code sent' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

// Reset password with 6-digit code
const resetPassword = async (req, res) => {
  try {
    const { email, resetCode, password, newPassword, confirmPassword } = req.body;
    
    // Use newPassword if provided, otherwise use password
    const actualPassword = newPassword || password;
    
    console.log('Reset password request:', { email, resetCode, password: actualPassword ? 'provided' : 'missing', confirmPassword: confirmPassword ? 'provided' : 'missing' });
    
    if (actualPassword !== confirmPassword) {
      return res.status(400).json({ msg: 'Passwords do not match' });
    }

    const user = await User.findOne({
      email,
      resetPasswordCode: resetCode,
      resetPasswordExpires: { $gt: Date.now() }
    });
    
    console.log('User found:', user ? 'Yes' : 'No');
    
    if (!user) return res.status(400).json({ msg: 'Invalid or expired code' });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(actualPassword, salt);
    user.resetPasswordCode = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ msg: 'Password reset successful' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// Resend OTP for email verification (no database storage)
const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ msg: 'Email is required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'User not found' });
    }

    // Check if user is already verified
    if (user.isVerified) {
      return res.status(400).json({ msg: 'Email is already verified' });
    }

    // Generate new OTP
    const emailVerificationOTP = generateOTP();

    // Store new OTP in memory (replaces any existing OTP for this email)
    storeOTP(user.email, emailVerificationOTP, user.userType, user.firstName || 'User');

    // Send new OTP email
    const emailTemplate = generateOTPEmailTemplate(
      emailVerificationOTP, 
      user.firstName || 'User', 
      user.userType
    );
    
    await transporter.sendMail({
      from: `"Safe Anchor" <${process.env.GMAIL_FROM_EMAIL || process.env.EMAIL_USER}>`,
      to: user.email,
      subject: '🔐 New Verification Code - Safe Anchor',
      html: emailTemplate
    });

    res.json({ 
      msg: 'New verification code sent to your email. Please check your inbox.',
      expiresIn: '10 minutes'
    });
  } catch (err) {
    console.error('Resend OTP error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

module.exports = {
  register,
  verifyEmail,
  resendOTP,
  login,
  logout,
  refreshToken,
  forgotPassword,
  resetPassword
};