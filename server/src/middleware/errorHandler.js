const logger = require('../utils/logger');
const { AppError } = require('../utils/errors');

const errorHandler = (err, req, res, next) => {
  logger.error('Error:', {
    error: err,
    path: req.path,
    method: req.method,
    body: req.body,
    user: req.user?.email,
  });

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      status: 'fail',
      message: err.message,
    });
  }

  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      status: 'fail',
      message: 'Invalid token',
    });
  }

  // Handle multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      status: 'fail',
      message: 'File too large',
    });
  }

  // Production error response
  if (process.env.NODE_ENV === 'production') {
    return res.status(500).json({
      status: 'error',
      message: 'Something went wrong',
    });
  }

  // Development error response
  return res.status(500).json({
    status: 'error',
    message: err.message,
    stack: err.stack,
  });
};

module.exports = errorHandler; 