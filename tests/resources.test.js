const request = require('supertest');
const app = require('../app');
const User = require('../models/User');
const Resource = require('../models/Resource');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

describe('Resource Routes', () => {
  let testUser;
  let testResource;
  let authToken;

  beforeEach(async () => {
    // Create a test user
    const hashedPassword = await bcrypt.hash('testpassword123', 12);
    testUser = new User({
      email: 'user@example.com',
      password: hashedPassword,
      firstName: 'Test',
      lastName: 'User',
      phone: '+1234567890',
      userType: 'victim',
      isVerified: true
    });
    await testUser.save();

    // Create a test resource
    testResource = new Resource({
      type: 'article',
      title: 'Test Article',
      content: 'This is a test article content',
      author: 'Test Author',
      category: 'general',
      isPublished: true
    });
    await testResource.save();

    // Generate auth token
    authToken = jwt.sign(
      { userId: testUser._id, userType: testUser.userType },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
  });

  describe('GET /api/resources/articles', () => {
    it('should get all articles', async () => {
      const res = await request(app)
        .get('/api/resources/articles');

      expect(res.status).toBe(200);
      expect(res.body.articles).toBeDefined();
      expect(Array.isArray(res.body.articles)).toBe(true);
    });

    it('should filter articles by category', async () => {
      // Create another article with different category
      const anotherArticle = new Resource({
        type: 'article',
        title: 'Another Article',
        content: 'Another article content',
        author: 'Another Author',
        category: 'crisis',
        isPublished: true
      });
      await anotherArticle.save();

      const res = await request(app)
        .get('/api/resources/articles')
        .query({ category: 'crisis' });

      expect(res.status).toBe(200);
      expect(res.body.articles).toBeDefined();
      expect(res.body.articles.length).toBe(1);
      expect(res.body.articles[0].category).toBe('crisis');
    });
  });

  describe('GET /api/resources/survivor-stories', () => {
    it('should get all survivor stories', async () => {
      // Create a survivor story
      const survivorStory = new Resource({
        type: 'survivor-story',
        title: 'My Journey to Recovery',
        content: 'This is my personal story of survival and recovery...',
        author: 'Anonymous Survivor',
        category: 'personal',
        isPublished: true
      });
      await survivorStory.save();

      const res = await request(app)
        .get('/api/resources/survivor-stories');

      expect(res.status).toBe(200);
      expect(res.body.stories).toBeDefined();
      expect(Array.isArray(res.body.stories)).toBe(true);
    });
  });

  describe('POST /api/resources', () => {
    it('should create a new resource with authentication', async () => {
      const resourceData = {
        type: 'article',
        title: 'New Article',
        content: 'This is a new article content',
        author: 'New Author',
        category: 'education'
      };

      const res = await request(app)
        .post('/api/resources')
        .set('Authorization', `Bearer ${authToken}`)
        .send(resourceData);

      expect(res.status).toBe(201);
      expect(res.body.resource).toBeDefined();
      expect(res.body.resource.title).toBe(resourceData.title);
    });

    it('should return 401 without authentication', async () => {
      const resourceData = {
        type: 'article',
        title: 'New Article',
        content: 'This is a new article content',
        author: 'New Author'
      };

      const res = await request(app)
        .post('/api/resources')
        .send(resourceData);

      expect(res.status).toBe(401);
    });

    it('should return 400 for invalid resource data', async () => {
      const invalidResourceData = {
        type: 'article',
        // Missing title
        content: 'This is content without title',
        author: 'Author'
      };

      const res = await request(app)
        .post('/api/resources')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidResourceData);

      expect(res.status).toBe(400);
    });
  });

  describe('PUT /api/resources/:id', () => {
    it('should update a resource with authentication', async () => {
      const updateData = {
        title: 'Updated Article Title',
        content: 'Updated content',
        category: 'updated-category'
      };

      const res = await request(app)
        .put(`/api/resources/${testResource._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect(res.status).toBe(200);
      expect(res.body.resource).toBeDefined();
      expect(res.body.resource.title).toBe(updateData.title);
    });

    it('should return 401 without authentication', async () => {
      const updateData = {
        title: 'Updated Title'
      };

      const res = await request(app)
        .put(`/api/resources/${testResource._id}`)
        .send(updateData);

      expect(res.status).toBe(401);
    });

    it('should return 404 for non-existent resource', async () => {
      const nonExistentId = '507f1f77bcf86cd799439011';
      const updateData = {
        title: 'Updated Title'
      };

      const res = await request(app)
        .put(`/api/resources/${nonExistentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /api/resources/:id', () => {
    it('should delete a resource with authentication', async () => {
      const res = await request(app)
        .delete(`/api/resources/${testResource._id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.msg).toContain('resource deleted');

      // Verify resource is deleted
      const deletedResource = await Resource.findById(testResource._id);
      expect(deletedResource).toBeNull();
    });

    it('should return 401 without authentication', async () => {
      const res = await request(app)
        .delete(`/api/resources/${testResource._id}`);

      expect(res.status).toBe(401);
    });

    it('should return 404 for non-existent resource', async () => {
      const nonExistentId = '507f1f77bcf86cd799439011';
      const res = await request(app)
        .delete(`/api/resources/${nonExistentId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(404);
    });
  });
});
