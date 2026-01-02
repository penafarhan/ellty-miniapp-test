import request from 'supertest';
import app from '../server';
import pool from '../database';

describe('Calculations Routes', () => {
  let authToken: string;
  let userId: number;

  beforeAll(async () => {
    // Register a test user
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'calctest',
        password: 'password123',
      });

    authToken = response.body.token;
    userId = response.body.user.id;
  });

  afterAll(async () => {
    await pool.query('DELETE FROM calculations WHERE user_id = $1', [userId]);
    await pool.query('DELETE FROM users WHERE id = $1', [userId]);
    await pool.end();
  });

  describe('GET /api/calculations', () => {
    it('should get all calculations', async () => {
      const response = await request(app).get('/api/calculations');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('POST /api/calculations', () => {
    it('should create a starting number when authenticated', async () => {
      const response = await request(app)
        .post('/api/calculations')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ number: 42 });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.number).toBe(42);
      expect(response.body.result).toBe(42);
      expect(response.body.parent_id).toBeNull();
      expect(response.body.operation).toBeNull();
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .post('/api/calculations')
        .send({ number: 42 });

      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/calculations/:id/operation', () => {
    let parentId: number;

    beforeEach(async () => {
      const response = await request(app)
        .post('/api/calculations')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ number: 10 });

      parentId = response.body.id;
    });

    it('should add operation to existing calculation', async () => {
      const response = await request(app)
        .post(`/api/calculations/${parentId}/operation`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ operation: 'add', number: 5 });

      expect(response.status).toBe(201);
      expect(response.body.parent_id).toBe(parentId);
      expect(response.body.operation).toBe('add');
      expect(response.body.number).toBe(5);
      expect(response.body.result).toBe(15);
    });

    it('should calculate correctly for all operations', async () => {
      // Addition
      const addResponse = await request(app)
        .post(`/api/calculations/${parentId}/operation`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ operation: 'add', number: 3 });
      expect(addResponse.body.result).toBe(13);

      // Subtraction
      const subResponse = await request(app)
        .post(`/api/calculations/${parentId}/operation`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ operation: 'subtract', number: 2 });
      expect(subResponse.body.result).toBe(8);

      // Multiplication
      const mulResponse = await request(app)
        .post(`/api/calculations/${parentId}/operation`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ operation: 'multiply', number: 2 });
      expect(mulResponse.body.result).toBe(20);

      // Division
      const divResponse = await request(app)
        .post(`/api/calculations/${parentId}/operation`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ operation: 'divide', number: 2 });
      expect(divResponse.body.result).toBe(5);
    });

    it('should prevent division by zero', async () => {
      const response = await request(app)
        .post(`/api/calculations/${parentId}/operation`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ operation: 'divide', number: 0 });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Division by zero');
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .post(`/api/calculations/${parentId}/operation`)
        .send({ operation: 'add', number: 5 });

      expect(response.status).toBe(401);
    });

    it('should return 404 for non-existent parent', async () => {
      const response = await request(app)
        .post('/api/calculations/99999/operation')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ operation: 'add', number: 5 });

      expect(response.status).toBe(404);
    });
  });
});
