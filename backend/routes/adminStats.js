import express from 'express';
import AdminStatsController from '../controllers/AdminStatsController.js';

const router = express.Router();

// GET /admin/api/stats - отримати базову статистику
router.get('/', AdminStatsController.get_basic);

// GET /admin/api/stats/detailed - отримати детальну статистику
router.get('/detailed', AdminStatsController.get_detailed);

export default router;
