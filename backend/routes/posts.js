import express from 'express';
import PostsController from '../controllers/postsControllers.js';
import AuthMiddleware from '../middleware/auth.js';
import Validator from '../middleware/validation.js';
import FileUpload from '../middleware/fileUpload.js';
import RateLimit from '../middleware/rateLimit.js';
import ErrorHandler from '../middleware/errorHandler.js';

const router = express.Router();

router.use(AuthMiddleware.identify_user);

// GET /api/posts
router.get('/', ErrorHandler.async_handler(PostsController.get_all_public));

// GET /api/posts/all/comments
router.get('/all/comments', 
    AuthMiddleware.require_admin,
    ErrorHandler.async_handler(PostsController.get_all_comments)
);

// GET /api/posts/:post_id
router.get('/:post_id', 
    Validator.validate_id('post_id'),
    ErrorHandler.async_handler(PostsController.get_by_id)
);

// GET /api/posts/:post_id/comments
router.get('/:post_id/comments', 
    Validator.validate_id('post_id'),
    ErrorHandler.async_handler(PostsController.get_post_comments)
);

// POST /api/posts/:post_id/comments
router.post('/:post_id/comments', 
    AuthMiddleware.require_auth,
    Validator.validate_id('post_id'),
    RateLimit.commenting(),
    Validator.validate_comment,
    ErrorHandler.async_handler(PostsController.create_comment)
);

// GET /api/posts/:post_id/categories
router.get('/:post_id/categories', 
    Validator.validate_id('post_id'),
    ErrorHandler.async_handler(PostsController.get_post_categories)
);

// GET /api/posts/:post_id/like
router.get('/:post_id/like', 
    Validator.validate_id('post_id'),
    ErrorHandler.async_handler(PostsController.get_post_likes)
);

// POST /api/posts/
router.post('/', 
    AuthMiddleware.require_auth,
    RateLimit.posting(),
    FileUpload.handle_upload_error(FileUpload.upload_post_images),
    Validator.validate_post,
    ErrorHandler.async_handler(PostsController.create)
);

// POST /api/posts/:post_id/like
router.post('/:post_id/like', 
    AuthMiddleware.require_auth,
    Validator.validate_id('post_id'),
    ErrorHandler.async_handler(PostsController.like_post)
);

// PATCH /api/posts/:post_id
router.patch('/:post_id', 
    AuthMiddleware.require_auth,
    Validator.validate_id('post_id'),
    FileUpload.handle_upload_error(FileUpload.upload_post_images),
    ErrorHandler.async_handler(PostsController.update)
);

// DELETE /api/posts/:post_id
router.delete('/:post_id', 
    AuthMiddleware.require_auth,
    Validator.validate_id('post_id'),
    ErrorHandler.async_handler(PostsController.delete)
);

// DELETE /api/posts/:post_id/like
router.delete('/:post_id/like', 
    AuthMiddleware.require_auth,
    Validator.validate_id('post_id'),
    ErrorHandler.async_handler(PostsController.unlike_post)
);

// POST /api/posts/:post_id/save
router.post('/:post_id/save', 
    AuthMiddleware.require_auth,
    Validator.validate_id('post_id'),
    ErrorHandler.async_handler(PostsController.save_post)
);

// DELETE /api/posts/:post_id/save
router.delete('/:post_id/save', 
    AuthMiddleware.require_auth,
    Validator.validate_id('post_id'),
    ErrorHandler.async_handler(PostsController.unsave_post)
);

// GET /api/posts/:post_id/save-status
router.get('/:post_id/save-status', 
    AuthMiddleware.identify_user,
    Validator.validate_id('post_id'),
    ErrorHandler.async_handler(PostsController.get_save_status)
);

// POST /api/posts/execute-code
router.post('/execute-code',
    AuthMiddleware.require_auth,
    RateLimit.execute_code_limit(),
    ErrorHandler.async_handler(PostsController.execute_code)
);

// POST /api/posts/highlight-code
router.post('/highlight-code',
    AuthMiddleware.require_auth,
    ErrorHandler.async_handler(PostsController.highlight_code)
);

// POST /api/posts/validate-code
router.post('/validate-code',
    AuthMiddleware.require_auth,
    ErrorHandler.async_handler(PostsController.validate_code)
);

// POST /api/posts/execute-code
router.post('/execute-code',
    AuthMiddleware.require_auth,
    RateLimit.execute_code_limit(),
    ErrorHandler.async_handler(PostsController.execute_code)
);

// POST /api/posts/highlight-code
router.post('/highlight-code',
    AuthMiddleware.require_auth,
    ErrorHandler.async_handler(PostsController.highlight_code)
);

// POST /api/posts/validate-code
router.post('/validate-code',
    AuthMiddleware.require_auth,
    ErrorHandler.async_handler(PostsController.validate_code)
);

export default router;
