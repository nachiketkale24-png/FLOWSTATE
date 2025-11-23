# FlowState Multi-User Authentication Setup Guide

## Overview
FlowState has been successfully converted into a fully functional multi-user product with Firebase authentication and user-specific data storage.

---

## 🚀 What's Been Implemented

### Backend Changes

#### 1. **Authentication Middleware** (`backend/middleware/authMiddleware.js`)
- `verifyFirebaseToken()` - Validates Firebase ID tokens and attaches `req.user` to requests
- `optionalAuth()` - Optional authentication for flexible routes
- `requireEmailVerified()` - Enforces email verification
- Returns 401 on authentication failures with detailed error messages

#### 2. **Protected Routes** (`backend/server.js`)
All API routes now require authentication:
```javascript
app.use('/api/sessions', verifyFirebaseToken, sessionRoutes);
app.use('/api/analysis', verifyFirebaseToken, analysisRoutes);
app.use('/api/users', verifyFirebaseToken, userRoutes);
```

#### 3. **User-Based Firestore Structure** (`backend/firebase/firestore.js`)
New collection hierarchy:
```
users/{userId}/
  ├── profile: { email, displayName, createdAt, lastLoginAt }
  ├── settings/
  │   └── preferences: { flowThresholds, distractionBlocking, notifications }
  └── sessions/{sessionId}: { startTime, endTime, metrics, insights... }
```

**New Functions:**
- `createOrUpdateUserProfile()` - Sync user profile on login
- `getUserProfile()` - Get user profile
- `getUserSettings()` - Get user-specific settings
- `updateUserSettings()` - Update user preferences

**Updated Functions (now user-aware):**
- `saveSession(userId, data)` - Creates session under `users/{uid}/sessions`
- `updateSession(userId, sessionId, updates)` - Updates user's session
- `endSession(userId, sessionId, finalData)` - Finalizes user's session
- `getUserSessions(userId, limit)` - Fetches user's session history
- `getSession(userId, sessionId)` - Gets specific session for user
- `getUserStats(userId)` - Calculates user statistics

#### 4. **Updated Controllers**
**sessionController.js:**
- Uses `req.user.uid` from auth middleware (no more manual userId in body)
- `startSession()` - Creates session for authenticated user
- `updateSessionMetrics()` - Updates metrics for user's session
- `endSessionWithSummary()` - Ends session and generates AI insights
- `getSessionById()` - Retrieves session details

**userController.js:**
- `syncUserProfile()` - POST `/api/users/sync` - Syncs Firebase Auth user with Firestore
- `getUserSessionsList()` - GET `/api/users/sessions` - Returns authenticated user's sessions
- `getUserStatistics()` - GET `/api/users/stats` - Returns aggregated stats
- `getSettings()` - GET `/api/users/settings` - Returns user preferences
- `updateSettings()` - POST `/api/users/settings` - Updates user preferences

#### 5. **Updated Routes** (`backend/routes/userRoutes.js`)
New endpoints (all protected):
```
POST   /api/users/sync      - Sync user profile after login
GET    /api/users/sessions  - Get authenticated user's sessions
GET    /api/users/stats     - Get authenticated user's statistics
GET    /api/users/settings  - Get user settings
POST   /api/users/settings  - Update user settings
```

---

### Frontend Changes

#### 1. **Firebase Client Setup** (`src/lib/firebaseClient.js`)
- Initializes Firebase with environment variables
- Exports `auth` and `db` instances
- Supports Firebase Emulator for development

#### 2. **AuthContext** (`src/context/AuthContext.jsx`)
Manages authentication state globally:
- `authUser` - Current user object `{ uid, email, displayName, photoURL }`
- `loading` - Authentication loading state
- `signUp(email, password, displayName)` - Create new account
- `signIn(email, password)` - Login with email/password
- `signInWithGoogle()` - Google OAuth login
- `signOut()` - Logout user
- `getIdToken()` - Get current user's ID token
- Auto-syncs user profile with backend on login

#### 3. **Route Guards**
**ProtectedRoute** (`src/components/ProtectedRoute.jsx`):
- Redirects to `/auth` if not logged in
- Shows loading spinner while checking auth
- Wraps all protected pages

**PublicOnlyRoute** (`src/components/PublicOnlyRoute.jsx`):
- Redirects to `/dashboard` if already logged in
- Used for Home and AuthPage

#### 4. **AuthPage** (`src/pages/AuthPage.jsx`)
Beautiful glassmorphic login/register page:
- Tabbed interface (Login / Create Account)
- Email + Password authentication
- Google Sign-In button
- Input validation with error messages
- Responsive design matching app theme

#### 5. **Authorized API Client** (`src/api/client.js`)
Handles all backend communication:
- `authorizedFetch(url, options)` - Adds Firebase ID token to headers
- `get(url)` - GET request helper
- `post(url, body)` - POST request helper
- `put(url, body)` - PUT request helper
- `del(url)` - DELETE request helper
- `parseResponse(response)` - JSON parsing with error handling

#### 6. **Updated Session API** (`src/api/sessionApi.js`)
All functions now use `authorizedFetch()`:
- `startSession(initialData)` - No userId needed (from token)
- `updateSessionMetrics(sessionId, metrics)` - Update with auth
- `endSession(sessionId, finalMetrics)` - End with auth
- `getSession(sessionId)` - Get with auth
- `getUserSessions(limit)` - Get authenticated user's sessions
- `getUserStats()` - Get authenticated user's stats
- `getUserSettings()` - Get user preferences
- `updateUserSettings(settings)` - Update preferences

#### 7. **Updated App Routing** (`src/App.jsx`)
```javascript
<BrowserRouter>
  <AuthProvider>  {/* Wraps entire app */}
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<PublicOnlyRoute><HomePage /></PublicOnlyRoute>} />
      <Route path="/auth" element={<PublicOnlyRoute><AuthPage /></PublicOnlyRoute>} />
      
      {/* Protected Routes */}
      <Route path="/dashboard" element={<ProtectedRoute><FlowProvider>...</FlowProvider></ProtectedRoute>} />
      <Route path="/analytics" element={<ProtectedRoute>...</ProtectedRoute>} />
      <Route path="/assistant" element={<ProtectedRoute>...</ProtectedRoute>} />
      <Route path="/history" element={<ProtectedRoute>...</ProtectedRoute>} />
      <Route path="/reports" element={<ProtectedRoute>...</ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute>...</ProtectedRoute>} />
    </Routes>
  </AuthProvider>
</BrowserRouter>
```

**FlowProvider** now lives *inside* protected routes (only active for logged-in users).

#### 8. **Updated HomePage** (`src/pages/HomePage.jsx`)
- Auto-redirects to `/dashboard` if user is already logged in
- "Get Started" button now routes to `/auth` (not `/dashboard`)
- Shows loading state while checking authentication

#### 9. **Updated Navigation** (`src/components/Navigation.jsx`)
Displays user information:
- **User Avatar** - Initials in gradient circle
- **User Info** - Name and email in sidebar (when expanded)
- **Logout Button** - Sign out with confirmation
- Shows collapsed avatar when sidebar minimized

#### 10. **FlowContext Backend Integration** (`src/context/FlowContext.jsx`)
- Removed hardcoded `'demo-user'` userId
- `startSession()` now calls backend API without userId (uses auth token)
- Metrics automatically upload to backend every 5 seconds
- Session insights fetched from backend on session end

---

## 📋 Setup Instructions

### 1. Install Firebase SDK

In the **frontend** directory:
```bash
cd flowstate
npm install firebase
```

### 2. Configure Firebase Environment Variables

Create `.env` file in `flowstate/` directory:
```env
# Backend API
VITE_BACKEND_URL=http://localhost:3001

# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Optional: Use Firebase Emulator (development)
VITE_USE_FIREBASE_EMULATOR=false
```

**Get Firebase credentials:**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to Project Settings → General
4. Scroll to "Your apps" → Web app
5. Copy the config values

### 3. Backend Firebase Admin Setup

Ensure `backend/firebase/serviceAccount.json` exists:
1. Go to Firebase Console → Project Settings → Service Accounts
2. Click "Generate New Private Key"
3. Save downloaded JSON as `backend/firebase/serviceAccount.json`
4. Add to `.gitignore`: `backend/firebase/serviceAccount.json`

### 4. Enable Firebase Authentication

In Firebase Console:
1. Go to **Authentication** → **Sign-in method**
2. Enable **Email/Password**
3. Enable **Google** (configure OAuth consent screen)

### 5. Firestore Security Rules

Update Firestore rules to enforce authentication:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      // Users can only read/write their own data
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      match /sessions/{sessionId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
      
      match /settings/{document} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
```

### 6. Start the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd flowstate
npm run dev
```

Open http://localhost:5175

---

## 🔐 Authentication Flow

### 1. **New User Registration**
```
User fills form → signUp() → Firebase Auth creates user → 
updateProfile() sets displayName → POST /api/users/sync → 
Firestore creates user document → Redirect to /dashboard
```

### 2. **User Login**
```
User enters credentials → signIn() → Firebase Auth validates → 
POST /api/users/sync updates lastLoginAt → Redirect to /dashboard
```

### 3. **Google Sign-In**
```
User clicks Google button → signInWithGoogle() → OAuth popup → 
Firebase creates/signs in user → POST /api/users/sync → 
Redirect to /dashboard
```

### 4. **Session Start**
```
User clicks "Start Session" → startSession() → 
POST /api/sessions/start (with Bearer token) → 
Backend verifies token → Creates session at users/{uid}/sessions/{sessionId} → 
Returns sessionId to frontend
```

### 5. **Metrics Upload**
```
Every 5 seconds → updateSessionMetrics() → 
POST /api/sessions/{sessionId}/update (with Bearer token) → 
Backend verifies token → Appends metrics to session document
```

### 6. **Session End**
```
User clicks "End Session" → endSession() → 
POST /api/sessions/{sessionId}/end (with Bearer token) → 
Backend generates AI insights → Returns summary → 
Frontend displays SessionSummary modal
```

---

## 📊 Data Flow Examples

### Viewing Analytics
```
User navigates to /analytics → ProtectedRoute checks auth → 
AnalyticsPage mounts → GET /api/users/stats (with Bearer token) → 
Backend queries users/{uid}/sessions → Calculates aggregates → 
Returns weekly data → Renders charts
```

### Viewing History
```
User navigates to /history → HistoryPage mounts → 
GET /api/users/sessions?limit=50 (with Bearer token) → 
Backend fetches users/{uid}/sessions → Returns session list → 
Renders table with pagination
```

### Updating Settings
```
User modifies settings → Clicks "Save" → 
POST /api/users/settings (with Bearer token) → 
Backend writes to users/{uid}/settings/preferences → 
Returns updated settings → Shows success toast
```

---

## 🧪 Testing the Implementation

### 1. Test Registration
1. Navigate to http://localhost:5175
2. Click "Get Started"
3. Switch to "Create Account" tab
4. Enter name, email, password
5. Click "Create Account"
6. Should redirect to /dashboard
7. Check backend logs for "User profile created"
8. Check Firestore: `users/{uid}` document should exist

### 2. Test Login
1. Sign out (click logout in sidebar)
2. Navigate to /auth
3. Enter email and password
4. Click "Sign In"
5. Should redirect to /dashboard
6. Check backend logs for "User profile updated"

### 3. Test Session Lifecycle
1. Click "Start Session" on dashboard
2. Type for 10 seconds (should see typing cadence update)
3. Check browser console for "Session started on backend"
4. Wait 5+ seconds (metrics should upload automatically)
5. Check backend logs for "Session updated"
6. Click "End Session"
7. Should see SessionSummary modal with AI insights
8. Check Firestore: Session document should have `status: 'completed'`

### 4. Test Route Protection
1. Sign out
2. Try accessing http://localhost:5175/dashboard directly
3. Should redirect to /auth
4. After login, should access /dashboard successfully

### 5. Test Google Sign-In
1. Click "Continue with Google" on AuthPage
2. Select Google account
3. Should redirect to /dashboard
4. Check Firestore for user profile with Google data

---

## 🐛 Troubleshooting

### "Firebase not initialized" Error
- Ensure `.env` file exists in `flowstate/` directory
- Check all `VITE_FIREBASE_*` variables are set
- Restart Vite dev server after adding env vars

### "401 Unauthorized" on API Calls
- User not logged in → Redirect to /auth automatically
- Token expired → AuthContext will refresh automatically
- Check browser console for Firebase errors

### Backend "Firebase service account not found"
- Ensure `serviceAccount.json` exists in `backend/firebase/`
- File must be valid JSON from Firebase Console
- Check file permissions (should be readable)

### "Session not found" Errors
- User changed between session start/end
- Session expired (check `currentSessionId` in FlowContext)
- Backend restarted (sessions lost in memory)

### Google Sign-In Not Working
- Enable Google provider in Firebase Console
- Configure OAuth consent screen
- Add authorized domain (localhost for dev)
- Check browser console for OAuth errors

---

## 📁 Files Changed Summary

### Backend (9 files)
- ✅ `backend/middleware/authMiddleware.js` - **CREATED**
- ✅ `backend/server.js` - **UPDATED** (added auth middleware)
- ✅ `backend/firebase/firestore.js` - **UPDATED** (user-based collections)
- ✅ `backend/controllers/sessionController.js` - **UPDATED** (req.user.uid)
- ✅ `backend/controllers/userController.js` - **UPDATED** (sync, settings endpoints)
- ✅ `backend/routes/userRoutes.js` - **UPDATED** (new endpoints)

### Frontend (11 files)
- ✅ `src/lib/firebaseClient.js` - **CREATED**
- ✅ `src/context/AuthContext.jsx` - **CREATED**
- ✅ `src/components/ProtectedRoute.jsx` - **CREATED**
- ✅ `src/components/PublicOnlyRoute.jsx` - **CREATED**
- ✅ `src/pages/AuthPage.jsx` - **CREATED**
- ✅ `src/api/client.js` - **CREATED**
- ✅ `src/api/sessionApi.js` - **UPDATED** (authorizedFetch)
- ✅ `src/App.jsx` - **UPDATED** (AuthProvider, route guards)
- ✅ `src/pages/HomePage.jsx` - **UPDATED** (auto-redirect, Get Started button)
- ✅ `src/components/Navigation.jsx` - **UPDATED** (user avatar, logout)
- ✅ `src/context/FlowContext.jsx` - **UPDATED** (removed hardcoded userId)

---

## 🎯 Next Steps (Optional Enhancements)

### 1. Email Verification
- Send verification email on signup
- Block access until email verified
- Use `requireEmailVerified` middleware

### 2. Password Reset
- Add "Forgot Password" link on AuthPage
- Use Firebase `sendPasswordResetEmail()`
- Create password reset confirmation page

### 3. User Profile Page
- Allow users to edit displayName, photoURL
- Show account creation date
- Display session statistics

### 4. Social Login Providers
- Add Facebook, Twitter, GitHub
- Configure in Firebase Console
- Add buttons to AuthPage

### 5. Real-time Sync
- Use Firestore onSnapshot for live updates
- Show active sessions across devices
- Real-time leaderboards

### 6. Admin Dashboard
- Admin role in Firestore custom claims
- View all users and sessions
- Generate system-wide analytics

---

## 📝 Environment Variables Reference

### Frontend (.env in `flowstate/`)
```env
# Required
VITE_BACKEND_URL=http://localhost:3001
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...

# Optional
VITE_USE_FIREBASE_EMULATOR=false
```

### Backend (.env in `backend/`)
```env
# Server
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5175

# Groq AI (optional)
GROQ_API_KEY=your_groq_api_key

# Firebase Admin (uses serviceAccount.json)
# No env vars needed - loaded from file
```

---

## ✅ Success Checklist

- [ ] Firebase SDK installed (`npm install firebase`)
- [ ] `.env` file created with Firebase config
- [ ] `serviceAccount.json` added to backend
- [ ] Firebase Authentication enabled (Email + Google)
- [ ] Firestore security rules updated
- [ ] Backend starts without errors (`npm run dev`)
- [ ] Frontend starts without errors (`npm run dev`)
- [ ] Can register new user
- [ ] Can login with email/password
- [ ] Can login with Google
- [ ] Dashboard shows user name in sidebar
- [ ] Can start and end sessions
- [ ] Sessions appear in History page
- [ ] Analytics shows user-specific data
- [ ] Settings save correctly
- [ ] Logout works properly

---

## 🎉 Congratulations!

FlowState is now a fully functional, multi-user AI-powered productivity app with:
- ✅ Secure Firebase Authentication
- ✅ User-specific data isolation
- ✅ Real-time session tracking
- ✅ AI-powered insights
- ✅ Beautiful glassmorphic UI
- ✅ Mobile responsive design
- ✅ Production-ready architecture

Happy coding! 🚀
