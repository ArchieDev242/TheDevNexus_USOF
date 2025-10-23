import express from 'express';
import LikesController from '../controllers/likesController.js';

const router = express.Router();

// Post likes (using /posts/ to match frontend requests)
router.post('/posts/:id/like', LikesController.like_post);
router.post('/posts/:id/dislike', LikesController.dislike_post);
router.get('/posts/:id', LikesController.get_post_likes);

// Comment likes (using /comments/ to match frontend requests)
router.post('/comments/:id/like', LikesController.like_comment);
router.post('/comments/:id/dislike', LikesController.dislike_comment);
router.get('/comments/:id', LikesController.get_comment_likes);

// User rating/reputation
router.post('/user/:userId/rate', LikesController.rate_user);
router.get('/user/:userId/rating', LikesController.get_user_rating);

// User's own likes
router.get('/user/my', LikesController.get_user_likes);

// Admin
router.get('/admin/stats', LikesController.admin_get_stats);

export default router;
