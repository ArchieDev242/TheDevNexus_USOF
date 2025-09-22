import express from 'express';
import PostsController from '../controllers/postsControllers.js';
import AuthMiddleware from '../middleware/auth.js';
import Validator from '../middleware/validation.js';
import FileUpload from '../middleware/fileUpload.js';
import RateLimit from '../middleware/rateLimit.js';
import ErrorHandler from '../middleware/errorHandler.js';

const router = express.Router();

router.use(AuthMiddleware.identify_user);

// GET /api/posts - get all posts (public, with sorting and filtering)
router.get('/', ErrorHandler.async_handler(PostsController.getAllPublic));

// GET /api/posts/:post_id - get specified post data (public)
router.get('/:post_id', 
    Validator.validate_id('post_id'),
    ErrorHandler.async_handler(PostsController.getById)
);

// GET /api/posts/:post_id/comments - get all comments for the specified post
router.get('/:post_id/comments', 
    Validator.validate_id('post_id'),
    ErrorHandler.async_handler(PostsController.getPostComments)
);

// POST /api/posts/:post_id/comments - create a new comment
router.post('/:post_id/comments', 
    AuthMiddleware.require_auth,
    Validator.validate_id('post_id'),
    RateLimit.commenting(),
    Validator.validate_comment,
    ErrorHandler.async_handler(PostsController.createComment)
);

// GET /api/posts/:post_id/categories - get all categories associated with the specified post
router.get('/:post_id/categories', 
    Validator.validate_id('post_id'),
    ErrorHandler.async_handler(PostsController.getPostCategories)
);

// GET /api/posts/:post_id/like - get all likes under the specified post
router.get('/:post_id/like', 
    Validator.validate_id('post_id'),
    ErrorHandler.async_handler(PostsController.getPostLikes)
);

// POST /api/posts/ - create a new post
router.post('/', 
    AuthMiddleware.require_auth,
    RateLimit.posting(),
    FileUpload.handle_upload_error(FileUpload.upload_post_images),
    Validator.validate_post,
    ErrorHandler.async_handler(PostsController.create)
);

// POST /api/posts/:post_id/like - create a new like under a post
router.post('/:post_id/like', 
    AuthMiddleware.require_auth,
    Validator.validate_id('post_id'),
    ErrorHandler.async_handler(PostsController.likePost)
);

// PATCH /api/posts/:post_id - update the specified post (creator only)
router.patch('/:post_id', 
    AuthMiddleware.require_auth,
    Validator.validate_id('post_id'),
    FileUpload.handle_upload_error(FileUpload.upload_post_images),
    ErrorHandler.async_handler(PostsController.update)
);

// DELETE /api/posts/:post_id - delete a post
router.delete('/:post_id', 
    AuthMiddleware.require_auth,
    Validator.validate_id('post_id'),
    ErrorHandler.async_handler(PostsController.delete)
);

// DELETE /api/posts/:post_id/like - delete a like under a post
router.delete('/:post_id/like', 
    AuthMiddleware.require_auth,
    Validator.validate_id('post_id'),
    ErrorHandler.async_handler(PostsController.unlikePost)
);

export default router;
