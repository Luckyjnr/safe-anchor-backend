const express = require('express');
const router = express.Router();
const authenticate = require('../../middleware/auth');
const {
  bookSession,
  getSessions,
  getSession,
  updateSession,
  deleteSession
} = require('../../controllers/sessionController');

router.post('/book', authenticate, bookSession);
router.get('/', authenticate, getSessions);
router.get('/:id', authenticate, getSession);
router.put('/:id', authenticate, updateSession);
router.delete('/:id', authenticate, deleteSession);

module.exports = router;

/**
 * @swagger
 * /api/sessions/book:
 *   post:
 *     summary: Book a session with an expert
 *     tags: [Session]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - expertId
 *               - scheduledAt
 *             properties:
 *               expertId:
 *                 type: string
 *                 description: ID of the expert to book session with
 *               scheduledAt:
 *                 type: string
 *                 format: date-time
 *                 description: Scheduled date and time for the session (must be in the future)
 *               notes:
 *                 type: string
 *                 description: Additional notes for the session
 *               duration:
 *                 type: number
 *                 description: Duration of the session in minutes
 *     responses:
 *       201:
 *         description: Session booked successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: "session booked"
 *                 session:
 *                   type: object
 *                   description: Booked session details
 *       400:
 *         description: Missing required fields or cannot schedule in the past
 *       401:
 *         description: Unauthorized - invalid or missing token
 *       409:
 *         description: Expert or victim already has a session at this time
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/sessions:
 *   get:
 *     summary: Get all sessions for the authenticated user
 *     tags: [Session]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sessions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sessions:
 *                   type: array
 *                   items:
 *                     type: object
 *                   description: List of user's sessions
 *       401:
 *         description: Unauthorized - invalid or missing token
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/sessions/{id}:
 *   get:
 *     summary: Get session details by ID
 *     tags: [Session]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema: 
 *           type: string
 *         required: true
 *         description: Session ID (must be valid MongoDB ObjectId)
 *     responses:
 *       200:
 *         description: Session details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 session:
 *                   type: object
 *                   description: Session details
 *       400:
 *         description: Invalid session ID format
 *       401:
 *         description: Unauthorized - invalid or missing token
 *       404:
 *         description: Session not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/sessions/{id}:
 *   put:
 *     summary: Update session details
 *     tags: [Session]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema: 
 *           type: string
 *         required: true
 *         description: Session ID (must be valid MongoDB ObjectId)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, confirmed, completed, cancelled]
 *                 description: Session status
 *               scheduledAt:
 *                 type: string
 *                 format: date-time
 *                 description: New scheduled date and time
 *               notes:
 *                 type: string
 *                 description: Updated session notes
 *               duration:
 *                 type: number
 *                 description: Updated session duration in minutes
 *     responses:
 *       200:
 *         description: Session updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: "session updated"
 *                 session:
 *                   type: object
 *                   description: Updated session details
 *       400:
 *         description: Invalid session ID format
 *       401:
 *         description: Unauthorized - invalid or missing token
 *       404:
 *         description: Session not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/sessions/{id}:
 *   delete:
 *     summary: Delete a session
 *     tags: [Session]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema: 
 *           type: string
 *         required: true
 *         description: Session ID (must be valid MongoDB ObjectId)
 *     responses:
 *       200:
 *         description: Session deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: "session deleted"
 *       400:
 *         description: Invalid session ID format
 *       401:
 *         description: Unauthorized - invalid or missing token
 *       404:
 *         description: Session not found
 *       500:
 *         description: Server error
 */