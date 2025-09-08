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
 *     responses:
 *       200:
 *         description: List of support groups
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
 *             properties:
 *               name: { type: string }
 *               description: { type: string }
 *     responses:
 *       201:
 *         description: Support group created
 *       400:
 *         description: Bad request
 *
 * /api/support-groups/{id}:
 *   put:
 *     summary: Update a support group
 *     tags: [SupportGroup]
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
 *         description: Support group updated
 *       404:
 *         description: Support group not found
 *
 *   delete:
 *     summary: Delete a support group
 *     tags: [SupportGroup]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema: { type: string }
 *         required: true
 *     responses:
 *       200:
 *         description: Support group deleted
 *       404:
 *         description: Support group not found
 *
 * /api/support-groups/{id}/join:
 *   post:
 *     summary: Join a support group
 *     tags: [SupportGroup]
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
 *             properties:
 *               userId: { type: string }
 *     responses:
 *       200:
 *         description: Joined support group
 *       400:
 *         description: User already a member
 *       404:
 *         description: Support group not found
 *
 * /api/support-groups/{id}/leave:
 *   post:
 *     summary: Leave a support group
 *     tags: [SupportGroup]
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
 *             properties:
 *               userId: { type: string }
 *     responses:
 *       200:
 *         description: Left support group
 *       404:
 *         description: Support group not found
 */