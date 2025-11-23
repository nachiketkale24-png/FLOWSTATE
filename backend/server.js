/**
 * FlowState Backend Server - MongoDB Version
 */

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const { connectDB } = require('./config/database');
const { initializeAchievements } = require('./controllers/achievementsController');
const logger = require('./utils/logger');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// ============================================================================
// MIDDLEWARE
// ============================================================================

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// ============================================================================
// INITIALIZE DATABASE
// ============================================================================

let dbConnected = false;

connectDB()
  .then(async () => {
    dbConnected = true;
    logger.info('✅ MongoDB connected successfully');
    
    // Initialize achievements
    await initializeAchievements();
  })
  .catch((error) => {
    logger.error('❌ MongoDB connection failed:', error.message);
    logger.warn('⚠️  Server will start but database features will be unavailable');
  });

// ============================================================================
// HEALTH CHECK & INFO ROUTES
// ============================================================================

app.get('/', (req, res) => {
  res.json({
    name: 'FlowState Backend API',
    version: '2.0.0',
    status: 'running',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      sessions: '/api/sessions',
      analysis: '/api/analysis',
      users: '/api/users',
      goals: '/api/goals',
      achievements: '/api/achievements',
      planner: '/api/planner',
      ai: '/api/ai',
    },
  });
});

app.get('/health', (req, res) => {
  const health = {
    status: dbConnected ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    services: {
      mongodb: dbConnected ? 'connected' : 'not connected',
      groq: process.env.GROQ_API_KEY ? 'configured' : 'not configured',
    },
  };

  const httpCode = dbConnected ? 200 : 503;
  res.status(httpCode).json(health);
});

// ============================================================================
// API ROUTES
// ============================================================================

const { verifyToken } = require('./middleware/jwtAuth');

// Auth routes (public)
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

// Protected routes
const sessionRoutes = require('./routes/sessionRoutes');
app.use('/api/sessions', verifyToken, sessionRoutes);

const analysisRoutes = require('./routes/analysisRoutes');
app.use('/api/analysis', verifyToken, analysisRoutes);

const userRoutes = require('./routes/userRoutes');
app.use('/api/users', verifyToken, userRoutes);

const achievementsRoutes = require('./routes/achievementsRoutes');
app.use('/api/achievements', verifyToken, achievementsRoutes);

const goalsRoutes = require('./routes/goalsRouter');
app.use('/api/goals', verifyToken, goalsRoutes);

const plannerRoutes = require('./routes/plannerRoutes');
app.use('/api/planner', verifyToken, plannerRoutes);

const aiRoutes = require('./routes/aiRoutes');
app.use('/api/ai', verifyToken, aiRoutes);

// ============================================================================
// ERROR HANDLERS
// ============================================================================

app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`,
    timestamp: new Date().toISOString(),
  });
});

app.use((err, req, res, next) => {
  logger.error('❌ Server Error:', err);
  
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  res.status(statusCode).json({
    error: err.name || 'ServerError',
    message,
    timestamp: new Date().toISOString(),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// ============================================================================
// START SERVER
// ============================================================================

app.listen(PORT, () => {
  console.log('\n' + '='.repeat(60));
  console.log('🚀 FlowState Backend Server Started (MongoDB Edition)');
  console.log('='.repeat(60));
  console.log(`📍 Server running on: http://localhost:${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`💾 MongoDB: ${dbConnected ? '✅ Connected' : '⏳ Connecting...'}`);
  console.log(`🤖 Groq API: ${process.env.GROQ_API_KEY ? '✅ Configured' : '⚠️  Not configured'}`);
  console.log('='.repeat(60));
  console.log('\n📚 API Endpoints:');
  console.log(`   Health: http://localhost:${PORT}/health`);
  console.log(`   Auth: http://localhost:${PORT}/api/auth`);
  console.log(`   Sessions: http://localhost:${PORT}/api/sessions`);
  console.log(`   Analysis: http://localhost:${PORT}/api/analysis`);
  console.log(`   Users: http://localhost:${PORT}/api/users`);
  console.log(`   Goals: http://localhost:${PORT}/api/goals`);
  console.log(`   Achievements: http://localhost:${PORT}/api/achievements`);
  console.log(`   Planner: http://localhost:${PORT}/api/planner`);
  console.log(`   AI Chat: http://localhost:${PORT}/api/ai`);
  console.log('\n✨ Ready to accept requests!\n');
});

process.on('SIGTERM', () => {
  logger.info('👋 SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('👋 SIGINT received. Shutting down gracefully...');
  process.exit(0);
});

module.exports = app;
