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
 *         description: List of crisis hotlines retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 hotlines:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         description: Hotline ID
 *                       name:
 *                         type: string
 *                         description: Hotline name
 *                       phone:
 *                         type: string
 *                         description: Phone number
 *                       country:
 *                         type: string
 *                         description: Country
 *                       description:
 *                         type: string
 *                         description: Hotline description
 *                       isActive:
 *                         type: boolean
 *                         description: Whether hotline is active
 *       401:
 *         description: Unauthorized - invalid or missing token
 *       500:
 *         description: Server error
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
 *             required:
 *               - name
 *               - phone
 *             properties:
 *               name:
 *                 type: string
 *                 description: Hotline name
 *               phone:
 *                 type: string
 *                 description: Phone number
 *               country:
 *                 type: string
 *                 description: Country
 *               description:
 *                 type: string
 *                 description: Hotline description
 *     responses:
 *       201:
 *         description: Crisis hotline created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: "hotline created"
 *                 hotline:
 *                   type: object
 *                   description: Created hotline details
 *       400:
 *         description: Name and phone are required
 *       401:
 *         description: Unauthorized - invalid or missing token
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/crisis-hotlines/{id}:
 *   put:
 *     summary: Update a crisis hotline
 *     tags: [CrisisHotline]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema: 
 *           type: string
 *         required: true
 *         description: Hotline ID (must be valid MongoDB ObjectId)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Updated hotline name
 *               phone:
 *                 type: string
 *                 description: Updated phone number
 *               country:
 *                 type: string
 *                 description: Updated country
 *               description:
 *                 type: string
 *                 description: Updated description
 *               isActive:
 *                 type: boolean
 *                 description: Whether hotline is active
 *     responses:
 *       200:
 *         description: Crisis hotline updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: "hotline updated"
 *                 hotline:
 *                   type: object
 *                   description: Updated hotline details
 *       401:
 *         description: Unauthorized - invalid or missing token
 *       404:
 *         description: Crisis hotline not found
 *       500:
 *         description: Server error
 *
 *   delete:
 *     summary: Delete a crisis hotline
 *     tags: [CrisisHotline]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema: 
 *           type: string
 *         required: true
 *         description: Hotline ID (must be valid MongoDB ObjectId)
 *     responses:
 *       200:
 *         description: Crisis hotline deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: "hotline deleted"
 *       401:
 *         description: Unauthorized - invalid or missing token
 *       404:
 *         description: Crisis hotline not found
 *       500:
 *         description: Server error
 */