// Payment model
import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    
    // Payment details
    razorpayPaymentId: String,
    razorpayOrderId: String,
    razorpaySignature: String,
    
    // Transaction type
    transactionType: {
      type: String,
      enum: ['subscription', 'single_interview'],
      required: true,
    },
    
    // Amount & currency
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: 'INR',
    },
    
    // Subscription related
    subscriptionPlan: String, // 'starter' or 'growth'
    subscriptionDuration: Number, // in months
    
    // Interview related
    interviewId: mongoose.Schema.Types.ObjectId,
    
    // Payment status
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending',
    },
    
    // Metadata
    description: String,
    notes: String,
    
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

paymentSchema.index({ userId: 1, createdAt: -1 });
paymentSchema.index({ razorpayPaymentId: 1 });

const Payment = mongoose.model('Payment', paymentSchema);
export default Payment;
