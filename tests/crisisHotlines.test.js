const request = require('supertest');
const app = require('../app');
const User = require('../models/User');
const CrisisHotline = require('../models/CrisisHotline');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

describe('Crisis Hotlines API', () => {
  let testUser;
  let testHotline;
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

    // Create a test hotline
    testHotline = new CrisisHotline({
      name: 'Test Hotline',
      phone: '+1234567890',
      country: 'Testland',
      description: 'Test description',
      isActive: true
    });
    await testHotline.save();

    // Generate auth token
    authToken = jwt.sign(
      { userId: testUser._id, userType: testUser.userType },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
  });

  describe('GET /api/crisis-hotlines', () => {
    it('should get all crisis hotlines with authentication', async () => {
      const res = await request(app)
        .get('/api/crisis-hotlines')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.hotlines).toBeDefined();
      expect(Array.isArray(res.body.hotlines)).toBe(true);
    });

    it('should return 401 without authentication', async () => {
      const res = await request(app)
        .get('/api/crisis-hotlines');

      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/crisis-hotlines', () => {
    it('should create a crisis hotline with authentication', async () => {
      const hotlineData = {
        name: 'New Hotline',
        phone: '+1234567891',
        country: 'Newland',
        description: 'New hotline description'
      };

      const res = await request(app)
        .post('/api/crisis-hotlines')
        .set('Authorization', `Bearer ${authToken}`)
        .send(hotlineData);

      expect(res.status).toBe(201);
      expect(res.body.hotline).toBeDefined();
      expect(res.body.hotline.name).toBe(hotlineData.name);
    });

    it('should return 401 without authentication', async () => {
      const hotlineData = {
        name: 'New Hotline',
        phone: '+1234567891',
        country: 'Newland',
        description: 'New hotline description'
      };

      const res = await request(app)
        .post('/api/crisis-hotlines')
        .send(hotlineData);

      expect(res.status).toBe(401);
    });

    it('should return 400 for invalid hotline data', async () => {
      const invalidData = {
        name: 'Hotline without phone',
        // Missing phone
        country: 'Testland',
        description: 'Test description'
      };

      const res = await request(app)
        .post('/api/crisis-hotlines')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData);

      expect(res.status).toBe(400);
    });
  });

  describe('PUT /api/crisis-hotlines/:id', () => {
    it('should update a crisis hotline with authentication', async () => {
      const updateData = {
        name: 'Updated Hotline',
        phone: '+1234567892',
        description: 'Updated description'
      };

      const res = await request(app)
        .put(`/api/crisis-hotlines/${testHotline._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect(res.status).toBe(200);
      expect(res.body.hotline).toBeDefined();
      expect(res.body.hotline.name).toBe(updateData.name);
    });

    it('should return 404 for non-existent hotline', async () => {
      const nonExistentId = '507f1f77bcf86cd799439011';
      const updateData = {
        name: 'Updated Hotline'
      };

      const res = await request(app)
        .put(`/api/crisis-hotlines/${nonExistentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /api/crisis-hotlines/:id', () => {
    it('should delete a crisis hotline with authentication', async () => {
      const res = await request(app)
        .delete(`/api/crisis-hotlines/${testHotline._id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.msg).toContain('hotline deleted');

      // Verify hotline is deleted
      const deletedHotline = await CrisisHotline.findById(testHotline._id);
      expect(deletedHotline).toBeNull();
    });

    it('should return 404 for non-existent hotline', async () => {
      const nonExistentId = '507f1f77bcf86cd799439011';
      const res = await request(app)
        .delete(`/api/crisis-hotlines/${nonExistentId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(404);
    });
  });
});