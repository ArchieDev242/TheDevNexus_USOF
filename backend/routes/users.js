import express from 'express';
import UsersController from '../controllers/usersController.js';
import AuthMiddleware from '../middleware/auth.js';
import Validator from '../middleware/validation.js';
import FileUpload from '../middleware/fileUpload.js';
import ErrorHandler from '../middleware/errorHandler.js';

const router = express.Router();

router.use(AuthMiddleware.identify_user);

// GET /api/users - get all users (public)
router.get('/', ErrorHandler.async_handler(UsersController.get_all_public));

// GET /api/users/:user_id - get specified user data (public)
router.get('/:user_id', 
    Validator.validate_id('user_id'),
    ErrorHandler.async_handler(UsersController.get_public_profile)
);

// POST /api/users - create a new user (admin only)
router.post('/', 
    AuthMiddleware.require_admin,
    Validator.validate_user_registration,
    ErrorHandler.async_handler(UsersController.admin_create)
);

// PATCH /api/users/avatar - upload user avatar (authenticated users)
router.patch('/avatar', 
    AuthMiddleware.require_auth,
    FileUpload.handle_upload_error(FileUpload.upload_avatar),
    ErrorHandler.async_handler(UsersController.upload_avatar)
);

// PATCH /api/users/:user_id - update user data
router.patch('/:user_id', 
    AuthMiddleware.require_auth,
    Validator.validate_id('user_id'),
    AuthMiddleware.require_ownership_or_admin((req) => parseInt(req.params.user_id)),
    ErrorHandler.async_handler(UsersController.update_profile)
);

// DELETE /api/users/:user_id - delete user
router.delete('/:user_id', 
    AuthMiddleware.require_auth,
    Validator.validate_id('user_id'),
    AuthMiddleware.require_ownership_or_admin((req) => parseInt(req.params.user_id)),
    ErrorHandler.async_handler(UsersController.delete_account)
);

export default router;
