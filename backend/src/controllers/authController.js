// Authentication Controller - Phase 1
import User from '../models/User.js';
import { ApiResponse, ApiError, asyncHandler } from '../utils/apiResponse.js';
import jwt from 'jsonwebtoken';
import env from '../config/env.js';

/**
 * Register a new user
 * @route POST /api/auth/register
 * @body {name, email, password}
 */
export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  // Validation
  if (!name || !email || !password) {
    throw new ApiError(400, 'Name, email, and password are required');
  }

  if (password.length < 8) {
    throw new ApiError(400, 'Password must be at least 8 characters');
  }

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(409, 'User with this email already exists');
  }

  // Create user
  const user = await User.create({
    name,
    email,
    password,
  });

  // Generate JWT token
  const token = jwt.sign(user.getJWT(), env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRE,
  });

  res.status(201).json(
    new ApiResponse(201, {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        subscriptionPlan: user.subscriptionPlan,
      },
    }, 'User registered successfully')
  );
});

/**
 * Login user
 * @route POST /api/auth/login
 * @body {email, password}
 */
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Validation
  if (!email || !password) {
    throw new ApiError(400, 'Email and password are required');
  }

  // Find user
  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(401, 'Invalid email or password');
  }

  // Check password
  const isPasswordCorrect = await user.comparePassword(password);
  if (!isPasswordCorrect) {
    throw new ApiError(401, 'Invalid email or password');
  }

  // Generate JWT token
  const token = jwt.sign(user.getJWT(), env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRE,
  });

  res.json(
    new ApiResponse(200, {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        subscriptionPlan: user.subscriptionPlan,
      },
    }, 'Login successful')
  );
});

/**
 * Get current user
 * @route GET /api/auth/me
 * @middleware verifyJWT
 */
export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.userId);

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  res.json(
    new ApiResponse(200, {
      id: user._id,
      name: user.name,
      email: user.email,
      subscriptionPlan: user.subscriptionPlan,
      totalInterviews: user.totalInterviews,
      interviewsRemaining: user.interviewsRemaining,
    }, 'User retrieved successfully')
  );
});

/**
 * Refresh JWT token
 * @route POST /api/auth/refresh
 * @middleware verifyJWT
 */
export const refreshToken = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.userId);

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  const token = jwt.sign(user.getJWT(), env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRE,
  });

  res.json(
    new ApiResponse(200, { token }, 'Token refreshed successfully')
  );
});
