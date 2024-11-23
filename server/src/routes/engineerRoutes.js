const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const db = require('../db');

// Get all engineers
router.get('/', authenticate, (req, res) => {
    db.query(
        'SELECT id, name, email, status FROM users WHERE role = $1',
        ['engineer']
    )
    .then(result => res.json(result.rows))
    .catch(error => {
        console.error('Error fetching engineers:', error);
        res.status(500).json({ message: 'Error fetching engineers' });
    });
});

// Get engineer by ID
router.get('/:id', authenticate, (req, res) => {
    db.query(
        'SELECT id, name, email, status FROM users WHERE id = $1 AND role = $2',
        [req.params.id, 'engineer']
    )
    .then(result => {
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Engineer not found' });
        }
        res.json(result.rows[0]);
    })
    .catch(error => {
        console.error('Error fetching engineer:', error);
        res.status(500).json({ message: 'Error fetching engineer' });
    });
});

// Get engineer's projects
router.get('/:id/projects', authenticate, (req, res) => {
    db.query(
        `SELECT p.* 
        FROM projects p 
        WHERE p.assigned_to = $1 
        ORDER BY p.created_at DESC`,
        [req.params.id]
    )
    .then(result => res.json(result.rows))
    .catch(error => {
        console.error('Error fetching engineer projects:', error);
        res.status(500).json({ message: 'Error fetching engineer projects' });
    });
});

// Update engineer status
router.put('/:id/status', authenticate, authorize(['admin']), (req, res) => {
    const { status } = req.body;
    db.query(
        'UPDATE users SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 AND role = $3 RETURNING id, name, email, status',
        [status, req.params.id, 'engineer']
    )
    .then(result => {
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Engineer not found' });
        }
        res.json(result.rows[0]);
    })
    .catch(error => {
        console.error('Error updating engineer status:', error);
        res.status(500).json({ message: 'Error updating engineer status' });
    });
});

module.exports = router;  // Export the router directly 