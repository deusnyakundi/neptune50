const express = require('express');
const router = express.Router();

// Import routes
const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const projectRoutes = require('./projectRoutes');
const engineerRoutes = require('./engineerRoutes');
const provisioningRoutes = require('./provisioningRoutes');
const dashboardRoutes = require('./dashboardRoutes');

// Debug imports
console.log('Auth routes:', typeof authRoutes);
console.log('User routes:', typeof userRoutes);
console.log('Project routes:', typeof projectRoutes);
console.log('Engineer routes:', typeof engineerRoutes);
console.log('Provisioning routes:', typeof provisioningRoutes);
console.log('Dashboard routes:', typeof dashboardRoutes);

// Mount routes (only if they're routers)
if (authRoutes.stack) router.use('/auth', authRoutes);
if (userRoutes.stack) router.use('/users', userRoutes);
if (projectRoutes.stack) router.use('/projects', projectRoutes);
if (engineerRoutes.stack) router.use('/engineers', engineerRoutes);
if (provisioningRoutes.stack) router.use('/provisioning', provisioningRoutes);
if (dashboardRoutes.stack) router.use('/dashboard', dashboardRoutes);

module.exports = router; 