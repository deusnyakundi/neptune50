const { ValidationError } = require('../utils/errors');
const logger = require('../utils/logger');

class BaseController {
  async handleRequest(req, res, handler) {
    try {
      await handler(req, res);
    } catch (error) {
      if (error instanceof ValidationError) {
        return res.status(400).json({ message: error.message });
      }
      logger.error('Request error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  success(res, data, status = 200) {
    res.status(status).json(data);
  }

  error(res, message, status = 400) {
    res.status(status).json({ message });
  }
}

module.exports = BaseController; 