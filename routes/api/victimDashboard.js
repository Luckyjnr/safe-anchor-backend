const express = require('express');
const router = express.Router();
const authenticate = require('../../middleware/auth');
const { getVictimDashboard } = require('../../controllers/victimDashboardController');

router.get('/', authenticate, getVictimDashboard);

module.exports = router;

/**
 * @swagger
 * /api/victim-dashboard:
 *   get:
 *     summary: Get victim dashboard info
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: { description: Victim dashboard data }
 */