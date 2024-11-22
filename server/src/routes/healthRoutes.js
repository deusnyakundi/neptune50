const express = require('express');
const router = express.Router();
const db = require('../db');
const redis = require('../utils/redis');

router.get('/health', async (req, res) => {
  try {
    // Check database connection
    await db.raw('SELECT 1');
    
    // Check Redis connection
    await redis.ping();
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'connected',
        redis: 'connected',
      },
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      services: {
        database: error.message.includes('database') ? 'disconnected' : 'connected',
        redis: error.message.includes('redis') ? 'disconnected' : 'connected',
      },
    });
  }
});

module.exports = router; 