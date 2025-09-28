const express = require('express');
const router = express.Router();
const ServicesController = require('../controllers/servicesController');
const { authenticate, require_admin } = require('../middleware/auth');

// GET /api/services/status
router.get('/status', ServicesController.get_services_status);

// GET /api/services/documentation
router.get('/documentation', ServicesController.get_documentation);

// code execution endpoints (require authentication)
router.post('/code/execute', authenticate, ServicesController.execute_code);
router.post('/code/highlight', authenticate, ServicesController.highlight_code);

// mail service endpoints (require authentication)  
router.post('/mail/test', authenticate, ServicesController.test_mail_service);

module.exports = router;
