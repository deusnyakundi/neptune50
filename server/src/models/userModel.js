const db = require('../db');

const userModel = {
    findByEmail: async (email) => {
        const query = 'SELECT id, email, password_hash, name, role, status FROM users WHERE email = $1';
        const { rows } = await db.query(query, [email]);
        return rows[0];
    },

    findById: async (id) => {
        const query = 'SELECT id, email, name, role, status FROM users WHERE id = $1';
        const { rows } = await db.query(query, [id]);
        return rows[0];
    },

    create: async (user) => {
        const query = `
            INSERT INTO users (email, password_hash, name, role, status, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            RETURNING id, email, name, role, status, created_at
        `;
        const values = [
            user.email,
            user.password_hash,
            user.name,
            user.role || 'user',
            user.status || 'active'
        ];
        const { rows } = await db.query(query, values);
        return rows[0];
    },

    updateLastLogin: async (id) => {
        const query = 'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1 RETURNING id';
        const { rows } = await db.query(query, [id]);
        return rows[0];
    },

    update: async (id, updates) => {
        const allowedUpdates = ['name', 'role', 'status'];
        const updateFields = Object.keys(updates)
            .filter(key => allowedUpdates.includes(key) && updates[key] !== undefined)
            .map((key, index) => `${key} = $${index + 1}`);
        
        if (updateFields.length === 0) return null;

        const query = `
            UPDATE users 
            SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP 
            WHERE id = $${updateFields.length + 1}
            RETURNING id, email, name, role, status
        `;

        const values = [...Object.values(updates).filter((_, index) => 
            allowedUpdates.includes(Object.keys(updates)[index])), id];
        
        const { rows } = await db.query(query, values);
        return rows[0];
    }
};

module.exports = userModel; 