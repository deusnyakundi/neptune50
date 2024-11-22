const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

router.post('/login', authController.login);
router.post('/change-password', authenticate, authController.changePassword);
router.get('/profile', authenticate, authController.getProfile);

module.exports = router; 