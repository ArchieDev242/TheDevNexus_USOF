import express from 'express';
import comments_controller from '../controllers/commentsController.js';
import auth_middleware from '../middleware/auth.js';
import Validator from '../middleware/validation.js';
import error_handler from '../middleware/errorHandler.js';

const router = express.Router();

router.use(auth_middleware.identify_user);

router.get('/post/:postId', 
    Validator.validate_id('postId'), 
    error_handler.async_handler(comments_controller.get_by_post)
);

router.get('/:id', 
    Validator.validate_id('id'), 
    error_handler.async_handler(comments_controller.get_by_id)
);

// GET /api/comments/:comment_id/like - get all likes under the specified comment
router.get('/:id/like', 
    Validator.validate_id('id'), 
    error_handler.async_handler(comments_controller.get_comment_likes)
);

// POST /api/comments/:comment_id/like - create a new like under a comment
router.post('/:id/like', 
    auth_middleware.require_auth,
    Validator.validate_id('id'),
    error_handler.async_handler(comments_controller.like_comment)
);

// DELETE /api/comments/:comment_id/like - delete a like under a comment
router.delete('/:id/like', 
    auth_middleware.require_auth,
    Validator.validate_id('id'),
    error_handler.async_handler(comments_controller.unlike_comment)
);

// POST /api/comments/:comment_id/reply - create a reply to a comment
router.post('/:id/reply',
    auth_middleware.require_auth,
    Validator.validate_id('id'),
    Validator.validate_comment,
    error_handler.async_handler(comments_controller.create_reply)
);

router.post('/', 
    auth_middleware.require_auth,
    Validator.validate_comment,
    error_handler.async_handler(comments_controller.create)
);

router.put('/:id', 
    auth_middleware.require_auth,
    Validator.validate_id('id'),
    Validator.validate_comment,
    error_handler.async_handler(comments_controller.update)
);

router.delete('/:id', 
    auth_middleware.require_auth,
    Validator.validate_id('id'),
    error_handler.async_handler(comments_controller.delete)
);

router.get('/admin/all', 
    auth_middleware.require_admin,
    error_handler.async_handler(comments_controller.admin_get_all)
);

router.get('/admin/moderate', 
    auth_middleware.require_admin,
    error_handler.async_handler(comments_controller.admin_get_moderate)
);

router.put('/admin/:id/approve', 
    auth_middleware.require_admin,
    Validator.validate_id('id'),
    error_handler.async_handler(comments_controller.admin_approve)
);

router.put('/admin/:id/reject', 
    auth_middleware.require_admin,
    Validator.validate_id('id'),
    error_handler.async_handler(comments_controller.admin_reject)
);

router.delete('/admin/:id', 
    auth_middleware.require_admin,
    Validator.validate_id('id'),
    error_handler.async_handler(comments_controller.admin_delete)
);

export default router;
