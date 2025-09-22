import express from 'express';
import CategoriesController from '../controllers/categoriesController.js';
import AuthMiddleware from '../middleware/auth.js';
import Validator from '../middleware/validation.js';
import ErrorHandler from '../middleware/errorHandler.js';

const router = express.Router();

router.use(AuthMiddleware.identify_user);

// GET /api/categories - get all categories
router.get('/', ErrorHandler.async_handler(CategoriesController.get_all));

// GET /api/categories/:category_id - get specified category data
router.get('/:category_id', 
    Validator.validate_id('category_id'),
    ErrorHandler.async_handler(CategoriesController.get_by_id)
);

// GET /api/categories/:category_id/posts - get all posts associated with the specified category
router.get('/:category_id/posts', 
    Validator.validate_id('category_id'),
    ErrorHandler.async_handler(CategoriesController.get_posts_by_category)
);

// POST /api/categories - create a new category (admin only)
router.post('/', 
    AuthMiddleware.require_admin,
    Validator.validate_category,
    ErrorHandler.async_handler(CategoriesController.admin_create)
);

// PATCH /api/categories/:category_id - update specified category data (admin only)
router.patch('/:category_id', 
    AuthMiddleware.require_admin,
    Validator.validate_id('category_id'),
    Validator.validate_category,
    ErrorHandler.async_handler(CategoriesController.admin_update)
);

// DELETE /api/categories/:category_id - delete a category (admin only)
router.delete('/:category_id', 
    AuthMiddleware.require_admin,
    Validator.validate_id('category_id'),
    ErrorHandler.async_handler(CategoriesController.admin_delete)
);

export default router;
