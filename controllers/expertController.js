const User = require('../models/User');
const Expert = require('../models/Expert');
const RefreshToken = require('../models/RefreshToken');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const transporter = require('../config/email');
const AWS = require('aws-sdk');
const { generateOTP } = require('../utils/otpGenerator');
const { generateOTPEmailTemplate } = require('../utils/emailTemplates');
const { storeOTP } = require('../utils/otpStorage');

// AWS S3 setup (make sure to set credentials in environment variables)
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

// Register expert with email verification
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

    // Generate OTP for email verification (not stored in database)
    const emailVerificationOTP = generateOTP();

    user = new User({
      email,
      password: hashedPassword,
      userType: 'expert',
      firstName,
      lastName,
      phone,
      isVerified: false
      // OTP is NOT stored in database - only sent via email
    });
    await user.save();

    await new Expert({ userId: user._id, specialization }).save();

    // Store OTP in memory (not database)
    storeOTP(user.email, emailVerificationOTP, 'expert', firstName || 'Expert');

    // Send OTP verification email
    const emailTemplate = generateOTPEmailTemplate(
      emailVerificationOTP, 
      firstName || 'Expert', 
      'expert'
    );
    
    await transporter.sendMail({
      from: `"Safe Anchor" <${process.env.GMAIL_FROM_EMAIL || process.env.EMAIL_USER}>`,
      to: user.email,
      subject: '🔐 Verify Your Email - Safe Anchor Expert',
      html: emailTemplate
    });

    res.status(201).json({
      msg: 'Registration successful. Please check your email to verify your account.',
      expert: { 
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

// Expert email verification endpoint
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
    res.status(500).json({ msg: 'Server error' });
  }
};

// Expert login (only if verified)
const loginExpert = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email, userType: 'expert' });
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
      expert: {
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

// Expert logout
const logoutExpert = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    console.log('Expert logout request:', { refreshToken: refreshToken ? 'provided' : 'missing' });
    
    if (refreshToken) {
      await RefreshToken.deleteOne({ token: refreshToken });
    }
    
    res.json({ msg: 'Logged out successfully' });
  } catch (err) {
    console.error('Expert logout error:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
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

    res.json({ token: accessToken, refreshToken: newRefreshToken });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

// Expert forgot password (6-digit code)
const forgotPasswordExpert = async (req, res) => {
  try {
    const { email } = req.body;
    console.log('Expert forgot password - email:', email);
    
    const user = await User.findOne({ email, userType: 'expert' });
    console.log('Expert user found:', user ? 'Yes' : 'No');
    
    if (!user) return res.status(400).json({ msg: 'User not found' });

    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    console.log('Generated reset code:', resetCode);
    
    user.resetPasswordCode = resetCode;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();
    console.log('Reset code saved to user');

    console.log('Sending email to:', user.email);
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
    console.log('Email sent successfully');

    res.json({ msg: 'reset code sent' });
  } catch (err) {
    console.error('Expert forgot password error:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
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

    res.json({ msg: 'password reset successful' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

// Test endpoint to check token
const testToken = async (req, res) => {
  try {
    console.log('Test token - req.user:', req.user);
    console.log('Test token - req.headers:', req.headers);
    res.json({ 
      msg: 'Token test successful', 
      user: req.user,
      hasUser: !!req.user 
    });
  } catch (err) {
    console.error('Test token error:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// POST /api/experts/kyc-verification
const kycVerification = async (req, res) => {
  try {
    console.log('KYC verification - req.user:', req.user);
    console.log('KYC verification - req.body:', req.body);
    
    const userId = req.user?._id; // Get from JWT token (auth middleware sets req.user to full user object)
    const { fullName, dateOfBirth, address, phoneNumber, idType, idNumber } = req.body;
    
    if (!userId) {
      return res.status(401).json({ msg: 'User ID not found in token' });
    }
    
    console.log('KYC verification request:', { userId, fullName, idType });
    
    // Check if user exists
    const user = await User.findById(userId);
    console.log('User found:', user ? 'Yes' : 'No', user ? user.userType : 'N/A');
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    if (user.userType !== 'expert') {
      return res.status(403).json({ msg: 'User is not an expert' });
    }
    
    // Check if expert record exists
    const expert = await Expert.findOne({ userId });
    console.log('Expert found:', expert ? 'Yes' : 'No');
    
    if (!expert) {
      // If expert record doesn't exist, create it
      console.log('Creating expert record for userId:', userId);
      const newExpert = new Expert({ 
        userId: userId, 
        specialization: user?.specialization || 'general' 
      });
      await newExpert.save();
      console.log('Expert record created successfully');
      
      // Update the expert with KYC data
      newExpert.kycDocuments = [{
        fullName,
        dateOfBirth,
        address,
        phoneNumber,
        idType,
        idNumber,
        submittedAt: new Date()
      }];
      newExpert.verificationStatus = 'pending';
      await newExpert.save();
      
      return res.json({ msg: 'KYC verification submitted successfully' });
    }

    // Update expert with KYC data
    expert.kycDocuments = [{
      fullName,
      dateOfBirth,
      address,
      phoneNumber,
      idType,
      idNumber,
      submittedAt: new Date()
    }];
    expert.verificationStatus = 'pending';
    await expert.save();

    res.json({ msg: 'KYC verification submitted successfully' });
  } catch (err) {
    console.error('KYC verification error:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// POST /api/experts/upload-credentials
const uploadCredentials = async (req, res) => {
  try {
    const userId = req.user._id; // Get from JWT token
    const file = req.file; // Multer provides this from 'file' field
    
    console.log('Upload credentials - userId:', userId, 'file:', file ? file.originalname : 'No file');

    if (!file) {
      return res.status(400).json({ msg: 'No file uploaded' });
    }

    // For testing purposes, we'll simulate the upload
    // In production, you would upload to S3
    const fileUrl = `https://example-bucket.s3.amazonaws.com/credentials/${userId}/${file.originalname}`;
    
    console.log('Simulated file URL:', fileUrl);

    // Save file URL to expert profile
    const expert = await Expert.findOneAndUpdate(
      { userId },
      { $push: { credentials: fileUrl } },
      { new: true }
    );

    if (!expert) {
      return res.status(404).json({ msg: 'Expert not found' });
    }

    res.json({ 
      msg: 'Credentials uploaded successfully', 
      fileUrl: fileUrl,
      expert: {
        _id: expert._id,
        credentials: expert.credentials
      }
    });
  } catch (err) {
    console.error('Upload credentials error:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// PUT /api/experts/verification-status
const updateVerificationStatus = async (req, res) => {
  try {
    const userId = req.user._id; // Get from JWT token
    const { status } = req.body;
    console.log('Update verification status - userId:', userId, 'status:', status);
    
    const expert = await Expert.findOneAndUpdate(
      { userId },
      { verificationStatus: status },
      { new: true }
    );
    console.log('Expert found:', expert ? 'Yes' : 'No');
    
    if (!expert) return res.status(404).json({ msg: 'Expert not found' });

    res.json({ msg: 'verification status updated', expert });
  } catch (err) {
    console.error('Update verification status error:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// GET /api/experts/profile
const getExpertProfile = async (req, res) => {
  try {
    const userId = req.user._id; // Get from JWT token
    console.log('Get expert profile - userId:', userId);
    
    let expert = await Expert.findOne({ userId }).populate('userId');
    console.log('Expert found:', expert ? 'Yes' : 'No');
    
    if (!expert) {
      // If expert record doesn't exist, create it
      console.log('Creating expert record for profile request');
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ msg: 'User not found' });
      }
      
      expert = new Expert({ 
        userId: userId, 
        specialization: user.specialization || ['general'] 
      });
      await expert.save();
      await expert.populate('userId');
      console.log('Expert record created for profile');
    }

    res.json({ expert });
  } catch (err) {
    console.error('Get expert profile error:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// PUT /api/experts/profile
const updateExpertProfile = async (req, res) => {
  try {
    const userId = req.user._id; // Get from JWT token
    const updates = req.body;
    
    console.log('Update expert profile - userId:', userId, 'updates:', updates);
    
    const expert = await Expert.findOneAndUpdate({ userId }, updates, { new: true });
    if (!expert) return res.status(404).json({ msg: 'Expert not found' });

    res.json({ msg: 'Profile updated successfully', expert });
  } catch (err) {
    console.error('Update expert profile error:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
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