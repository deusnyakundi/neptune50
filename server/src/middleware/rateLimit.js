const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const redis = require('../utils/redis');
const config = require('../config');

const createRateLimiter = (options = {}) => {
  const defaultOptions = {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(429).json({
        error: 'Too many requests, please try again later.',
        retryAfter: Math.ceil(options.windowMs / 1000),
      });
    },
  };

  if (config.env === 'production') {
    return rateLimit({
      ...defaultOptions,
      ...options,
      store: new RedisStore({
        client: redis,
        prefix: 'rate-limit:',
      }),
    });
  }

  return rateLimit({
    ...defaultOptions,
    ...options,
  });
};

// Different rate limits for different endpoints
const rateLimiters = {
  api: createRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
  }),

  auth: createRateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5,
  }),

  provisioning: createRateLimiter({
    windowMs: 60 * 1000, // 1 minute
    max: 10,
  }),
};

module.exports = rateLimiters; 