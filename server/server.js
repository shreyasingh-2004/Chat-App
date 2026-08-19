import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import { createServer } from 'http';
import { fileURLToPath } from 'url';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import connectToMongoDB from './db/connectToMongoDB.js';
import { setupSocket } from './socket/socket.js';
import validateEnv from './validateEnv.js';

import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import groupRoutes from './routes/group.routes.js';
import messageRoutes from './routes/message.routes.js';
import uploadRoutes from './routes/upload.routes.js';

import { protectRoute } from './middleware/protectRoute.js';
import { errorHandler } from "./middleware/error.middleware.js";

dotenv.config();
validateEnv();

const app = express();
const httpServer = createServer(app);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isProduction = process.env.NODE_ENV === 'production';
const PORT = Number(process.env.PORT) || 5000;
const host = process.env.HOST || '0.0.0.0';


// =============================
// 🌐 CORS CONFIG — MUST BE FIRST
// =============================

const defaultDevOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
  'http://127.0.0.1:3002',
  'http://localhost:5173',
  'http://localhost:5174',
];

const configuredOrigins = [
  process.env.CLIENT_URL,
  ...(process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : []),
]
  .map((origin) => origin?.trim())
  .filter(Boolean);

const allowedOrigins = isProduction
  ? configuredOrigins
  : [...new Set([...configuredOrigins, ...defaultDevOrigins])];

const isAllowedOrigin = (origin) => {
  if (!origin) return true;
  if (allowedOrigins.includes(origin)) return true;
  return !isProduction && /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin);
};

const corsOptions = {
  origin(origin, callback) {
    if (isAllowedOrigin(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`CORS blocked origin: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
};

// ✅ CORS must be applied BEFORE everything else
app.use(cors(corsOptions));

// ✅ Handle ALL preflight OPTIONS requests globally
app.options('*', cors(corsOptions));


// =============================
// ✅ SECURITY MIDDLEWARE
// =============================

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }, // ✅ Prevents helmet from blocking cross-origin responses
}));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests, please try again later.",
});

app.use('/api', limiter);


// =============================
// ⚙️ SOCKET SETUP
// =============================

const io = setupSocket(httpServer, corsOptions);
app.set('io', io);


// =============================
// 📦 BODY / COOKIE MIDDLEWARE
// =============================

app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));
app.use(cookieParser());


// =============================
// 🚀 ROUTES
// =============================

app.use('/api/auth', authRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/users', userRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/messages', uploadRoutes);


// =============================
// 🧪 TEST ROUTES
// =============================

app.get('/api/test', (req, res) => {
  res.json({
    message: 'API is working!',
    timestamp: new Date(),
    env: process.env.NODE_ENV,
  });
});

app.get('/api/test-auth', protectRoute, (req, res) => {
  res.json({
    message: 'Auth is working!',
    user: {
      id: req.user._id,
      name: req.user.fullName,
    },
  });
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date() });
});


// =============================
// 🌍 PRODUCTION BUILD
// =============================

if (isProduction) {
  const clientDistPath = path.join(__dirname, '../client/dist');
  app.use(express.static(clientDistPath));

  app.get('*', (req, res) => {
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}


// =============================
// ❌ GLOBAL ERROR HANDLER (LAST)
// =============================

app.use(errorHandler);


// =============================
// 🚀 START SERVER
// =============================

const startServer = async () => {
  try {
    await connectToMongoDB();

    httpServer.listen(PORT, host, () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`📍 Health check: http://localhost:${PORT}/health`);
      console.log(`🔗 API: http://localhost:${PORT}/api/test`);
    });

    httpServer.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`\n❌ Port ${PORT} is already in use!`);
        process.exit(1);
      } else {
        console.error('Server error:', error);
        process.exit(1);
      }
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();