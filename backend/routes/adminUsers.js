import express from 'express';
import UsersController from '../controllers/usersController.js';

const router = express.Router();

// GET /admin/api/users - отримати всіх користувачів
router.get('/', (req, res, next) => UsersController.admin_get_all(req, res).catch(next));

// GET /admin/api/users/:id - отримати користувача за ID
router.get('/:id', (req, res, next) => UsersController.admin_get_by_id(req, res).catch(next));

// PUT /admin/api/users/:id/role - змінити роль користувача
router.put('/:id/role', (req, res, next) => UsersController.admin_update_role(req, res).catch(next));

// PUT /admin/api/users/:id/status - змінити статус користувача (потрібно додати цей метод)
router.put('/:id/status', (req, res, next) => UsersController.admin_update_role(req, res).catch(next));

// PUT /admin/api/users/:id/ban - заблокувати користувача (потрібно додати цей метод)
router.put('/:id/ban', (req, res, next) => UsersController.admin_update_role(req, res).catch(next));

// PUT /admin/api/users/:id/unban - розблокувати користувача (потрібно додати цей метод)
router.put('/:id/unban', (req, res, next) => UsersController.admin_update_role(req, res).catch(next));

// DELETE /admin/api/users/:id - видалити користувача
router.delete('/:id', (req, res, next) => UsersController.admin_delete(req, res).catch(next));

export default router;
