import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import Database from './database/Database.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

// Import routes
import authRoutes from './routes/auth.js';
import dashboardRoutes from './routes/dashboard.js';
import assignmentsRoutes from './routes/assignments.js';
import problemsRoutes from './routes/problems.js';
import submissionsRoutes from './routes/submissions.js';
import contestsRoutes from './routes/contests.js';
import notificationsRoutes from './routes/notifications.js';
import teacherRoutes from './routes/teacher.js';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Database connection
const dbPath = process.env.DB_PATH || path.join(__dirname, 'database/codelab.db');
const db = new Database(dbPath);
app.set('db', db);

// Initialize database
await db.initialize();

// Middleware
app.use(helmet()); // Security headers
app.use(cors()); // CORS
app.use(compression()); // Compress responses
app.use(express.json({ limit: '10mb' })); // Parse JSON bodies
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev')); // Logging

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/assignments', assignmentsRoutes);
app.use('/api/problems', problemsRoutes);
app.use('/api/submissions', submissionsRoutes);
app.use('/api/contests', contestsRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/teacher', teacherRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🗄️  Database: ${dbPath}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  await db.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  await db.close();
  process.exit(0);
});
