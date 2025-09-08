const request = require('supertest');
const app = require('../app');
const User = require('../models/User');
const SupportGroup = require('../models/SupportGroup');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

describe('Support Groups API', () => {
  let testUser;
  let testSupportGroup;
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

    // Create a test support group
    testSupportGroup = new SupportGroup({
      name: 'Test Support Group',
      description: 'A test support group for survivors',
      category: 'general',
      isActive: true,
      members: [],
      createdBy: testUser._id
    });
    await testSupportGroup.save();

    // Generate auth token
    authToken = jwt.sign(
      { userId: testUser._id, userType: testUser.userType },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
  });

  describe('GET /api/support-groups', () => {
    it('should get all support groups with authentication', async () => {
      const res = await request(app)
        .get('/api/support-groups')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.supportGroups).toBeDefined();
      expect(Array.isArray(res.body.supportGroups)).toBe(true);
    });

    it('should return 401 without authentication', async () => {
      const res = await request(app)
        .get('/api/support-groups');

      expect(res.status).toBe(401);
    });

    it('should filter support groups by category', async () => {
      // Create another support group with different category
      const anotherGroup = new SupportGroup({
        name: 'Another Support Group',
        description: 'Another test support group',
        category: 'crisis',
        isActive: true,
        members: [],
        createdBy: testUser._id
      });
      await anotherGroup.save();

      const res = await request(app)
        .get('/api/support-groups')
        .query({ category: 'crisis' })
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.supportGroups).toBeDefined();
      expect(res.body.supportGroups.length).toBe(1);
      expect(res.body.supportGroups[0].category).toBe('crisis');
    });
  });

  describe('POST /api/support-groups', () => {
    it('should create a support group with authentication', async () => {
      const groupData = {
        name: 'New Support Group',
        description: 'A new support group for survivors',
        category: 'therapy'
      };

      const res = await request(app)
        .post('/api/support-groups')
        .set('Authorization', `Bearer ${authToken}`)
        .send(groupData);

      expect(res.status).toBe(201);
      expect(res.body.supportGroup).toBeDefined();
      expect(res.body.supportGroup.name).toBe(groupData.name);
    });

    it('should return 401 without authentication', async () => {
      const groupData = {
        name: 'New Support Group',
        description: 'A new support group for survivors',
        category: 'therapy'
      };

      const res = await request(app)
        .post('/api/support-groups')
        .send(groupData);

      expect(res.status).toBe(401);
    });

    it('should return 400 for invalid group data', async () => {
      const invalidData = {
        // Missing required name field
        description: 'Test group without name'
      };

      const res = await request(app)
        .post('/api/support-groups')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData);

      expect(res.status).toBe(400);
      expect(res.body.msg).toContain('Group name is required');
    });
  });

  describe('PUT /api/support-groups/:id', () => {
    it('should update a support group with authentication', async () => {
      const updateData = {
        name: 'Updated Support Group',
        description: 'Updated description',
        category: 'updated-category'
      };

      const res = await request(app)
        .put(`/api/support-groups/${testSupportGroup._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect(res.status).toBe(200);
      expect(res.body.supportGroup).toBeDefined();
      expect(res.body.supportGroup.name).toBe(updateData.name);
    });

    it('should return 404 for non-existent support group', async () => {
      const nonExistentId = '507f1f77bcf86cd799439011';
      const updateData = {
        name: 'Updated Group'
      };

      const res = await request(app)
        .put(`/api/support-groups/${nonExistentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /api/support-groups/:id', () => {
    it('should delete a support group with authentication', async () => {
      const res = await request(app)
        .delete(`/api/support-groups/${testSupportGroup._id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.msg).toContain('support group deleted');

      // Verify support group is deleted
      const deletedGroup = await SupportGroup.findById(testSupportGroup._id);
      expect(deletedGroup).toBeNull();
    });

    it('should return 404 for non-existent support group', async () => {
      const nonExistentId = '507f1f77bcf86cd799439011';
      const res = await request(app)
        .delete(`/api/support-groups/${nonExistentId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(404);
    });
  });

  describe('POST /api/support-groups/:id/join', () => {
    it('should join a support group with authentication', async () => {
      const joinData = {
        userId: testUser._id
      };

      const res = await request(app)
        .post(`/api/support-groups/${testSupportGroup._id}/join`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(joinData);

      expect(res.status).toBe(200);
      expect(res.body.msg).toContain('joined support group');
    });

    it('should return 400 if user is already a member', async () => {
      // First join the group
      await request(app)
        .post(`/api/support-groups/${testSupportGroup._id}/join`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ userId: testUser._id });

      // Try to join again
      const res = await request(app)
        .post(`/api/support-groups/${testSupportGroup._id}/join`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ userId: testUser._id });

      expect(res.status).toBe(400);
      expect(res.body.msg).toContain('already a member');
    });

    it('should return 404 for non-existent support group', async () => {
      const nonExistentId = '507f1f77bcf86cd799439011';
      const joinData = {
        userId: testUser._id
      };

      const res = await request(app)
        .post(`/api/support-groups/${nonExistentId}/join`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(joinData);

      expect(res.status).toBe(404);
    });
  });

  describe('POST /api/support-groups/:id/leave', () => {
    it('should leave a support group with authentication', async () => {
      // First join the group
      await request(app)
        .post(`/api/support-groups/${testSupportGroup._id}/join`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ userId: testUser._id });

      // Then leave the group
      const res = await request(app)
        .post(`/api/support-groups/${testSupportGroup._id}/leave`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ userId: testUser._id });

      expect(res.status).toBe(200);
      expect(res.body.msg).toContain('left support group');
    });

    it('should return 404 for non-existent support group', async () => {
      const nonExistentId = '507f1f77bcf86cd799439011';
      const leaveData = {
        userId: testUser._id
      };

      const res = await request(app)
        .post(`/api/support-groups/${nonExistentId}/leave`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(leaveData);

      expect(res.status).toBe(404);
    });
  });
});
