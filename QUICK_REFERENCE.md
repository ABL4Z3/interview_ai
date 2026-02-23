# QUICK_REFERENCE.md - IntervuAI Command & Setup Cheat Sheet

## 🚀 One-Command Setup

```powershell
cd c:\Users\Lenovo\Desktop\f-projects\IntervuAI
.\setup.bat
```

Then edit `.env` with your API keys and run:

```powershell
npm run dev
```

## 📦 Project Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start both backend & frontend |
| `npm run dev:backend` | Start backend only (port 3000) |
| `npm run dev:frontend` | Start frontend only (port 5173) |
| `npm run build` | Build both for production |
| `npm run build:backend` | Build backend only |
| `npm run build:frontend` | Build frontend only |
| `npm run lint` | Lint all code |
| `npm run test` | Run all tests |

## 📁 Key File Locations

### Configuration
- `.env` - Environment variables (API keys, database, JWT secret)
- `.env.example` - Template for .env

### Backend Core
- `backend/src/index.js` - Server entry point
- `backend/src/config/env.js` - Environment setup
- `backend/src/config/database.js` - MongoDB connection

### Backend Services (Phase 1)
- `backend/src/services/gptService.js` - GPT-4o-mini integration
- `backend/src/services/deepgramService.js` - Speech-to-text
- `backend/src/services/elevenlabsService.js` - Text-to-speech (Phase 2)

### Backend Models
- `backend/src/models/User.js` - User schema
- `backend/src/models/Interview.js` - Interview schema
- `backend/src/models/Payment.js` - Payment schema

### Frontend
- `frontend/src/main.jsx` - React entry point
- `frontend/src/App.jsx` - Root component
- `frontend/vite.config.js` - Vite configuration
- `frontend/tailwind.config.js` - Tailwind CSS configuration

## 🔑 Required API Keys & Setup

### 1. OpenAI (GPT-4o-mini)
```
Website: platform.openai.com/api-keys
Env Var: OPENAI_API_KEY
Cost: Pay-as-you-go ($0.15/1M tokens)
```

### 2. Deepgram (Speech-to-Text)
```
Website: console.deepgram.com
Env Var: DEEPGRAM_API_KEY
Cost: Free tier includes 600 minutes/month
```

### 3. ElevenLabs (Text-to-Speech)
```
Website: elevenlabs.io
Env Var: ELEVENLABS_API_KEY, ELEVENLABS_VOICE_ID
Cost: Free tier includes 10K characters/month
```

### 4. MongoDB
```
Local: mongod (install from mongodb.com)
Cloud: Atlas (mongodb.com/cloud/atlas) - free tier available
Env Var: MONGODB_URI
```

### 5. Razorpay (Payments)
```
Website: razorpay.com
Env Var: RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET
Use: Test keys for development (production ready)
```

### 6. JWT Secret
```
Env Var: JWT_SECRET
Value: Any random 32+ character string
Example: MyV3ry$ecureJWT$ecretK3yFor1nterv1uA1
```

## 📋 API Endpoints (Phase 1)

### Health Check
```
GET /api/health
Response: { success: true, message: "..." }
```

### Authentication (To Be Implemented)
```
POST /api/auth/register
POST /api/auth/login
GET /api/auth/me (requires token)
```

### Interview (To Be Implemented)
```
POST /api/interview/start
GET /api/interview/:id
POST /api/interview/:id/process-audio
```

## 🧪 Testing with Postman

1. **Create Request**
   - Method: POST
   - URL: `http://localhost:3000/api/auth/register`
   - Body (JSON):
   ```json
   {
     "name": "Test User",
     "email": "test@example.com",
     "password": "password123"
   }
   ```

2. **Test Health**
   - Method: GET
   - URL: `http://localhost:3000/api/health`

3. **Use Firebase Emulator for Local Testing**
   ```bash
   firebase emulators:start
   ```

## 🔍 Debugging Commands

### Check if Backend is Running
```powershell
curl http://localhost:3000/api/health
# Should return: {"success":true,...}
```

### Check MongoDB Connection
```powershell
mongo
# Then: show dbs
```

### View Backend Logs
```
Look for startup messages including:
✓ Server running on http://localhost:3000
✓ MongoDB connected successfully
```

### Frontend Console Errors
- Press F12 in browser to open DevTools
- Check Console tab for errors
- Check Network tab for API calls

## 🚨 Common Issues & Fixes

### Issue: "EADDRINUSE" (Port already in use)
**Fix:** Change PORT in .env or kill the process using the port

### Issue: MongoDB Connection Error
**Fix:** Start MongoDB with `mongod` or use Atlas connection string

### Issue: "Invalid API Key" for OpenAI/Deepgram
**Fix:** Double-check API keys in .env (no extra spaces)

### Issue: CORS errors in frontend
**Fix:** Ensure FRONTEND_URL in .env matches your dev frontend URL

### Issue: npm ERR! ERR! ERESOLVE unable to resolve dependency tree
**Fix:** Delete node_modules and package-lock.json, then run npm install

## 📚 Documentation Files

- `README.md` - Project overview
- `SETUP_GUIDE.md` - Detailed setup instructions
- `PHASE_1_GUIDE.md` - Phase 1 implementation guide
- `backend/README.md` - Backend-specific documentation
- `frontend/README.md` - Frontend-specific documentation

## 🎯 Phase Checklist

- [ ] **Phase 1**: GPT-4o-mini & Deepgram integration
- [ ] **Phase 2**: ElevenLabs text-to-speech
- [ ] **Phase 3**: React UI & Interview room
- [ ] **Phase 4**: Razorpay payments
- [ ] **Phase 5**: Deployment (Docker, etc.)

## 💻 Environment Variables Quick Paste

```env
# Copy this to .env and fill in your keys

MONGODB_URI=mongodb://localhost:27017/intervuai
OPENAI_API_KEY=sk-XXX
DEEPGRAM_API_KEY=XXX
ELEVENLABS_API_KEY=XXX
ELEVENLABS_VOICE_ID=XXX
RAZORPAY_KEY_ID=rzp_test_XXX
RAZORPAY_KEY_SECRET=XXX
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:5173
JWT_SECRET=YourV3ry$ecureJWT$ecretStringWith32Plus$Chars
JWT_EXPIRE=7d
API_BASE_URL=http://localhost:3000
```

## 📞 Quick Links

- [OpenAI Docs](https://platform.openai.com/docs)
- [Deepgram Docs](https://developers.deepgram.com)
- [ElevenLabs Docs](https://elevenlabs.io/docs)
- [Razorpay Docs](https://razorpay.com/docs)
- [MongoDB Docs](https://docs.mongodb.com)
- [Express.js Guide](https://expressjs.com)
- [React Docs](https://react.dev)

## 🔄 Workflow

```
1. Edit .env with API keys
2. Start MongoDB: mongod
3. Run: npm run dev
4. Backend: http://localhost:3000/api/health
5. Frontend: http://localhost:5173
6. Implement Phase 1 features
7. Test with Postman/Thunder Client
8. Commit changes
9. Move to Phase 2
```

---

**Last Updated**: 2024-02-21 | **Status**: Phase 1 - In Progress
