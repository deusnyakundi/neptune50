const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const dashboardController = require('../controllers/dashboardController');

// Make sure controller methods exist before adding routes
router.get('/overview', authenticate, dashboardController.getOverview);
router.get('/timeline', authenticate, dashboardController.getTimeline);
router.get('/engineer-metrics', authenticate, dashboardController.getEngineerMetrics);

module.exports = router; 