import express from 'express';
import comments_controller from '../controllers/commentsController.js';
import auth_middleware from '../middleware/auth.js';
import Validator from '../middleware/validation.js';
import error_handler from '../middleware/errorHandler.js';

const router = express.Router();

router.use(auth_middleware.identify_user);

// GET /api/comments/:comment_id - get specified comment data
router.get('/:comment_id', 
    Validator.validate_id('comment_id'),
    error_handler.async_handler(comments_controller.get_by_id)
);

// GET /api/comments/:comment_id/like - get all likes under the specified comment
router.get('/:comment_id/like', 
    Validator.validate_id('comment_id'),
    error_handler.async_handler(comments_controller.get_comment_likes)
);

// POST /api/comments/:comment_id/like - create a new like under a comment
router.post('/:comment_id/like', 
    auth_middleware.require_auth,
    Validator.validate_id('comment_id'),
    error_handler.async_handler(comments_controller.like_comment)
);

// PATCH /api/comments/:comment_id - update specified comment data
router.patch('/:comment_id', 
    auth_middleware.require_auth,
    Validator.validate_id('comment_id'),
    Validator.validate_comment,
    error_handler.async_handler(comments_controller.update)
);

// DELETE /api/comments/:comment_id - delete a comment
router.delete('/:comment_id', 
    auth_middleware.require_auth,
    Validator.validate_id('comment_id'),
    error_handler.async_handler(comments_controller.delete)
);

// DELETE /api/comments/:comment_id/like - delete a like under a comment
router.delete('/:comment_id/like', 
    auth_middleware.require_auth,
    Validator.validate_id('comment_id'),
    error_handler.async_handler(comments_controller.unlikeComment)
);

export default router;
