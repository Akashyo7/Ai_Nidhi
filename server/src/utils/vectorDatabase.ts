import { db } from '@/utils/database';
import { logger } from '@/utils/logger';
import OpenAI from 'openai';

// Initialize OpenAI client for embeddings
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface VectorDocument {
  id: string;
  userId: string;
  content: string;
  metadata: Record<string, any>;
  documentType: 'content' | 'context' | 'trend' | 'competitor' | 'writing_sample' | 'project';
  embedding?: number[];
  createdAt: Date;
  updatedAt: Date;
}

export interface SimilaritySearchResult {
  document: VectorDocument;
  similarity: number;
}

export class VectorDatabaseService {
  
  /**
   * Initialize the vector database with pgvector extension
   */
  static async initialize(): Promise<void> {
    try {
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

      logger.info('Vector database initialized successfully');
    } catch (error) {
      logger.error('Vector database initialization failed:', error);
      throw error;
    }
  }

  /**
   * Generate embeddings for text content using OpenAI
   */
  static async generateEmbedding(text: string): Promise<number[]> {
    try {
      const response = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: text,
        encoding_format: 'float',
      });

      return response.data[0].embedding;
    } catch (error) {
      logger.error('Failed to generate embedding:', error);
      throw new Error('Embedding generation failed');
    }
  }

  /**
   * Store a document with its embedding in the vector database
   */
  static async storeDocument(document: Omit<VectorDocument, 'id' | 'embedding' | 'createdAt' | 'updatedAt'>): Promise<VectorDocument> {
    try {
      // Generate embedding for the content
      const embedding = await this.generateEmbedding(document.content);

      const query = `
        INSERT INTO vector_documents (user_id, content, metadata, document_type, embedding)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `;

      const values = [
        document.userId,
        document.content,
        JSON.stringify(document.metadata),
        document.documentType,
        `[${embedding.join(',')}]`
      ];

      const result = await db.query(query, values);
      const stored = result.rows[0];

      return {
        id: stored.id,
        userId: stored.user_id,
        content: stored.content,
        metadata: stored.metadata,
        documentType: stored.document_type,
        embedding: stored.embedding,
        createdAt: stored.created_at,
        updatedAt: stored.updated_at,
      };
    } catch (error) {
      logger.error('Failed to store document:', error);
      throw error;
    }
  }

  /**
   * Update an existing document and regenerate its embedding
   */
  static async updateDocument(id: string, updates: Partial<Pick<VectorDocument, 'content' | 'metadata'>>): Promise<VectorDocument | null> {
    try {
      const fields = [];
      const values = [];
      let paramCount = 1;

      if (updates.content !== undefined) {
        // Generate new embedding for updated content
        const embedding = await this.generateEmbedding(updates.content);
        fields.push(`content = $${paramCount++}`);
        values.push(updates.content);
        fields.push(`embedding = $${paramCount++}`);
        values.push(`[${embedding.join(',')}]`);
      }

      if (updates.metadata !== undefined) {
        fields.push(`metadata = $${paramCount++}`);
        values.push(JSON.stringify(updates.metadata));
      }

      if (fields.length === 0) {
        return this.getDocumentById(id);
      }

      fields.push(`updated_at = CURRENT_TIMESTAMP`);
      values.push(id);

      const query = `
        UPDATE vector_documents 
        SET ${fields.join(', ')}
        WHERE id = $${paramCount}
        RETURNING *
      `;

      const result = await db.query(query, values);
      
      if (result.rows.length === 0) {
        return null;
      }

      const updated = result.rows[0];
      return {
        id: updated.id,
        userId: updated.user_id,
        content: updated.content,
        metadata: updated.metadata,
        documentType: updated.document_type,
        embedding: updated.embedding,
        createdAt: updated.created_at,
        updatedAt: updated.updated_at,
      };
    } catch (error) {
      logger.error('Failed to update document:', error);
      throw error;
    }
  }

  /**
   * Perform semantic similarity search
   */
  static async similaritySearch(
    query: string,
    userId?: string,
    documentType?: string,
    limit: number = 10,
    threshold: number = 0.7
  ): Promise<SimilaritySearchResult[]> {
    try {
      // Generate embedding for the search query
      const queryEmbedding = await this.generateEmbedding(query);

      let sqlQuery = `
        SELECT 
          id, user_id, content, metadata, document_type, embedding,
          created_at, updated_at,
          1 - (embedding <=> $1) as similarity
        FROM vector_documents
        WHERE 1 - (embedding <=> $1) > $2
      `;
      
      const values: any[] = [`[${queryEmbedding.join(',')}]`, threshold];
      let paramCount = 3;

      if (userId) {
        sqlQuery += ` AND user_id = $${paramCount++}`;
        values.push(userId);
      }

      if (documentType) {
        sqlQuery += ` AND document_type = $${paramCount++}`;
        values.push(documentType);
      }

      sqlQuery += ` ORDER BY similarity DESC LIMIT $${paramCount}`;
      values.push(limit);

      const result = await db.query(sqlQuery, values);

      return result.rows.map(row => ({
        document: {
          id: row.id,
          userId: row.user_id,
          content: row.content,
          metadata: row.metadata,
          documentType: row.document_type,
          embedding: row.embedding,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
        },
        similarity: parseFloat(row.similarity)
      }));
    } catch (error) {
      logger.error('Similarity search failed:', error);
      throw error;
    }
  }

  /**
   * Get document by ID
   */
  static async getDocumentById(id: string): Promise<VectorDocument | null> {
    try {
      const query = 'SELECT * FROM vector_documents WHERE id = $1';
      const result = await db.query(query, [id]);

      if (result.rows.length === 0) {
        return null;
      }

      const doc = result.rows[0];
      return {
        id: doc.id,
        userId: doc.user_id,
        content: doc.content,
        metadata: doc.metadata,
        documentType: doc.document_type,
        embedding: doc.embedding,
        createdAt: doc.created_at,
        updatedAt: doc.updated_at,
      };
    } catch (error) {
      logger.error('Failed to get document by ID:', error);
      throw error;
    }
  }

  /**
   * Get all documents for a user
   */
  static async getUserDocuments(userId: string, documentType?: string): Promise<VectorDocument[]> {
    try {
      let query = 'SELECT * FROM vector_documents WHERE user_id = $1';
      const values = [userId];

      if (documentType) {
        query += ' AND document_type = $2';
        values.push(documentType);
      }

      query += ' ORDER BY created_at DESC';

      const result = await db.query(query, values);

      return result.rows.map(doc => ({
        id: doc.id,
        userId: doc.user_id,
        content: doc.content,
        metadata: doc.metadata,
        documentType: doc.document_type,
        embedding: doc.embedding,
        createdAt: doc.created_at,
        updatedAt: doc.updated_at,
      }));
    } catch (error) {
      logger.error('Failed to get user documents:', error);
      throw error;
    }
  }

  /**
   * Delete a document
   */
  static async deleteDocument(id: string): Promise<boolean> {
    try {
      const query = 'DELETE FROM vector_documents WHERE id = $1';
      const result = await db.query(query, [id]);
      return result.rowCount > 0;
    } catch (error) {
      logger.error('Failed to delete document:', error);
      throw error;
    }
  }

  /**
   * Find similar documents to a given document
   */
  static async findSimilarDocuments(
    documentId: string,
    limit: number = 5,
    threshold: number = 0.8
  ): Promise<SimilaritySearchResult[]> {
    try {
      const document = await this.getDocumentById(documentId);
      if (!document || !document.embedding) {
        throw new Error('Document not found or has no embedding');
      }

      const query = `
        SELECT 
          id, user_id, content, metadata, document_type, embedding,
          created_at, updated_at,
          1 - (embedding <=> $1) as similarity
        FROM vector_documents
        WHERE id != $2 AND 1 - (embedding <=> $1) > $3
        ORDER BY similarity DESC
        LIMIT $4
      `;

      const values = [
        `[${document.embedding.join(',')}]`,
        documentId,
        threshold,
        limit
      ];

      const result = await db.query(query, values);

      return result.rows.map(row => ({
        document: {
          id: row.id,
          userId: row.user_id,
          content: row.content,
          metadata: row.metadata,
          documentType: row.document_type,
          embedding: row.embedding,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
        },
        similarity: parseFloat(row.similarity)
      }));
    } catch (error) {
      logger.error('Failed to find similar documents:', error);
      throw error;
    }
  }

  /**
   * Batch store multiple documents
   */
  static async batchStoreDocuments(documents: Omit<VectorDocument, 'id' | 'embedding' | 'createdAt' | 'updatedAt'>[]): Promise<VectorDocument[]> {
    try {
      const results: VectorDocument[] = [];

      // Process in batches to avoid overwhelming the embedding API
      const batchSize = 10;
      for (let i = 0; i < documents.length; i += batchSize) {
        const batch = documents.slice(i, i + batchSize);
        
        for (const doc of batch) {
          const stored = await this.storeDocument(doc);
          results.push(stored);
        }
      }

      return results;
    } catch (error) {
      logger.error('Batch store documents failed:', error);
      throw error;
    }
  }

  /**
   * Get document statistics for a user
   */
  static async getUserDocumentStats(userId: string): Promise<Record<string, number>> {
    try {
      const query = `
        SELECT document_type, COUNT(*) as count
        FROM vector_documents
        WHERE user_id = $1
        GROUP BY document_type
      `;

      const result = await db.query(query, [userId]);
      
      const stats: Record<string, number> = {};
      result.rows.forEach(row => {
        stats[row.document_type] = parseInt(row.count);
      });

      return stats;
    } catch (error) {
      logger.error('Failed to get user document stats:', error);
      throw error;
    }
  }
}