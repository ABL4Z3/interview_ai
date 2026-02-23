// JWT Authentication middleware
import jwt from 'jsonwebtoken';
import env from '../config/env.js';
import { ApiError } from '../utils/apiResponse.js';

const verifyJWT = (req, res, next) => {
  try {
    // Get token from headers
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      throw new ApiError(401, 'No token provided');
    }

    // Verify token
    const decoded = jwt.verify(token, env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof ApiError) {
      return next(error);
    }
    next(new ApiError(401, 'Invalid or expired token'));
  }
};

export default verifyJWT;
