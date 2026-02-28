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
    credits: 15,
    duration: 30, // days
    features: ['15 credits/month', 'All interview types', 'Basic + Detailed feedback'],
  },
  growth: {
    name: 'Growth',
    price: 999, // INR
    credits: 35,
    duration: 30,
    features: ['35 credits/month', 'All interview types', 'Premium analysis', 'Priority support'],
  },
  pro: {
    name: 'Pro',
    price: 1999, // INR
    credits: 80,
    duration: 30,
    features: ['80 credits/month', 'All interview types', 'Premium analysis', 'Priority support', 'Detailed roadmaps'],
  },
};

// Credit cost lookup
export const CREDIT_COSTS = {
  duration: {
    quick: 1,    // 5 questions, ~10 min
    standard: 2, // 8 questions, ~16 min
    deep: 3,     // 12 questions, ~25 min
  },
  analysis: {
    basic: 0,    // score + brief feedback (included)
    detailed: 1, // per-question feedback + tips
    premium: 2,  // detailed + improvement roadmap + model answers
  },
};

// Map duration tier to number of questions for the agent
export const DURATION_QUESTIONS = {
  quick: 5,
  standard: 8,
  deep: 12,
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
    receipt: `r_${String(userId).slice(-8)}_${Date.now().toString().slice(-10)}`,
    notes: {
      userId,
      plan,
      credits: planDetails.credits,
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
  CREDIT_COSTS,
  DURATION_QUESTIONS,
};
