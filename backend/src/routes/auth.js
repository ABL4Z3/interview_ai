// Authentication Routes - Phase 1
import express from 'express';
import {
  sendOTP,
  register,
  login,
  getMe,
  refreshToken,
  googleAuth,
} from '../controllers/authController.js';
import verifyJWT from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/send-otp', sendOTP);
router.post('/register', register);
router.post('/login', login);
router.post('/google', googleAuth);

// Protected routes
router.get('/me', verifyJWT, getMe);
router.post('/refresh', verifyJWT, refreshToken);

export default router;
