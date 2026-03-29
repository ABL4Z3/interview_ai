import { ApiError } from '../utils/apiResponse.js';

/**
 * Middleware to verify that user has accepted terms of service
 * Must be placed after verifyJWT middleware
 */
const verifyTermsAcceptance = (req, res, next) => {
  try {
    if (!req.user) {
      throw new ApiError(401, 'Authentication required');
    }

    if (!req.user.termsAccepted) {
      throw new ApiError(403, 'You must accept the Terms of Service before using this feature');
    }

    next();
  } catch (error) {
    next(error);
  }
};

export default verifyTermsAcceptance;
