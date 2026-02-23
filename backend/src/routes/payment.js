// Payment Routes
import express from 'express';
import {
  getPlans,
  createPaymentOrder,
  verifyPaymentHandler,
  getPaymentHistory,
} from '../controllers/paymentController.js';
import verifyJWT from '../middleware/auth.js';

const router = express.Router();

// Public route - get plans
router.get('/plans', getPlans);

// Protected routes
router.post('/create-order', verifyJWT, createPaymentOrder);
router.post('/verify', verifyJWT, verifyPaymentHandler);
router.get('/history', verifyJWT, getPaymentHistory);

export default router;
