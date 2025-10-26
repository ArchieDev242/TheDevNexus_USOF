import express from 'express';
import CommentsController from '../controllers/commentsController.js';

const router = express.Router();

// GET /admin/api/comments
router.get('/', (req, res, next) => CommentsController.admin_get_all(req, res).catch(next));

// GET /admin/api/comments/:id
router.get('/:id', (req, res, next) => CommentsController.getById(req, res).catch(next));

// PUT /admin/api/comments/:id/approve
router.put('/:id/approve', (req, res, next) => CommentsController.admin_approve(req, res).catch(next));

// PUT /admin/api/comments/:id/reject
router.put('/:id/reject', (req, res, next) => CommentsController.admin_reject(req, res).catch(next));

// DELETE /admin/api/comments/:id
router.delete('/:id', (req, res, next) => CommentsController.admin_delete(req, res).catch(next));

export default router;
