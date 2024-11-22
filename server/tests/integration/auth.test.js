const request = require('supertest');
const app = require('../../src/app');
const { generateToken } = require('../utils/testHelpers');

describe('Auth Routes', () => {
  describe('POST /api/auth/login', () => {
    it('should login successfully with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@safaricom.co.ke',
          password: 'Admin123!@#',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toHaveProperty('email', 'admin@safaricom.co.ke');
    });

    it('should fail with invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@safaricom.co.ke',
          password: 'wrongpassword',
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message', 'Invalid credentials');
    });
  });

  describe('POST /api/auth/change-password', () => {
    it('should change password successfully', async () => {
      const token = generateToken({
        email: 'admin@safaricom.co.ke',
        role: 'admin',
      });

      const response = await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send({
          currentPassword: 'Admin123!@#',
          newPassword: 'NewAdmin123!@#',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty(
        'message',
        'Password changed successfully'
      );
    });
  });
}); 