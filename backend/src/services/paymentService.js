// Razorpay Payment Service
import Razorpay from 'razorpay';
import crypto from 'crypto';
import env from '../config/env.js';
import { ApiError } from '../utils/apiResponse.js';

let razorpayInstance = null;

function getRazorpay() {
  if (!razorpayInstance) {
    if (!env.RAZORPAY_KEY_ID || !env.RAZORPAY_KEY_SECRET) {
      throw new ApiError(503, 'Payment service not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.');
    }
    razorpayInstance = new Razorpay({
      key_id: env.RAZORPAY_KEY_ID,
      key_secret: env.RAZORPAY_KEY_SECRET,
    });
  }
  return razorpayInstance;
}

// Subscription plans configuration
export const PLANS = {
  starter: {
    name: 'Starter',
    price: 499, // INR
    interviews: 5,
    duration: 30, // days
    features: ['5 AI interviews/month', 'Detailed feedback', 'Score tracking'],
  },
  growth: {
    name: 'Growth',
    price: 999, // INR
    interviews: 999, // unlimited
    duration: 30,
    features: ['Unlimited AI interviews', 'Detailed feedback', 'Score tracking', 'Priority support', 'Interview history'],
  },
};

/**
 * Create a Razorpay order
 */
export const createOrder = async (plan, userId) => {
  const planDetails = PLANS[plan];
  if (!planDetails) {
    throw new ApiError(400, `Invalid plan: ${plan}. Choose 'starter' or 'growth'.`);
  }

  const razorpay = getRazorpay();

  const options = {
    amount: planDetails.price * 100, // Razorpay expects paise
    currency: 'INR',
    receipt: `order_${userId}_${Date.now()}`,
    notes: {
      userId,
      plan,
      interviews: planDetails.interviews,
    },
  };

  try {
    const order = await razorpay.orders.create(options);
    return {
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      plan: planDetails,
    };
  } catch (error) {
    console.error('Razorpay Order Creation Error:', JSON.stringify(error, null, 2));
    const razorpayMsg = error?.error?.description || error?.message || 'Unknown Razorpay error';
    throw new ApiError(500, `Failed to create payment order: ${razorpayMsg}`);
  }
};

/**
 * Verify Razorpay payment signature
 */
export const verifyPayment = (razorpayOrderId, razorpayPaymentId, razorpaySignature) => {
  const body = razorpayOrderId + '|' + razorpayPaymentId;
  const expectedSignature = crypto
    .createHmac('sha256', env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest('hex');

  return expectedSignature === razorpaySignature;
};

/**
 * Get plan details
 */
export const getPlanDetails = (plan) => {
  return PLANS[plan] || null;
};

export default {
  createOrder,
  verifyPayment,
  getPlanDetails,
  PLANS,
};
