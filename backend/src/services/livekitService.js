// LiveKit Service - Real-time interview room management
import { AccessToken } from 'livekit-server-sdk';
import env from '../config/env.js';
import { ApiError } from '../utils/apiResponse.js';

/**
 * Generate a LiveKit access token for a participant
 * @param {string} roomName - The room to join
 * @param {string} participantIdentity - Unique identity for the participant
 * @param {string} participantName - Display name
 * @param {object} metadata - Room metadata (interview config)
 * @returns {string} JWT token
 */
export const generateToken = async (roomName, participantIdentity, participantName, metadata = {}) => {
  if (!env.LIVEKIT_API_KEY || !env.LIVEKIT_API_SECRET) {
    throw new ApiError(503, 'LiveKit is not configured. Set LIVEKIT_API_KEY and LIVEKIT_API_SECRET.');
  }

  const token = new AccessToken(env.LIVEKIT_API_KEY, env.LIVEKIT_API_SECRET, {
    identity: participantIdentity,
    name: participantName,
    metadata: JSON.stringify(metadata),
  });

  token.addGrant({
    room: roomName,
    roomJoin: true,
    canPublish: true,
    canSubscribe: true,
    roomCreate: true,
    canPublishData: true,
  });

  return await token.toJwt();
};

/**
 * Get the LiveKit WebSocket URL
 */
export const getLiveKitUrl = () => {
  if (!env.LIVEKIT_URL) {
    throw new ApiError(503, 'LiveKit URL is not configured.');
  }
  return env.LIVEKIT_URL;
};

export default {
  generateToken,
  getLiveKitUrl,
};
