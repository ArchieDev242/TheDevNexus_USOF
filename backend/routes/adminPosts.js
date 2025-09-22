import express from 'express';
import PostsController from '../controllers/postsControllers.js';

const router = express.Router();

// GET /admin/api/posts - отримати всі пости
router.get('/', (req, res, next) => PostsController.adminGetAll(req, res).catch(next));

// GET /admin/api/posts/:id - отримати пост за ID
router.get('/:id', (req, res, next) => PostsController.get_by_id(req, res).catch(next));

// PUT /admin/api/posts/:id/status - змінити статус посту
router.put('/:id/status', (req, res, next) => PostsController.adminUpdateStatus(req, res).catch(next));

// DELETE /admin/api/posts/:id - видалити пост
router.delete('/:id', (req, res, next) => PostsController.delete(req, res).catch(next));

export default router;
