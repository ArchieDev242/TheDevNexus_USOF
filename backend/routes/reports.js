import express from 'express';
import reportsController from '../controllers/reportsController.js';
import auth_middleware from '../middleware/auth.js';

const router = express.Router();

router.use(auth_middleware.identify_user);

// Submit a report (authenticated users only)
router.post('/', auth_middleware.require_auth, reportsController.submit_report);

// Get all reports (admin only)
router.get('/', auth_middleware.require_auth, reportsController.get_reports);

// Get reports count (admin only)
router.get('/count', auth_middleware.require_auth, reportsController.get_reports_count);

// Get specific report (admin only)
router.get('/:report_id', auth_middleware.require_auth, reportsController.get_report);

// Resolve/dismiss report (admin only)
router.put('/:report_id', auth_middleware.require_auth, reportsController.resolve_report);

// Update report status via PATCH (admin only) - alias for PUT
router.patch('/:report_id', auth_middleware.require_auth, reportsController.resolve_report);

// Get reports for specific content (admin only)
router.get('/content/:reported_type/:reported_id', auth_middleware.require_auth, reportsController.get_reports_for_content);

export default router;
