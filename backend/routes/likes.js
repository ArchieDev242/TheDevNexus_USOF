import express from 'express';
import LikesController from '../controllers/likesController.js';
import auth_middleware from '../middleware/auth.js';

const router = express.Router();

router.use(auth_middleware.identify_user);

// post likes
router.post('/posts/:id/like', auth_middleware.require_auth, LikesController.like_post);
router.post('/posts/:id/dislike', auth_middleware.require_auth, LikesController.dislike_post);
router.get('/posts/:id', LikesController.get_post_likes);

// comment likes
router.post('/comments/:id/like', auth_middleware.require_auth, LikesController.like_comment);
router.post('/comments/:id/dislike', auth_middleware.require_auth, LikesController.dislike_comment);
router.get('/comments/:id', LikesController.get_comment_likes);

// user rating/reputation
router.post('/user/:userId/rate', auth_middleware.require_auth, LikesController.rate_user);
router.get('/user/:userId/rating', LikesController.get_user_rating);

// user's own likes
router.get('/user/my', auth_middleware.require_auth, LikesController.get_user_likes);

router.get('/admin/stats', LikesController.admin_get_stats);

export default router;
