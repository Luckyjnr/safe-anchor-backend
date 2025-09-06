const express = require('express');
const router = express.Router();
const {
  bookSession,
  getSession,
  updateSession,
  deleteSession
} = require('../../controllers/sessionController');

router.post('/book', bookSession);
router.get('/:id', getSession);
router.put('/:id', updateSession);
router.delete('/:id', deleteSession);

module.exports = router;

/**
 * @swagger
 * /api/sessions/book:
 *   post:
 *     summary: Book a session with an expert
 *     tags: [Session]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               victimId: { type: string }
 *               expertId: { type: string }
 *               scheduledAt: { type: string, format: date-time }
 *               notes: { type: string }
 *     responses:
 *       201: { description: Session booked }
 */

/**
 * @swagger
 * /api/sessions/{id}:
 *   get:
 *     summary: Get session details
 *     tags: [Session]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema: { type: string }
 *         required: true
 *     responses:
 *       200: { description: Session details }
 */

/**
 * @swagger
 * /api/sessions/{id}:
 *   put:
 *     summary: Update session details
 *     tags: [Session]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema: { type: string }
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200: { description: Session updated }
 */

/**
 * @swagger
 * /api/sessions/{id}:
 *   delete:
 *     summary: Delete a session
 *     tags: [Session]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema: { type: string }
 *         required: true
 *     responses:
 *       200: { description: Session deleted }
 */