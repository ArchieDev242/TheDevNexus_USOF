import express from 'express';

import {
  register,
  verifyEmail,
  login
} from '../controllers/authController.js';

const router = express.Router();

router.post('/register', register);
router.post('/login',login);
router.get('/verify',verifyEmail);

export default router;