import { Router } from 'express';
import { authenticateToken } from '@/middleware/auth';
import { ContextService } from '@/services/contextService';
import { validateRequired } from '@/utils/modelValidation';
import { logger } from '@/utils/logger';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

/**
 * Update user context
 * PUT /api/context
 */
router.put('/', async (req, res) => {
  try {
    const { content } = req.body;
    const userId = req.user!.userId;

    // Validate required fields
    const errors = [
      validateRequired(content, 'content')
    ].filter(Boolean);

    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    if (content.length < 10) {
      return res.status(400).json({ 
        error: 'Context must be at least 10 characters long' 
      });
    }

    const result = await ContextService.updateUserContext(userId, content);

    res.json({
      message: 'Context updated successfully',
      context: result.context,
      analysis: result.analysis
    });
  } catch (error) {
    logger.error('Failed to update context:', error);
    res.status(500).json({ error: 'Failed to update context' });
  }
});

/**
 * Get current user context
 * GET /api/context
 */
router.get('/', async (req, res) => {
  try {
    const userId = req.user!.userId;

    const context = await ContextService.getLatestContext(userId);

    if (!context) {
      return res.json({
        context: null,
        message: 'No context found'
      });
    }

    res.json({
      context: {
        id: context.id,
        version: context.version,
        content: context.content,
        analysis: context.analysis,
        createdAt: context.createdAt,
        confidence: context.confidence
      }
    });
  } catch (error) {
    logger.error('Failed to get context:', error);
    res.status(500).json({ error: 'Failed to get context' });
  }
});

/**
 * Get context history
 * GET /api/context/history
 */
router.get('/history', async (req, res) => {
  try {
    const userId = req.user!.userId;
    const { limit = 10 } = req.query;

    const history = await ContextService.getContextHistory(userId);
    
    // Limit results
    const limitedHistory = history.slice(0, parseInt(limit as string));

    res.json({
      history: limitedHistory.map(context => ({
        id: context.id,
        version: context.version,
        content: context.content.substring(0, 200) + (context.content.length > 200 ? '...' : ''),
        analysis: {
          wordCount: context.analysis.wordCount,
          keywords: context.analysis.keywords.slice(0, 5),
          topics: context.analysis.topics,
          sentiment: context.analysis.sentiment,
          confidence: context.analysis.confidence
        },
        createdAt: context.createdAt,
        confidence: context.confidence
      })),
      total: history.length
    });
  } catch (error) {
    logger.error('Failed to get context history:', error);
    res.status(500).json({ error: 'Failed to get context history' });
  }
});

/**
 * Get context insights and recommendations
 * GET /api/context/insights
 */
router.get('/insights', async (req, res) => {
  try {
    const userId = req.user!.userId;

    const insights = await ContextService.getContextInsights(userId);

    res.json({
      insights: {
        strengths: insights.strengths,
        suggestions: insights.suggestions,
        missingAreas: insights.missingAreas
      }
    });
  } catch (error) {
    logger.error('Failed to get context insights:', error);
    res.status(500).json({ error: 'Failed to get context insights' });
  }
});

/**
 * Analyze context content (preview without saving)
 * POST /api/context/analyze
 */
router.post('/analyze', async (req, res) => {
  try {
    const { content } = req.body;

    // Validate required fields
    const errors = [
      validateRequired(content, 'content')
    ].filter(Boolean);

    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    if (content.length < 10) {
      return res.status(400).json({ 
        error: 'Content must be at least 10 characters long' 
      });
    }

    const analysis = await ContextService.analyzeContext(content);

    res.json({
      analysis: {
        wordCount: analysis.wordCount,
        keywords: analysis.keywords,
        topics: analysis.topics,
        sentiment: analysis.sentiment,
        confidence: analysis.confidence,
        readabilityScore: analysis.readabilityScore,
        professionalTerms: analysis.professionalTerms,
        industries: analysis.industries
      }
    });
  } catch (error) {
    logger.error('Failed to analyze context:', error);
    res.status(500).json({ error: 'Failed to analyze context' });
  }
});

/**
 * Get context version by ID
 * GET /api/context/version/:id
 */
router.get('/version/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    const history = await ContextService.getContextHistory(userId);
    const version = history.find(v => v.id === id);

    if (!version) {
      return res.status(404).json({ error: 'Context version not found' });
    }

    res.json({
      version: {
        id: version.id,
        version: version.version,
        content: version.content,
        analysis: version.analysis,
        createdAt: version.createdAt,
        confidence: version.confidence
      }
    });
  } catch (error) {
    logger.error('Failed to get context version:', error);
    res.status(500).json({ error: 'Failed to get context version' });
  }
});

/**
 * Get context statistics
 * GET /api/context/stats
 */
router.get('/stats', async (req, res) => {
  try {
    const userId = req.user!.userId;

    const history = await ContextService.getContextHistory(userId);
    const latest = await ContextService.getLatestContext(userId);

    if (!latest) {
      return res.json({
        stats: {
          totalVersions: 0,
          currentVersion: 0,
          averageConfidence: 0,
          totalWords: 0,
          lastUpdated: null
        }
      });
    }

    const averageConfidence = history.reduce((sum, ctx) => sum + ctx.confidence, 0) / history.length;

    res.json({
      stats: {
        totalVersions: history.length,
        currentVersion: latest.version,
        averageConfidence: Math.round(averageConfidence * 100) / 100,
        totalWords: latest.analysis.wordCount,
        lastUpdated: latest.createdAt,
        topKeywords: latest.analysis.keywords.slice(0, 5),
        identifiedIndustries: latest.analysis.industries,
        mainTopics: latest.analysis.topics
      }
    });
  } catch (error) {
    logger.error('Failed to get context stats:', error);
    res.status(500).json({ error: 'Failed to get context stats' });
  }
});

export default router;