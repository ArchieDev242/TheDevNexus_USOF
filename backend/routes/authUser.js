import express from 'express';

import {
  register,
  login,
  verifyEmail,
  forgotPassword,
  verifyResetToken,
  resetPassword
} from '../controllers/authController.js';

const router = express.Router();

router.post('/register', register);
router.post('/login',login);
router.get('/verify',verifyEmail);
router.post('/password/forgot', forgotPassword);
router.post('/password/verify', verifyResetToken);
router.post('/password/reset', resetPassword);

export default router;