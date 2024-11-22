const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const dashboardController = require('../controllers/dashboardController');

router.get('/metrics',
  authenticate,
  dashboardController.getMetrics
);

router.get('/projects',
  authenticate,
  dashboardController.getProjectStatistics
);

router.get('/provisioning',
  authenticate,
  dashboardController.getProvisioningStatistics
);

module.exports = router; 