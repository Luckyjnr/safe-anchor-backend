const request = require('supertest');
const app = require('../app');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

describe('Auth Routes', () => {
  let testUser;
  let authToken;

  beforeEach(async () => {
    // Create a test user
    const hashedPassword = await bcrypt.hash('testpassword123', 12);
    testUser = new User({
      email: 'test@example.com',
      password: hashedPassword,
      firstName: 'Test',
      lastName: 'User',
      phone: '+1234567890',
      userType: 'victim',
      isVerified: true
    });
    await testUser.save();

    // Generate auth token
    authToken = jwt.sign(
      { userId: testUser._id, userType: testUser.userType },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
  });

  describe('POST /api/auth/register', () => {
    it('should register a new victim user successfully', async () => {
      const userData = {
        email: 'newuser@example.com',
        password: 'password123',
        confirmPassword: 'password123',
        firstName: 'New',
        lastName: 'User',
        phone: '+1234567891'
      };

      const res = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expect(res.status).toBe(201);
      expect(res.body.msg).toContain('Registration successful');
      expect(res.body.user.email).toBe(userData.email);
    });

    it('should return 400 for invalid email format', async () => {
      const userData = {
        email: 'invalid-email',
        password: 'password123',
        confirmPassword: 'password123',
        firstName: 'Test',
        lastName: 'User',
        phone: '+1234567890'
      };

      const res = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expect(res.status).toBe(400);
    });

    it('should return 400 for password mismatch', async () => {
      const userData = {
        email: 'test2@example.com',
        password: 'password123',
        confirmPassword: 'differentpassword',
        firstName: 'Test',
        lastName: 'User',
        phone: '+1234567890'
      };

      const res = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expect(res.status).toBe(400);
    });

    it('should return 400 for existing email', async () => {
      const userData = {
        email: 'test@example.com', // Already exists
        password: 'password123',
        confirmPassword: 'password123',
        firstName: 'Test',
        lastName: 'User',
        phone: '+1234567890'
      };

      const res = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'testpassword123'
      };

      const res = await request(app)
        .post('/api/auth/login')
        .send(loginData);

      expect(res.status).toBe(200);
      expect(res.body.token).toBeDefined();
      expect(res.body.refreshToken).toBeDefined();
      expect(res.body.user.email).toBe(loginData.email);
    });

    it('should return 400 for invalid credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };

      const res = await request(app)
        .post('/api/auth/login')
        .send(loginData);

      expect(res.status).toBe(400);
    });

    it('should return 400 for non-existent email', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'password123'
      };

      const res = await request(app)
        .post('/api/auth/login')
        .send(loginData);

      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/auth/refresh-token', () => {
    it('should refresh token with valid refresh token', async () => {
      // First login to get refresh token
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'testpassword123'
        });

      const refreshToken = loginRes.body.refreshToken;

      const res = await request(app)
        .post('/api/auth/refresh-token')
        .send({ refreshToken });

      expect(res.status).toBe(200);
      expect(res.body.token).toBeDefined();
    });

    it('should return 401 for invalid refresh token', async () => {
      const res = await request(app)
        .post('/api/auth/refresh-token')
        .send({ refreshToken: 'invalid-token' });

      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should logout successfully with valid refresh token', async () => {
      // First login to get refresh token
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'testpassword123'
        });

      const refreshToken = loginRes.body.refreshToken;

      const res = await request(app)
        .post('/api/auth/logout')
        .send({ refreshToken });

      expect(res.status).toBe(200);
      expect(res.body.msg).toContain('logged out');
    });
  });

  describe('POST /api/auth/forgot-password', () => {
    it('should send password reset code for existing email', async () => {
      const res = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'test@example.com' });

      expect(res.status).toBe(200);
      expect(res.body.msg).toContain('reset code sent');
    });

    it('should return 400 for non-existent email', async () => {
      const res = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'nonexistent@example.com' });

      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/auth/reset-password', () => {
    it('should reset password with valid code', async () => {
      // First request forgot password
      await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'test@example.com' });

      // Get the reset code from the user (in real app, this would be from email)
      const user = await User.findOne({ email: 'test@example.com' });
      const resetCode = user.resetPasswordCode;

      const res = await request(app)
        .post('/api/auth/reset-password')
        .send({
          resetCode,
          password: 'newpassword123',
          confirmPassword: 'newpassword123'
        });

      expect(res.status).toBe(200);
      expect(res.body.msg).toContain('password reset');
    });

    it('should return 400 for invalid reset code', async () => {
      const res = await request(app)
        .post('/api/auth/reset-password')
        .send({
          resetCode: 'invalid-code',
          password: 'newpassword123',
          confirmPassword: 'newpassword123'
        });

      expect(res.status).toBe(400);
    });
  });
});
