import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { logger } from '@/utils/logger';
import { errorHandler } from '@/middleware/errorHandler';
import { notFoundHandler } from '@/middleware/notFoundHandler';
import { initializeDatabase } from '@/utils/database';
import authRoutes from '@/routes/auth';
import embeddingsRoutes from '@/routes/embeddings';
import contextRoutes from '@/routes/context';
import writingStyleRoutes from '@/routes/writingStyle';
import linkedinRoutes from '@/routes/linkedin';
import webSearchRoutes from '@/routes/webSearch';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});
app.use(limiter);

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
  });
});

// API routes
app.get('/api', (req, res) => {
  res.json({
    message: 'ANIDHI Personal Branding Platform API',
    version: '1.0.0',
    status: 'active',
  });
});

// Auth routes
app.use('/api/auth', authRoutes);

// Embeddings routes
app.use('/api/embeddings', embeddingsRoutes);

// Context routes
app.use('/api/context', contextRoutes);

// Writing style routes
app.use('/api/writing-style', writingStyleRoutes);

// LinkedIn routes
app.use('/api/linkedin', linkedinRoutes);

// Web search routes
app.use('/api/web-search', webSearchRoutes);

// Error handling middleware
app.use(notFoundHandler);
app.use(errorHandler);

// Initialize database and start server
const startServer = async () => {
  try {
    // Initialize PostgreSQL database
    await initializeDatabase();
    logger.info('Using PostgreSQL database');
    
    app.listen(PORT, () => {
      logger.info(`🚀 ANIDHI Server running on port ${PORT}`);
      logger.info(`📊 Environment: ${process.env.NODE_ENV}`);
      logger.info(`🔗 API URL: http://localhost:${PORT}`);
      logger.info(`🔐 Auth endpoints: http://localhost:${PORT}/api/auth`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;