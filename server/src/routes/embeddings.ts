import { Router } from 'express';
import { authenticateToken } from '@/middleware/auth';
import { EmbeddingService } from '@/services/embeddingService';
import { VectorDatabaseService } from '@/utils/vectorDatabase';
import { validateRequired } from '@/utils/modelValidation';
import { logger } from '@/utils/logger';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

/**
 * Store writing sample for analysis
 * POST /api/embeddings/writing-sample
 */
router.post('/writing-sample', async (req, res) => {
  try {
    const { content, platform, contentType } = req.body;
    const userId = req.user!.userId;

    // Validate required fields
    const errors = [
      validateRequired(content, 'content'),
      validateRequired(platform, 'platform'),
      validateRequired(contentType, 'contentType')
    ].filter(Boolean);

    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    const document = await EmbeddingService.storeWritingSample(
      userId,
      content,
      platform,
      contentType
    );

    res.status(201).json({
      message: 'Writing sample stored successfully',
      documentId: document.id
    });
  } catch (error) {
    logger.error('Failed to store writing sample:', error);
    res.status(500).json({ error: 'Failed to store writing sample' });
  }
});

/**
 * Analyze user's writing style
 * POST /api/embeddings/analyze-writing-style
 */
router.post('/analyze-writing-style', async (req, res) => {
  try {
    const userId = req.user!.userId;

    const analysis = await EmbeddingService.analyzeWritingStyle(userId);

    res.json({
      message: 'Writing style analysis completed',
      analysis
    });
  } catch (error) {
    logger.error('Failed to analyze writing style:', error);
    res.status(500).json({ error: 'Failed to analyze writing style' });
  }
});

/**
 * Store user context for semantic search
 * POST /api/embeddings/context
 */
router.post('/context', async (req, res) => {
  try {
    const { contextType, contextData } = req.body;
    const userId = req.user!.userId;

    // Validate required fields
    const errors = [
      validateRequired(contextType, 'contextType'),
      validateRequired(contextData, 'contextData')
    ].filter(Boolean);

    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    const document = await EmbeddingService.storeUserContext(
      userId,
      contextType,
      contextData
    );

    res.status(201).json({
      message: 'User context stored successfully',
      documentId: document.id
    });
  } catch (error) {
    logger.error('Failed to store user context:', error);
    res.status(500).json({ error: 'Failed to store user context' });
  }
});

/**
 * Semantic search across user's documents
 * POST /api/embeddings/search
 */
router.post('/search', async (req, res) => {
  try {
    const { query, documentTypes, limit = 10, threshold = 0.7 } = req.body;
    const userId = req.user!.userId;

    // Validate required fields
    const errors = [
      validateRequired(query, 'query')
    ].filter(Boolean);

    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    const results = await EmbeddingService.findSimilarContent(userId, query, {
      documentTypes,
      limit,
      threshold,
      includeMetadata: true
    });

    res.json({
      query,
      results,
      count: results.length
    });
  } catch (error) {
    logger.error('Failed to perform semantic search:', error);
    res.status(500).json({ error: 'Failed to perform semantic search' });
  }
});

/**
 * Generate content ideas based on topic
 * POST /api/embeddings/content-ideas
 */
router.post('/content-ideas', async (req, res) => {
  try {
    const { topic, platform } = req.body;
    const userId = req.user!.userId;

    // Validate required fields
    const errors = [
      validateRequired(topic, 'topic'),
      validateRequired(platform, 'platform')
    ].filter(Boolean);

    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    const ideas = await EmbeddingService.generateContentIdeas(userId, topic, platform);

    res.json({
      topic,
      platform,
      ideas,
      count: ideas.length
    });
  } catch (error) {
    logger.error('Failed to generate content ideas:', error);
    res.status(500).json({ error: 'Failed to generate content ideas' });
  }
});

/**
 * Find relevant trends for user
 * POST /api/embeddings/relevant-trends
 */
router.post('/relevant-trends', async (req, res) => {
  try {
    const { userContext } = req.body;
    const userId = req.user!.userId;

    // Validate required fields
    const errors = [
      validateRequired(userContext, 'userContext')
    ].filter(Boolean);

    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    const trends = await EmbeddingService.findRelevantTrends(userId, userContext);

    res.json({
      userContext,
      trends,
      count: trends.length
    });
  } catch (error) {
    logger.error('Failed to find relevant trends:', error);
    res.status(500).json({ error: 'Failed to find relevant trends' });
  }
});

/**
 * Get user's document statistics
 * GET /api/embeddings/stats
 */
router.get('/stats', async (req, res) => {
  try {
    const userId = req.user!.userId;

    const stats = await VectorDatabaseService.getUserDocumentStats(userId);

    res.json({
      userId,
      documentStats: stats,
      totalDocuments: Object.values(stats).reduce((sum, count) => sum + count, 0)
    });
  } catch (error) {
    logger.error('Failed to get document stats:', error);
    res.status(500).json({ error: 'Failed to get document stats' });
  }
});

/**
 * Get user's documents by type
 * GET /api/embeddings/documents/:type?
 */
router.get('/documents/:type?', async (req, res) => {
  try {
    const { type } = req.params;
    const userId = req.user!.userId;

    const documents = await VectorDatabaseService.getUserDocuments(userId, type);

    res.json({
      userId,
      documentType: type || 'all',
      documents: documents.map(doc => ({
        id: doc.id,
        content: doc.content.substring(0, 200) + '...', // Truncate for overview
        metadata: doc.metadata,
        documentType: doc.documentType,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt
      })),
      count: documents.length
    });
  } catch (error) {
    logger.error('Failed to get user documents:', error);
    res.status(500).json({ error: 'Failed to get user documents' });
  }
});

/**
 * Delete a document
 * DELETE /api/embeddings/documents/:id
 */
router.delete('/documents/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    // Verify the document belongs to the user
    const document = await VectorDatabaseService.getDocumentById(id);
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    if (document.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const deleted = await VectorDatabaseService.deleteDocument(id);
    
    if (deleted) {
      res.json({ message: 'Document deleted successfully' });
    } else {
      res.status(404).json({ error: 'Document not found' });
    }
  } catch (error) {
    logger.error('Failed to delete document:', error);
    res.status(500).json({ error: 'Failed to delete document' });
  }
});

/**
 * Find similar documents to a given document
 * GET /api/embeddings/documents/:id/similar
 */
router.get('/documents/:id/similar', async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 5, threshold = 0.8 } = req.query;
    const userId = req.user!.userId;

    // Verify the document belongs to the user
    const document = await VectorDatabaseService.getDocumentById(id);
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    if (document.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const similarDocuments = await VectorDatabaseService.findSimilarDocuments(
      id,
      parseInt(limit as string),
      parseFloat(threshold as string)
    );

    res.json({
      documentId: id,
      similarDocuments: similarDocuments.map(result => ({
        document: {
          id: result.document.id,
          content: result.document.content.substring(0, 200) + '...',
          metadata: result.document.metadata,
          documentType: result.document.documentType,
          createdAt: result.document.createdAt
        },
        similarity: result.similarity
      })),
      count: similarDocuments.length
    });
  } catch (error) {
    logger.error('Failed to find similar documents:', error);
    res.status(500).json({ error: 'Failed to find similar documents' });
  }
});

export default router;