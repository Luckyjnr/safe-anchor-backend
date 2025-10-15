const User = require('../models/User');
const Victim = require('../models/Victim');
const RefreshToken = require('../models/RefreshToken');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sendEmail = require('../config/email'); // ✅ Using Resend now
const { generateOTP } = require('../utils/otpGenerator');
const { generateOTPEmailTemplate } = require('../utils/emailTemplates');
const { storeOTP, verifyOTP } = require('../utils/otpStorage');

// =============================
// 🎯 HELPER: GENERATE TOKENS
// =============================
const generateTokens = (user) => {
  const payload = { userId: user._id, userType: user.userType };
  const accessToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
  const refreshToken = crypto.randomBytes(40).toString('hex');
  return { accessToken, refreshToken };
};

// =============================
// 📩 REGISTER CONTROLLER
// =============================
const register = async (req, res) => {
  try {
    const { email, username, password, confirmPassword, firstName, lastName, phone } = req.body;

    if (password !== confirmPassword) {
      return res.status(400).json({ msg: 'Passwords do not match' });
    }

    // Check if email or username already exists
    let user = await User.findOne({ $or: [{ email }, { username }] });
    if (user) {
      return res.status(400).json({
        msg: user.email === email ? 'Email already exists' : 'Username already exists',
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const emailVerificationOTP = generateOTP();

    user = new User({
      email,
      username,
      password: hashedPassword,
      userType: 'victim',
      firstName,
      lastName,
      phone,
      isVerified: false,
    });

    await user.save();
    await new Victim({ userId: user._id }).save();

    storeOTP(user.email, emailVerificationOTP, 'victim', firstName || 'User');
    const emailTemplate = generateOTPEmailTemplate(emailVerificationOTP, firstName || 'User', 'victim');

    console.log('📧 Attempting to send OTP via Resend to:', user.email);
    console.log('📨 Generated OTP:', emailVerificationOTP);

    try {
      // ✅ FIXED sendEmail usage
      await sendEmail(
        user.email,
        '🔐 Verify Your Email - Safe Anchor',
        {
          text: `Your verification code is ${emailVerificationOTP}`,
          html: emailTemplate,
        }
      );
      console.log('✅ Email sent successfully via Resend');
    } catch (error) {
      console.error('❌ Email sending error (Resend):', error.message);
    }

    res.status(201).json({
      msg: 'Registration successful. Please check your email to verify your account.',
      user: {
        userId: user._id,
        userType: user.userType,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    });
  } catch (err) {
    console.error('❌ Register error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

// =============================
// 📩 VERIFY EMAIL
// =============================
const verifyEmail = async (req, res) => {
  try {
    const { otp } = req.body;

    if (!otp) {
      return res.status(400).json({ msg: 'OTP is required' });
    }

    const validation = verifyOTP(otp);

    if (!validation.success) {
      return res.status(400).json({ msg: validation.message });
    }

    const user = await User.findOne({ email: validation.email });
    if (!user) return res.status(400).json({ msg: 'User not found' });

    if (user.isVerified) {
      return res.status(400).json({ msg: 'Email already verified' });
    }

    user.isVerified = true;
    await user.save();

    res.json({
      msg: 'Email verified successfully. You can now log in.',
      user: {
        userId: user._id,
        email: user.email,
        userType: user.userType,
        isVerified: user.isVerified,
      },
    });
  } catch (err) {
    console.error('Email verification error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

// =============================
// 🔐 LOGIN
// =============================
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
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
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    }).save();

    res.json({
      token: accessToken,
      refreshToken: refreshTokenValue,
      user: {
        ...payload,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

// =============================
// 🔐 LOGOUT
// =============================
const logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) await RefreshToken.deleteOne({ token: refreshToken });
    res.json({ msg: 'Logged out successfully' });
  } catch (err) {
    console.error('Logout error:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// =============================
// 🔁 REFRESH TOKEN
// =============================
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
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    }).save();

    res.json({ token: tokens.accessToken, refreshToken: tokens.refreshToken });
  } catch (err) {
    console.error('Refresh token error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

// =============================
// 🔑 FORGOT PASSWORD
// =============================
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'User not found' });

    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetPasswordCode = resetCode;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    console.log('📧 Sending password reset via Resend:', email);
    console.log('📨 Reset code:', resetCode);

    const html = `
      <p>You requested a password reset for your Safe Anchor account.</p>
      <p>Copy the code below to reset your password:</p>
      <h2>${resetCode}</h2>
      <p>If you did not request this, please ignore this email.</p>
    `;

    // ✅ FIXED sendEmail call
    await sendEmail(
      user.email,
      'Safe Anchor - Password Reset Code',
      {
        text: `Your password reset code is ${resetCode}`,
        html,
      }
    );

    console.log('✅ Password reset email sent via Resend');
    res.json({ msg: 'Reset code sent' });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

// =============================
// 🔑 RESET PASSWORD
// =============================
const resetPassword = async (req, res) => {
  try {
    const { email, resetCode, password, newPassword, confirmPassword } = req.body;
    const actualPassword = newPassword || password;

    if (actualPassword !== confirmPassword) {
      return res.status(400).json({ msg: 'Passwords do not match' });
    }

    const user = await User.findOne({
      email,
      resetPasswordCode: resetCode,
      resetPasswordExpires: { $gt: Date.now() },
    });

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

// =============================
// 🔁 RESEND OTP
// =============================
const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ msg: 'Email is required' });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'User not found' });
    if (user.isVerified) return res.status(400).json({ msg: 'Email already verified' });

    const emailVerificationOTP = generateOTP();
    storeOTP(user.email, emailVerificationOTP, user.userType, user.firstName || 'User');

    const emailTemplate = generateOTPEmailTemplate(emailVerificationOTP, user.firstName || 'User', user.userType);

    console.log('📧 Resending OTP via Resend:', user.email);
    console.log('📨 New OTP generated:', emailVerificationOTP);

    // ✅ FIXED sendEmail usage
    await sendEmail(
      user.email,
      '🔐 New Verification Code - Safe Anchor',
      {
        text: `Your new verification code is ${emailVerificationOTP}`,
        html: emailTemplate,
      }
    );

    console.log('✅ Resend OTP email sent via Resend');
    res.json({
      msg: 'New verification code sent to your email. Please check your inbox.',
      expiresIn: '10 minutes',
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
  resetPassword,
};
