const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer(); // In-memory storage for S3 upload
const {
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
} = require('../../controllers/expertController');

router.post('/register', registerExpert);
router.post('/login', loginExpert);
router.post('/logout', logoutExpert);
router.post('/refresh-token', refreshTokenExpert);
router.post('/forgot-password', forgotPasswordExpert);
router.post('/reset-password', resetPasswordExpert);

router.post('/kyc-verification', kycVerification);
router.post('/upload-credentials', upload.single('file'), uploadCredentials);
router.put('/verification-status', updateVerificationStatus);
router.get('/profile', getExpertProfile);
router.put('/profile', updateExpertProfile);
router.get('/public-profile/:id', getPublicExpertProfile);

module.exports = router;

/**
 * @swagger
 * /api/experts/register:
 *   post:
 *     summary: Register a new expert user
 *     tags: [Expert]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email: { type: string }
 *               password: { type: string }
 *               confirmPassword: { type: string }
 *               firstName: { type: string }
 *               lastName: { type: string }
 *               phone: { type: string }
 *               specialization: { type: array, items: { type: string } }
 *     responses:
 *       201: { description: Expert registered successfully }
 *       400: { description: Bad request }
 */

/**
 * @swagger
 * /api/experts/login:
 *   post:
 *     summary: Login as an expert user
 *     tags: [Expert]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email: { type: string }
 *               password: { type: string }
 *     responses:
 *       200: { description: Login successful }
 *       400: { description: Invalid credentials }
 */

/**
 * @swagger
 * /api/experts/logout:
 *   post:
 *     summary: Logout expert user
 *     tags: [Expert]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken: { type: string }
 *     responses:
 *       200: { description: Logged out successfully }
 */

/**
 * @swagger
 * /api/experts/refresh-token:
 *   post:
 *     summary: Refresh expert access token
 *     tags: [Expert]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken: { type: string }
 *     responses:
 *       200: { description: Token refreshed }
 *       401: { description: Invalid or expired refresh token }
 */

/**
 * @swagger
 * /api/experts/forgot-password:
 *   post:
 *     summary: Send password reset code to expert email
 *     tags: [Expert]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email: { type: string }
 *     responses:
 *       200: { description: Password reset code sent }
 *       400: { description: User not found }
 */

/**
 * @swagger
 * /api/experts/reset-password:
 *   post:
 *     summary: Reset expert password using code
 *     tags: [Expert]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               resetCode: { type: string }
 *               password: { type: string }
 *               confirmPassword: { type: string }
 *     responses:
 *       200: { description: Password reset successful }
 *       400: { description: Invalid or expired code }
 */

/**
 * @swagger
 * /api/experts/kyc-verification:
 *   post:
 *     summary: Submit KYC verification data for expert
 *     tags: [Expert]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId: { type: string }
 *               kycData: { type: object }
 *     responses:
 *       200: { description: KYC submitted, pending verification }
 */

/**
 * @swagger
 * /api/experts/upload-credentials:
 *   post:
 *     summary: Upload credential file for expert (S3)
 *     tags: [Expert]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               userId: { type: string }
 *               file: { type: string, format: binary }
 *     responses:
 *       200: { description: Credential uploaded }
 */

/**
 * @swagger
 * /api/experts/verification-status:
 *   put:
 *     summary: Update expert verification status
 *     tags: [Expert]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId: { type: string }
 *               status: { type: string }
 *     responses:
 *       200: { description: Verification status updated }
 */

/**
 * @swagger
 * /api/experts/profile:
 *   get:
 *     summary: Get expert profile
 *     tags: [Expert]
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema: { type: string }
 *         required: true
 *     responses:
 *       200: { description: Expert profile }
 */

/**
 * @swagger
 * /api/experts/profile:
 *   put:
 *     summary: Update expert profile
 *     tags: [Expert]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId: { type: string }
 *               updates: { type: object }
 *     responses:
 *       200: { description: Profile updated }
 */

/**
 * @swagger
 * /api/experts/public-profile/{id}:
 *   get:
 *     summary: Get public expert profile by ID
 *     tags: [Expert]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema: { type: string }
 *         required: true
 *     responses:
 *       200: { description: Public expert profile }
 */