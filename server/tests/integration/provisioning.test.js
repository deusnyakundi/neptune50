const request = require('supertest');
const path = require('path');
const app = require('../../src/app');
const { generateToken } = require('../utils/testHelpers');

describe('Provisioning Routes', () => {
  let userToken;

  beforeEach(() => {
    userToken = generateToken({ email: 'user@safaricom.co.ke', role: 'user' });
  });

  describe('POST /api/provisioning/bulk', () => {
    it('should process valid excel file', async () => {
      const response = await request(app)
        .post('/api/provisioning/bulk')
        .set('Authorization', `Bearer ${userToken}`)
        .attach('file', path.join(__dirname, '../fixtures/valid-devices.xlsx'))
        .field('ticketNumber', 'INC123456')
        .field('reason', 'Test bulk provisioning');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('results');
      expect(Array.isArray(response.body.results)).toBe(true);
    });

    it('should reject invalid file format', async () => {
      const response = await request(app)
        .post('/api/provisioning/bulk')
        .set('Authorization', `Bearer ${userToken}`)
        .attach('file', path.join(__dirname, '../fixtures/invalid.txt'))
        .field('ticketNumber', 'INC123456')
        .field('reason', 'Test bulk provisioning');

      expect(response.status).toBe(400);
    });
  });
}); 