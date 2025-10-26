import express from 'express';
import categories_controller from '../controllers/categoriesController.js';
import auth_middleware from '../middleware/auth.js';
import Validator from '../middleware/validation.js';
import error_handler from '../middleware/errorHandler.js';

const router = express.Router();

router.use(auth_middleware.identify_user);

// GET /api/categories 
router.get('/', error_handler.async_handler(categories_controller.get_all));

// GET /api/categories/:category_id
router.get('/:category_id', 
    Validator.validate_id('category_id'),
    error_handler.async_handler(categories_controller.get_by_id)
);

// GET /api/categories/:category_id/posts
router.get('/:category_id/posts', 
    Validator.validate_id('category_id'),
    error_handler.async_handler(categories_controller.get_posts_by_category)
);

// POST /api/categories
router.post('/', 
    auth_middleware.require_admin,
    Validator.validate_category,
    error_handler.async_handler(categories_controller.admin_create)
);

// PATCH /api/categories/:category_id
router.patch('/:category_id', 
    auth_middleware.require_admin,
    Validator.validate_id('category_id'),
    Validator.validate_category,
    error_handler.async_handler(categories_controller.admin_update)
);

// DELETE /api/categories/:category_id
router.delete('/:category_id', 
    auth_middleware.require_admin,
    Validator.validate_id('category_id'),
    error_handler.async_handler(categories_controller.admin_delete)
);

export default router;
