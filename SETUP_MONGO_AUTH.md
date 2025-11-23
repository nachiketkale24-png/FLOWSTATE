# FlowState - MongoDB & JWT Auth Setup Guide

## 🚀 Complete Setup Instructions

### Prerequisites
- Node.js 18+ installed
- MongoDB installed and running (or MongoDB Atlas account)
- npm or yarn package manager

---

## Backend Setup

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure MongoDB
Create a `.env` file in the `backend` directory:

```env
# MongoDB Configuration
MONGO_URI=mongodb://localhost:27017/flowstate
# OR for MongoDB Atlas:
# MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/flowstate

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-to-something-random
JWT_EXPIRES_IN=7d

# Server Configuration
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Optional: Groq AI API Key
GROQ_API_KEY=your-groq-api-key-here

# Optional: Google OAuth (not implemented yet)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

**Important:** Change the `JWT_SECRET` to a long random string for production!

### 3. Start MongoDB
If using local MongoDB:
```bash
# Windows
net start MongoDB

# Mac/Linux
sudo systemctl start mongod
# or
brew services start mongodb-community
```

### 4. Start Backend Server
```bash
npm run dev
```

The backend should start on `http://localhost:3001`

You should see:
```
✅ MongoDB Connected Successfully
✅ Achievements initialized
🚀 FlowState Backend Server Started (MongoDB Edition)
📍 Server running on: http://localhost:3001
```

---

## Frontend Setup

### 1. Install Dependencies
```bash
cd flowstate
npm install
```

### 2. Configure Environment
Create/update `.env` file in the `flowstate` directory:

```env
VITE_BACKEND_URL=http://localhost:3001
```

### 3. Start Frontend
```bash
npm run dev
```

The frontend should start on `http://localhost:5173`

---

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Sessions
- `POST /api/sessions/start` - Start flow session
- `POST /api/sessions/:id/update` - Update session metrics
- `POST /api/sessions/:id/end` - End session
- `GET /api/sessions/:id` - Get session by ID

### User
- `GET /api/users/sessions` - Get user's sessions
- `GET /api/users/stats` - Get user statistics

### Goals
- `POST /api/goals` - Create goal
- `GET /api/goals` - Get all goals
- `GET /api/goals/:id` - Get goal by ID
- `PUT /api/goals/:id` - Update goal
- `POST /api/goals/:id/progress` - Update progress
- `DELETE /api/goals/:id` - Delete goal

### Achievements
- `GET /api/achievements` - Get all achievements
- `GET /api/achievements/user` - Get user achievements
- `POST /api/achievements/unlock` - Unlock achievement

### Planner
- `POST /api/planner/blocks` - Create planner block
- `GET /api/planner/blocks` - Get planner blocks
- `GET /api/planner/blocks/:id` - Get block by ID
- `PUT /api/planner/blocks/:id` - Update block
- `DELETE /api/planner/blocks/:id` - Delete block

### AI Assistant
- `POST /api/ai/message` - Send message to AI

### Analysis
- `POST /api/analysis/flow` - Analyze flow metrics
- `POST /api/analysis/insights` - Generate insights

---

## 🔐 Authentication Flow

### Registration
```javascript
POST /api/auth/register
{
  "email": "user@example.com",
  "password": "securepassword",
  "displayName": "John Doe"
}

Response:
{
  "success": true,
  "data": {
    "user": { ... },
    "token": "jwt-token-here"
  }
}
```

### Login
```javascript
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "securepassword"
}

Response:
{
  "success": true,
  "data": {
    "user": { ... },
    "token": "jwt-token-here"
  }
}
```

### Protected Requests
Include JWT token in Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

Or the token is automatically sent via httpOnly cookie.

---

## 💾 Database Schema

### User Collection
```javascript
{
  email: String (unique),
  password: String (hashed),
  displayName: String,
  photoURL: String,
  authProvider: 'email' | 'google',
  stats: {
    totalSessions: Number,
    totalFlowTime: Number,
    avgFlowScore: Number,
    bestFlowScore: Number,
    currentStreak: Number,
    longestStreak: Number
  },
  createdAt: Date
}
```

### Session Collection
```javascript
{
  userId: ObjectId (ref: User),
  startTime: Date,
  endTime: Date,
  sessionDuration: Number,
  status: 'active' | 'paused' | 'completed',
  flowState: String,
  flowScore: Number,
  metrics: {
    attention: Number,
    stamina: Number,
    focus: Number,
    arousal: Number
  },
  metricsHistory: Array,
  insights: [String]
}
```

### Goal Collection
```javascript
{
  userId: ObjectId (ref: User),
  title: String,
  description: String,
  type: 'daily' | 'weekly' | 'monthly' | 'custom',
  target: { value: Number, unit: String },
  current: Number,
  progress: Number (0-100),
  status: 'active' | 'completed' | 'failed' | 'archived',
  startDate: Date,
  endDate: Date
}
```

### Achievement Collection
```javascript
{
  key: String (unique),
  title: String,
  description: String,
  icon: String,
  category: String,
  requirement: { type: String, value: Number },
  points: Number,
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
}
```

### UserAchievement Collection
```javascript
{
  userId: ObjectId (ref: User),
  achievementKey: String,
  unlockedAt: Date,
  progress: Number,
  isCompleted: Boolean
}
```

---

## 🧪 Testing

### Test Backend Health
```bash
curl http://localhost:3001/health
```

### Test Registration
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123","displayName":"Test User"}'
```

### Test Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

---

## 🔧 Troubleshooting

### MongoDB Connection Failed
- Ensure MongoDB is running: `mongod --version`
- Check MONGO_URI in .env file
- For MongoDB Atlas, whitelist your IP address

### JWT Token Issues
- Verify JWT_SECRET is set in .env
- Check token expiration (default: 7 days)
- Clear browser localStorage and re-login

### CORS Errors
- Ensure FRONTEND_URL matches your frontend port
- Check backend CORS configuration in server.js

### Port Already in Use
```bash
# Windows
netstat -ano | findstr :3001
taskkill /PID <pid> /F

# Mac/Linux
lsof -ti:3001 | xargs kill -9
```

---

## 🚀 Production Deployment

### Backend
1. Set `NODE_ENV=production` in .env
2. Use strong JWT_SECRET (32+ random characters)
3. Use MongoDB Atlas or secure MongoDB instance
4. Enable HTTPS
5. Set proper CORS origins
6. Add rate limiting middleware

### Frontend
1. Build production bundle: `npm run build`
2. Set VITE_BACKEND_URL to production API URL
3. Deploy to Vercel, Netlify, or similar

---

## 📝 Notes

- All passwords are hashed with bcrypt
- JWT tokens expire after 7 days (configurable)
- Sessions auto-calculate duration and progress
- Achievements are auto-initialized on server start
- MongoDB indexes are created automatically

---

## 🆘 Support

For issues or questions:
1. Check console logs (backend terminal)
2. Check browser DevTools console (frontend)
3. Verify MongoDB connection
4. Ensure all environment variables are set

---

**Happy Coding! 🎉**
