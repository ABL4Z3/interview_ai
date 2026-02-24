import mongoose from 'mongoose';

const otpVerificationSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    index: true,
  },
  otp: {
    type: String,
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: 0 }, // MongoDB TTL: auto-delete when expiresAt is reached
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('OTPVerification', otpVerificationSchema);
