import express from 'express';
import notifications_controller from '../controllers/notificationsController.js';
import auth_middleware from '../middleware/auth.js';

const router = express.Router();

router.use(auth_middleware.require_auth);

// GET /api/notifications
router.get('/', notifications_controller.get_notifications);

// GET /api/notifications/unread
router.get('/unread', notifications_controller.get_unread_notifications);

// GET /api/notifications/unread/count
router.get('/unread/count', notifications_controller.get_unread_count);

// PUT /api/notifications/:id/read
router.put('/:id/read', notifications_controller.mark_notification_read);

// PUT /api/notifications/read-all
router.put('/read-all', notifications_controller.mark_all_read);

// DELETE /api/notifications/:id
router.delete('/:id', notifications_controller.delete_notification);

// DELETE /api/notifications/read
router.delete('/read', notifications_controller.delete_read_notifications);

// DELETE /api/notifications/cleanup
router.delete('/cleanup', notifications_controller.cleanup_old_notifications);

export default router;
