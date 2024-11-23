const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const db = require('../db');

// Get all projects
router.get('/', authenticate, (req, res) => {
    db.query(`
        SELECT p.*, u.name as assigned_engineer_name 
        FROM projects p 
        LEFT JOIN users u ON p.assigned_to = u.id
        ORDER BY p.created_at DESC
    `)
    .then(result => res.json(result.rows))
    .catch(error => {
        console.error('Error fetching projects:', error);
        res.status(500).json({ message: 'Error fetching projects' });
    });
});

// Get project by ID
router.get('/:id', authenticate, (req, res) => {
    db.query(
        `SELECT p.*, u.name as assigned_engineer_name 
        FROM projects p 
        LEFT JOIN users u ON p.assigned_to = u.id 
        WHERE p.id = $1`,
        [req.params.id]
    )
    .then(result => {
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Project not found' });
        }
        res.json(result.rows[0]);
    })
    .catch(error => {
        console.error('Error fetching project:', error);
        res.status(500).json({ message: 'Error fetching project' });
    });
});

// Create new project
router.post('/', authenticate, authorize(['admin']), (req, res) => {
    const { name, description, status } = req.body;
    
    db.query(
        `INSERT INTO projects (name, description, status, created_by) 
        VALUES ($1, $2, $3, $4) 
        RETURNING *`,
        [name, description, status, req.user.id]
    )
    .then(result => res.status(201).json(result.rows[0]))
    .catch(error => {
        console.error('Error creating project:', error);
        res.status(500).json({ message: 'Error creating project' });
    });
});

// Update project
router.put('/:id', authenticate, authorize(['admin']), (req, res) => {
    const { name, description, status, assigned_to } = req.body;
    
    db.query(
        `UPDATE projects 
        SET name = $1, description = $2, status = $3, assigned_to = $4, updated_at = CURRENT_TIMESTAMP 
        WHERE id = $5 
        RETURNING *`,
        [name, description, status, assigned_to, req.params.id]
    )
    .then(result => {
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Project not found' });
        }
        res.json(result.rows[0]);
    })
    .catch(error => {
        console.error('Error updating project:', error);
        res.status(500).json({ message: 'Error updating project' });
    });
});

module.exports = router; 