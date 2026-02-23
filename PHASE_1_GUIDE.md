# PHASE_1_GUIDE.md - Brain & Ears: GPT-4o-mini & Deepgram Integration

## 🎯 Phase 1 Objectives

Build the "brain" and "ears" of IntervuAI:

- ✅ Express.js backend with proper structure
- ⬜ GPT-4o-mini integration for dynamic question generation
- ⬜ Deepgram Nova-2 integration for speech-to-text processing
- ⬜ MongoDB models for users and interviews
- ⬜ JWT authentication system
- ⬜ Core API endpoints

## 📊 Phase 1 Architecture

```
┌─────────────────────────────────────────┐
│  Frontend (React/Vite)                  │
└────────────────┬────────────────────────┘
                 │ Audio Stream
                 │
┌────────────────▼───────────────────────┐
│  Backend (Express.js)                   │
├─────────────────────────────────────────┤
│  Audio Processing                       │
│  ├─ Deepgram Nova-2 (Speech → Text)     │
│  └─ Audio Stream Handler                │
├─────────────────────────────────────────┤
│  AI Logic Layer                         │
│  ├─ GPT-4o-mini (Generate Questions)    │
│  ├─ Context Manager (Interview State)   │
│  └─ Response Evaluator                  │
├─────────────────────────────────────────┤
│  Data Layer                             │
│  ├─ User Model                          │
│  ├─ Interview Model                     │
│  └─ MongoDB Connection                  │
└─────────────────────────────────────────┘
```

## 📋 Implementation Checklist

### 1. Authentication System
- [ ] User registration endpoint
- [ ] User login endpoint
- [ ] JWT token generation
- [ ] Auth middleware for protected routes
- [ ] Password hashing with bcryptjs

### 2. GPT-4o-mini Integration
- [ ] OpenAI SDK setup
- [ ] Question generation service
- [ ] Interview context management
- [ ] Response evaluation logic
- [ ] Follow-up question generation

### 3. Deepgram Nova-2 Integration
- [ ] Deepgram SDK setup
- [ ] Real-time transcription service
- [ ] Audio stream handling
- [ ] Transcript storage
- [ ] Error handling for audio issues

### 4. API Endpoints

#### Authentication
```
POST /api/auth/register
POST /api/auth/login
POST /api/auth/refresh
POST /api/auth/logout
GET /api/auth/me
```

#### Interview
```
POST /api/interview/start
GET /api/interview/:id
POST /api/interview/:id/process-audio
GET /api/interview/:id/questions
GET /api/interview/user/history
PUT /api/interview/:id/evaluate
```

### 5. Database Models
- [ ] User schema with subscription data
- [ ] Interview schema with questions/answers
- [ ] Session/Token management
- [ ] Indices for performance

## 🛠️ Development Steps

### Step 1: Set Up Environment

```powershell
cd c:\Users\Lenovo\Desktop\f-projects\IntervuAI
npm install
```

### Step 2: Create Auth Routes & Controllers

Create `backend/src/routes/auth.js`:
```javascript
import express from 'express';
import { register, login, getMe } from '../controllers/authController.js';
import verifyJWT from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', verifyJWT, getMe);

export default router;
```

### Step 3: Create GPT Service

Create `backend/src/services/gptService.js`:
```javascript
import { OpenAI } from 'openai';
import env from '../config/env.js';

const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
});

// Generate initial interview question
export const generateInitialQuestion = async (interviewType) => {
  // Implementation here
};

// Evaluate candidate response
export const evaluateResponse = async (question, response, context) => {
  // Implementation here
};

// Generate follow-up question
export const generateFollowUp = async (previousQ, response, context) => {
  // Implementation here
};
```

### Step 4: Create Deepgram Service

Create `backend/src/services/deepgramService.js`:
```javascript
import { Deepgram } from '@deepgram/sdk';
import env from '../config/env.js';

const deepgram = new Deepgram({
  apiKey: env.DEEPGRAM_API_KEY,
});

// Transcribe audio stream
export const transcribeAudio = async (audioBuffer) => {
  // Implementation here
};

// Process real-time audio
export const processRealtimeAudio = async (audioStream) => {
  // Implementation here
};
```

### Step 5: Create Interview Controller

Create `backend/src/controllers/interviewController.js`:
```javascript
import { asyncHandler, ApiResponse, ApiError } from '../utils/apiResponse.js';
import Interview from '../models/Interview.js';
import { generateInitialQuestion } from '../services/gptService.js';

export const startInterview = asyncHandler(async (req, res) => {
  const { interviewType, difficultyLevel } = req.body;
  
  // Create new interview document
  // Generate first question
  // Return interview ID and first question
  
  res.json(new ApiResponse(200, { interview }, 'Interview started'));
});
```

### Step 6: Wire Up Routes

Update `backend/src/index.js`:
```javascript
import authRoutes from './routes/auth.js';
import interviewRoutes from './routes/interview.js';

app.use('/api/auth', authRoutes);
app.use('/api/interview', interviewRoutes);
```

## 🔌 API Response Format

All endpoints follow standardized response:

```json
{
  "success": true|false,
  "data": {},
  "message": "string",
  "timestamp": "ISO timestamp"
}
```

### Success Response Example
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGc...",
    "user": {
      "id": "...",
      "email": "user@example.com",
      "name": "John Doe"
    }
  },
  "message": "Login successful",
  "timestamp": "2024-02-21T10:30:00.000Z"
}
```

### Error Response Example
```json
{
  "success": false,
  "message": "Invalid credentials",
  "timestamp": "2024-02-21T10:30:00.000Z"
}
```

## 🧪 Testing Phase 1

### 1. Test with Postman or Thunder Client

**Test Registration:**
```
POST http://localhost:3000/api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Test Login:**
```
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Test Start Interview:**
```
POST http://localhost:3000/api/interview/start
Authorization: Bearer <token_from_login>
Content-Type: application/json

{
  "interviewType": "fullstack",
  "difficultyLevel": "intermediate"
}
```

### 2. Test with Frontend

Create simple test page in frontend:
```javascript
import { useState } from 'react';
import apiClient from '../services/api';

function TestPhase1() {
  const [response, setResponse] = useState(null);

  const testHealth = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/health');
      const data = await res.json();
      setResponse(data);
    } catch (error) {
      setResponse({ error: error.message });
    }
  };

  return (
    <div>
      <button onClick={testHealth}>Test API</button>
      <pre>{JSON.stringify(response, null, 2)}</pre>
    </div>
  );
}
```

## 📊 Interview Flow (Phase 1)

```
1. Candidate logs in/registers
   ↓
2. Candidate starts interview
   ↓
3. Backend calls GPT to generate Q1
   ↓
4. Q1 displayed to candidate
   ↓
5. Candidate speaks answer
   ↓
6. Audio sent to backend
   ↓
7. Deepgram transcribes audio → text
   ↓
8. GPT evaluates response and generates Q2
   ↓
9. Repeat for 5-10 questions
   ↓
10. Interview evaluation completes
    ↓
11. Results saved to MongoDB
   ↓
12. Candidate sees results
```

## 🎓 Interview Question Generation Prompt

```
You are a professional technical interviewer. Your task is to evaluate the candidate's response
and continue with follow-up questions.

Interview Context:
- Type: {interviewType}
- Difficulty: {difficultyLevel}
- Questions Asked: {questionCount}
- Previous Questions: {previousQuestions}

Current Question: {currentQuestion}
Candidate Response: {candidateResponse}

Please:
1. Evaluate this response (score 0-100)
2. Provide constructive feedback
3. Ask a follow-up question that tests deeper understanding

Format your response as JSON:
{
  "score": 75,
  "feedback": "...",
  "followUpQuestion": "...",
  "isPassingScore": true
}
```

## 📦 npm Packages to Install

Core packages (already in package.json):
- `express` - Web framework
- `mongoose` - MongoDB ODM
- `openai` - GPT-4o-mini access
- `deepgram-sdk` - Speech-to-text
- `jsonwebtoken` - JWT tokens
- `bcryptjs` - Password hashing

Install all dependencies:
```powershell
cd c:\Users\Lenovo\Desktop\f-projects\IntervuAI
npm install
```

## 🚀 Running Phase 1

```powershell
# Terminal 1 - MongoDB
mongod

# Terminal 2 - Backend
npm run dev:backend

# Terminal 3 - Frontend (or browser test)
npm run dev:frontend
```

## 📝 Environment Variables Needed

Ensure these are in `.env`:
```env
OPENAI_API_KEY=sk-...
DEEPGRAM_API_KEY=...
MONGODB_URI=mongodb://localhost:27017/intervuai
JWT_SECRET=your_secret_key_min_32_chars
PORT=3000
FRONTEND_URL=http://localhost:5173
```

## ✅ Phase 1 Completion Criteria

- [ ] All auth endpoints working
- [ ] Users can register and login
- [ ] JWT tokens generated and validated
- [ ] Interview can be started
- [ ] First question generated via GPT-4o-mini
- [ ] Audio can be processed
- [ ] Deepgram transcribes audio correctly
- [ ] Response evaluated and follow-up generated
- [ ] All data persisted in MongoDB
- [ ] No CORS errors
- [ ] Error handling works properly

## 🎉 Next Phase

Once Phase 1 is complete, move to **Phase 2**: Integrate ElevenLabs for text-to-speech to give the AI a voice!

---

**Questions?** Refer to individual service documentation or check API implementation examples.
