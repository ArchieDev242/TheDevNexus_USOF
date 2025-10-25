import express from 'express';
import users_controller from '../controllers/usersController.js';
import auth_middleware from '../middleware/auth.js';
import Validator from '../middleware/validation.js';
import file_upload from '../middleware/fileUpload.js';
import error_handler from '../middleware/errorHandler.js';

const router = express.Router();

router.use(auth_middleware.identify_user);

// GET /api/users/me - get current authenticated user (must be before /:user_id)
router.get('/me', error_handler.async_handler(users_controller.get_current_user));

// GET /api/users/me/achievements - get current user's achievements (must be before /:user_id)
router.get('/me/achievements',
    auth_middleware.require_auth,
    error_handler.async_handler(users_controller.get_user_achievements)
);

// GET /api/users/saved-posts - get user's saved posts (must be before /:user_id)
router.get('/saved-posts', 
    auth_middleware.require_auth,
    error_handler.async_handler(users_controller.get_saved_posts)
);

// GET /api/users - get all users (public)
router.get('/', error_handler.async_handler(users_controller.get_all_public));

// GET /api/users/:user_id/posts - get user's posts
router.get('/:user_id/posts',
    Validator.validate_id('user_id'),
    error_handler.async_handler(users_controller.get_user_posts)
);

// GET /api/users/:user_id/achievements - get user's achievements
router.get('/:user_id/achievements',
    Validator.validate_id('user_id'),
    error_handler.async_handler(users_controller.get_user_achievements)
);

// GET /api/users/:user_id/reputation - get user reputation summary/history
router.get('/:user_id/reputation',
    Validator.validate_id('user_id'),
    error_handler.async_handler(users_controller.get_reputation)
);

// POST /api/users/:user_id/reputation - rate a user
router.post('/:user_id/reputation',
    auth_middleware.require_auth,
    Validator.validate_id('user_id'),
    Validator.validate_reputation_action,
    error_handler.async_handler(users_controller.rate_user)
);

// GET /api/users/:user_id - get specified user data (public)
router.get('/:user_id', 
    Validator.validate_id('user_id'),
    error_handler.async_handler(users_controller.get_public_profile)
);

// POST /api/users - create a new user (admin only)
router.post('/', 
    auth_middleware.require_admin,
    Validator.validate_user_registration,
    error_handler.async_handler(users_controller.admin_create)
);

// PATCH /api/users/avatar - upload user avatar (authenticated users)
router.patch('/avatar', 
    auth_middleware.require_auth,
    file_upload.handle_upload_error(file_upload.upload_avatar),
    error_handler.async_handler(users_controller.upload_avatar)
);

// DELETE /api/users/avatar - delete user avatar (authenticated users)
router.delete('/avatar',
    auth_middleware.require_auth,
    error_handler.async_handler(users_controller.delete_avatar)
);

// PATCH /api/users/:user_id - update user data
router.patch('/:user_id', 
    auth_middleware.require_auth,
    Validator.validate_id('user_id'),
    auth_middleware.require_ownership_or_admin((req) => parseInt(req.params.user_id)),
    error_handler.async_handler(users_controller.update_profile)
);

// DELETE /api/users/:user_id - delete user
router.delete('/:user_id', 
    auth_middleware.require_auth,
    Validator.validate_id('user_id'),
    auth_middleware.require_ownership_or_admin((req) => parseInt(req.params.user_id)),
    error_handler.async_handler(users_controller.delete_account)
);

export default router;
