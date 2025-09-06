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
 *     responses:
 *       200: { description: List of articles }
 */

/**
 * @swagger
 * /api/resources/survivor-stories:
 *   get:
 *     summary: Get all survivor stories
 *     tags: [Resource]
 *     responses:
 *       200: { description: List of survivor stories }
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
 *             properties:
 *               type: { type: string }
 *               title: { type: string }
 *               content: { type: string }
 *               author: { type: string }
 *     responses:
 *       201: { description: Resource created }
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
 *         schema: { type: string }
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200: { description: Resource updated }
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
 *         schema: { type: string }
 *         required: true
 *     responses:
 *       200: { description: Resource deleted }
 */