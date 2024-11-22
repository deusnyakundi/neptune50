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
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn }
    );
  }

  async validateToken(token) {
    try {
      const decoded = jwt.verify(token, config.jwtSecret);
      const user = await userModel.findByEmail(decoded.email);
      
      if (!user) {
        throw new AuthenticationError('User not found');
      }

      return user;
    } catch (error) {
      throw new AuthenticationError('Invalid token');
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