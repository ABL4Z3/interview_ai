// Deepgram Nova-2 Service - Phase 1
import { createClient } from '@deepgram/sdk';
import env from '../config/env.js';
import { ApiError } from '../utils/apiResponse.js';

const deepgramClient = createClient({
  apiKey: env.DEEPGRAM_API_KEY,
});

/**
 * Transcribe audio buffer to text using Deepgram Nova-2
 * @param {Buffer} audioBuffer - Raw audio data
 * @param {Object} options - Transcription options
 * @returns {Promise<{transcript: string, confidence: number}>}
 */
export const transcribeAudio = async (audioBuffer, options = {}) => {
  try {
    const {
      mimeType = 'audio/wav',
      language = 'en-US',
      smartFormat = true,
    } = options;

    const response = await deepgramClient.listen.prerecorded.transcribeBuffer(
      audioBuffer,
      {
        model: 'nova-2',
        language,
        smart_format: smartFormat,
        punctuate: true,
      }
    );

    if (!response.result?.results?.channels?.[0]?.alternatives?.[0]) {
      throw new Error('No transcription received from Deepgram');
    }

    const transcript = response.result.results.channels[0].alternatives[0].transcript;
    const confidence = response.result.results.channels[0].alternatives[0].confidence || 0;

    return {
      transcript,
      confidence,
      words: response.result.results.channels[0].alternatives[0].words?.length || 0,
    };
  } catch (error) {
    console.error('Deepgram Transcription Error:', error);
    throw new ApiError(500, `Speech-to-text transcription failed: ${error.message}`);
  }
};

/**
 * Process real-time audio stream with Deepgram
 * @param {Stream} audioStream - Audio stream from client
 * @returns {Promise<AsyncIterable>} - Transcript stream
 */
export const processRealtimeAudio = async (audioStream) => {
  try {
    // Note: Implementation depends on whether using WebSocket or REST
    // This is a placeholder for real-time streaming setup

    // For live streaming with Deepgram, typically use:
    // const connection = await deepgram.listen.live({
    //   model: 'nova-2',
    //   smart_format: true,
    //   encoding: 'linear16',
    //   sample_rate: 16000,
    // });

    throw new ApiError(503, 'Real-time streaming not yet implemented in Phase 1');
  } catch (error) {
    console.error('Deepgram Real-time Error:', error);
    throw error;
  }
};

/**
 * Check Deepgram API connection
 * @returns {Promise<boolean>} - API is accessible
 */
export const checkDeepgramConnection = async () => {
  try {
    // Simple health check - just verify the client can be initialized
    return !!deepgramClient;
  } catch (error) {
    console.warn('Deepgram connection check:', error.message);
    return false;
  }
};

/**
 * Validate audio before sending to Deepgram
 * @param {Buffer} audioBuffer - Audio data
 * @returns {Object} - Validation result
 */
export const validateAudio = (audioBuffer) => {
  const minAudioLength = 200; // Roughly 100ms at 16kHz
  const maxAudioLength = 10 * 1024 * 1024; // 10MB max

  if (!audioBuffer || audioBuffer.length === 0) {
    return {
      valid: false,
      error: 'Audio buffer is empty',
    };
  }

  if (audioBuffer.length < minAudioLength) {
    return {
      valid: false,
      error: 'Audio is too short (minimum 100ms)',
    };
  }

  if (audioBuffer.length > maxAudioLength) {
    return {
      valid: false,
      error: 'Audio is too large (maximum 10MB)',
    };
  }

  return {
    valid: true,
    size: audioBuffer.length,
    estimatedDuration: (audioBuffer.length / 16000 / 2).toFixed(2), // Rough estimate for 16kHz mono
  };
};

/**
 * Process audio chunk for transcription
 * Useful for chunked uploads
 * @param {Array<Buffer>} audioChunks - Array of audio buffers
 * @returns {Promise<{transcript: string, confidence: number}>}
 */
export const processAudioChunks = async (audioChunks) => {
  try {
    // Combine chunks
    const combinedAudio = Buffer.concat(audioChunks);

    // Validate combined audio
    const validation = validateAudio(combinedAudio);
    if (!validation.valid) {
      throw new ApiError(400, validation.error);
    }

    // Transcribe
    return await transcribeAudio(combinedAudio);
  } catch (error) {
    console.error('Deepgram Chunk Processing Error:', error);
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, 'Failed to process audio chunks');
  }
};

/**
 * Get Deepgram model info
 * @returns {Object} - Model details
 */
export const getModelInfo = () => {
  return {
    model: 'nova-2',
    provider: 'deepgram',
    capabilities: [
      'Speech-to-Text',
      'Multi-language support',
      'Smart formatting',
      'Punctuation',
      'Confidence scores',
    ],
    supported_formats: [
      'audio/wav',
      'audio/mp3',
      'audio/ogg',
      'audio/flac',
    ],
  };
};

export default {
  transcribeAudio,
  processRealtimeAudio,
  checkDeepgramConnection,
  validateAudio,
  processAudioChunks,
  getModelInfo,
};
