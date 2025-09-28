import express from 'express';
import CommentsController from '../controllers/commentsController.js';
import AuthMiddleware from '../middleware/auth.js';
import Validator from '../middleware/validation.js';
import RateLimit from '../middleware/rateLimit.js';
import ErrorHandler from '../middleware/errorHandler.js';

const router = express.Router();

router.use(AuthMiddleware.identify_user);

router.get('/post/:postId', 
    Validator.validate_id('postId'), 
    ErrorHandler.async_handler(CommentsController.getByPost)
);

router.get('/:id', 
    Validator.validate_id('id'), 
    ErrorHandler.async_handler(CommentsController.getById)
);

// GET /api/comments/:comment_id/like - get all likes under the specified comment
router.get('/:id/like', 
    Validator.validate_id('id'), 
    ErrorHandler.async_handler(CommentsController.getCommentLikes)
);

// POST /api/comments/:comment_id/like - create a new like under a comment
router.post('/:id/like', 
    AuthMiddleware.require_auth,
    Validator.validate_id('id'),
    ErrorHandler.async_handler(CommentsController.likeComment)
);

// DELETE /api/comments/:comment_id/like - delete a like under a comment
router.delete('/:id/like', 
    AuthMiddleware.require_auth,
    Validator.validate_id('id'),
    ErrorHandler.async_handler(CommentsController.unlike_comment)
);

// POST /api/comments/:comment_id/reply - create a reply to a comment
router.post('/:id/reply',
    AuthMiddleware.require_auth,
    Validator.validate_id('id'),
    RateLimit.commenting(),
    Validator.validate_comment,
    ErrorHandler.async_handler(CommentsController.create_reply)
);

router.post('/', 
    AuthMiddleware.require_auth,
    RateLimit.commenting(),
    Validator.validate_comment,
    ErrorHandler.async_handler(CommentsController.create)
);

router.put('/:id', 
    AuthMiddleware.require_auth,
    Validator.validate_id('id'),
    Validator.validate_comment,
    ErrorHandler.async_handler(CommentsController.update)
);

router.delete('/:id', 
    AuthMiddleware.require_auth,
    Validator.validate_id('id'),
    ErrorHandler.async_handler(CommentsController.delete)
);

router.get('/admin/all', 
    AuthMiddleware.require_admin,
    ErrorHandler.async_handler(CommentsController.admin_get_all)
);

router.get('/admin/moderate', 
    AuthMiddleware.require_admin,
    ErrorHandler.async_handler(CommentsController.admin_get_moderate)
);

router.put('/admin/:id/approve', 
    AuthMiddleware.require_admin,
    Validator.validate_id('id'),
    ErrorHandler.async_handler(CommentsController.admin_approve)
);

router.put('/admin/:id/reject', 
    AuthMiddleware.require_admin,
    Validator.validate_id('id'),
    ErrorHandler.async_handler(CommentsController.admin_reject)
);

router.delete('/admin/:id', 
    AuthMiddleware.require_admin,
    Validator.validate_id('id'),
    ErrorHandler.async_handler(CommentsController.admin_delete)
);

export default router;
