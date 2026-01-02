import request from 'supertest';
import app from '../server';
import pool from '../database';

describe('Auth Routes', () => {
  beforeAll(async () => {
    // Clean up test data
    await pool.query('DELETE FROM users WHERE username LIKE $1', ['testuser%']);
  });

  afterAll(async () => {
    await pool.query('DELETE FROM users WHERE username LIKE $1', ['testuser%']);
    await pool.end();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser1',
          password: 'password123',
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toHaveProperty('username', 'testuser1');
    });

    it('should not register duplicate username', async () => {
      await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser2',
          password: 'password123',
        });

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser2',
          password: 'password456',
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should validate password length', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser3',
          password: '123',
        });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeAll(async () => {
      await request(app)
        .post('/api/auth/register')
        .send({
          username: 'logintest',
          password: 'password123',
        });
    });

    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'logintest',
          password: 'password123',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toHaveProperty('username', 'logintest');
    });

    it('should reject invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'logintest',
          password: 'wrongpassword',
        });

      expect(response.status).toBe(401);
    });
  });
});
