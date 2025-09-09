const express = require('express');
const router = express.Router();
const authenticate = require('../../middleware/auth');
const {
  getSupportGroups,
  createSupportGroup,
  updateSupportGroup,
  deleteSupportGroup,
  joinSupportGroup,
  leaveSupportGroup
} = require('../../controllers/supportGroupController');

// List all support groups (only logged-in users)
router.get('/', authenticate, getSupportGroups);

// Create a support group (only logged-in users)
router.post('/', authenticate, createSupportGroup);

// Update a support group (only logged-in users)
router.put('/:id', authenticate, updateSupportGroup);

// Delete a support group (only logged-in users)
router.delete('/:id', authenticate, deleteSupportGroup);

// Join a support group (only logged-in users)
router.post('/:id/join', authenticate, joinSupportGroup);

// Leave a support group (only logged-in users)
router.post('/:id/leave', authenticate, leaveSupportGroup);

module.exports = router;

/**
 * @swagger
 * /api/support-groups:
 *   get:
 *     summary: Get all support groups
 *     tags: [SupportGroup]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category (optional)
 *     responses:
 *       200:
 *         description: List of support groups retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 supportGroups:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         description: Support group ID
 *                       name:
 *                         type: string
 *                         description: Group name
 *                       description:
 *                         type: string
 *                         description: Group description
 *                       category:
 *                         type: string
 *                         description: Group category
 *                       members:
 *                         type: array
 *                         items:
 *                           type: object
 *                         description: Group members
 *                       isActive:
 *                         type: boolean
 *                         description: Whether group is active
 *       401:
 *         description: Unauthorized - invalid or missing token
 *       500:
 *         description: Server error
 *
 *   post:
 *     summary: Create a new support group
 *     tags: [SupportGroup]
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
 *             properties:
 *               name:
 *                 type: string
 *                 description: Support group name
 *               description:
 *                 type: string
 *                 description: Support group description
 *               category:
 *                 type: string
 *                 enum: [general, trauma, domestic_violence, sexual_assault, mental_health]
 *                 description: Support group category
 *     responses:
 *       201:
 *         description: Support group created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: "support group created"
 *                 supportGroup:
 *                   type: object
 *                   description: Created support group details
 *       400:
 *         description: Group name is required
 *       401:
 *         description: Unauthorized - invalid or missing token
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/support-groups/{id}:
 *   put:
 *     summary: Update a support group
 *     tags: [SupportGroup]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema: 
 *           type: string
 *         required: true
 *         description: Support group ID (must be valid MongoDB ObjectId)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Updated group name
 *               description:
 *                 type: string
 *                 description: Updated group description
 *               category:
 *                 type: string
 *                 enum: [general, trauma, domestic_violence, sexual_assault, mental_health]
 *                 description: Updated group category
 *               isActive:
 *                 type: boolean
 *                 description: Whether group is active
 *     responses:
 *       200:
 *         description: Support group updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: "support group updated"
 *                 supportGroup:
 *                   type: object
 *                   description: Updated support group details
 *       401:
 *         description: Unauthorized - invalid or missing token
 *       404:
 *         description: Support group not found
 *       500:
 *         description: Server error
 *
 *   delete:
 *     summary: Delete a support group
 *     tags: [SupportGroup]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema: 
 *           type: string
 *         required: true
 *         description: Support group ID (must be valid MongoDB ObjectId)
 *     responses:
 *       200:
 *         description: Support group deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: "support group deleted"
 *       401:
 *         description: Unauthorized - invalid or missing token
 *       404:
 *         description: Support group not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/support-groups/{id}/join:
 *   post:
 *     summary: Join a support group
 *     tags: [SupportGroup]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema: 
 *           type: string
 *         required: true
 *         description: Support group ID (must be valid MongoDB ObjectId)
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Empty body - user ID comes from JWT token
 *     responses:
 *       200:
 *         description: Successfully joined support group
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: "joined support group"
 *       400:
 *         description: User already a member
 *       401:
 *         description: Unauthorized - invalid or missing token
 *       404:
 *         description: Support group not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/support-groups/{id}/leave:
 *   post:
 *     summary: Leave a support group
 *     tags: [SupportGroup]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema: 
 *           type: string
 *         required: true
 *         description: Support group ID (must be valid MongoDB ObjectId)
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Empty body - user ID comes from JWT token
 *     responses:
 *       200:
 *         description: Successfully left support group
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: "left support group"
 *       401:
 *         description: Unauthorized - invalid or missing token
 *       404:
 *         description: Support group not found
 *       500:
 *         description: Server error
 */