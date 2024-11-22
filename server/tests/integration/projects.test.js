const request = require('supertest');
const app = require('../../src/app');
const { generateToken } = require('../utils/testHelpers');

describe('Project Routes', () => {
  let adminToken, engineerToken, userToken;

  beforeEach(() => {
    adminToken = generateToken({ email: 'admin@safaricom.co.ke', role: 'admin' });
    engineerToken = generateToken({ email: 'engineer@safaricom.co.ke', role: 'engineer' });
    userToken = generateToken({ email: 'user@safaricom.co.ke', role: 'user' });
  });

  describe('POST /api/projects', () => {
    const newProject = {
      description: 'Test Project',
      region: 'NAIROBI EAST',
      msp: 'Test MSP',
      partner: 'Test Partner',
    };

    it('should create a project when authenticated as admin', async () => {
      const response = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newProject);

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject(newProject);
    });

    it('should fail when missing required fields', async () => {
      const response = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({});

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/projects', () => {
    it('should return filtered projects', async () => {
      const response = await request(app)
        .get('/api/projects')
        .set('Authorization', `Bearer ${userToken}`)
        .query({ status: 'pending' });

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.every(p => p.status === 'pending')).toBe(true);
    });
  });

  describe('PUT /api/projects/:id/status', () => {
    it('should update project status when authenticated as engineer', async () => {
      const response = await request(app)
        .put('/api/projects/2/status')
        .set('Authorization', `Bearer ${engineerToken}`)
        .send({
          status: 'completed',
          notes: 'Project completed successfully',
        });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('completed');
    });
  });
}); 