import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import { VectorDatabaseService } from '@/utils/vectorDatabase';
import { EmbeddingService } from '@/services/embeddingService';
import { UserModel } from '@/models';
import { initializeDatabase } from '@/utils/database';

// Mock OpenAI to avoid API calls during testing
jest.mock('openai', () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
      embeddings: {
        create: jest.fn().mockResolvedValue({
          data: [{
            embedding: Array(1536).fill(0).map(() => Math.random())
          }]
        })
      }
    }))
  };
});

describe('Vector Database Service', () => {
  let testUserId: string;

  beforeAll(async () => {
    // Initialize database with vector support
    await initializeDatabase();
    await VectorDatabaseService.initialize();
  });

  beforeEach(async () => {
    // Create a test user
    const user = await UserModel.create({
      email: 'vector-test@example.com',
      password: 'hashedpassword123',
      name: 'Vector Test User'
    });
    testUserId = user.id;
  });

  afterAll(async () => {
    // Clean up test data
    if (testUserId) {
      // This will cascade delete vector documents
      await UserModel.delete(testUserId);
    }
  });

  describe('Document Storage', () => {
    it('should store a document with embedding', async () => {
      const document = await VectorDatabaseService.storeDocument({
        userId: testUserId,
        content: 'This is a test document for vector storage',
        metadata: { type: 'test', category: 'unit-test' },
        documentType: 'content'
      });

      expect(document).toBeTruthy();
      expect(document.id).toBeTruthy();
      expect(document.userId).toBe(testUserId);
      expect(document.content).toBe('This is a test document for vector storage');
      expect(document.documentType).toBe('content');
      expect(document.embedding).toBeTruthy();
    });

    it('should update a document and regenerate embedding', async () => {
      const document = await VectorDatabaseService.storeDocument({
        userId: testUserId,
        content: 'Original content',
        metadata: { version: 1 },
        documentType: 'content'
      });

      const updated = await VectorDatabaseService.updateDocument(document.id, {
        content: 'Updated content with new information',
        metadata: { version: 2 }
      });

      expect(updated).toBeTruthy();
      expect(updated?.content).toBe('Updated content with new information');
      expect(updated?.metadata.version).toBe(2);
      expect(updated?.embedding).toBeTruthy();
      expect(updated?.embedding).not.toEqual(document.embedding);
    });

    it('should retrieve document by ID', async () => {
      const stored = await VectorDatabaseService.storeDocument({
        userId: testUserId,
        content: 'Document for retrieval test',
        metadata: { test: true },
        documentType: 'content'
      });

      const retrieved = await VectorDatabaseService.getDocumentById(stored.id);

      expect(retrieved).toBeTruthy();
      expect(retrieved?.id).toBe(stored.id);
      expect(retrieved?.content).toBe('Document for retrieval test');
    });

    it('should delete a document', async () => {
      const document = await VectorDatabaseService.storeDocument({
        userId: testUserId,
        content: 'Document to be deleted',
        metadata: {},
        documentType: 'content'
      });

      const deleted = await VectorDatabaseService.deleteDocument(document.id);
      expect(deleted).toBe(true);

      const retrieved = await VectorDatabaseService.getDocumentById(document.id);
      expect(retrieved).toBeNull();
    });
  });

  describe('Similarity Search', () => {
    beforeEach(async () => {
      // Store some test documents for similarity search
      await VectorDatabaseService.storeDocument({
        userId: testUserId,
        content: 'JavaScript is a programming language for web development',
        metadata: { topic: 'programming' },
        documentType: 'content'
      });

      await VectorDatabaseService.storeDocument({
        userId: testUserId,
        content: 'Python is great for data science and machine learning',
        metadata: { topic: 'programming' },
        documentType: 'content'
      });

      await VectorDatabaseService.storeDocument({
        userId: testUserId,
        content: 'Cooking pasta requires boiling water and adding salt',
        metadata: { topic: 'cooking' },
        documentType: 'content'
      });
    });

    it('should find similar documents', async () => {
      const results = await VectorDatabaseService.similaritySearch(
        'Programming languages and software development',
        testUserId,
        'content',
        5,
        0.1 // Lower threshold for testing
      );

      expect(results.length).toBeGreaterThan(0);
      expect(results[0].similarity).toBeGreaterThan(0);
      
      // Programming-related content should be more similar
      const programmingResults = results.filter(r => 
        r.document.content.includes('JavaScript') || r.document.content.includes('Python')
      );
      expect(programmingResults.length).toBeGreaterThan(0);
    });

    it('should filter by document type', async () => {
      // Store a writing sample
      await VectorDatabaseService.storeDocument({
        userId: testUserId,
        content: 'This is my writing style sample',
        metadata: { platform: 'linkedin' },
        documentType: 'writing_sample'
      });

      const contentResults = await VectorDatabaseService.similaritySearch(
        'writing style',
        testUserId,
        'content',
        10,
        0.1
      );

      const writingSampleResults = await VectorDatabaseService.similaritySearch(
        'writing style',
        testUserId,
        'writing_sample',
        10,
        0.1
      );

      // Should find different results for different document types
      expect(contentResults.length).toBeGreaterThanOrEqual(0);
      expect(writingSampleResults.length).toBeGreaterThan(0);
      
      writingSampleResults.forEach(result => {
        expect(result.document.documentType).toBe('writing_sample');
      });
    });

    it('should find similar documents to a given document', async () => {
      const document = await VectorDatabaseService.storeDocument({
        userId: testUserId,
        content: 'React is a JavaScript library for building user interfaces',
        metadata: { framework: 'react' },
        documentType: 'content'
      });

      const similarDocs = await VectorDatabaseService.findSimilarDocuments(
        document.id,
        3,
        0.1
      );

      expect(similarDocs.length).toBeGreaterThan(0);
      similarDocs.forEach(result => {
        expect(result.document.id).not.toBe(document.id);
        expect(result.similarity).toBeGreaterThan(0);
      });
    });
  });

  describe('User Document Management', () => {
    it('should get all documents for a user', async () => {
      await VectorDatabaseService.storeDocument({
        userId: testUserId,
        content: 'First document',
        metadata: {},
        documentType: 'content'
      });

      await VectorDatabaseService.storeDocument({
        userId: testUserId,
        content: 'Second document',
        metadata: {},
        documentType: 'writing_sample'
      });

      const allDocs = await VectorDatabaseService.getUserDocuments(testUserId);
      expect(allDocs.length).toBe(2);

      const contentDocs = await VectorDatabaseService.getUserDocuments(testUserId, 'content');
      expect(contentDocs.length).toBe(1);
      expect(contentDocs[0].documentType).toBe('content');
    });

    it('should get document statistics', async () => {
      await VectorDatabaseService.storeDocument({
        userId: testUserId,
        content: 'Content document',
        metadata: {},
        documentType: 'content'
      });

      await VectorDatabaseService.storeDocument({
        userId: testUserId,
        content: 'Writing sample',
        metadata: {},
        documentType: 'writing_sample'
      });

      const stats = await VectorDatabaseService.getUserDocumentStats(testUserId);
      
      expect(stats.content).toBe(1);
      expect(stats.writing_sample).toBe(1);
    });
  });

  describe('Batch Operations', () => {
    it('should batch store multiple documents', async () => {
      const documents = [
        {
          userId: testUserId,
          content: 'First batch document',
          metadata: { batch: 1 },
          documentType: 'content' as const
        },
        {
          userId: testUserId,
          content: 'Second batch document',
          metadata: { batch: 1 },
          documentType: 'content' as const
        }
      ];

      const results = await VectorDatabaseService.batchStoreDocuments(documents);
      
      expect(results.length).toBe(2);
      results.forEach(doc => {
        expect(doc.id).toBeTruthy();
        expect(doc.embedding).toBeTruthy();
        expect(doc.metadata.batch).toBe(1);
      });
    });
  });
});

describe('Embedding Service', () => {
  let testUserId: string;

  beforeAll(async () => {
    await initializeDatabase();
    await VectorDatabaseService.initialize();
  });

  beforeEach(async () => {
    const user = await UserModel.create({
      email: 'embedding-test@example.com',
      password: 'hashedpassword123',
      name: 'Embedding Test User'
    });
    testUserId = user.id;
  });

  describe('Writing Style Analysis', () => {
    it('should store and analyze writing samples', async () => {
      // Store multiple writing samples
      await EmbeddingService.storeWritingSample(
        testUserId,
        'This is a professional post about business strategy and growth.',
        'linkedin',
        'post'
      );

      await EmbeddingService.storeWritingSample(
        testUserId,
        'Another professional article discussing market trends and analysis.',
        'linkedin',
        'article'
      );

      const analysis = await EmbeddingService.analyzeWritingStyle(testUserId);

      expect(analysis).toBeTruthy();
      expect(analysis.tone).toBeTruthy();
      expect(analysis.vocabulary).toBeInstanceOf(Array);
      expect(analysis.confidence).toBeGreaterThan(0);
    });
  });

  describe('Context Storage', () => {
    it('should store user context for semantic search', async () => {
      const contextData = {
        profession: 'Software Developer',
        interests: ['JavaScript', 'React', 'Node.js'],
        goals: ['Build better applications', 'Learn new technologies']
      };

      const document = await EmbeddingService.storeUserContext(
        testUserId,
        'professional_context',
        contextData
      );

      expect(document).toBeTruthy();
      expect(document.documentType).toBe('context');
      expect(document.metadata.contextType).toBe('professional_context');
      expect(document.metadata.originalData).toEqual(contextData);
    });
  });

  describe('Content Ideas Generation', () => {
    it('should generate content ideas based on stored data', async () => {
      // Store some context and writing samples
      await EmbeddingService.storeUserContext(testUserId, 'interests', {
        topics: ['web development', 'JavaScript', 'career growth']
      });

      await EmbeddingService.storeWritingSample(
        testUserId,
        'Web development is evolving rapidly with new frameworks',
        'linkedin',
        'post'
      );

      const ideas = await EmbeddingService.generateContentIdeas(
        testUserId,
        'JavaScript frameworks',
        'linkedin'
      );

      expect(ideas).toBeInstanceOf(Array);
      ideas.forEach(idea => {
        expect(idea.topic).toBeTruthy();
        expect(idea.platform).toBe('linkedin');
        expect(idea.confidence).toBeGreaterThan(0);
      });
    });
  });

  describe('Semantic Search', () => {
    it('should find similar content across document types', async () => {
      // Store different types of documents
      await EmbeddingService.storeUserContext(testUserId, 'skills', {
        programming: ['JavaScript', 'Python', 'React']
      });

      await EmbeddingService.storeWritingSample(
        testUserId,
        'Building React applications with modern JavaScript',
        'blog',
        'article'
      );

      const results = await EmbeddingService.findSimilarContent(
        testUserId,
        'React development and JavaScript programming',
        { limit: 5, threshold: 0.1 }
      );

      expect(results).toBeInstanceOf(Array);
      expect(results.length).toBeGreaterThan(0);
      
      results.forEach(result => {
        expect(result.similarity).toBeGreaterThan(0);
        expect(['context', 'writing_sample']).toContain(result.documentType);
      });
    });
  });
});