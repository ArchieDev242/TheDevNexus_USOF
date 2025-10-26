import express from 'express';
import users_controller from '../controllers/usersController.js';
import auth_middleware from '../middleware/auth.js';
import Validator from '../middleware/validation.js';
import file_upload from '../middleware/fileUpload.js';
import error_handler from '../middleware/errorHandler.js';

const router = express.Router();

router.use(auth_middleware.identify_user);

// GET /api/users/me
router.get('/me', error_handler.async_handler(users_controller.get_current_user));

// GET /api/users/me/achievements
router.get('/me/achievements',
    auth_middleware.require_auth,
    error_handler.async_handler(users_controller.get_user_achievements)
);

// GET /api/users/saved-posts
router.get('/saved-posts', 
    auth_middleware.require_auth,
    error_handler.async_handler(users_controller.get_saved_posts)
);

// GET /api/users
router.get('/', error_handler.async_handler(users_controller.get_all_public));

// GET /api/users/:user_id/posts
router.get('/:user_id/posts',
    Validator.validate_id('user_id'),
    error_handler.async_handler(users_controller.get_user_posts)
);

// GET /api/users/:user_id/achievements
router.get('/:user_id/achievements',
    Validator.validate_id('user_id'),
    error_handler.async_handler(users_controller.get_user_achievements)
);

// GET /api/users/:user_id/reputation
router.get('/:user_id/reputation',
    Validator.validate_id('user_id'),
    error_handler.async_handler(users_controller.get_reputation)
);

// POST /api/users/:user_id/reputation
router.post('/:user_id/reputation',
    auth_middleware.require_auth,
    Validator.validate_id('user_id'),
    Validator.validate_reputation_action,
    error_handler.async_handler(users_controller.rate_user)
);

// GET /api/users/:user_id
router.get('/:user_id', 
    Validator.validate_id('user_id'),
    error_handler.async_handler(users_controller.get_public_profile)
);

// POST /api/users
router.post('/', 
    auth_middleware.require_admin,
    Validator.validate_user_registration,
    error_handler.async_handler(users_controller.admin_create)
);

// PATCH /api/users/avatar
router.patch('/avatar', 
    auth_middleware.require_auth,
    file_upload.handle_upload_error(file_upload.upload_avatar),
    error_handler.async_handler(users_controller.upload_avatar)
);

// DELETE /api/users/avatar
router.delete('/avatar',
    auth_middleware.require_auth,
    error_handler.async_handler(users_controller.delete_avatar)
);

// PATCH /api/users/:user_id
router.patch('/:user_id', 
    auth_middleware.require_auth,
    Validator.validate_id('user_id'),
    auth_middleware.require_ownership_or_admin((req) => parseInt(req.params.user_id)),
    error_handler.async_handler(users_controller.update_profile)
);

// DELETE /api/users/:user_id
router.delete('/:user_id', 
    auth_middleware.require_auth,
    Validator.validate_id('user_id'),
    auth_middleware.require_ownership_or_admin((req) => parseInt(req.params.user_id)),
    error_handler.async_handler(users_controller.delete_account)
);

export default router;
