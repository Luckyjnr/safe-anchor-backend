const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer(); // In-memory storage for S3 upload
const authenticate = require('../../middleware/auth');
const { uploadLimiter } = require('../../middleware/security');
const {
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
} = require('../../controllers/expertController');

router.post('/register', registerExpert);
router.get('/verify-email', verifyExpertEmail); // Added for email verification
router.post('/login', loginExpert);
router.post('/logout', logoutExpert);
router.post('/refresh-token', refreshTokenExpert);
router.post('/forgot-password', forgotPasswordExpert);
router.post('/reset-password', resetPasswordExpert);

// Test endpoint
router.get('/test-token', authenticate, testToken);

router.post('/kyc-verification', authenticate, kycVerification);
router.post('/upload-credentials', uploadLimiter, authenticate, upload.single('file'), uploadCredentials);
router.put('/verification-status', authenticate, updateVerificationStatus);
router.get('/profile', authenticate, getExpertProfile);
router.put('/profile', authenticate, updateExpertProfile);
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
 *             required:
 *               - email
 *               - password
 *               - confirmPassword
 *               - firstName
 *               - lastName
 *               - userType
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Expert's email address
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 description: Expert's password
 *               confirmPassword:
 *                 type: string
 *                 description: Password confirmation
 *               firstName:
 *                 type: string
 *                 description: Expert's first name
 *               lastName:
 *                 type: string
 *                 description: Expert's last name
 *               phone:
 *                 type: string
 *                 description: Expert's phone number
 *               userType:
 *                 type: string
 *                 enum: [expert]
 *                 description: Must be 'expert' for expert registration
 *               specialization:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [counseling, therapy, legal, medical, social_work]
 *                 description: Expert's areas of specialization
 *     responses:
 *       201:
 *         description: Expert registered successfully. Please check your email to verify your account.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: "Registration successful. Please check your email to verify your account."
 *       400:
 *         description: Bad request - validation error
 *       409:
 *         description: User already exists
 */

/**
 * @swagger
 * /api/experts/verify-email:
 *   get:
 *     summary: Verify expert email with token
 *     tags: [Expert]
 *     parameters:
 *       - in: query
 *         name: token
 *         schema:
 *           type: string
 *         required: true
 *         description: Email verification token sent to expert's email
 *     responses:
 *       200: { description: Email verified successfully }
 *       400: { description: Invalid or expired verification token }
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
 *       401: { description: Email not verified }
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
 *             required:
 *               - email
 *               - resetCode
 *               - password
 *               - confirmPassword
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Expert's email address
 *               resetCode:
 *                 type: string
 *                 description: 6-digit reset code sent to email
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 description: New password
 *               confirmPassword:
 *                 type: string
 *                 description: Password confirmation
 *               newPassword:
 *                 type: string
 *                 minLength: 6
 *                 description: Alternative field for new password (can be used instead of password)
 *     responses:
 *       200:
 *         description: Password reset successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: "Password reset successfully"
 *       400:
 *         description: Invalid or expired code, or passwords do not match
 *       404:
 *         description: User not found
 */

/**
 * @swagger
 * /api/experts/kyc-verification:
 *   post:
 *     summary: Submit KYC verification data for expert
 *     tags: [Expert]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fullName
 *               - dateOfBirth
 *               - address
 *               - phoneNumber
 *               - idType
 *               - idNumber
 *             properties:
 *               fullName:
 *                 type: string
 *                 description: Full legal name
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *                 description: Date of birth (YYYY-MM-DD)
 *               address:
 *                 type: string
 *                 description: Full address
 *               phoneNumber:
 *                 type: string
 *                 description: Phone number
 *               idType:
 *                 type: string
 *                 enum: [passport, driver_license, national_id]
 *                 description: Type of identification document
 *               idNumber:
 *                 type: string
 *                 description: Identification document number
 *     responses:
 *       200:
 *         description: KYC verification submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: "KYC verification submitted successfully"
 *       401:
 *         description: Unauthorized - invalid or missing token
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/experts/upload-credentials:
 *   post:
 *     summary: Upload credential file for expert (S3)
 *     tags: [Expert]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Credential file to upload (PDF, DOC, DOCX, JPG, PNG)
 *     responses:
 *       200:
 *         description: Credential uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: "Credentials uploaded successfully"
 *                 fileUrl:
 *                   type: string
 *                   description: URL of the uploaded file
 *                 expert:
 *                   type: object
 *                   description: Updated expert profile
 *       400:
 *         description: No file uploaded
 *       401:
 *         description: Unauthorized - invalid or missing token
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/experts/verification-status:
 *   put:
 *     summary: Update expert verification status
 *     tags: [Expert]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, verified, rejected, under_review]
 *                 description: New verification status
 *     responses:
 *       200:
 *         description: Verification status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: "verification status updated"
 *                 expert:
 *                   type: object
 *                   description: Updated expert profile
 *       401:
 *         description: Unauthorized - invalid or missing token
 *       404:
 *         description: Expert not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/experts/profile:
 *   get:
 *     summary: Get expert profile
 *     tags: [Expert]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Expert profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 expert:
 *                   type: object
 *                   description: Expert profile data
 *       401:
 *         description: Unauthorized - invalid or missing token
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/experts/profile:
 *   put:
 *     summary: Update expert profile
 *     tags: [Expert]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               specialization:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [counseling, therapy, legal, medical, social_work]
 *                 description: Expert's areas of specialization
 *               bio:
 *                 type: string
 *                 description: Expert's biography
 *               experience:
 *                 type: string
 *                 description: Years of experience
 *               languages:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Languages spoken
 *               availability:
 *                 type: string
 *                 description: Availability schedule
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: "Profile updated successfully"
 *                 expert:
 *                   type: object
 *                   description: Updated expert profile
 *       401:
 *         description: Unauthorized - invalid or missing token
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/experts/test-token:
 *   get:
 *     summary: Test authentication token validity
 *     tags: [Expert]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token is valid
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: "Token test successful"
 *                 user:
 *                   type: object
 *                   description: User information from token
 *                 hasUser:
 *                   type: boolean
 *                   description: Whether user was found
 *       401:
 *         description: Unauthorized - invalid or missing token
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
 *         schema: 
 *           type: string
 *         required: true
 *         description: Expert ID
 *     responses:
 *       200:
 *         description: Public expert profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 expert:
 *                   type: object
 *                   description: Public expert profile data
 *       404:
 *         description: Expert not found
 *       500:
 *         description: Server error
 */