# FlowState Backend API

Production-ready Express backend with Firebase, Groq AI, and real-time session tracking.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- Firebase project with Firestore enabled
- Groq API key (optional, for AI features)

### Installation

```bash
cd backend
npm install
```

### Configuration

1. **Create `.env` file:**
```bash
cp .env.example .env
```

2. **Edit `.env` with your credentials:**
```env
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5175

# Groq API (get key from https://console.groq.com/keys)
GROQ_API_KEY=gsk_your_actual_groq_api_key_here

# AI Configuration
AI_MODEL=llama-3.1-70b-versatile
AI_TEMPERATURE=0.7
AI_MAX_TOKENS=500
```

3. **Add Firebase Service Account:**

- Go to [Firebase Console](https://console.firebase.google.com)
- Select your project → Project Settings → Service Accounts
- Click "Generate New Private Key"
- Save the downloaded file as `backend/firebase/serviceAccount.json`

### Run the Server

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

Server will start on: **http://localhost:3001**

---

## 📚 API Documentation

### Base URL
```
http://localhost:3001/api
```

All responses follow this format:
```json
{
  "success": true | false,
  "message": "Human-readable message",
  "data": { ... },
  "error": "ErrorType" // Only on failure
}
```

---

## 🎯 Session Management

### Start Session
**POST** `/api/sessions/start`

Start a new flow tracking session.

**Request:**
```json
{
  "userId": "user123",
  "initialData": {
    "goal": "Deep work on project X"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Session started successfully",
  "data": {
    "sessionId": "abc123...",
    "userId": "user123",
    "status": "active",
    "startTime": "2025-11-22T10:30:00.000Z"
  }
}
```

---

### Update Session
**POST** `/api/sessions/:id/update`

Update session with real-time metrics (call every 1-5 seconds).

**Request:**
```json
{
  "metrics": {
    "typingCadence": 65,
    "activeRatio": 0.85,
    "flowScore": 78,
    "flowState": "FLOW",
    "sessionDuration": 180,
    "flowDuration": 120,
    "blockedCount": 2
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Session updated successfully",
  "data": {
    "sessionId": "abc123...",
    "metricsCount": 45
  }
}
```

---

### End Session
**POST** `/api/sessions/:id/end`

End session and generate AI insights.

**Request:**
```json
{
  "finalMetrics": {
    "sessionDuration": 1800,
    "flowDuration": 1200,
    "flowScore": 82,
    "staminaScore": 75,
    "blockedCount": 3
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Session ended successfully",
  "data": {
    "sessionId": "abc123...",
    "sessionDuration": 1800,
    "flowDuration": 1200,
    "flowScore": 82,
    "insights": [
      "🔥 Exceptional focus! You maintained flow for 20 minutes.",
      "💪 Your stamina is strong - you can handle longer sessions.",
      "🚫 Blocked 3 distractions. Your awareness is improving!"
    ]
  }
}
```

---

### Get Session
**GET** `/api/sessions/:id`

Retrieve session details by ID.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "abc123...",
    "userId": "user123",
    "status": "completed",
    "sessionDuration": 1800,
    "flowScore": 82,
    "insights": [...],
    "metrics": [...]
  }
}
```

---

## 🤖 AI Analysis

### Analyze Flow
**POST** `/api/analysis/flow`

Analyze flow metrics using hybrid (rule-based + AI) approach.

**Request:**
```json
{
  "metrics": {
    "typingCadence": 65,
    "activeRatio": 0.85,
    "prevFlowScore": 70,
    "flowState": "MONITORING"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "flowScore": 78,
    "fatigueScore": 25,
    "distractionRisk": 18,
    "isFlowLikely": true,
    "shouldExitFlow": false,
    "analysisMethod": "hybrid"
  }
}
```

---

### Generate Insights
**POST** `/api/analysis/insights`

Generate AI-powered insights from session data.

**Request:**
```json
{
  "sessionData": {
    "sessionDuration": 1800,
    "flowDuration": 1200,
    "staminaScore": 75,
    "flowScore": 82,
    "blockedCount": 3
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "insights": [
      "Excellent focus session!",
      "Your stamina is strong.",
      "Consider longer sessions."
    ],
    "count": 3,
    "sessionSummary": {
      "duration": "30m 0s",
      "flowTime": "20m 0s",
      "flowPercentage": 67
    }
  }
}
```

---

## 👤 User Management

### Get User Sessions
**GET** `/api/users/:id/sessions?limit=50`

Get all sessions for a user.

**Response:**
```json
{
  "success": true,
  "data": {
    "userId": "user123",
    "sessions": [
      {
        "id": "abc123...",
        "startTime": "2025-11-22T10:30:00Z",
        "sessionDuration": 1800,
        "flowScore": 82
      }
    ],
    "count": 15
  }
}
```

---

### Get User Statistics
**GET** `/api/users/:id/stats`

Get aggregated user statistics.

**Response:**
```json
{
  "success": true,
  "data": {
    "userId": "user123",
    "totalSessions": 15,
    "totalFlowTime": 18000,
    "totalFlowTimeFormatted": "5h 0m",
    "averageFlowScore": 78,
    "averageStamina": 72,
    "totalDistractions": 23,
    "flowEfficiency": 65,
    "lastSession": {
      "id": "abc123...",
      "startTime": "2025-11-22T10:30:00Z",
      "duration": 1800
    }
  }
}
```

---

## 🔧 Utility Endpoints

### Health Check
**GET** `/health`

Check backend health and service status.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-11-22T12:00:00.000Z",
  "uptime": 3600,
  "environment": "development",
  "services": {
    "firebase": "connected",
    "groq": "configured"
  }
}
```

---

## 🗄️ Firestore Schema

### Collections

#### `sessions`
```json
{
  "id": "auto-generated",
  "userId": "string",
  "status": "active | completed",
  "flowState": "IDLE | MONITORING | FLOW",
  "startTime": "timestamp",
  "endTime": "timestamp | null",
  "sessionDuration": "number (seconds)",
  "flowDuration": "number (seconds)",
  "flowScore": "number (0-100)",
  "staminaScore": "number (0-100)",
  "blockedCount": "number",
  "insights": ["string"],
  "metrics": [
    {
      "timestamp": "ISO string",
      "typingCadence": "number (WPM)",
      "activeRatio": "number (0-1)",
      "flowScore": "number (0-100)",
      "flowState": "string"
    }
  ],
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

---

## 🧪 Testing

### Manual Testing

```bash
# Start session
curl -X POST http://localhost:3001/api/sessions/start \
  -H "Content-Type: application/json" \
  -d '{"userId":"test123"}'

# Update session
curl -X POST http://localhost:3001/api/sessions/SESSION_ID/update \
  -H "Content-Type: application/json" \
  -d '{"metrics":{"typingCadence":65,"activeRatio":0.85}}'

# End session
curl -X POST http://localhost:3001/api/sessions/SESSION_ID/end \
  -H "Content-Type: application/json" \
  -d '{"finalMetrics":{"sessionDuration":1800,"flowDuration":1200}}'
```

---

## 🔒 Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | 3001 | Server port |
| `NODE_ENV` | No | development | Environment mode |
| `FRONTEND_URL` | No | http://localhost:5175 | Frontend CORS origin |
| `GROQ_API_KEY` | Yes* | - | Groq API key for AI features |
| `AI_MODEL` | No | llama-3.1-70b-versatile | AI model name |
| `AI_TEMPERATURE` | No | 0.7 | AI creativity (0-1) |
| `AI_MAX_TOKENS` | No | 500 | Max AI response tokens |
| `LOG_LEVEL` | No | info | Log level (debug/info/warn/error) |

\* Required for AI features (insights, flow analysis). Backend works without it using rule-based logic.

---

## 📁 Project Structure

```
backend/
├── server.js                 # Express app entry point
├── package.json              # Dependencies
├── .env                      # Environment variables
├── firebase/
│   ├── admin.js             # Firebase Admin initialization
│   ├── firestore.js         # Firestore CRUD operations
│   └── serviceAccount.json  # Firebase credentials (gitignored)
├── routes/
│   ├── sessionRoutes.js     # Session endpoints
│   ├── analysisRoutes.js    # AI analysis endpoints
│   └── userRoutes.js        # User management endpoints
├── controllers/
│   ├── sessionController.js # Session business logic
│   ├── analysisController.js# AI analysis logic
│   └── userController.js    # User statistics logic
├── ai/
│   ├── groqClient.js        # Groq API integration
│   ├── flowAnalysis.js      # Hybrid flow analysis
│   ├── insightsGenerator.js # Insights generation
│   └── flowiseClient.js     # Flowise placeholder
└── utils/
    ├── validateSession.js   # Input validation
    ├── calculateMetrics.js  # Metrics calculations
    └── logger.js            # Structured logging
```

---

## 🐛 Troubleshooting

### Firebase Connection Failed
```
Error: Firebase service account not found
```
**Solution:** Add `serviceAccount.json` to `backend/firebase/` directory.

### Groq API Errors
```
Error: GROQ_API_KEY not configured
```
**Solution:** Add `GROQ_API_KEY` to `.env` file. Backend will fallback to rule-based logic if missing.

### CORS Errors
```
Access-Control-Allow-Origin error
```
**Solution:** Update `FRONTEND_URL` in `.env` to match your frontend URL.

### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::3001
```
**Solution:** Change `PORT` in `.env` or kill the process using port 3001.

---

## 📈 Performance

- **Rule-based analysis:** <1ms
- **Groq AI analysis:** 200-500ms (with llama-3.1-70b)
- **Session updates:** ~10ms (Firestore write)
- **Insights generation:** 300-800ms (with AI)

---

## 🚀 Deployment

### Deploy to Railway/Render/Fly.io

1. Add environment variables in dashboard
2. Add `serviceAccount.json` as secret file
3. Deploy with: `npm start`

### Deploy to Vercel (Serverless)

Not recommended - requires refactoring to serverless functions.

---

## 📝 License

MIT License - See LICENSE file for details.

---

## 🤝 Support

For issues or questions:
- Check troubleshooting section above
- Review Firestore logs in Firebase Console
- Check server logs for detailed error messages

---

**Built with:** Express, Firebase Admin SDK, Groq AI, Node.js 18+