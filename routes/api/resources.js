const express = require('express');
const router = express.Router();
const authenticate = require('../../middleware/auth');
const {
  getArticles,
  getSurvivorStories,
  createResource,
  updateResource,
  deleteResource
} = require('../../controllers/resourceController');

router.get('/articles', getArticles);
router.get('/survivor-stories', getSurvivorStories);
router.post('/', authenticate, createResource); // Only logged-in users
router.put('/:id', authenticate, updateResource); // Only logged-in users
router.delete('/:id', authenticate, deleteResource); // Only logged-in users

module.exports = router;

/**
 * @swagger
 * /api/resources/articles:
 *   get:
 *     summary: Get all articles
 *     tags: [Resource]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category (optional)
 *     responses:
 *       200:
 *         description: List of articles retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 articles:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         description: Article ID
 *                       title:
 *                         type: string
 *                         description: Article title
 *                       content:
 *                         type: string
 *                         description: Article content
 *                       author:
 *                         type: string
 *                         description: Article author
 *                       category:
 *                         type: string
 *                         description: Article category
 *                       isPublished:
 *                         type: boolean
 *                         description: Whether article is published
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         description: Creation date
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/resources/survivor-stories:
 *   get:
 *     summary: Get all survivor stories
 *     tags: [Resource]
 *     responses:
 *       200:
 *         description: List of survivor stories retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 stories:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         description: Story ID
 *                       title:
 *                         type: string
 *                         description: Story title
 *                       content:
 *                         type: string
 *                         description: Story content
 *                       author:
 *                         type: string
 *                         description: Story author (may be anonymous)
 *                       isPublished:
 *                         type: boolean
 *                         description: Whether story is published
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         description: Creation date
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/resources:
 *   post:
 *     summary: Create a new resource (article or survivor story)
 *     tags: [Resource]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - title
 *               - content
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [article, survivor_story]
 *                 description: Type of resource
 *               title:
 *                 type: string
 *                 description: Resource title
 *               content:
 *                 type: string
 *                 description: Resource content
 *               author:
 *                 type: string
 *                 description: Resource author
 *               category:
 *                 type: string
 *                 description: Resource category
 *               isPublished:
 *                 type: boolean
 *                 description: Whether resource is published
 *     responses:
 *       201:
 *         description: Resource created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: "Resource created successfully"
 *                 resource:
 *                   type: object
 *                   description: Created resource details
 *       400:
 *         description: Bad request - validation error
 *       401:
 *         description: Unauthorized - invalid or missing token
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/resources/{id}:
 *   put:
 *     summary: Update a resource
 *     tags: [Resource]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema: 
 *           type: string
 *         required: true
 *         description: Resource ID (must be valid MongoDB ObjectId)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Updated resource title
 *               content:
 *                 type: string
 *                 description: Updated resource content
 *               author:
 *                 type: string
 *                 description: Updated resource author
 *               category:
 *                 type: string
 *                 description: Updated resource category
 *               isPublished:
 *                 type: boolean
 *                 description: Whether resource is published
 *     responses:
 *       200:
 *         description: Resource updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: "Resource updated successfully"
 *                 resource:
 *                   type: object
 *                   description: Updated resource details
 *       400:
 *         description: Invalid resource ID format
 *       401:
 *         description: Unauthorized - invalid or missing token
 *       404:
 *         description: Resource not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/resources/{id}:
 *   delete:
 *     summary: Delete a resource
 *     tags: [Resource]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema: 
 *           type: string
 *         required: true
 *         description: Resource ID (must be valid MongoDB ObjectId)
 *     responses:
 *       200:
 *         description: Resource deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: "Resource deleted successfully"
 *       400:
 *         description: Invalid resource ID format
 *       401:
 *         description: Unauthorized - invalid or missing token
 *       404:
 *         description: Resource not found
 *       500:
 *         description: Server error
 */