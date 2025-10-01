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
import auth_middleware from '../middleware/auth.js';
import Validator from '../middleware/validation.js';
import RateLimit from '../middleware/rateLimit.js';
import error_handler from '../middleware/errorHandler.js';

const router = express.Router();

router.post('/register', 
    RateLimit.auth(),
    Validator.validate_user_registration,
    error_handler.async_handler(register)
);

router.post('/login', 
    RateLimit.auth(),
    Validator.validate_user_login,
    error_handler.async_handler(login)
);

router.post('/logout', 
    auth_middleware.identify_user,
    auth_middleware.require_auth,
    error_handler.async_handler(logout)
);

router.post('/password-reset', 
    RateLimit.password_reset(),
    Validator.validate_password_reset,
    error_handler.async_handler(forgotPassword)
);

router.post('/password-reset/confirm', 
    RateLimit.password_reset(),
    Validator.validate_new_password,
    error_handler.async_handler(resetPassword)
);

// email verification (additional endpoint)
router.get('/verify', error_handler.async_handler(verifyEmail));
router.post('/password/verify', error_handler.async_handler(verifyResetToken));

export default router;