const User = require('../models/User');
const Expert = require('../models/Expert');
const RefreshToken = require('../models/RefreshToken');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const transporter = require('../config/email');
const AWS = require('aws-sdk');

// AWS S3 setup (make sure to set credentials in environment variables)
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

// Register expert
const registerExpert = async (req, res) => {
  try {
    const { email, password, confirmPassword, firstName, lastName, phone, specialization } = req.body;
    if (password !== confirmPassword) {
      return res.status(400).json({ msg: 'Passwords do not match' });
    }
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({
      email,
      password: hashedPassword,
      userType: 'expert',
      firstName,
      lastName,
      phone,
      isVerified: false
    });
    await user.save();

    await new Expert({ userId: user._id, specialization }).save();

    const payload = { userId: user._id, userType: user.userType };
    const accessToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
    const refreshTokenValue = crypto.randomBytes(40).toString('hex');
    await new RefreshToken({
      userId: user._id,
      token: refreshTokenValue,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    }).save();

    res.status(201).json({
      accessToken,
      refreshToken: refreshTokenValue,
      user: payload
    });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

// Expert login
const loginExpert = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email, userType: 'expert' });
    if (!user) return res.status(400).json({ msg: 'Invalid credentials' });

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
      accessToken,
      refreshToken: refreshTokenValue,
      user: payload
    });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

// Expert logout
const logoutExpert = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    await RefreshToken.deleteOne({ token: refreshToken });
    res.json({ msg: 'Logged out successfully' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

// Expert refresh token
const refreshTokenExpert = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    const storedToken = await RefreshToken.findOne({ token: refreshToken });
    if (!storedToken || storedToken.expiresAt < Date.now()) {
      return res.status(401).json({ msg: 'Invalid or expired refresh token' });
    }
    const user = await User.findById(storedToken.userId);
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

    res.json({ accessToken, refreshToken: newRefreshToken });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

// Expert forgot password (6-digit code)
const forgotPasswordExpert = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email, userType: 'expert' });
    if (!user) return res.status(400).json({ msg: 'User not found' });

    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetPasswordCode = resetCode;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    await transporter.sendMail({
      from: `"Safe Anchor" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: 'Expert Password Reset Code',
      html: `
        <p>You requested a password reset for your Safe Anchor expert account.</p>
        <p>Copy the code below to reset your password:</p>
        <h2>${resetCode}</h2>
        <p>If you did not request this, please ignore this email.</p>
      `
    });

    res.json({ msg: 'Password reset code sent to your email' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

// Expert reset password (6-digit code)
const resetPasswordExpert = async (req, res) => {
  try {
    const { resetCode, password, confirmPassword } = req.body;
    if (password !== confirmPassword) {
      return res.status(400).json({ msg: 'Passwords do not match' });
    }
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
    res.status(500).json({ msg: 'Server error' });
  }
};

// POST /api/experts/kyc-verification
const kycVerification = async (req, res) => {
  try {
    const { userId, kycData } = req.body;
    const expert = await Expert.findOne({ userId });
    if (!expert) return res.status(404).json({ msg: 'Expert not found' });

    expert.kycDocuments = kycData;
    expert.verificationStatus = 'pending';
    await expert.save();

    res.json({ msg: 'KYC submitted, pending verification', expert });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

// POST /api/experts/upload-credentials
const uploadCredentials = async (req, res) => {
  try {
    const { userId } = req.body;
    const file = req.file; // Assuming multer is used for file upload

    // Upload file to S3
    const params = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: `credentials/${userId}/${file.originalname}`,
      Body: file.buffer,
      ContentType: file.mimetype
    };

    const uploadResult = await s3.upload(params).promise();

    // Save file URL to expert profile
    const expert = await Expert.findOneAndUpdate(
      { userId },
      { $push: { credentials: uploadResult.Location } },
      { new: true }
    );
    if (!expert) return res.status(404).json({ msg: 'Expert not found' });

    res.json({ msg: 'Credential uploaded', url: uploadResult.Location, expert });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

// PUT /api/experts/verification-status
const updateVerificationStatus = async (req, res) => {
  try {
    const { userId, status } = req.body;
    const expert = await Expert.findOneAndUpdate(
      { userId },
      { verificationStatus: status },
      { new: true }
    );
    if (!expert) return res.status(404).json({ msg: 'Expert not found' });

    res.json({ msg: 'Verification status updated', expert });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

// GET /api/experts/profile
const getExpertProfile = async (req, res) => {
  try {
    const { userId } = req.query;
    const expert = await Expert.findOne({ userId }).populate('userId');
    if (!expert) return res.status(404).json({ msg: 'Expert not found' });

    res.json({ expert });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

// PUT /api/experts/profile
const updateExpertProfile = async (req, res) => {
  try {
    const { userId, updates } = req.body;
    const expert = await Expert.findOneAndUpdate({ userId }, updates, { new: true });
    if (!expert) return res.status(404).json({ msg: 'Expert not found' });

    res.json({ msg: 'Profile updated', expert });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

// GET /api/experts/public-profile/:id
const getPublicExpertProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const expert = await Expert.findById(id).populate('userId');
    if (!expert) return res.status(404).json({ msg: 'Expert not found' });

    res.json({ expert });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

module.exports = {
  registerExpert,
  loginExpert,
  logoutExpert,
  refreshTokenExpert,
  forgotPasswordExpert,
  resetPasswordExpert,
  kycVerification,
  uploadCredentials,
  updateVerificationStatus,
  getExpertProfile,
  updateExpertProfile,
  getPublicExpertProfile
};