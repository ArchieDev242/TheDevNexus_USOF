import express from 'express';
import NotificationsController from '../controllers/notificationsController.js';
import AuthMiddleware from '../middleware/auth.js';

const router = express.Router();

router.use(AuthMiddleware.require_auth);

// GET /api/notifications
router.get('/', NotificationsController.get_notifications);

// GET /api/notifications/unread
router.get('/unread', NotificationsController.get_unread_notifications);

// GET /api/notifications/unread/count
router.get('/unread/count', NotificationsController.get_unread_count);

// PUT /api/notifications/:id/read
router.put('/:id/read', NotificationsController.mark_notification_read);

// PUT /api/notifications/read-all
router.put('/read-all', NotificationsController.mark_all_read);

// DELETE /api/notifications/:id
router.delete('/:id', NotificationsController.delete_notification);

// DELETE /api/notifications/read
router.delete('/read', NotificationsController.delete_read_notifications);

// DELETE /api/notifications/cleanup
router.delete('/cleanup', NotificationsController.cleanup_old_notifications);

export default router;
