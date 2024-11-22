const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const config = require('../config');

const authController = {
  async login(req, res) {
    try {
      const { email, password } = req.body;

      // Validate email domain
      if (!email.endsWith('@safaricom.co.ke')) {
        return res.status(400).json({
          message: 'Only @safaricom.co.ke email addresses are allowed'
        });
      }

      // Check if user exists
      const { rows } = await db.query(
        'SELECT * FROM users WHERE email = $1',
        [email]
      );

      if (rows.length === 0) {
        return res.status(401).json({
          message: 'Invalid credentials'
        });
      }

      const user = rows[0];

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({
          message: 'Invalid credentials'
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        { 
          email: user.email,
          role: user.role,
          firstLogin: user.first_login
        },
        config.jwt.secret,
        { expiresIn: config.jwt.expiresIn }
      );

      res.json({
        token,
        user: {
          email: user.email,
          name: user.name,
          role: user.role,
          firstLogin: user.first_login
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        message: 'Internal server error'
      });
    }
  },

  async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;
      const userEmail = req.user.email;

      // Get user from database
      const { rows } = await db.query(
        'SELECT * FROM users WHERE email = $1',
        [userEmail]
      );

      const user = rows[0];

      // Verify current password
      const isValidPassword = await bcrypt.compare(currentPassword, user.password);
      if (!isValidPassword) {
        return res.status(401).json({
          message: 'Current password is incorrect'
        });
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update password and first_login status
      await db.query(
        'UPDATE users SET password = $1, first_login = false WHERE email = $2',
        [hashedPassword, userEmail]
      );

      res.json({
        message: 'Password updated successfully'
      });
    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({
        message: 'Internal server error'
      });
    }
  },

  async getProfile(req, res) {
    try {
      const { rows } = await db.query(
        'SELECT email, name, role, first_login FROM users WHERE email = $1',
        [req.user.email]
      );

      res.json(rows[0]);
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({
        message: 'Internal server error'
      });
    }
  }
};

module.exports = authController; 