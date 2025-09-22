import express from 'express';
import LikesController from '../controllers/likesController.js';

const router = express.Router();

router.post('/post/:id/like', LikesController.like_post);
router.post('/post/:id/dislike', LikesController.dislike_post);
router.post('/comment/:id/like', LikesController.like_comment);
router.post('/comment/:id/dislike', LikesController.dislike_comment);
router.get('/user/my', LikesController.get_user_likes);

router.get('/post/:id', LikesController.get_post_likes);
router.get('/comment/:id', LikesController.get_comment_likes);

router.get('/admin/stats', LikesController.admin_get_stats);

export default router;
