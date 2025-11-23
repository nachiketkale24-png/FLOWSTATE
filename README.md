# 🚀 FLOWSTATE - AI-Powered Focus Tracker

<div align="center">

![FLOWSTATE Banner](https://img.shields.io/badge/FLOWSTATE-AI%20Focus%20Tracker-blueviolet?style=for-the-badge)
[![React](https://img.shields.io/badge/React-19.2.0-61DAFB?style=flat-square&logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-v20+-339933?style=flat-square&logo=node.js)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.0+-47A248?style=flat-square&logo=mongodb)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

**Real-time focus monitoring powered by 4 AI agents**

[Features](#-features) • [Demo](#-demo-mode) • [Installation](#-installation) • [Architecture](#-architecture) • [API](#-api-documentation)

</div>

---

## 📖 Overview

**FLOWSTATE** is an intelligent productivity tracking system that uses AI agents to monitor your focus in real-time. It detects when you enter deep work states, blocks distractions automatically, and provides personalized insights to optimize your workflow.

### 🎯 Core Capabilities

- **Real-Time Flow Detection** - AI analyzes typing cadence and activity patterns
- **Smart Distraction Blocking** - Prevents context switches during deep focus
- **Stamina Building** - Tracks and improves long-term focus capacity
- **Personalized Insights** - AI-generated recommendations after each session
- **Beautiful Analytics** - Comprehensive charts and progress tracking

---

## ✨ Features

### 🤖 AI Agents (4 Local Modules)

1. **Flow Agent** (`flowAgent.js`)
   - Analyzes typing cadence (50-110 wpm)
   - Calculates active ratio (engagement level)
   - Outputs: Flow Score (0-100), Fatigue, Distraction Risk

2. **Distraction Agent** (`distractionAgent.js`)
   - Monitors 5 major distraction sites
   - Triggers blocks during FLOW state (3-10% probability)
   - Shows overlay with Return/Override/End options

3. **Stamina Agent** (`staminaAgent.js`)
   - Builds long-term focus capacity
   - Tracks session/flow duration ratios
   - Updates trend: up/down/stable

4. **Insights Agent** (`insightsAgent.js`)
   - Generates 2-3 personalized tips
   - Analyzes session patterns
   - Suggests optimal work windows

### 📊 Dashboard Features

- **9 Live Metrics** updating every second
- **State Machine**: IDLE → MONITORING → FLOW
- **Session Summary** with AI insights
- **Weekly Analytics** with 5 interactive charts
- **Goals & Achievements** system with tiers
- **AI Assistant** for productivity queries

### 🎨 Modern UI

- **Glassmorphism Design** with cyberpunk aesthetics
- **3D Floating Cards** with hover effects
- **Neon Glow Effects** on text and borders
- **Responsive Layout** for all devices
- **Dark Mode** with purple/pink gradients

---

## 🎮 Demo Mode

Run the app **without backend** using mock data:

```bash
cd flowstate
npm install
npm run dev
```

Open: **http://localhost:5173/**

Demo mode features:
- ✅ Pre-loaded sessions (7 days of data)
- ✅ All AI agents functional
- ✅ Full UI/UX experience
- ✅ No database required
- ✅ Offline AI responses

To toggle demo mode:
```javascript
// src/demoData.js
export const DEMO_MODE = true; // or false
```

---

## 🛠️ Installation

### Prerequisites

- Node.js v20+
- MongoDB 6.0+
- npm or yarn

### 1️⃣ Clone Repository

```bash
git clone https://github.com/nachiketkale24-png/FLOWSTATE.git
cd FLOWSTATE
```

### 2️⃣ Setup Backend

```bash
cd backend
npm install

# Create .env file
echo "MONGODB_URI=mongodb://localhost:27017/flowstate
JWT_SECRET=your-secret-key-here
GROQ_API_KEY=your-groq-api-key
PORT=3001" > .env

# Start MongoDB (if not running)
mongod

# Start server
npm start
```

Backend runs on: **http://localhost:3001**

### 3️⃣ Setup Frontend

```bash
cd ../flowstate
npm install
npm run dev
```

Frontend runs on: **http://localhost:5173**

### 4️⃣ Configure API Connection

```javascript
// flowstate/src/demoData.js
export const DEMO_MODE = false; // Use real backend
```

---

## 🏗️ Architecture

### Tech Stack

**Frontend:**
- React 19.2.0 with hooks
- Vite 7.2.4 (build tool)
- Tailwind CSS v4 (styling)
- Recharts (analytics)
- React Router (navigation)

**Backend:**
- Node.js + Express
- MongoDB with Mongoose
- JWT Authentication
- Groq API (AI insights)

### Project Structure

```
FLOWSTATE/
├── flowstate/              # Frontend (React)
│   ├── src/
│   │   ├── ai/            # 4 AI agent modules
│   │   ├── components/    # Reusable UI components
│   │   ├── context/       # State management
│   │   ├── pages/         # Route pages
│   │   ├── api/           # Backend API clients
│   │   └── demoData.js    # Mock data for demo
│   └── package.json
│
├── backend/               # Backend (Node.js)
│   ├── ai/               # Groq AI integration
│   ├── controllers/      # Route handlers
│   ├── models/           # MongoDB schemas
│   ├── routes/           # API endpoints
│   ├── middleware/       # Auth & validation
│   └── server.js         # Entry point
│
└── README.md
```

### State Flow

```
User Action → FlowContext → AI Agents → State Update → UI Render
```

---

## 📡 API Documentation

### Base URL
```
http://localhost:3001/api
```

### Authentication

**Register User**
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

**Login**
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

Returns: `{ token, user }`

### Sessions

**Create Session**
```http
POST /sessions
Authorization: Bearer <token>

{
  "startTime": "2024-11-22T10:00:00Z",
  "duration": 1800,
  "flowScore": 85,
  "distractionsBlocked": 5
}
```

**Get User Sessions**
```http
GET /sessions?limit=10&page=1
Authorization: Bearer <token>
```

### Analytics

**Get Weekly Stats**
```http
GET /analysis/weekly
Authorization: Bearer <token>
```

Returns: Flow trends, distraction stats, stamina data

### Goals

**Create Goal**
```http
POST /goals
Authorization: Bearer <token>

{
  "title": "Complete Project",
  "category": "Development",
  "priority": "High",
  "targetDate": "2024-12-01T00:00:00Z"
}
```

**Get All Goals**
```http
GET /goals
Authorization: Bearer <token>
```

### AI Assistant

**Ask Question**
```http
POST /ai/chat
Authorization: Bearer <token>

{
  "message": "How's my flow score?",
  "context": "dashboard"
}
```

---

## 🎯 Usage Guide

### Starting a Focus Session

1. Click **"Start Session"** on Dashboard
2. Watch metrics update every second
3. When Flow Score hits **70+**, you enter **FLOW** state
4. Distraction blocks may trigger (3-10% chance/sec)
5. Click **"End Session"** when done

### Understanding Metrics

| Metric | Description | Range |
|--------|-------------|-------|
| **Flow Score** | AI-calculated focus level | 0-100 |
| **Active Ratio** | Engagement percentage | 0-100% |
| **Typing Cadence** | Words per minute | 50-110 |
| **Fatigue Level** | Energy depletion risk | 0-100 |
| **Distraction Risk** | Break probability | 0-100 |
| **Focus Stamina** | Long-term capacity | 0-100 |

### Viewing Analytics

Navigate to **Analytics** tab to see:
- Flow Score Trend (last 7 sessions)
- Distraction Timeline (hourly breakdown)
- Stamina Growth (10-session window)
- Performance Radar (5 key metrics)
- Weekly Session Distribution (hours per day)

---

## 🔧 Configuration

### Environment Variables

**Backend (.env)**
```env
MONGODB_URI=mongodb://localhost:27017/flowstate
JWT_SECRET=your-super-secret-jwt-key
GROQ_API_KEY=gsk_your_groq_api_key_here
PORT=3001
NODE_ENV=development
```

**Frontend (src/config/appConfig.js)**
```javascript
export const APP_CONFIG = {
  API_URL: 'http://localhost:3001',
  DEMO_MODE: false,
  SESSION_CHECK_INTERVAL: 1000, // 1 second
  FLOW_THRESHOLD: 70,
  DISTRACTION_SITES: ['youtube.com', 'instagram.com', ...]
};
```

---

## 🚀 Deployment

### Frontend (Vercel)

```bash
cd flowstate
npm run build
vercel deploy
```

### Backend (Railway/Render)

1. Push to GitHub
2. Connect to Railway/Render
3. Set environment variables
4. Deploy from `main` branch

### MongoDB Atlas

1. Create cluster at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Get connection string
3. Update `MONGODB_URI` in backend `.env`

---

## 📊 Demo Video

[🎬 Watch Demo Video](https://youtu.be/your-demo-link)

**Key Features Showcased:**
- Live session with real-time metrics
- Flow state transition (MONITORING → FLOW)
- Distraction blocking in action
- AI-generated insights
- Analytics dashboard walkthrough

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Team

**Project Lead:** Nachiket Kale  
**GitHub:** [@nachiketkale24-png](https://github.com/nachiketkale24-png)  
**Institution:** NIT Silchar

---

## 🙏 Acknowledgments

- **Groq API** for fast LLM inference
- **MongoDB** for flexible data storage
- **React Team** for the amazing framework
- **Tailwind CSS** for utility-first styling
- **Recharts** for beautiful visualizations

---

## 📞 Support

For issues or questions:
- Open an [Issue](https://github.com/nachiketkale24-png/FLOWSTATE/issues)
- Email: nachiket@example.com
- Documentation: See `/flowstate/DEMO_GUIDE.md`

---

<div align="center">

**Built with ❤️ for the NIT Silchar Hackathon**

⭐ Star this repo if you found it helpful!

</div>
