const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const db = require('../db');

// Get user profile
router.get('/profile', authenticate, (req, res) => {
    try {
        const { password_hash, ...user } = req.user;
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching profile' });
    }
});

// Get all users (admin only)
router.get('/', 
    authenticate, 
    authorize(['admin']), 
    (req, res) => {
        try {
            db.query('SELECT id, email, name, role, status FROM users')
                .then(result => res.json(result.rows))
                .catch(error => {
                    console.error('Error:', error);
                    res.status(500).json({ message: 'Error fetching users' });
                });
        } catch (error) {
            res.status(500).json({ message: 'Error fetching users' });
        }
});

// Update user (admin only)
router.put('/:id', 
    authenticate, 
    authorize(['admin']), 
    (req, res) => {
        try {
            const { id } = req.params;
            const { name, role, status } = req.body;
            
            db.query(
                'UPDATE users SET name = $1, role = $2, status = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING *',
                [name, role, status, id]
            )
                .then(result => {
                    if (result.rows.length === 0) {
                        return res.status(404).json({ message: 'User not found' });
                    }
                    const { password_hash, ...user } = result.rows[0];
                    res.json(user);
                })
                .catch(error => {
                    console.error('Error:', error);
                    res.status(500).json({ message: 'Error updating user' });
                });
        } catch (error) {
            res.status(500).json({ message: 'Error updating user' });
        }
});

module.exports = router; 