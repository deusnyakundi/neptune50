const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Login route
router.post('/login', (req, res) => {
    authController.login(req, res);
});

// Register route
router.post('/register', (req, res) => {
    authController.register(req, res);
});

// Logout route (optional - can be handled client-side)
router.post('/logout', (req, res) => {
    res.json({ message: 'Logged out successfully' });
});

// Password reset request
router.post('/forgot-password', (req, res) => {
    // TODO: Implement password reset
    res.status(501).json({ message: 'Not implemented yet' });
});

// Password reset
router.post('/reset-password', (req, res) => {
    // TODO: Implement password reset
    res.status(501).json({ message: 'Not implemented yet' });
});

module.exports = router; 