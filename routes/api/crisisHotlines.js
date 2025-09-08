const express = require('express');
const router = express.Router();
const authenticate = require('../../middleware/auth');
const {
  getHotlines,
  createHotline,
  updateHotline,
  deleteHotline
} = require('../../controllers/crisisHotlineController');

// List all hotlines (only logged-in users)
router.get('/', authenticate, getHotlines);

// Create a hotline (only logged-in users)
router.post('/', authenticate, createHotline);

// Update a hotline (only logged-in users)
router.put('/:id', authenticate, updateHotline);

// Delete a hotline (only logged-in users)
router.delete('/:id', authenticate, deleteHotline);

module.exports = router;

/**
 * @swagger
 * /api/crisis-hotlines:
 *   get:
 *     summary: Get all crisis hotlines
 *     tags: [CrisisHotline]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of crisis hotlines
 *
 *   post:
 *     summary: Create a new crisis hotline
 *     tags: [CrisisHotline]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               phone: { type: string }
 *               country: { type: string }
 *               description: { type: string }
 *     responses:
 *       201:
 *         description: Crisis hotline created
 *       400:
 *         description: Bad request
 *
 * /api/crisis-hotlines/{id}:
 *   put:
 *     summary: Update a crisis hotline
 *     tags: [CrisisHotline]
 *     security:
 *       - bearerAuth: []
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
 *       200:
 *         description: Crisis hotline updated
 *       404:
 *         description: Crisis hotline not found
 *
 *   delete:
 *     summary: Delete a crisis hotline
 *     tags: [CrisisHotline]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema: { type: string }
 *         required: true
 *     responses:
 *       200:
 *         description: Crisis hotline deleted
 *       404:
 *         description: Crisis hotline not found
 */