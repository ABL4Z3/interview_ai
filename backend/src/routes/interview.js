// Interview Routes - Phase 1
import express from 'express';
import {
  startInterview,
  getInterview,
  processAudio,
  getInterviewHistory,
  startLiveInterview,
  saveLiveResults,
  completeLiveInterview,
} from '../controllers/interviewController.js';
import verifyJWT from '../middleware/auth.js';

const router = express.Router();

// Agent callback route (no JWT - uses x-agent-api-key header)
router.post('/:id/save-live-results', saveLiveResults);

// All remaining interview routes require authentication
router.use(verifyJWT);

// Interview management
router.post('/start', startInterview);
router.post('/start-live', startLiveInterview);
router.get('/user/history', getInterviewHistory);
router.get('/:id', getInterview);
router.post('/:id/process-audio', processAudio);
router.post('/:id/complete-live', completeLiveInterview);

export default router;
