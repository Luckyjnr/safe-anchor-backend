const express = require('express');
const router = express.Router();
const authenticate = require('../../middleware/auth');
const {
  matchExpertForVictim,
  getMatchedExperts,
  updateExpertPreference,
  startAnonymousSupport,
  submitAnonymousQuestionnaire,
  getAnonymousResources,
  addEmergencyContact,
  getExpertHistory,
  getVictimProfile
} = require('../../controllers/victimController');

// Profile route
router.get('/profile', authenticate, getVictimProfile);

// Protected routes
router.post('/match-expert', authenticate, matchExpertForVictim);
router.get('/matched-experts', authenticate, getMatchedExperts);
router.put('/expert-preference', authenticate, updateExpertPreference);
router.post('/emergency-contact', authenticate, addEmergencyContact);
router.get('/expert-history', authenticate, getExpertHistory);

// Anonymous routes (no authentication required)
router.post('/anonymous-start', startAnonymousSupport);
router.post('/questionnaire', submitAnonymousQuestionnaire);
router.get('/anonymous-resources', getAnonymousResources);

module.exports = router;

/**
 * @swagger
 * /api/victims/match-expert:
 *   post:
 *     summary: Match victim to experts based on preferences
 *     tags: [Victim]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - preferences
 *             properties:
 *               preferences:
 *                 type: object
 *                 properties:
 *                   specialization:
 *                     type: array
 *                     items:
 *                       type: string
 *                       enum: [counseling, therapy, legal, medical, social_work]
 *                     description: Preferred expert specializations
 *                   location:
 *                     type: string
 *                     enum: [online, in_person, both]
 *                     description: Preferred session location
 *                   language:
 *                     type: string
 *                     description: Preferred language
 *                   gender:
 *                     type: string
 *                     enum: [male, female, any]
 *                     description: Preferred expert gender
 *     responses:
 *       200:
 *         description: Matched experts returned successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 matches:
 *                   type: array
 *                   items:
 *                     type: object
 *                   description: List of matched experts
 *       401:
 *         description: Unauthorized - invalid or missing token
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/victims/matched-experts:
 *   get:
 *     summary: Get victim's matched experts
 *     tags: [Victim]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of matched experts retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 experts:
 *                   type: array
 *                   items:
 *                     type: object
 *                   description: List of matched experts
 *       401:
 *         description: Unauthorized - invalid or missing token
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/victims/expert-preference:
 *   put:
 *     summary: Update victim's expert preferences
 *     tags: [Victim]
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
 *                 description: Preferred expert specializations
 *               location:
 *                 type: string
 *                 enum: [online, in_person, both]
 *                 description: Preferred session location
 *               language:
 *                 type: string
 *                 description: Preferred language
 *               gender:
 *                 type: string
 *                 enum: [male, female, any]
 *                 description: Preferred expert gender
 *               availability:
 *                 type: string
 *                 description: Preferred time availability
 *     responses:
 *       200:
 *         description: Expert preferences updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: "Expert preferences updated successfully"
 *                 victim:
 *                   type: object
 *                   description: Updated victim profile
 *       401:
 *         description: Unauthorized - invalid or missing token
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/victims/anonymous-start:
 *   post:
 *     summary: Start anonymous support session
 *     tags: [Victim]
 *     responses:
 *       201: { description: Anonymous support session started }
 */

/**
 * @swagger
 * /api/victims/questionnaire:
 *   post:
 *     summary: Submit anonymous questionnaire
 *     tags: [Victim]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201: { description: Anonymous questionnaire submitted }
 */

/**
 * @swagger
 * /api/victims/anonymous-resources:
 *   get:
 *     summary: Get resources for anonymous users
 *     tags: [Victim]
 *     responses:
 *       200: { description: List of resources for anonymous users }
 */

/**
 * @swagger
 * /api/victims/emergency-contact:
 *   post:
 *     summary: Add emergency contact for victim
 *     tags: [Victim]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - phone
 *             properties:
 *               name:
 *                 type: string
 *                 description: Emergency contact's name
 *               phone:
 *                 type: string
 *                 description: Emergency contact's phone number
 *               relationship:
 *                 type: string
 *                 description: Relationship to victim
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Emergency contact's email
 *               address:
 *                 type: string
 *                 description: Emergency contact's address
 *     responses:
 *       200:
 *         description: Emergency contact added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: "Emergency contact added successfully"
 *                 victim:
 *                   type: object
 *                   description: Updated victim profile
 *       401:
 *         description: Unauthorized - invalid or missing token
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/victims/expert-history:
 *   get:
 *     summary: Get victim's session history
 *     tags: [Victim]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Victim session history retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 history:
 *                   type: array
 *                   items:
 *                     type: object
 *                   description: List of session history records
 *       401:
 *         description: Unauthorized - invalid or missing token
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/victims/profile:
 *   get:
 *     summary: Get victim profile
 *     tags: [Victim]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Victim profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 victim:
 *                   type: object
 *                   description: Victim profile data including matched experts, preferences, and emergency contacts
 *       401:
 *         description: Unauthorized - invalid or missing token
 *       500:
 *         description: Server error
 */