# IntervuAI Backend

Node.js/Express backend for the IntervuAI platform.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your API keys
   ```

3. Start development server:
   ```bash
   npm run dev
   ```

The backend will run on `http://localhost:3000`

## Project Structure

```
src/
├── index.js              # Application entry point
├── config/              # Configuration files
│   ├── database.js      # MongoDB connection
│   └── env.js           # Environment variables
├── models/              # MongoDB schemas
│   ├── User.js
│   ├── Interview.js
│   └── Payment.js
├── services/            # Business logic
│   ├── gptService.js    # GPT-4o-mini integration
│   ├── deepgramService.js   # Speech-to-text
│   ├── elevenlabsService.js # Text-to-speech
│   └── paymentService.js    # Razorpay integration
├── controllers/         # Request handlers
├── routes/              # API routes
├── middleware/          # Auth, validation, error handling
└── utils/               # Helper functions
```

## API Endpoints (Phase 1)

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Interview
- `POST /api/interview/start` - Start new interview
- `POST /api/interview/process-audio` - Process candidate audio
- `GET /api/interview/:id` - Get interview details
- `GET /api/interview/:id/status` - Check interview status

## Key Features

### Phase 1 (Current)
- User authentication with JWT
- GPT-4o-mini integration for question generation
- Deepgram Nova-2 for speech-to-text processing
- MongoDB models for users and interviews

### Upcoming Phases
- ElevenLabs text-to-speech integration
- WebSocket support for real-time communication
- Razorpay payment integration
- Interview analytics and evaluation

## API Design

All endpoints return JSON in this format:
```json
{
  "success": true|false,
  "data": {},
  "error": null|"error message",
  "timestamp": "ISO timestamp"
}
```

## Development Notes

- Uses ES Modules (import/export)
- Async/await for all async operations
- Error handling middleware for all routes
- Input validation on all endpoints
- JWT-based authentication
- CORS enabled for frontend development

## Debugging

- Set `NODE_ENV=development` for verbose logs
- Use `--experimental-modules` flag when needed
- Check MongoDB connection in logs during startup

## Dependencies

- Express.js: Web framework
- Mongoose: MongoDB ODM
- OpenAI SDK: GPT-4o-mini access
- Deepgram SDK: Speech-to-text
- ElevenLabs SDK: Text-to-speech
- Razorpay: Payment processing
- Socket.io: Real-time communication
- JWT: Authentication
- Helmet: Security headers
- CORS: Cross-origin resource sharing
