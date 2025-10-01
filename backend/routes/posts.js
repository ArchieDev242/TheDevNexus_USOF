import express from 'express';
import posts_controller from '../controllers/postsControllers.js';
import auth_middleware from '../middleware/auth.js';
import Validator from '../middleware/validation.js';
import file_upload from '../middleware/fileUpload.js';
import RateLimit from '../middleware/rateLimit.js';
import error_handler from '../middleware/errorHandler.js';

const router = express.Router();

router.use(auth_middleware.identify_user);

// GET /api/posts
router.get('/', error_handler.async_handler(posts_controller.get_all_public));

// GET /api/posts/all/comments
router.get('/all/comments', 
    auth_middleware.require_admin,
    error_handler.async_handler(posts_controller.get_all_comments)
);

// GET /api/posts/:post_id
router.get('/:post_id', 
    Validator.validate_id('post_id'),
    error_handler.async_handler(posts_controller.get_by_id)
);

// GET /api/posts/:post_id/comments
router.get('/:post_id/comments', 
    Validator.validate_id('post_id'),
    error_handler.async_handler(posts_controller.get_post_comments)
);

// POST /api/posts/:post_id/comments
router.post('/:post_id/comments', 
    auth_middleware.require_auth,
    Validator.validate_id('post_id'),
    Validator.validate_comment,
    error_handler.async_handler(posts_controller.create_comment)
);

// GET /api/posts/:post_id/categories
router.get('/:post_id/categories', 
    Validator.validate_id('post_id'),
    error_handler.async_handler(posts_controller.get_post_categories)
);

// GET /api/posts/:post_id/like
router.get('/:post_id/like', 
    Validator.validate_id('post_id'),
    error_handler.async_handler(posts_controller.get_post_likes)
);

// POST /api/posts/
router.post('/', 
    auth_middleware.require_auth,
    file_upload.handle_upload_error(file_upload.upload_post_images),
    Validator.validate_post,
    error_handler.async_handler(posts_controller.create)
);

// POST /api/posts/:post_id/like
router.post('/:post_id/like', 
    auth_middleware.require_auth,
    Validator.validate_id('post_id'),
    error_handler.async_handler(posts_controller.like_post)
);

// PATCH /api/posts/:post_id
router.patch('/:post_id', 
    auth_middleware.require_auth,
    Validator.validate_id('post_id'),
    file_upload.handle_upload_error(file_upload.upload_post_images),
    error_handler.async_handler(posts_controller.update)
);

// DELETE /api/posts/:post_id
router.delete('/:post_id', 
    auth_middleware.require_auth,
    Validator.validate_id('post_id'),
    error_handler.async_handler(posts_controller.delete)
);

// DELETE /api/posts/:post_id/like
router.delete('/:post_id/like', 
    auth_middleware.require_auth,
    Validator.validate_id('post_id'),
    error_handler.async_handler(posts_controller.unlike_post)
);

// POST /api/posts/:post_id/save
router.post('/:post_id/save', 
    auth_middleware.require_auth,
    Validator.validate_id('post_id'),
    error_handler.async_handler(posts_controller.save_post)
);

// DELETE /api/posts/:post_id/save
router.delete('/:post_id/save', 
    auth_middleware.require_auth,
    Validator.validate_id('post_id'),
    error_handler.async_handler(posts_controller.unsave_post)
);

// GET /api/posts/:post_id/save-status
router.get('/:post_id/save-status', 
    auth_middleware.identify_user,
    Validator.validate_id('post_id'),
    error_handler.async_handler(posts_controller.get_save_status)
);

// POST /api/posts/execute-code
router.post('/execute-code',
    auth_middleware.require_auth,
    RateLimit.execute_code_limit(),
    error_handler.async_handler(posts_controller.execute_code)
);

// POST /api/posts/highlight-code
router.post('/highlight-code',
    auth_middleware.require_auth,
    error_handler.async_handler(posts_controller.highlight_code)
);

// POST /api/posts/validate-code
router.post('/validate-code',
    auth_middleware.require_auth,
    error_handler.async_handler(posts_controller.validate_code)
);

export default router;
