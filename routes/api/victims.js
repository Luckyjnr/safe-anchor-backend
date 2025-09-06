const express = require('express');
const router = express.Router();
const {
  matchExpertForVictim,
  getMatchedExperts,
  updateExpertPreference,
  startAnonymousSupport,
  submitAnonymousQuestionnaire,
  getAnonymousResources,
  addEmergencyContact,
  getExpertHistory
} = require('../../controllers/victimController');

router.post('/match-expert', matchExpertForVictim);
router.get('/matched-experts', getMatchedExperts);
router.put('/expert-preference', updateExpertPreference);

router.post('/anonymous-start', startAnonymousSupport);
router.post('/questionnaire', submitAnonymousQuestionnaire);
router.get('/anonymous-resources', getAnonymousResources);

router.post('/emergency-contact', addEmergencyContact);
router.get('/expert-history', getExpertHistory);

module.exports = router;

/**
 * @swagger
 * /api/victims/match-expert:
 *   post:
 *     summary: Match victim to experts based on preferences
 *     tags: [Victim]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId: { type: string }
 *               preferences: { type: object }
 *     responses:
 *       200: { description: Matched experts returned }
 */

/**
 * @swagger
 * /api/victims/matched-experts:
 *   get:
 *     summary: Get victim’s matched experts
 *     tags: [Victim]
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema: { type: string }
 *         required: true
 *     responses:
 *       200: { description: List of matched experts }
 */

/**
 * @swagger
 * /api/victims/expert-preference:
 *   put:
 *     summary: Update victim’s expert preferences
 *     tags: [Victim]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId: { type: string }
 *               preferences: { type: object }
 *     responses:
 *       200: { description: Preferences updated }
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId: { type: string }
 *               contact: { type: object }
 *     responses:
 *       200: { description: Emergency contact added }
 */

/**
 * @swagger
 * /api/victims/expert-history:
 *   get:
 *     summary: Get victim's session history
 *     tags: [Victim]
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema: { type: string }
 *         required: true
 *     responses:
 *       200: { description: Victim session history }
 */