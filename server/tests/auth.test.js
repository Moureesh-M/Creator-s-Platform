import mongoose from 'mongoose';
import request from 'supertest';
import app from '../app.js';
import connectDB from '../config/database.js';
import User from '../models/User.js';

beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_secret';
  process.env.MONGODB_URI_TEST = process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/creators-platform-test';
  await connectDB();
});

afterEach(async () => {
  await User.deleteMany({});
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('Authentication routes', () => {
  describe('POST /api/auth/register', () => {
    it('registers with valid data', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'Password123'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.token).toBeDefined();
      expect(response.body.user.email).toBe('test@example.com');
    });

    it('fails when email already exists', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password123'
      };

      await request(app).post('/api/auth/register').send(userData);
      const response = await request(app).post('/api/auth/register').send(userData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toMatch(/already exists/i);
    });

    it('fails with missing fields', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'missing@example.com',
          password: 'Password123'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toMatch(/provide/i);
    });
  });

  describe('POST /api/auth/login', () => {
    it('logs in with correct credentials', async () => {
      await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Login User',
          email: 'login@example.com',
          password: 'Password123'
        });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@example.com',
          password: 'Password123'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.token).toBeDefined();
      expect(response.body.user.email).toBe('login@example.com');
    });

    it('fails with wrong password', async () => {
      await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Login User',
          email: 'login@example.com',
          password: 'Password123'
        });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@example.com',
          password: 'WrongPassword'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toMatch(/invalid/i);
    });
  });
});
