const request = require('supertest');
const app = require('../app');
const User = require('../models/User');
const Expert = require('../models/Expert');
const Session = require('../models/Session');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

describe('Session Routes', () => {
  let testUser;
  let testExpert;
  let testSession;
  let authToken;

  beforeEach(async () => {
    // Create a test user (victim)
    const hashedPassword = await bcrypt.hash('testpassword123', 12);
    testUser = new User({
      email: `victim-${Date.now()}@example.com`,
      password: hashedPassword,
      firstName: 'Victim',
      lastName: 'User',
      phone: '+1234567890',
      userType: 'victim',
      isVerified: true
    });
    await testUser.save();

    // Create a test expert
    const expertPassword = await bcrypt.hash('expertpass123', 12);
    // Create expert user first
    const expertUser = new User({
      email: `expert-${Date.now()}@example.com`,
      password: expertPassword,
      firstName: 'Expert',
      lastName: 'User',
      phone: '+1234567891',
      userType: 'expert',
      isVerified: true
    });
    await expertUser.save();

    testExpert = new Expert({
      userId: expertUser._id,
      specialization: ['counseling', 'therapy'],
      verificationStatus: 'verified'
    });
    await testExpert.save();

    // Create a test session
    testSession = new Session({
      victimId: testUser._id,
      expertId: testExpert._id,
      scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      status: 'pending',
      notes: 'Initial consultation'
    });
    await testSession.save();

    // Generate auth token
    authToken = jwt.sign(
      { userId: testUser._id, userType: testUser.userType },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
  });

  describe('POST /api/sessions/book', () => {
    it('should book a session with an expert', async () => {
      const sessionData = {
        victimId: testUser._id,
        expertId: testExpert._id,
        scheduledAt: new Date(Date.now() + 48 * 60 * 60 * 1000), // Day after tomorrow
        notes: 'Follow-up session'
      };

      const res = await request(app)
        .post('/api/sessions/book')
        .set('Authorization', `Bearer ${authToken}`)
        .send(sessionData);

      expect(res.status).toBe(201);
      expect(res.body.session).toBeDefined();
      expect(res.body.session.victimId).toBe(sessionData.victimId.toString());
      expect(res.body.session.expertId).toBe(sessionData.expertId.toString());
    });

    it('should return 400 for invalid session data', async () => {
      const invalidSessionData = {
        victimId: testUser._id,
        // Missing expertId
        scheduledAt: new Date(Date.now() + 48 * 60 * 60 * 1000),
        notes: 'Test session'
      };

      const res = await request(app)
        .post('/api/sessions/book')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidSessionData);

      expect(res.status).toBe(400);
    });

    it('should return 400 for past scheduled time', async () => {
      const sessionData = {
        victimId: testUser._id,
        expertId: testExpert._id,
        scheduledAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
        notes: 'Past session'
      };

      const res = await request(app)
        .post('/api/sessions/book')
        .set('Authorization', `Bearer ${authToken}`)
        .send(sessionData);

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/sessions/:id', () => {
    it('should get session details', async () => {
      const res = await request(app)
        .get(`/api/sessions/${testSession._id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.session).toBeDefined();
      expect(res.body.session._id).toBe(testSession._id.toString());
    });

    it('should return 404 for non-existent session', async () => {
      const nonExistentId = '507f1f77bcf86cd799439011'; // Valid ObjectId format
      const res = await request(app)
        .get(`/api/sessions/${nonExistentId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/sessions/:id', () => {
    it('should update session details', async () => {
      const updateData = {
        scheduledAt: new Date(Date.now() + 72 * 60 * 60 * 1000), // 3 days from now
        notes: 'Updated session notes',
        status: 'confirmed'
      };

      const res = await request(app)
        .put(`/api/sessions/${testSession._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect(res.status).toBe(200);
      expect(res.body.session).toBeDefined();
      expect(res.body.msg).toContain('session updated');
    });

    it('should return 404 for non-existent session', async () => {
      const nonExistentId = '507f1f77bcf86cd799439011';
      const updateData = {
        notes: 'Updated notes'
      };

      const res = await request(app)
        .put(`/api/sessions/${nonExistentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /api/sessions/:id', () => {
    it('should delete a session', async () => {
      const res = await request(app)
        .delete(`/api/sessions/${testSession._id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.msg).toContain('session deleted');

      // Verify session is deleted
      const deletedSession = await Session.findById(testSession._id);
      expect(deletedSession).toBeNull();
    });

    it('should return 404 for non-existent session', async () => {
      const nonExistentId = '507f1f77bcf86cd799439011';
      const res = await request(app)
        .delete(`/api/sessions/${nonExistentId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(404);
    });
  });
});
