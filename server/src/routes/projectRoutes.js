const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const projectController = require('../controllers/projectController');
const rateLimiters = require('../middleware/rateLimit');
const cacheMiddleware = require('../middleware/cache');

// Apply rate limiting to all routes
router.use(rateLimiters.api);

// GET routes with caching
router.get('/',
  authenticate,
  cacheMiddleware(300), // 5 minutes cache
  projectController.getProjects
);

router.get('/stats',
  authenticate,
  cacheMiddleware(600), // 10 minutes cache
  projectController.getProjectStats
);

// POST routes with stricter rate limiting
router.post('/',
  authenticate,
  authorize(['admin', 'user']),
  rateLimiters.provisioning,
  projectController.createProject
);

router.get('/my-projects',
  authenticate,
  projectController.getMyProjects
);

router.put('/:id/status',
  authenticate,
  projectController.updateProjectStatus
);

router.post('/:id/start',
  authenticate,
  authorize(['engineer']),
  projectController.startProject
);

router.get('/export',
  authenticate,
  projectController.exportProjects
);

module.exports = router; 