const cache = require('../utils/cache');

const cacheMiddleware = (ttl = 300) => { // Default 5 minutes
  return async (req, res, next) => {
    if (req.method !== 'GET') {
      return next();
    }

    const key = cache.generateKey(req.originalUrl, req.query);
    const cachedResponse = await cache.get(key);

    if (cachedResponse) {
      return res.json(cachedResponse);
    }

    // Store original send function
    const originalSend = res.json;

    // Override send
    res.json = function(body) {
      // Restore original send
      res.json = originalSend;

      // Cache the response
      cache.set(key, body, ttl);

      // Send the response
      return originalSend.call(this, body);
    };

    next();
  };
};

module.exports = cacheMiddleware; 