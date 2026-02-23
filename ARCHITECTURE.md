# ARCHITECTURE.md - IntervuAI System Architecture & Design

## 🏗️ System Overview

IntervuAI is a monorepo project with a three-tier architecture:

```
┌──────────────────────────────────────────────────────────┐
│                    Frontend Layer                        │
│          (React.js + Vite + Tailwind CSS)                │
│     - Interview Room Interface                           │
│     - Audio Recording & Streaming                        │
│     - Real-time Transcription Display                    │
└────────────────────────┬─────────────────────────────────┘
                         │ REST API + WebSocket
┌────────────────────────▼─────────────────────────────────┐
│                    Backend Layer                         │
│           (Node.js + Express.js + Socket.io)             │
├──────────────────────────────────────────────────────────┤
│  Controllers & Routes                                    │
│  - Auth Routes → Authentication                          │
│  - Interview Routes → Interview Management               │
│  - Payment Routes → Billing                              │
├──────────────────────────────────────────────────────────┤
│  Services (Business Logic)                               │
│  - GPT Service (Question Generation & Evaluation)        │
│  - Deepgram Service (Speech-to-Text)                     │
│  - ElevenLabs Service (Text-to-Speech)                   │
│  - Payment Service (Razorpay Integration)                │
├──────────────────────────────────────────────────────────┤
│  Middleware                                              │
│  - Authentication (JWT)                                  │
│  - Error Handling                                        │
│  - Request Validation                                    │
│  - CORS & Security                                       │
│  - Logging                                               │
└────────────────────────┬─────────────────────────────────┘
                         │ Mongoose ODM
┌────────────────────────▼─────────────────────────────────┐
│                    Data Layer                            │
│              (MongoDB + Mongoose)                        │
│  Collections:                                            │
│  - Users                                                 │
│  - Interviews                                            │
│  - Payments                                              │
│  - Sessions                                              │
└──────────────────────────────────────────────────────────┘
```

## 📊 Data Models

### User Model
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed),
  phone: String,
  profilePicture: String,
  
  // Subscription
  subscriptionPlan: 'free' | 'starter' | 'growth',
  subscriptionActive: Boolean,
  subscriptionEndDate: Date,
  
  // Interview tracking
  totalInterviews: Number,
  interviewsRemaining: Number,
  
  // Payment
  razorpayCustomerId: String,
  
  // Metadata
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Interview Model
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  
  // Metadata
  title: String,
  interviewType: 'frontend' | 'backend' | 'fullstack' | 'devops' | 'data-science',
  difficultyLevel: 'beginner' | 'intermediate' | 'advanced',
  
  // Status
  status: 'not_started' | 'in_progress' | 'completed' | 'cancelled',
  startedAt: Date,
  completedAt: Date,
  
  // Questions & Responses
  questions: [{
    questionNumber: Number,
    questionText: String,
    generatedAt: Date,
    candidateResponse: String,
    responseReceivedAt: Date,
    aiEvaluation: {
      score: Number (0-100),
      feedback: String,
      followUpQuestion: String
    }
  }],
  
  // Results
  totalQuestions: Number,
  questionsAnswered: Number,
  overallScore: Number,
  summary: String,
  
  // Billing
  isPaid: Boolean,
  paymentId: String,
  amountPaid: Number,
  
  // Timestamps
  createdAt: Date,
  updatedAt: Date
}
```

### Payment Model
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  
  // Razorpay
  razorpayPaymentId: String,
  razorpayOrderId: String,
  razorpaySignature: String,
  
  // Transaction
  transactionType: 'subscription' | 'single_interview',
  amount: Number,
  currency: String,
  
  // Details
  subscriptionPlan: String,
  subscriptionDuration: Number,
  interviewId: ObjectId,
  
  // Status
  status: 'pending' | 'completed' | 'failed' | 'refunded',
  
  createdAt: Date,
  updatedAt: Date
}
```

## 🔄 Interview Flow

```
START INTERVIEW
    ↓
[Generate First Question]
    ├─ Call GPT-4o-mini
    ├─ Generate contextual question
    └─ Store in Interview.questions
    ↓
[Display Question to Candidate]
    └─ Send via WebSocket/REST
    ↓
[Candidate Responds via Audio]
    ├─ Browser captures audio
    ├─ Sends compressed audio to backend
    └─ Store raw audio
    ↓
[Process Audio]
    ├─ Decompress audio
    ├─ Send to Deepgram Nova-2
    ├─ Receive transcript
    └─ Store transcript
    ↓
[Evaluate Response]
    ├─ Send to GPT-4o-mini with context
    ├─ Get score, feedback, follow-up
    └─ Store evaluation
    ↓
↱ REPEAT? ↲
│   ├─ If < 10 questions: Generate next
│   └─ If >= 10 questions: Finalize
    ↓
[Generate Interview Summary]
    ├─ Compile all Q&A
    ├─ Call GPT for summary
    └─ Calculate final score
    ↓
[Store Results]
    ├─ Save to MongoDB
    ├─ Mark interview as completed
    └─ Update user interview count
    ↓
INTERVIEW COMPLETE
```

## 🔌 API Architecture

### REST Endpoints

**Authentication**
```
POST   /api/auth/register          Register new user
POST   /api/auth/login             Login user
GET    /api/auth/me                Get current user
POST   /api/auth/refresh           Refresh JWT token
POST   /api/auth/logout            Logout user
```

**Interview Management**
```
POST   /api/interview/start        Start new interview
GET    /api/interview/:id          Get interview details
GET    /api/interview/user/history Get user's interviews
POST   /api/interview/:id/process-audio  Process candidate audio
PUT    /api/interview/:id/evaluate      Evaluate response
GET    /api/interview/:id/status       Get interview status
```

**Payment**
```
POST   /api/payment/create-order   Create Razorpay order
POST   /api/payment/verify         Verify payment
GET    /api/payment/history        Get payment history
POST   /api/subscription/upgrade   Upgrade subscription
```

**Health**
```
GET    /api/health                 API health check
```

### WebSocket Events

**From Client**
```
audio:chunk              Send audio chunk
interview:start         Start interview request
interview:answer        Submit candidate answer
interview:end           End interview
```

**From Server**
```
question:new            New question sent
transcript:update       Real-time transcription
evaluation:complete     Response evaluation done
interview:complete      Interview finished
error:occurred          Error notification
```

## 🔐 Security Architecture

### Authentication Flow

```
CLIENT                               SERVER
  │                                    │
  ├─── POST /auth/login ────────────>│
  │  {email, password}               │
  │                                  ├─ Hash password with bcryptjs
  │                                  ├─ Compare with DB
  │                                  │
  │<────── JWT Token ─────────────────┤
  │                                   │
  ├─── API Request + Token ────────>│
  │  {Authorization: Bearer JWT}     │
  │                                  ├─ Verify JWT signature
  │                                  ├─ Check expiration
  │                                  ├─ Extract user info
  │                                  │
  │<────── Protected Response ────────┤
```

### Security Headers
- Helmet.js for HTTP security headers
- CORS configured for frontend origin only
- JWT tokens with expiration
- Password hashing with bcryptjs (salt rounds: 10)
- Rate limiting (to be added)
- Input validation with express-validator

## 🚀 Deployment Architecture

### Development Environment
```
Local Machine
├── Backend (localhost:3000)
│   └── MongoDB (localhost:27017)
└── Frontend (localhost:5173)
```

### Production Environment
```
Cloud Deployment (AWS/GCP/Heroku)
├── Frontend (CDN/Static Hosting)
│   └── Vercel or Netlify
├── Backend (Container/Server)
│   ├── Docker container
│   ├── Node.js process manager (PM2)
│   └── Environment variables (secure)
└── Database
    ├── MongoDB Atlas (managed)
    └── Backups & replication
```

### Docker Architecture
```dockerfile
# Backend
FROM node:18-alpine
WORKDIR /app
COPY backend/ .
RUN npm install --production
EXPOSE 3000
CMD ["npm", "start"]

# Frontend
FROM node:18-alpine as build
WORKDIR /app
COPY frontend/ .
RUN npm install && npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
```

## 🔧 Technology Stack Details

### Frontend
- **React 18** - UI library with hooks
- **Vite** - Fast build tool & dev server
- **Tailwind CSS** - Utility-first styling
- **React Router** - Client-side routing
- **Zustand** - Lightweight state management
- **Axios** - HTTP client with interceptors
- **Socket.io Client** - Real-time communication
- **Lucide React** - Icon library

### Backend
- **Node.js 18+** - Runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM & validation
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **OpenAI SDK** - GPT-4o-mini integration
- **Deepgram SDK** - Speech-to-text
- **ElevenLabs SDK** - Text-to-speech
- **Razorpay SDK** - Payment processing
- **Socket.io** - WebSocket communication
- **Helmet** - Security headers
- **CORS** - Cross-origin support
- **express-validator** - Input validation

## 📈 Scalability Considerations

### Horizontal Scaling
- Stateless backend (can run multiple instances)
- Load balancer (NGINX/HAProxy)
- Database replication (MongoDB)
- Redis for caching (future)

### Vertical Scaling
- Optimize database queries with indices
- Implement pagination for large datasets
- Cache frequently accessed data
- Lazy load images and assets

### Performance
- API response time < 500ms
- Database query optimization
- Audio streaming in chunks
- Frontend code splitting with Vite

## 🔄 CI/CD Pipeline (Phase 5)

```
Push to GitHub
    ↓
Trigger GitHub Actions
    ├─ Run tests
    ├─ Lint code
    ├─ Build backend
    ├─ Build frontend
    └─ Run security scan
    ↓
Build Docker Image
    ├─ Backend image
    └─ Frontend image
    ↓
Push to Registry
    └─ Docker Hub
    ↓
Deploy to Production
    ├─ Backend service
    └─ Frontend service
    ↓
Smoke Tests
    └─ Verify endpoints
    ↓
LIVE
```

## 📊 Monitoring & Logging (Phase 5)

### Logging Strategy
- Backend: Winston or Pino
- Frontend: Custom error boundary
- Database: MongoDB logs
- Errors: Sentry or similar

### Metrics to Track
- API response times
- Error rates
- User registration rate
- Interview completion rate
- Payment success rate
- Database query performance

## 🔄 Error Handling Strategy

```javascript
// Global error hierarchy
ApiError (Custom)
  ├─ Validation Error (400)
  ├─ Authentication Error (401)
  ├─ Authorization Error (403)
  ├─ Not Found Error (404)
  ├─ Conflict Error (409)
  └─ Server Error (500)

// All errors caught by middleware
// Response format:
{
  success: false,
  message: "Error description",
  error: {} // dev only,
  timestamp: ISO
}
```

## 🎯 Design Patterns Used

1. **MVC Pattern** - Separation of concerns
2. **Service Layer** - Business logic isolation
3. **Middleware Pattern** - Request processing pipeline
4. **Singleton Pattern** - Database connections
5. **Factory Pattern** - Service creation
6. **Observer Pattern** - WebSocket events
7. **Decorator Pattern** - JWT verification

## 📚 Configuration Management

```
Code Base
├── Node Environment (development/production)
├── Feature Flags
└── Feature Toggles

Environment Variables
├── .env.development
├── .env.staging
└── .env.production
```

---

This architecture is designed to be:
- **Scalable** - Handle growth from MVP to 10K+ users
- **Maintainable** - Clear separation of concerns
- **Secure** - Industry-standard security practices
- **Flexible** - Easy to add new features
- **Testable** - Modular, unit-testable components
