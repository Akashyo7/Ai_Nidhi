import { Pool } from 'pg';
import { logger } from '@/utils/logger';
import dotenv from 'dotenv';

// Ensure environment variables are loaded
dotenv.config();

// Create connection pool with explicit configuration as fallback
const pool = new Pool(
  process.env.DATABASE_URL 
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      }
    : {
        host: 'localhost',
        port: 5432,
        database: 'anidhi',
        user: 'anidhi',
        password: 'anidhi_password',
        ssl: false,
      }
);

// Test database connection
pool.on('connect', () => {
  logger.info('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  logger.error('PostgreSQL connection error:', err);
});

export { pool as db };

// Initialize database tables using migrations
export const initializeDatabase = async () => {
  try {
    // Validate DATABASE_URL is loaded
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is not set');
    }
    
    logger.info(`Connecting to database: ${process.env.DATABASE_URL.replace(/:[^:@]*@/, ':****@')}`);
    
    // Test connection
    await pool.query('SELECT NOW()');
    logger.info('Database connection successful');
    
    // Run migrations to set up database schema
    const { runMigrations } = await import('./migrations');
    await runMigrations();
    
    logger.info('Database initialization completed successfully');
  } catch (error) {
    logger.error('Database initialization error:', error);
    throw error;
  }
};