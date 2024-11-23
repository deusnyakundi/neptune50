const Redis = require('ioredis');
const logger = require('./logger');

// Create Redis client
const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  }
});

redis.on('error', (error) => {
  logger.error('Redis connection error:', error);
});

redis.on('connect', () => {
  logger.info('Redis connected successfully');
});

const cache = {
  // Set data in cache
  async set(key, value, expireTime = 3600) {
    try {
      const serialized = JSON.stringify(value);
      await redis.setex(key, expireTime, serialized);
    } catch (error) {
      logger.error('Cache set error:', error);
    }
  },

  // Get data from cache
  async get(key) {
    try {
      const data = await redis.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      logger.error('Cache get error:', error);
      return null;
    }
  },

  // Delete data from cache
  async del(key) {
    try {
      await redis.del(key);
    } catch (error) {
      logger.error('Cache delete error:', error);
    }
  },

  // Clear all cache
  async clear() {
    try {
      await redis.flushall();
    } catch (error) {
      logger.error('Cache clear error:', error);
    }
  }
};

module.exports = cache; 