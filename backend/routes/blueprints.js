import express from 'express';
import auth_middleware from '../middleware/auth.js';
import blueprints_controller from '../controllers/blueprintsController.js';

const router = express.Router();

// Initialize user identification for all routes
router.use(auth_middleware.identify_user);

// GET /api/blueprints/search - Search blueprints
router.get('/search', blueprints_controller.search);

// GET /api/blueprints/popular - Get popular blueprints
router.get('/popular', blueprints_controller.get_popular);

// POST /api/blueprints - Create blueprint (requires authentication)
router.post('/', auth_middleware.require_auth, blueprints_controller.create);

// GET /api/blueprints/:blueprint_id - Get blueprint by ID
router.get('/:blueprint_id', blueprints_controller.get_by_id);

// DELETE /api/blueprints/:blueprint_id - Delete blueprint (requires authentication)
router.delete('/:blueprint_id', auth_middleware.require_auth, blueprints_controller.delete_blueprint);

export default router;
