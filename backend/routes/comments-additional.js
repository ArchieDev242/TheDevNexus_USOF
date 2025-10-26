import express from 'express';
import comments_controller from '../controllers/commentsController.js';
import auth_middleware from '../middleware/auth.js';
import Validator from '../middleware/validation.js';
import error_handler from '../middleware/errorHandler.js';

const router = express.Router();

router.use(auth_middleware.identify_user);

// GET /api/comments/:comment_id
router.get('/:comment_id', 
    Validator.validate_id('comment_id'),
    error_handler.async_handler(comments_controller.get_by_id)
);

// GET /api/comments/:comment_id/like
router.get('/:comment_id/like', 
    Validator.validate_id('comment_id'),
    error_handler.async_handler(comments_controller.get_comment_likes)
);

// POST /api/comments/:comment_id/like
router.post('/:comment_id/like', 
    auth_middleware.require_auth,
    Validator.validate_id('comment_id'),
    error_handler.async_handler(comments_controller.like_comment)
);

// PATCH /api/comments/:comment_id
router.patch('/:comment_id', 
    auth_middleware.require_auth,
    Validator.validate_id('comment_id'),
    Validator.validate_comment,
    error_handler.async_handler(comments_controller.update)
);

// DELETE /api/comments/:comment_id
router.delete('/:comment_id', 
    auth_middleware.require_auth,
    Validator.validate_id('comment_id'),
    error_handler.async_handler(comments_controller.delete)
);

// DELETE /api/comments/:comment_id/like
router.delete('/:comment_id/like', 
    auth_middleware.require_auth,
    Validator.validate_id('comment_id'),
    error_handler.async_handler(comments_controller.unlikeComment)
);

export default router;
