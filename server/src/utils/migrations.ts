import { db } from '@/utils/database';
import { logger } from '@/utils/logger';

export interface Migration {
  version: string;
  description: string;
  up: () => Promise<void>;
  down: () => Promise<void>;
}

// Migration tracking table
const createMigrationsTable = async (): Promise<void> => {
  await db.query(`
    CREATE TABLE IF NOT EXISTS migrations (
      version VARCHAR(255) PRIMARY KEY,
      description TEXT NOT NULL,
      executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
};

// Check if migration has been executed
const isMigrationExecuted = async (version: string): Promise<boolean> => {
  const result = await db.query('SELECT 1 FROM migrations WHERE version = $1', [version]);
  return result.rows.length > 0;
};

// Record migration execution
const recordMigration = async (version: string, description: string): Promise<void> => {
  await db.query(
    'INSERT INTO migrations (version, description) VALUES ($1, $2)',
    [version, description]
  );
};

// Remove migration record
const removeMigrationRecord = async (version: string): Promise<void> => {
  await db.query('DELETE FROM migrations WHERE version = $1', [version]);
};

// Migration definitions
const migrations: Migration[] = [
  {
    version: '001_initial_schema',
    description: 'Create initial database schema',
    up: async () => {
      // Users table
      await db.query(`
        CREATE TABLE IF NOT EXISTS users (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          email VARCHAR(255) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          name VARCHAR(255) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          is_verified BOOLEAN DEFAULT false
        )
      `);

      // User profiles table
      await db.query(`
        CREATE TABLE IF NOT EXISTS user_profiles (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID REFERENCES users(id) ON DELETE CASCADE,
          profession VARCHAR(255),
          goals TEXT[],
          branding_objectives TEXT[],
          context_box TEXT,
          social_media_handles JSONB DEFAULT '[]',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Create indexes
      await db.query('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)');
      await db.query('CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id)');
    },
    down: async () => {
      await db.query('DROP TABLE IF EXISTS user_profiles CASCADE');
      await db.query('DROP TABLE IF EXISTS users CASCADE');
    }
  },
  {
    version: '002_content_and_projects',
    description: 'Add content and projects tables',
    up: async () => {
      // Content table
      await db.query(`
        CREATE TABLE IF NOT EXISTS content (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID REFERENCES users(id) ON DELETE CASCADE,
          platform VARCHAR(100) NOT NULL,
          content_type VARCHAR(50) NOT NULL,
          title VARCHAR(500),
          body TEXT NOT NULL,
          tags TEXT[],
          brand_alignment DECIMAL(3,2) DEFAULT 0.0,
          performance_score DECIMAL(3,2) DEFAULT 0.0,
          status VARCHAR(50) DEFAULT 'draft',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Projects table
      await db.query(`
        CREATE TABLE IF NOT EXISTS projects (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID REFERENCES users(id) ON DELETE CASCADE,
          name VARCHAR(255) NOT NULL,
          type VARCHAR(100) NOT NULL,
          description TEXT,
          goals TEXT[],
          status VARCHAR(50) DEFAULT 'active',
          start_date DATE,
          end_date DATE,
          context JSONB DEFAULT '{}',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Create indexes
      await db.query('CREATE INDEX IF NOT EXISTS idx_content_user_id ON content(user_id)');
      await db.query('CREATE INDEX IF NOT EXISTS idx_content_platform ON content(platform)');
      await db.query('CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id)');
      await db.query('CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status)');
    },
    down: async () => {
      await db.query('DROP TABLE IF EXISTS content CASCADE');
      await db.query('DROP TABLE IF EXISTS projects CASCADE');
    }
  },
  {
    version: '003_intelligence_and_context',
    description: 'Add intelligence data and user context tables',
    up: async () => {
      // Intelligence data table
      await db.query(`
        CREATE TABLE IF NOT EXISTS intelligence_data (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID REFERENCES users(id) ON DELETE CASCADE,
          type VARCHAR(50) NOT NULL,
          data JSONB NOT NULL,
          relevance_score DECIMAL(3,2) DEFAULT 0.0,
          is_actionable BOOLEAN DEFAULT false,
          source VARCHAR(255),
          expires_at TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // User context table
      await db.query(`
        CREATE TABLE IF NOT EXISTS user_context (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID REFERENCES users(id) ON DELETE CASCADE,
          context_type VARCHAR(100) NOT NULL,
          data JSONB NOT NULL,
          confidence DECIMAL(3,2) DEFAULT 0.0,
          last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          version INTEGER DEFAULT 1,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Create indexes
      await db.query('CREATE INDEX IF NOT EXISTS idx_intelligence_data_user_id ON intelligence_data(user_id)');
      await db.query('CREATE INDEX IF NOT EXISTS idx_intelligence_data_type ON intelligence_data(type)');
      await db.query('CREATE INDEX IF NOT EXISTS idx_user_context_user_id ON user_context(user_id)');
      await db.query('CREATE INDEX IF NOT EXISTS idx_user_context_type ON user_context(context_type)');
    },
    down: async () => {
      await db.query('DROP TABLE IF EXISTS intelligence_data CASCADE');
      await db.query('DROP TABLE IF EXISTS user_context CASCADE');
    }
  },
  {
    version: '004_brand_strategy',
    description: 'Add brand strategy table',
    up: async () => {
      // Brand strategy table
      await db.query(`
        CREATE TABLE IF NOT EXISTS brand_strategy (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID REFERENCES users(id) ON DELETE CASCADE,
          core_message TEXT,
          target_audience TEXT[],
          content_pillars TEXT[],
          voice_and_tone JSONB DEFAULT '{}',
          platform_strategy JSONB DEFAULT '{}',
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Create indexes
      await db.query('CREATE INDEX IF NOT EXISTS idx_brand_strategy_user_id ON brand_strategy(user_id)');
    },
    down: async () => {
      await db.query('DROP TABLE IF EXISTS brand_strategy CASCADE');
    }
  },
  {
    version: '005_vector_database',
    description: 'Add vector database support with pgvector',
    up: async () => {
      // Enable pgvector extension
      await db.query('CREATE EXTENSION IF NOT EXISTS vector');
      
      // Create vector documents table
      await db.query(`
        CREATE TABLE IF NOT EXISTS vector_documents (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID REFERENCES users(id) ON DELETE CASCADE,
          content TEXT NOT NULL,
          metadata JSONB DEFAULT '{}',
          document_type VARCHAR(50) NOT NULL,
          embedding vector(1536),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Create indexes for efficient similarity search
      await db.query(`
        CREATE INDEX IF NOT EXISTS idx_vector_documents_user_id 
        ON vector_documents(user_id)
      `);
      
      await db.query(`
        CREATE INDEX IF NOT EXISTS idx_vector_documents_type 
        ON vector_documents(document_type)
      `);
      
      await db.query(`
        CREATE INDEX IF NOT EXISTS idx_vector_documents_embedding 
        ON vector_documents USING ivfflat (embedding vector_cosine_ops) 
        WITH (lists = 100)
      `);
    },
    down: async () => {
      await db.query('DROP TABLE IF EXISTS vector_documents CASCADE');
      await db.query('DROP EXTENSION IF EXISTS vector CASCADE');
    }
  }
];

// Run all pending migrations
export const runMigrations = async (): Promise<void> => {
  try {
    await createMigrationsTable();
    
    for (const migration of migrations) {
      const isExecuted = await isMigrationExecuted(migration.version);
      
      if (!isExecuted) {
        logger.info(`Running migration: ${migration.version} - ${migration.description}`);
        await migration.up();
        await recordMigration(migration.version, migration.description);
        logger.info(`Migration completed: ${migration.version}`);
      } else {
        logger.debug(`Migration already executed: ${migration.version}`);
      }
    }
    
    logger.info('All migrations completed successfully');
  } catch (error) {
    logger.error('Migration failed:', error);
    throw error;
  }
};

// Rollback a specific migration
export const rollbackMigration = async (version: string): Promise<void> => {
  try {
    const migration = migrations.find(m => m.version === version);
    
    if (!migration) {
      throw new Error(`Migration not found: ${version}`);
    }
    
    const isExecuted = await isMigrationExecuted(version);
    
    if (isExecuted) {
      logger.info(`Rolling back migration: ${version} - ${migration.description}`);
      await migration.down();
      await removeMigrationRecord(version);
      logger.info(`Migration rolled back: ${version}`);
    } else {
      logger.warn(`Migration not executed, cannot rollback: ${version}`);
    }
  } catch (error) {
    logger.error('Migration rollback failed:', error);
    throw error;
  }
};

// Get migration status
export const getMigrationStatus = async (): Promise<{ version: string; description: string; executed: boolean }[]> => {
  await createMigrationsTable();
  
  const executedMigrations = await db.query('SELECT version FROM migrations ORDER BY version');
  const executedVersions = new Set(executedMigrations.rows.map(row => row.version));
  
  return migrations.map(migration => ({
    version: migration.version,
    description: migration.description,
    executed: executedVersions.has(migration.version)
  }));
};