import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { createServer } from 'http';
import connectToMongoDB from './db/connectToMongoDB.js';
import { setupSocket } from './socket/socket.js';
import validateEnv from './validateEnv.js';

// Import routes
import authRoutes from './routes/auth.routes.js';
import messageRoutes from './routes/message.routes.js';
import userRoutes from './routes/user.routes.js';
import groupRoutes from './routes/group.routes.js';
import { protectRoute } from './middleware/protectRoute.js';

dotenv.config();

// Validate environment variables first
validateEnv();

const app = express();
const httpServer = createServer(app);

// Get allowed origins from env or use defaults
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',')
  : [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3002',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001',
      'http://127.0.0.1:3002',
      'http://localhost:5173',
      'http://localhost:5174'
    ];

// Setup socket.io
const io = setupSocket(httpServer, allowedOrigins);
app.set('io', io);

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/users', userRoutes);
app.use('/api/groups', groupRoutes);

// Test endpoints
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'API is working!',
    timestamp: new Date(),
    env: process.env.NODE_ENV
  });
});

app.get('/api/test-auth', protectRoute, (req, res) => {
  res.json({ 
    message: 'Auth is working!',
    user: {
      id: req.user._id,
      name: req.user.fullName
    }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date() });
});

const PORT = process.env.PORT || 5000;

// Start server only after DB connection
const startServer = async () => {
  try {
    await connectToMongoDB();
    httpServer.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📡 Test API: http://localhost:${PORT}/api/test`);
      console.log(`📡 Allowed origins: ${allowedOrigins.join(', ')}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();