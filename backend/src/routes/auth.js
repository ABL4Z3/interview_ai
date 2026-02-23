// Authentication Routes - Phase 1
import express from 'express';
import {
  register,
  login,
  getMe,
  refreshToken,
} from '../controllers/authController.js';
import verifyJWT from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/me', verifyJWT, getMe);
router.post('/refresh', verifyJWT, refreshToken);

export default router;
