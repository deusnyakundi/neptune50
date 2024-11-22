const express = require('express');
const router = express.Router();
const multer = require('multer');
const { authenticate, authorize } = require('../middleware/auth');
const provisioningController = require('../controllers/provisioningController');

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
      cb(null, true);
    } else {
      cb(new Error('Only .xlsx files are allowed'));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

router.post('/bulk',
  authenticate,
  authorize(['admin', 'user']),
  upload.single('file'),
  provisioningController.bulkProvision
);

router.get('/history',
  authenticate,
  provisioningController.getProvisioningHistory
);

router.get('/export/:id',
  authenticate,
  provisioningController.exportResults
);

module.exports = router; 