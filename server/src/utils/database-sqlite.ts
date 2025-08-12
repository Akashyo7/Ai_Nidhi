import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import { logger } from '@/utils/logger';

let db: Database<sqlite3.Database, sqlite3.Statement> | null = null;

export const initializeSQLiteDatabase = async () => {
  try {
    // Open SQLite database
    db = await open({
      filename: './anidhi.db',
      driver: sqlite3.Database
    });

    // Create users table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        name TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_active DATETIME DEFAULT CURRENT_TIMESTAMP,
        is_verified BOOLEAN DEFAULT 0
      )
    `);

    // Create user_profiles table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS user_profiles (
        id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
        user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
        profession TEXT,
        goals TEXT, -- JSON string
        branding_objectives TEXT, -- JSON string
        context_box TEXT,
        social_media_handles TEXT DEFAULT '[]', -- JSON string
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create indexes
    await db.exec('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)');
    await db.exec('CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id)');

    logger.info('SQLite database initialized successfully');
  } catch (error) {
    logger.error('SQLite database initialization error:', error);
    throw error;
  }
};

export const getSQLiteDB = () => {
  if (!db) {
    throw new Error('Database not initialized');
  }
  return db;
};