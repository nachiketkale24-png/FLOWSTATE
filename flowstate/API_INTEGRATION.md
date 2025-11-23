# FlowState API Integration Guide

## 🔧 Setup

### 1. Environment Variables

Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Edit `.env` and set your backend URL:
```env
VITE_BACKEND_URL=http://localhost:3001
VITE_API_TIMEOUT=10000
VITE_API_DEBUG=true
```

### 2. Start Backend Server

```bash
cd backend
npm install
npm start
```

Backend will run on: **http://localhost:3001**

### 3. Start Frontend

```bash
cd flowstate
npm install
npm run dev
```

Frontend will run on: **http://localhost:5175**

---

## 📡 API Integration

### **Session Lifecycle**

1. **Start Session** (`POST /api/sessions/start`)
   - Called when: User clicks "Start Session"
   - Creates session in Firestore
   - Returns: `sessionId`

2. **Update Metrics** (`POST /api/sessions/:id/update`)
   - Called when: Every 5 seconds during active session
   - Uploads current metrics snapshot
   - Fire-and-forget (doesn't block UI)

3. **End Session** (`POST /api/sessions/:id/end`)
   - Called when: User ends session
   - Saves final metrics
   - Generates AI insights via Groq
   - Returns: Session summary + insights

---

## 🗂️ API Files

### **`src/api/config.js`**
- Base configuration
- API request wrapper with timeout
- Toast notifications
- Environment variable handling

### **`src/api/sessionApi.js`**
- `startSession()` - Create new session
- `updateSessionMetrics()` - Upload metrics
- `endSession()` - End session & get summary
- `getSession()` - Fetch session by ID
- `getUserSessions()` - Get user's session list
- `getUserStats()` - Get user statistics

### **`src/api/analyticsApi.js`**
- `getWeeklyAnalytics()` - Weekly performance data
- `getStaminaAnalytics()` - Stamina trends
- `analyzeFlowMetrics()` - Real-time flow analysis
- `getHourlyBreakdown()` - Peak productivity hours
- `getDistractionBreakdown()` - Distraction categories

### **`src/api/flowApi.js`**
- `generateInsights()` - AI-powered session insights
- `analyzeFlowState()` - Real-time flow recommendations
- `getRecommendations()` - Personalized tips
- `checkBackendHealth()` - Health check

---

## 🔄 FlowContext Integration

### **Session Start**
```javascript
const startSession = async () => {
  // ... reset metrics ...
  
  // Call backend API
  const response = await apiStartSession('demo-user', {
    timestamp: new Date().toISOString()
  });
  
  setCurrentSessionId(response.sessionId);
};
```

### **Metrics Upload** (Every 5 seconds)
```javascript
// Inside 1-second engine loop
if (now - lastMetricsUploadRef.current >= 5000) {
  updateSessionMetrics(currentSessionId, metrics).catch(...);
}
```

### **Session End**
```javascript
const endSession = async () => {
  // End session on backend
  const response = await apiEndSession(currentSessionId, metrics);
  
  // Get AI insights
  const insights = await generateInsights(metrics);
  
  setSessionInsights([...response.insights, ...insights]);
};
```

---

## 🧪 Testing

### **1. Check Backend Health**
```bash
curl http://localhost:3001/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2025-11-22T...",
  "services": {
    "firebase": "connected",
    "groq": "configured"
  }
}
```

### **2. Start a Session**
```bash
curl -X POST http://localhost:3001/api/sessions/start \
  -H "Content-Type: application/json" \
  -d '{"userId":"test-user"}'
```

### **3. Update Metrics**
```bash
curl -X POST http://localhost:3001/api/sessions/SESSION_ID/update \
  -H "Content-Type: application/json" \
  -d '{"metrics":{"flowScore":75,"typingCadence":65}}'
```

### **4. End Session**
```bash
curl -X POST http://localhost:3001/api/sessions/SESSION_ID/end \
  -H "Content-Type: application/json" \
  -d '{"finalMetrics":{"sessionDuration":1800,"flowScore":82}}'
```

---

## 🛡️ Error Handling

### **Graceful Degradation**
The app continues working even if backend is unavailable:

1. **Session start fails**: Local session continues
2. **Metrics upload fails**: Silent retry (logs warning)
3. **Insights generation fails**: Falls back to local AI
4. **Network timeout**: 10-second timeout with abort

### **Toast Notifications**
```javascript
showToast('Session started successfully', 'success');
showToast('Failed to connect to backend', 'error');
```

---

## 📊 Data Flow

```
User Action → FlowContext → API Layer → Backend
                ↓              ↓           ↓
           Local State ← Response ← Firebase/Groq
```

### **Upload Strategy**
- Session start: Immediate
- Metrics update: Batched (every 5s)
- Session end: Immediate + AI insights

---

## 🔐 Authentication (TODO)

Currently uses hardcoded `demo-user`. To add auth:

1. Install Firebase Auth or your auth provider
2. Get user ID from auth context
3. Replace `'demo-user'` in `startSession()`
4. Add auth token to API headers in `config.js`

---

## 🚀 Deployment

### **Environment Variables**
Set these in your hosting platform:

```env
VITE_BACKEND_URL=https://your-backend.com
VITE_API_TIMEOUT=10000
VITE_API_DEBUG=false
```

### **CORS Configuration**
Update backend `.env`:
```env
FRONTEND_URL=https://your-frontend.com
```

---

## 📝 API Response Format

All endpoints return:
```json
{
  "success": true | false,
  "message": "Human-readable message",
  "data": { ... },
  "error": "ErrorType" // Only on failure
}
```

---

## 🐛 Debugging

### **Enable API Logging**
```env
VITE_API_DEBUG=true
```

Check browser console for:
```
[API Request] POST http://localhost:3001/api/sessions/start
[API Response] http://localhost:3001/api/sessions/start {sessionId: "..."}
[API Error] http://localhost:3001/api/... NetworkError
```

### **Common Issues**

**Backend not responding**
```bash
# Check if backend is running
curl http://localhost:3001/health

# Check Firestore connection
# Ensure serviceAccount.json exists in backend/firebase/
```

**CORS errors**
```bash
# Update backend/.env
FRONTEND_URL=http://localhost:5175
```

**Timeout errors**
```env
# Increase timeout in frontend/.env
VITE_API_TIMEOUT=30000
```

---

## 📈 Next Steps

1. ✅ Basic session lifecycle working
2. ✅ Metrics upload every 5 seconds
3. ✅ AI insights generation
4. ⏳ Add authentication
5. ⏳ Connect AnalyticsPage to backend
6. ⏳ Connect HistoryPage to backend
7. ⏳ Real-time sync with WebSockets (optional)

---

## 🤝 Support

- Backend README: `backend/README_BACKEND.md`
- API Documentation: `backend/README_BACKEND.md#api-documentation`
- Frontend Docs: This file

For issues, check:
1. Backend logs: `npm start` output
2. Frontend console: Browser DevTools
3. Network tab: XHR requests
