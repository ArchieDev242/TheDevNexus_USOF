import express from 'express';
import reportsController from '../controllers/reportsController.js';
import auth_middleware from '../middleware/auth.js';

const router = express.Router();

router.use(auth_middleware.identify_user);

router.post('/', auth_middleware.require_auth, reportsController.submit_report);

router.get('/', auth_middleware.require_auth, reportsController.get_reports);

router.get('/count', auth_middleware.require_auth, reportsController.get_reports_count);

router.get('/:report_id', auth_middleware.require_auth, reportsController.get_report);

router.put('/:report_id', auth_middleware.require_auth, reportsController.resolve_report);

router.patch('/:report_id', auth_middleware.require_auth, reportsController.resolve_report);

router.get('/content/:reported_type/:reported_id', auth_middleware.require_auth, reportsController.get_reports_for_content);

export default router;
