import express from 'express';
import CommentsController from '../controllers/commentsController.js';
import AuthMiddleware from '../middleware/auth.js';
import Validator from '../middleware/validation.js';
import ErrorHandler from '../middleware/errorHandler.js';

const router = express.Router();

router.use(AuthMiddleware.identify_user);

// GET /api/comments/:comment_id - get specified comment data
router.get('/:comment_id', 
    Validator.validate_id('comment_id'),
    ErrorHandler.async_handler(CommentsController.getById)
);

// GET /api/comments/:comment_id/like - get all likes under the specified comment
router.get('/:comment_id/like', 
    Validator.validate_id('comment_id'),
    ErrorHandler.async_handler(CommentsController.getCommentLikes)
);

// POST /api/comments/:comment_id/like - create a new like under a comment
router.post('/:comment_id/like', 
    AuthMiddleware.require_auth,
    Validator.validate_id('comment_id'),
    ErrorHandler.async_handler(CommentsController.likeComment)
);

// PATCH /api/comments/:comment_id - update specified comment data
router.patch('/:comment_id', 
    AuthMiddleware.require_auth,
    Validator.validate_id('comment_id'),
    Validator.validate_comment,
    ErrorHandler.async_handler(CommentsController.update)
);

// DELETE /api/comments/:comment_id - delete a comment
router.delete('/:comment_id', 
    AuthMiddleware.require_auth,
    Validator.validate_id('comment_id'),
    ErrorHandler.async_handler(CommentsController.delete)
);

// DELETE /api/comments/:comment_id/like - delete a like under a comment
router.delete('/:comment_id/like', 
    AuthMiddleware.require_auth,
    Validator.validate_id('comment_id'),
    ErrorHandler.async_handler(CommentsController.unlikeComment)
);

export default router;
