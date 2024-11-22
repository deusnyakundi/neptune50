const authService = require('../services/authService');
const { AuthenticationError, AuthorizationError } = require('../utils/errors');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AuthenticationError('No token provided');
    }

    const token = authHeader.split(' ')[1];
    const user = await authService.validateToken(token);
    
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

const authorize = (roles = []) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new AuthorizationError(
        'You do not have permission to perform this action'
      );
    }
    next();
  };
};

module.exports = {
  authenticate,
  authorize,
}; 