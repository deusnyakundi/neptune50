const redis = require('./redis');
const logger = require('./logger');

class CacheManager {
  constructor(defaultTTL = 3600) { // 1 hour default TTL
    this.defaultTTL = defaultTTL;
  }

  generateKey(prefix, params) {
    const sortedParams = Object.entries(params || {})
      .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
      .map(([key, value]) => `${key}:${value}`)
      .join('|');
    
    return `${prefix}:${sortedParams}`;
  }

  async get(key) {
    try {
      const cached = await redis.get(key);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      logger.error('Cache get error:', error);
      return null;
    }
  }

  async set(key, value, ttl = this.defaultTTL) {
    try {
      await redis.set(key, JSON.stringify(value), 'EX', ttl);
    } catch (error) {
      logger.error('Cache set error:', error);
    }
  }

  async delete(key) {
    try {
      await redis.del(key);
    } catch (error) {
      logger.error('Cache delete error:', error);
    }
  }

  async invalidatePattern(pattern) {
    try {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(keys);
      }
    } catch (error) {
      logger.error('Cache pattern invalidation error:', error);
    }
  }
}

module.exports = new CacheManager(); 