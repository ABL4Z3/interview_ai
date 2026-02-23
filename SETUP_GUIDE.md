# SETUP_GUIDE.md - IntervuAI Project Setup Guide

## 📋 Prerequisites

Before starting, ensure you have:

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0
- **MongoDB** (local installation or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas))
- API Keys for:
  - [OpenAI](https://platform.openai.com/api-keys) - GPT-4o-mini
  - [Deepgram](https://console.deepgram.com/) - Nova-2 Speech-to-Text
  - [ElevenLabs](https://elevenlabs.io/) - Text-to-Speech
  - [Razorpay](https://razorpay.com/) - Payment processing

## 🚀 Quick Start (Windows)

### Step 1: Navigate to Project
```powershell
cd c:\Users\Lenovo\Desktop\f-projects\IntervuAI
```

### Step 2: Run Setup Script
```powershell
.\setup.bat
```

Or manually:
```powershell
npm install
copy .env.example .env
copy backend\.env.example backend\.env
copy frontend\.env.example frontend\.env.local
```

### Step 3: Configure Environment Variables

Edit `.env` in the project root:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/intervuai
# Or use MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/intervuai

# OpenAI
OPENAI_API_KEY=sk-your_api_key_here

# Deepgram
DEEPGRAM_API_KEY=your_deepgram_key

# ElevenLabs
ELEVENLABS_API_KEY=your_elevenlabs_key
ELEVENLABS_VOICE_ID=21m00Tcm4TlvDq8ikWAM  # or your preferred voice ID

# Razorpay
RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=your_secret_key

# JWT (generate a random 32+ character string)
JWT_SECRET=your_very_long_secret_string_minimum_32_characters

# Frontend
FRONTEND_URL=http://localhost:5173
```

### Step 4: Start Development Servers

**Option A: Run Both Concurrently**
```powershell
npm run dev
```

**Option B: Run Separately (in different terminal windows)**

Terminal 1 - Backend:
```powershell
npm run dev:backend
# Runs on http://localhost:3000
```

Terminal 2 - Frontend:
```powershell
npm run dev:frontend
# Runs on http://localhost:5173
```

## 🐘 MongoDB Setup

### Local MongoDB

1. **Install MongoDB Community Edition**
   - Download from [mongodb.com/try/download/community](https://www.mongodb.com/try/download/community)
   - Run installer and follow setup

2. **Start MongoDB**
   ```powershell
   # Windows
   mongod
   ```

3. **Verify Connection**
   ```powershell
   mongo
   # Should connect successfully
   ```

### MongoDB Atlas (Cloud)

1. Create free cluster at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)

2. Update `MONGODB_URI` in `.env`:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/intervuai?retryWrites=true&w=majority
   ```

## 🔑 Getting API Keys

### OpenAI (GPT-4o-mini)

1. Go to [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Sign up and create account
3. Generate new API key
4. Copy to `OPENAI_API_KEY` in `.env`

### Deepgram (Nova-2)

1. Visit [console.deepgram.com](https://console.deepgram.com/)
2. Sign up for free account
3. Create API key
4. Copy to `DEEPGRAM_API_KEY` in `.env`

### ElevenLabs (Text-to-Speech)

1. Go to [elevenlabs.io](https://elevenlabs.io/)
2. Sign up and create account
3. Navigate to API Keys section
4. Copy API key and Voice ID to `.env`

### Razorpay (Payments)

1. Create account at [razorpay.com](https://razorpay.com/)
2. Go to Settings → API Keys
3. Copy Test Key ID and Secret to `.env`

## 📁 Project Structure After Setup

```
IntervuAI/
├── backend/
│   ├── src/
│   │   ├── config/         # Database & environment config
│   │   ├── models/         # MongoDB schemas (User, Interview, Payment)
│   │   ├── services/       # AI integration (GPT, Deepgram, ElevenLabs)
│   │   ├── controllers/    # Request handlers
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Auth, error handling
│   │   └── utils/          # Helper functions
│   ├── package.json
│   ├── .env
│   └── .gitignore
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable React components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API clients
│   │   ├── store/         # Zustand state management
│   │   ├── hooks/         # Custom React hooks
│   │   ├── utils/         # Helper functions
│   │   ├── assets/        # Images, icons
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   ├── .env.local
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── index.html
├── package.json            # Monorepo config
├── .env
├── .env.example
├── .gitignore
├── README.md
└── SETUP_GUIDE.md
```

## ✅ Verification Checklist

After setup, verify everything works:

```powershell
# 1. Check if both servers start
npm run dev

# 2. Backend health check (should return 200 OK)
curl http://localhost:3000/api/health

# 3. Frontend loads (should show IntervuAI home page)
# Visit http://localhost:5173

# 4. Frontend can connect to backend
# Check browser console for no CORS errors
```

## 🐛 Troubleshooting

### Port Already in Use

If port 3000 or 5173 is already in use:

```powershell
# Backend - change port in .env
PORT=3001

# Frontend - Vite will automatically use next available port
```

### MongoDB Connection Failed

```
Error: connect ECONNREFUSED 127.0.0.1:27017
```

Solutions:
1. Start MongoDB: `mongod`
2. Check MongoDB is running: `mongo`
3. Or use MongoDB Atlas with cloud connection string

### CORS Errors

If frontend can't reach backend:
1. Ensure `FRONTEND_URL` in `.env` matches frontend URL
2. Check backend is running on correct port
3. Ensure CORS middleware is enabled in backend

### Missing Environment Variables

```
Error: Cannot find module or missing API key
```

Solutions:
1. Copy `.env.example` to `.env`
2. Fill in all required API keys
3. Restart development server

### Node Version Issues

```powershell
# Check current version
node -v

# Should be >= 18.0.0
# If not, install latest from nodejs.org
```

## 📚 Next Steps

1. **Phase 1**: Implement GPT-4o-mini & Deepgram integration
   - See [backend/README.md](backend/README.md)

2. **Phase 2**: Add ElevenLabs text-to-speech
   - Implement audio streaming pipeline

3. **Phase 3**: Build React UI
   - Create interview room interface

4. **Phase 4**: Add Razorpay payments
   - Subscription management

5. **Phase 5**: Deploy to production
   - Docker setup and deployment

## 💡 Development Tips

- **Hot Reload**: Both backend and frontend support hot reload
- **Debug**: Use `NODE_ENV=development` for verbose logs
- **Database**: Use MongoDB Compass to view database
- **API Testing**: Use Postman or Thunder Client VS Code extension
- **Frontend Development**: Use React DevTools browser extension

## 📝 Common Commands

```powershell
# Start everything
npm run dev

# Start only backend
npm run dev:backend

# Start only frontend
npm run dev:frontend

# Build for production
npm run build

# Run linting
npm run lint

# Install new package in backend
npm install package-name --workspace=backend

# Install new package in frontend
npm install package-name --workspace=frontend

# Install new package in root only
npm install -D package-name
```

## 🆘 Getting Help

- Check [README.md](README.md) for project overview
- Review individual README files in `backend/` and `frontend/`
- Check error messages carefully - they often indicate the fix
- Use `npm run dev` with verbose output if stuck

## ✨ You're Ready!

Your IntervuAI development environment is now set up. Start with Phase 1 to build the core AI interview engine.

Happy coding! 🚀
