const request = require('supertest');
const app = require('../app');
const User = require('../models/User');
const Expert = require('../models/Expert');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

describe('Victim Routes', () => {
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
      matchedExperts: [],
      expertPreferences: {},
      emergencyContacts: [],
      sessionHistory: []
    });
    await testVictim.save();

    // Generate auth token
    authToken = jwt.sign(
      { userId: testUser._id, userType: testUser.userType },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
  });

  describe('POST /api/victims/match-expert', () => {
    it('should match victim to experts based on preferences', async () => {
      const matchData = {
        userId: testUser._id,
        preferences: {
          specialization: ['counseling'],
          experience: 'intermediate',
          languages: ['English']
        }
      };

      const res = await request(app)
        .post('/api/victims/match-expert')
        .set('Authorization', `Bearer ${authToken}`)
        .send(matchData);

      expect(res.status).toBe(200);
      expect(res.body.matches).toBeDefined();
      expect(Array.isArray(res.body.matches)).toBe(true);
    });
  });

  describe('GET /api/victims/matched-experts', () => {
    it('should get victim\'s matched experts', async () => {
      const res = await request(app)
        .get('/api/victims/matched-experts')
        .query({ userId: testUser._id })
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.experts).toBeDefined();
      expect(Array.isArray(res.body.experts)).toBe(true);
    });
  });

  describe('PUT /api/victims/expert-preference', () => {
    it('should update victim\'s expert preferences', async () => {
      const preferenceData = {
        userId: testUser._id,
        preferences: {
          specialization: ['therapy', 'counseling'],
          experience: 'expert',
          languages: ['English', 'Spanish']
        }
      };

      const res = await request(app)
        .put('/api/victims/expert-preference')
        .set('Authorization', `Bearer ${authToken}`)
        .send(preferenceData);

      expect(res.status).toBe(200);
      expect(res.body.msg).toContain('preferences updated');
    });
  });

  describe('POST /api/victims/anonymous-start', () => {
    it('should start anonymous support session', async () => {
      const res = await request(app)
        .post('/api/victims/anonymous-start');

      expect(res.status).toBe(201);
      expect(res.body.sessionId).toBeDefined();
      expect(res.body.msg).toContain('anonymous support session started');
    });
  });

  describe('POST /api/victims/questionnaire', () => {
    it('should submit anonymous questionnaire', async () => {
      const questionnaireData = {
        responses: {
          age: '25-35',
          situation: 'domestic violence',
          urgency: 'medium',
          preferredSupport: 'counseling'
        }
      };

      const res = await request(app)
        .post('/api/victims/questionnaire')
        .send(questionnaireData);

      expect(res.status).toBe(201);
      expect(res.body.msg).toContain('questionnaire submitted');
    });
  });

  describe('GET /api/victims/anonymous-resources', () => {
    it('should get resources for anonymous users', async () => {
      const res = await request(app)
        .get('/api/victims/anonymous-resources');

      expect(res.status).toBe(200);
      expect(res.body.resources).toBeDefined();
      expect(Array.isArray(res.body.resources)).toBe(true);
    });
  });

  describe('POST /api/victims/emergency-contact', () => {
    it('should add emergency contact for victim', async () => {
      const contactData = {
        userId: testUser._id,
        contact: {
          name: 'Emergency Contact',
          phone: '+1234567890',
          relationship: 'family',
          isPrimary: true
        }
      };

      const res = await request(app)
        .post('/api/victims/emergency-contact')
        .set('Authorization', `Bearer ${authToken}`)
        .send(contactData);

      expect(res.status).toBe(200);
      expect(res.body.msg).toContain('emergency contact added');
    });
  });

  describe('GET /api/victims/expert-history', () => {
    it('should get victim\'s session history', async () => {
      const res = await request(app)
        .get('/api/victims/expert-history')
        .query({ userId: testUser._id })
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.history).toBeDefined();
      expect(Array.isArray(res.body.history)).toBe(true);
    });
  });
});
