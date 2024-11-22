const winston = require('winston');
const { format } = winston;
const DailyRotateFile = require('winston-daily-rotate-file');
const uuid = require('uuid');

// Custom format for structured logging
const customFormat = format.combine(
  format.timestamp(),
  format.errors({ stack: true }),
  format.metadata({
    fillExcept: ['message', 'level', 'timestamp', 'label'],
  }),
  format.json()
);

// Create separate transports for different log levels
const createFileTransport = (level) => {
  return new DailyRotateFile({
    filename: `logs/${level}-%DATE%.log`,
    datePattern: 'YYYY-MM-DD',
    level,
    maxFiles: '30d',
    maxSize: '20m',
    format: customFormat,
  });
};

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  defaultMeta: { service: 'device-provisioning' },
  transports: [
    createFileTransport('error'),
    createFileTransport('warn'),
    createFileTransport('info'),
  ],
});

// Add console transport for non-production environments
if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: format.combine(
        format.colorize(),
        format.simple()
      ),
    })
  );
}

// Add request context middleware
const addRequestContext = (req, res, next) => {
  const requestId = req.headers['x-request-id'] || uuid.v4();
  req.requestId = requestId;
  
  logger.defaultMeta = {
    ...logger.defaultMeta,
    requestId,
    userId: req.user?.id,
    path: req.path,
    method: req.method,
  };
  
  next();
};

module.exports = {
  logger,
  addRequestContext,
}; 