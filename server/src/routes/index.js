const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const engineerRoutes = require('./engineerRoutes');
const projectRoutes = require('./projectRoutes');
const provisioningRoutes = require('./provisioningRoutes');
const dashboardRoutes = require('./dashboardRoutes');

// Mount routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/engineers', engineerRoutes);
router.use('/projects', projectRoutes);
router.use('/provisioning', provisioningRoutes);
router.use('/dashboard', dashboardRoutes);

module.exports = router; 