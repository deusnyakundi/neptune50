const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const config = require('../config');
const { AuthenticationError } = require('../utils/errors');
const userModel = require('../models/userModel');
const logger = require('../utils/logger');

class AuthService {
  generateToken(user) {
    return jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );
  }

  validateToken(token) {
    try {
      if (!token) {
        throw new Error('No token provided');
      }

      const cleanToken = token.startsWith('Bearer ') ? token.slice(7) : token;

      const decoded = jwt.verify(cleanToken, config.jwt.secret);
      
      console.log('Token validation:', {
        tokenProvided: !!token,
        decoded: decoded
      });

      return decoded;
    } catch (error) {
      console.error('Token validation error:', error.message);
      throw new Error('Invalid token');
    }
  }

  async authenticate(email, password) {
    const user = await userModel.findByEmail(email);
    
    if (!user) {
      throw new AuthenticationError('Invalid credentials');
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new AuthenticationError('Invalid credentials');
    }

    return user;
  }

  async changePassword(userId, currentPassword, newPassword) {
    const user = await userModel.findById(userId);
    
    if (!user) {
      throw new AuthenticationError('User not found');
    }

    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      throw new AuthenticationError('Current password is incorrect');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await userModel.updatePassword(userId, hashedPassword);

    logger.info(`Password changed for user: ${user.email}`);
  }

  validatePasswordStrength(password) {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (
      password.length < minLength ||
      !hasUpperCase ||
      !hasLowerCase ||
      !hasNumbers ||
      !hasSpecialChar
    ) {
      throw new ValidationError(
        'Password must be at least 8 characters long and contain uppercase, lowercase, numbers, and special characters'
      );
    }
  }
}

module.exports = new AuthService(); 