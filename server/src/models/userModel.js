const db = require('../db');

const userModel = {
    findByEmail: async (email) => {
        try {
            const query = 'SELECT * FROM users WHERE email = $1';
            const { rows } = await db.query(query, [email]);
            return rows[0];
        } catch (error) {
            throw new Error(`Error finding user by email: ${error.message}`);
        }
    },

    create: async (userData) => {
        try {
            const { email, password_hash, name, role, status } = userData;
            const query = `
                INSERT INTO users (
                    email, 
                    password_hash, 
                    name, 
                    role, 
                    status, 
                    created_at, 
                    updated_at
                ) VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                RETURNING id, email, name, role, status, created_at
            `;
            const values = [email, password_hash, name, role, status];
            const { rows } = await db.query(query, values);
            return rows[0];
        } catch (error) {
            throw new Error(`Error creating user: ${error.message}`);
        }
    },

    updateLastLogin: async (id) => {
        try {
            const query = 'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1';
            await db.query(query, [id]);
        } catch (error) {
            throw new Error(`Error updating last login: ${error.message}`);
        }
    }
};

module.exports = userModel; 