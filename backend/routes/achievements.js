import express from 'express';
import {
    get_all_achievements,
    get_user_achievements,
    get_public_user_achievements,
    get_leaderboard,
    get_achievement_details,
    award_achievement
} from '../controllers/achievementsController.js';
import auth_middleware from '../middleware/auth.js';
import error_handler from '../middleware/errorHandler.js';

const router = express.Router();

// public routes
router.get('/', error_handler.async_handler(get_all_achievements));
router.get('/leaderboard', error_handler.async_handler(get_leaderboard));
router.get('/details/:id', error_handler.async_handler(get_achievement_details));
router.get('/user/:user_id', error_handler.async_handler(get_public_user_achievements));

// protected routes
router.get('/my', 
    auth_middleware.identify_user,
    auth_middleware.require_auth,
    error_handler.async_handler(get_user_achievements)
);

// admin routes
router.post('/award',
    auth_middleware.identify_user,
    auth_middleware.require_auth,
    error_handler.async_handler(award_achievement)
);

export default router;
