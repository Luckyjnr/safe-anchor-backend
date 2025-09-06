const express = require('express');
const router = express.Router();
const authenticate = require('../../middleware/auth');
const { getExpertDashboard } = require('../../controllers/expertDashboardController');

router.get('/', authenticate, getExpertDashboard);

module.exports = router;


/**
 * @swagger
 * /api/expert-dashboard:
 *   get:
 *     summary: Get expert dashboard info
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: { description: Expert dashboard data }
 */