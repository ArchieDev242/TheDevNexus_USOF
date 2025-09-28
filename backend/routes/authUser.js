import express from 'express';
import {
  register,
  login,
  verifyEmail,
  forgotPassword,
  verifyResetToken,
  resetPassword,
  logout
} from '../controllers/authController.js';
import AuthMiddleware from '../middleware/auth.js';
import Validator from '../middleware/validation.js';
import RateLimit from '../middleware/rateLimit.js';
import ErrorHandler from '../middleware/errorHandler.js';

const router = express.Router();

router.post('/register', 
    RateLimit.auth(),
    Validator.validate_user_registration,
    ErrorHandler.async_handler(register)
);

router.post('/login', 
    RateLimit.auth(),
    Validator.validate_user_login,
    ErrorHandler.async_handler(login)
);

router.post('/logout', 
    AuthMiddleware.identify_user,
    AuthMiddleware.require_auth,
    ErrorHandler.async_handler(logout)
);

router.post('/password-reset', 
    RateLimit.password_reset(),
    Validator.validate_password_reset,
    ErrorHandler.async_handler(forgotPassword)
);

router.post('/password-reset/confirm', 
    RateLimit.password_reset(),
    Validator.validate_new_password,
    ErrorHandler.async_handler(resetPassword)
);

// email verification (additional endpoint)
router.get('/verify', ErrorHandler.async_handler(verifyEmail));
router.post('/password/verify', ErrorHandler.async_handler(verifyResetToken));

export default router;