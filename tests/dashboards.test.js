const request = require('supertest');
const app = require('../app');
const User = require('../models/User');
const Expert = require('../models/Expert');
const Session = require('../models/Session');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

describe('Dashboard Routes', () => {
  let testUser;
  let testExpert;
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

    // Create Victim record for the test user
    const Victim = require('../models/Victim');
    const testVictim = new Victim({
      userId: testUser._id,
      matchedExperts: [testExpert._id],
      expertPreferences: {},
      emergencyContacts: [],
      sessionHistory: []
    });
    await testVictim.save();

    // Create some test sessions
    const session1 = new Session({
      victimId: testUser._id,
      expertId: testExpert._id,
      scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      status: 'pending',
      notes: 'Initial consultation'
    });
    await session1.save();

    const session2 = new Session({
      victimId: testUser._id,
      expertId: testExpert._id,
      scheduledAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      status: 'completed',
      notes: 'Completed session'
    });
    await session2.save();

    // Generate auth token
    authToken = jwt.sign(
      { userId: testUser._id, userType: testUser.userType },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
  });

  describe('GET /api/victim-dashboard', () => {
    it('should get victim dashboard data with authentication', async () => {
      const res = await request(app)
        .get('/api/victim-dashboard')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.dashboard).toBeDefined();
      expect(res.body.dashboard.user).toBeDefined();
      expect(res.body.dashboard.upcomingSessions).toBeDefined();
      expect(res.body.dashboard.recentSessions).toBeDefined();
      expect(res.body.dashboard.matchedExperts).toBeDefined();
    });

    it('should return 401 without authentication', async () => {
      const res = await request(app)
        .get('/api/victim-dashboard');

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/expert-dashboard', () => {
    let expertAuthToken;

    beforeEach(async () => {
      // Generate expert auth token
      expertAuthToken = jwt.sign(
        { userId: testExpert.userId, role: 'expert' },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );
    });

    it('should get expert dashboard data with authentication', async () => {
      const res = await request(app)
        .get('/api/expert-dashboard')
        .set('Authorization', `Bearer ${expertAuthToken}`);

      expect(res.status).toBe(200);
      expect(res.body.dashboard).toBeDefined();
      expect(res.body.dashboard.expert).toBeDefined();
      expect(res.body.dashboard.upcomingSessions).toBeDefined();
      expect(res.body.dashboard.recentSessions).toBeDefined();
      expect(res.body.dashboard.stats).toBeDefined();
    });

    it('should return 401 without authentication', async () => {
      const res = await request(app)
        .get('/api/expert-dashboard');

      expect(res.status).toBe(401);
    });

    it('should return 403 for non-expert user', async () => {
      const res = await request(app)
        .get('/api/expert-dashboard')
        .set('Authorization', `Bearer ${authToken}`); // Using victim token

      expect(res.status).toBe(403);
    });
  });
});
