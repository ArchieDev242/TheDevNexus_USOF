import express from 'express';
import UsersController from '../controllers/usersController.js';

const router = express.Router();

// GET /admin/api/users
router.get('/', (req, res, next) => UsersController.admin_get_all(req, res).catch(next));

// GET /admin/api/users/:id
router.get('/:id', (req, res, next) => UsersController.admin_get_by_id(req, res).catch(next));

// PUT /admin/api/users/:id/role
router.put('/:id/role', (req, res, next) => UsersController.admin_update_role(req, res).catch(next));

// PUT /admin/api/users/:id/status
router.put('/:id/status', (req, res, next) => UsersController.admin_update_role(req, res).catch(next));

// PUT /admin/api/users/:id/ban
router.put('/:id/ban', (req, res, next) => UsersController.admin_update_role(req, res).catch(next));

// PUT /admin/api/users/:id/unban
router.put('/:id/unban', (req, res, next) => UsersController.admin_update_role(req, res).catch(next));

// DELETE /admin/api/users/:id
router.delete('/:id', (req, res, next) => UsersController.admin_delete(req, res).catch(next));

export default router;
