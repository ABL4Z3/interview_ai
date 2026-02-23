# Phase 1 API Testing Guide

## ✅ Current Status

- ✅ Backend Server Running on `http://localhost:3000`
- ✅ All Dependencies Installed
- ✅ Database Models Ready (User, Interview, Payment)
- ✅ Auth Routes: Register, Login, Refresh Token
- ✅ Interview Routes: Start, Get Status, Process Audio
- ✅ GPT-4o-mini Service Ready
- ✅ Deepgram Service Ready

## 🧪 Testing Phase 1 Endpoints

### Using cURL (Windows PowerShell)

#### 1. Health Check
```powershell
$response = Invoke-WebRequest -Uri "http://localhost:3000/api/health" -UseBasicParsing
$response.Content | ConvertFrom-Json | Format-Table
```

**Expected Response:**
```json
{
  "success": true,
  "message": "IntervuAI Backend is running",
  "timestamp": "2026-02-21T..."
}
```

---

#### 2. Register a New User

```powershell
$body = @{
    name = "John Doe"
    email = "john@example.com"
    password = "SecurePassword123"
} | ConvertTo-Json

$response = Invoke-WebRequest -Uri "http://localhost:3000/api/auth/register" `
  -Method POST `
  -Headers @{"Content-Type"="application/json"} `
  -Body $body `
  -UseBasicParsing

$data = $response.Content | ConvertFrom-Json
$data | Format-Table
$token = $data.data.token
Write-Host "✓ Token: $token"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com",
      "subscriptionPlan": "free"
    }
  },
  "message": "User registered successfully",
  "statusCode": 201
}
```

---

#### 3. Login User

```powershell
$body = @{
    email = "john@example.com"
    password = "SecurePassword123"
} | ConvertTo-Json

$response = Invoke-WebRequest -Uri "http://localhost:3000/api/auth/login" `
  -Method POST `
  -Headers @{"Content-Type"="application/json"} `
  -Body $body `
  -UseBasicParsing

$data = $response.Content | ConvertFrom-Json
$token = $data.data.token
Write-Host "✓ Login successful!"
Write-Host "Token: $token"
```

---

#### 4. Get Current User

```powershell
# First, save the token from login
$token = "YOUR_JWT_TOKEN_HERE"

$response = Invoke-WebRequest -Uri "http://localhost:3000/api/auth/me" `
  -Method GET `
  -Headers @{
      "Authorization"="Bearer $token"
      "Content-Type"="application/json"
  } `
  -UseBasicParsing

$response.Content | ConvertFrom-Json | Format-Table
```

---

#### 5. Start a New Interview

```powershell
$token = "YOUR_JWT_TOKEN_HERE"

$body = @{
    interviewType = "fullstack"
    difficultyLevel = "intermediate"
} | ConvertTo-Json

$response = Invoke-WebRequest -Uri "http://localhost:3000/api/interview/start" `
  -Method POST `
  -Headers @{
      "Authorization"="Bearer $token"
      "Content-Type"="application/json"
  } `
  -Body $body `
  -UseBasicParsing

$data = $response.Content | ConvertFrom-Json
$data.data | Format-Table
$interviewId = $data.data.interviewId
Write-Host "✓ Interview ID: $interviewId"
Write-Host "✓ First Question: $($data.data.question)"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "interviewId": "507f1f77bcf86cd799439012",
    "questionNumber": 1,
    "question": "What is the difference between SQL and NoSQL databases? Explain use cases for each.",
    "status": "in_progress"
  },
  "message": "Interview started successfully",
  "statusCode": 201
}
```

---

#### 6. Get Interview Details

```powershell
$token = "YOUR_JWT_TOKEN_HERE"
$interviewId = "YOUR_INTERVIEW_ID_HERE"

$response = Invoke-WebRequest -Uri "http://localhost:3000/api/interview/$interviewId" `
  -Method GET `
  -Headers @{
      "Authorization"="Bearer $token"
      "Content-Type"="application/json"
  } `
  -UseBasicParsing

$response.Content | ConvertFrom-Json | Format-Table
```

---

#### 7. Get Interview History

```powershell
$token = "YOUR_JWT_TOKEN_HERE"

$response = Invoke-WebRequest -Uri "http://localhost:3000/api/interview/user/history" `
  -Method GET `
  -Headers @{
      "Authorization"="Bearer $token"
      "Content-Type"="application/json"
  } `
  -UseBasicParsing

$response.Content | ConvertFrom-Json | Format-Table
```

---

## 📋 Testing Workflow

### Complete Testing Sequence

```powershell
# 1. Register user
$registerBody = @{
    name = "Test Candidate"
    email = "candidate@example.com"
    password = "TestPassword123"
} | ConvertTo-Json

$registerResp = Invoke-WebRequest -Uri "http://localhost:3000/api/auth/register" `
  -Method POST `
  -Headers @{"Content-Type"="application/json"} `
  -Body $registerBody -UseBasicParsing

$token = ($registerResp.Content | ConvertFrom-Json).data.token
Write-Host "✓ User registered. Token: $token"

# 2. Start interview
$interviewBody = @{
    interviewType = "backend"
    difficultyLevel = "intermediate"
} | ConvertTo-Json

$interviewResp = Invoke-WebRequest -Uri "http://localhost:3000/api/interview/start" `
  -Method POST `
  -Headers @{
      "Authorization"="Bearer $token"
      "Content-Type"="application/json"
  } `
  -Body $interviewBody -UseBasicParsing

$interview = $interviewResp.Content | ConvertFrom-Json
$interviewId = $interview.data.interviewId
Write-Host "✓ Interview started. ID: $interviewId"
Write-Host "Question: $($interview.data.question)"

# 3. Get interview details
$getResp = Invoke-WebRequest -Uri "http://localhost:3000/api/interview/$interviewId" `
  -Method GET `
  -Headers @{
      "Authorization"="Bearer $token"
      "Content-Type"="application/json"
  } -UseBasicParsing

Write-Host "✓ Interview details retrieved"
```

---

## 🔑 Important Notes

### JWT Token Handling

Store the token from login/register response and use it in the `Authorization` header:
```
Authorization: Bearer YOUR_TOKEN_HERE
```

### Error Responses

All errors follow this format:
```json
{
  "success": false,
  "message": "Error description",
  "statusCode": 400,
  "timestamp": "2026-02-21T..."
}
```

### Common HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Resource Created |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (no/invalid token) |
| 403 | Forbidden (no permission) |
| 404 | Not Found |
| 409 | Conflict (e.g., email already exists) |
| 500 | Server Error |

---

## 🧪 Using Postman

### Import Collection

1. Create a new Postman Collection called "IntervuAI Phase 1"
2. Create folders: Auth, Interview
3. Add requests:

**Auth → Register**
- Method: `POST`
- URL: `http://localhost:3000/api/auth/register`
- Body (JSON):
```json
{
  "name": "Test User",
  "email": "test@example.com",
  "password": "Password123"
}
```

**Auth → Login**
- Method: `POST`
- URL: `http://localhost:3000/api/auth/login`
- Body (JSON):
```json
{
  "email": "test@example.com",
  "password": "Password123"
}
```

**Auth → Get Me**
- Method: `GET`
- URL: `http://localhost:3000/api/auth/me`
- Headers:
  - `Authorization`: `Bearer {{token}}`

**Interview → Start**
- Method: `POST`
- URL: `http://localhost:3000/api/interview/start`
- Headers:
  - `Authorization`: `Bearer {{token}}`
- Body (JSON):
```json
{
  "interviewType": "fullstack",
  "difficultyLevel": "intermediate"
}
```

**Interview → Get Status**
- Method: `GET`
- URL: `http://localhost:3000/api/interview/{{interviewId}}`
- Headers:
  - `Authorization`: `Bearer {{token}}`

---

## 🐛 Troubleshooting

### Backend Not Responding

```powershell
# Check if server is running
$response = Invoke-WebRequest http://localhost:3000/api/health -UseBasicParsing -ErrorAction SilentlyContinue
if ($response.StatusCode -eq 200) {
    Write-Host "✓ Server is running"
} else {
    Write-Host "✗ Server is not running"
}
```

### Token Issues

- Token must be in `Authorization` header with `Bearer ` prefix
- Token expires in 7 days (JWT_EXPIRE env variable)
- Use `/api/auth/refresh` to get a new token

### Database Issues

If MongoDB isn't responding:
1. Check if MongoDB is running: `mongod`
2. Or use MongoDB Atlas connection string in `.env`
3. Verify `MONGODB_URI` is correct

---

## 📊 Next Steps for Phase 1

- [ ] **Complete Audio Processing**: Implement multipart form handling for audio uploads
- [ ] **Complete GPT Integration**: Test question generation and response evaluation
- [ ] **Complete Deepgram Integration**: Test audio transcription with real audio samples
- [ ] **Add Error Recovery**: Better error handling for API calls
- [ ] **Add Input Validation**: More robust validation middleware
- [ ] **Add Logging**: Request/response logging middleware
- [ ] **Write Unit Tests**: Jest tests for services

---

## 📚 Related Files

- Backend: `backend/src/index.js`
- Auth Routes: `backend/src/routes/auth.js`
- Interview Routes: `backend/src/routes/interview.js`
- Models: `backend/src/models/`
- Services: `backend/src/services/`

---

**Backend Status**: ✅ Running on http://localhost:3000
**Last Updated**: 2026-02-21
