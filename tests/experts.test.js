const request = require('supertest');
const app = require('../app');
const User = require('../models/User');
const Expert = require('../models/Expert');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

describe('Expert Routes', () => {
  let testExpert;
  let authToken;

  beforeEach(async () => {
    // Create a test user first
    const hashedPassword = await bcrypt.hash('testpassword123', 12);
    const testUser = new User({
      email: 'expert@example.com',
      password: hashedPassword,
      firstName: 'Expert',
      lastName: 'User',
      phone: '+1234567890',
      userType: 'expert',
      isVerified: true
    });
    await testUser.save();

    // Create a test expert
    testExpert = new Expert({
      userId: testUser._id,
      specialization: ['counseling', 'therapy'],
      verificationStatus: 'pending'
    });
    await testExpert.save();

    // Generate auth token
    authToken = jwt.sign(
      { userId: testUser._id, userType: testUser.userType },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
  });

  describe('POST /api/experts/register', () => {
    it('should register a new expert successfully', async () => {
      const expertData = {
        email: 'newexpert@example.com',
        password: 'password123',
        confirmPassword: 'password123',
        firstName: 'New',
        lastName: 'Expert',
        phone: '+1234567891',
        specialization: ['counseling', 'therapy']
      };

      const res = await request(app)
        .post('/api/experts/register')
        .send(expertData);

      expect(res.status).toBe(201);
      expect(res.body.msg).toContain('Registration successful');
      expect(res.body.expert.email).toBe(expertData.email);
    });

    it('should return 400 for missing specialization', async () => {
      const expertData = {
        email: 'expert2@example.com',
        password: 'password123',
        confirmPassword: 'password123',
        firstName: 'Test',
        lastName: 'Expert',
        phone: '+1234567890'
        // Missing specialization
      };

      const res = await request(app)
        .post('/api/experts/register')
        .send(expertData);

      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/experts/login', () => {
    it('should login with valid credentials', async () => {
      const loginData = {
        email: 'expert@example.com',
        password: 'testpassword123'
      };

      const res = await request(app)
        .post('/api/experts/login')
        .send(loginData);

      expect(res.status).toBe(200);
      expect(res.body.token).toBeDefined();
      expect(res.body.refreshToken).toBeDefined();
      expect(res.body.expert.email).toBe(loginData.email);
    });

    it('should return 400 for invalid credentials', async () => {
      const loginData = {
        email: 'expert@example.com',
        password: 'wrongpassword'
      };

      const res = await request(app)
        .post('/api/experts/login')
        .send(loginData);

      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/experts/kyc-verification', () => {
    it('should submit KYC verification data', async () => {
      const kycData = {
        userId: testExpert._id,
        kycData: {
          fullName: 'Expert User',
          dateOfBirth: '1990-01-01',
          address: '123 Test St',
          licenseNumber: 'LIC123456',
          licenseExpiry: '2025-12-31'
        }
      };

      const res = await request(app)
        .post('/api/experts/kyc-verification')
        .set('Authorization', `Bearer ${authToken}`)
        .send(kycData);

      expect(res.status).toBe(200);
      expect(res.body.msg).toContain('KYC submitted');
    });
  });

  describe('POST /api/experts/upload-credentials', () => {
    it('should upload credential file', async () => {
      const res = await request(app)
        .post('/api/experts/upload-credentials')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ userId: testExpert._id });

      expect(res.status).toBe(200);
      expect(res.body.msg).toContain('credential uploaded');
    });
  });

  describe('PUT /api/experts/verification-status', () => {
    it('should update verification status', async () => {
      const updateData = {
        userId: testExpert._id,
        status: 'verified'
      };

      const res = await request(app)
        .put('/api/experts/verification-status')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect(res.status).toBe(200);
      expect(res.body.msg).toContain('verification status updated');
    });
  });

  describe('GET /api/experts/profile', () => {
    it('should get expert profile', async () => {
      const res = await request(app)
        .get('/api/experts/profile')
        .query({ userId: testExpert._id })
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.expert.email).toBe(testExpert.email);
    });
  });

  describe('PUT /api/experts/profile', () => {
    it('should update expert profile', async () => {
      const updateData = {
        userId: testExpert._id,
        updates: {
          bio: 'Updated bio',
          experience: '5 years',
          languages: ['English', 'Spanish']
        }
      };

      const res = await request(app)
        .put('/api/experts/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect(res.status).toBe(200);
      expect(res.body.msg).toContain('profile updated');
    });
  });

  describe('GET /api/experts/public-profile/:id', () => {
    it('should get public expert profile', async () => {
      const res = await request(app)
        .get(`/api/experts/public-profile/${testExpert._id}`);

      expect(res.status).toBe(200);
      expect(res.body.expert.email).toBe(testExpert.email);
    });
  });

  describe('POST /api/experts/refresh-token', () => {
    it('should refresh expert token', async () => {
      // First login to get refresh token
      const loginRes = await request(app)
        .post('/api/experts/login')
        .send({
          email: 'expert@example.com',
          password: 'testpassword123'
        });

      const refreshToken = loginRes.body.refreshToken;

      const res = await request(app)
        .post('/api/experts/refresh-token')
        .send({ refreshToken });

      expect(res.status).toBe(200);
      expect(res.body.token).toBeDefined();
    });
  });

  describe('POST /api/experts/logout', () => {
    it('should logout expert successfully', async () => {
      // First login to get refresh token
      const loginRes = await request(app)
        .post('/api/experts/login')
        .send({
          email: 'expert@example.com',
          password: 'testpassword123'
        });

      const refreshToken = loginRes.body.refreshToken;

      const res = await request(app)
        .post('/api/experts/logout')
        .send({ refreshToken });

      expect(res.status).toBe(200);
      expect(res.body.msg).toContain('logged out');
    });
  });
});
