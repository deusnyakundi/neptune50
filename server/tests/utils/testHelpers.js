const jwt = require('jsonwebtoken');
const config = require('../../src/config');

const generateToken = (user) => {
  return jwt.sign(user, config.jwtSecret, { expiresIn: '1h' });
};

const createTestUser = (role = 'user') => ({
  email: `test-${role}@safaricom.co.ke`,
  name: `Test ${role}`,
  role,
  password: 'Test123!@#',
});

module.exports = {
  generateToken,
  createTestUser,
}; 