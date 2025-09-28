import express from 'express';
import {
    get_all_achievements,
    get_user_achievements,
    get_public_user_achievements,
    get_leaderboard,
    get_achievement_details,
    award_achievement
} from '../controllers/achievementsController.js';
import AuthMiddleware from '../middleware/auth.js';
import ErrorHandler from '../middleware/errorHandler.js';

const router = express.Router();

// public routes
router.get('/', ErrorHandler.async_handler(get_all_achievements));
router.get('/leaderboard', ErrorHandler.async_handler(get_leaderboard));
router.get('/details/:id', ErrorHandler.async_handler(get_achievement_details));
router.get('/user/:user_id', ErrorHandler.async_handler(get_public_user_achievements));

// protected routes
router.get('/my', 
    AuthMiddleware.identify_user,
    AuthMiddleware.require_auth,
    ErrorHandler.async_handler(get_user_achievements)
);

// admin routes
router.post('/award',
    AuthMiddleware.identify_user,
    AuthMiddleware.require_auth,
    ErrorHandler.async_handler(award_achievement)
);

export default router;
