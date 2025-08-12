import { Router } from 'express';
import { authenticateToken } from '@/middleware/auth';
import { WritingStyleService, ContentSample } from '@/services/writingStyleService';
import { validateRequired } from '@/utils/modelValidation';
import { logger } from '@/utils/logger';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

/**
 * Analyze writing style from content samples
 * POST /api/writing-style/analyze
 */
router.post('/analyze', async (req, res) => {
  try {
    const { samples } = req.body;
    const userId = req.user!.userId;

    // Validate required fields
    const errors = [
      validateRequired(samples, 'samples')
    ].filter(Boolean);

    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    if (!Array.isArray(samples) || samples.length === 0) {
      return res.status(400).json({ 
        error: 'Samples must be a non-empty array' 
      });
    }

    // Validate each sample
    for (const sample of samples) {
      if (!sample.content || !sample.platform || !sample.contentType) {
        return res.status(400).json({
          error: 'Each sample must have content, platform, and contentType'
        });
      }
    }

    const profile = await WritingStyleService.analyzeWritingStyle(userId, samples);

    res.json({
      message: 'Writing style analyzed successfully',
      profile,
      samplesAnalyzed: samples.length
    });
  } catch (error) {
    logger.error('Failed to analyze writing style:', error);
    res.status(500).json({ error: 'Failed to analyze writing style' });
  }
});

/**
 * Get current writing style profile
 * GET /api/writing-style/profile
 */
router.get('/profile', async (req, res) => {
  try {
    const userId = req.user!.userId;

    const profile = await WritingStyleService.getWritingStyleProfile(userId);

    if (!profile) {
      return res.json({
        profile: null,
        message: 'No writing style profile found. Add content samples to get started.'
      });
    }

    res.json({
      profile
    });
  } catch (error) {
    logger.error('Failed to get writing style profile:', error);
    res.status(500).json({ error: 'Failed to get writing style profile' });
  }
});

/**
 * Add a new content sample
 * POST /api/writing-style/sample
 */
router.post('/sample', async (req, res) => {
  try {
    const { content, platform, contentType, metadata } = req.body;
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

    if (content.length < 50) {
      return res.status(400).json({
        error: 'Content must be at least 50 characters long'
      });
    }

    const sample: ContentSample = {
      content,
      platform,
      contentType,
      metadata
    };

    const updatedProfile = await WritingStyleService.addContentSample(userId, sample);

    res.json({
      message: 'Content sample added successfully',
      profile: updatedProfile
    });
  } catch (error) {
    logger.error('Failed to add content sample:', error);
    res.status(500).json({ error: 'Failed to add content sample' });
  }
});

/**
 * Get writing style recommendations
 * GET /api/writing-style/recommendations
 */
router.get('/recommendations', async (req, res) => {
  try {
    const userId = req.user!.userId;

    const recommendations = await WritingStyleService.getStyleRecommendations(userId);

    res.json({
      recommendations
    });
  } catch (error) {
    logger.error('Failed to get style recommendations:', error);
    res.status(500).json({ error: 'Failed to get style recommendations' });
  }
});

/**
 * Compare writing styles
 * POST /api/writing-style/compare
 */
router.post('/compare', async (req, res) => {
  try {
    const { samples1, samples2 } = req.body;
    const userId = req.user!.userId;

    // Validate required fields
    if (!samples1 || !samples2 || !Array.isArray(samples1) || !Array.isArray(samples2)) {
      return res.status(400).json({
        error: 'Both samples1 and samples2 must be provided as arrays'
      });
    }

    // Analyze both sets of samples
    const profile1 = await WritingStyleService.analyzeWritingStyle(userId + '_temp1', samples1);
    const profile2 = await WritingStyleService.analyzeWritingStyle(userId + '_temp2', samples2);

    // Compare the profiles
    const comparison = await WritingStyleService.compareWritingStyles(profile1, profile2);

    res.json({
      comparison,
      profile1: {
        tone: profile1.tone,
        formality: profile1.formality,
        vocabulary: profile1.vocabulary,
        confidence: profile1.confidence
      },
      profile2: {
        tone: profile2.tone,
        formality: profile2.formality,
        vocabulary: profile2.vocabulary,
        confidence: profile2.confidence
      }
    });
  } catch (error) {
    logger.error('Failed to compare writing styles:', error);
    res.status(500).json({ error: 'Failed to compare writing styles' });
  }
});

/**
 * Get writing style insights
 * GET /api/writing-style/insights
 */
router.get('/insights', async (req, res) => {
  try {
    const userId = req.user!.userId;

    const profile = await WritingStyleService.getWritingStyleProfile(userId);
    
    if (!profile) {
      return res.json({
        insights: {
          hasProfile: false,
          message: 'Add content samples to get writing style insights',
          suggestions: [
            'Upload recent blog posts or articles',
            'Add social media content samples',
            'Include professional communications'
          ]
        }
      });
    }

    const recommendations = await WritingStyleService.getStyleRecommendations(userId);

    const insights = {
      hasProfile: true,
      summary: {
        tone: profile.tone,
        formality: profile.formality,
        complexity: profile.vocabulary.complexity,
        confidence: profile.confidence,
        sampleCount: profile.sampleCount,
        lastAnalyzed: profile.lastAnalyzed
      },
      strengths: recommendations.strengths,
      improvements: recommendations.improvements,
      suggestions: recommendations.suggestions,
      keyMetrics: {
        averageSentenceLength: profile.sentenceStructure.averageLength,
        vocabularyLevel: profile.vocabulary.technicalLevel,
        engagementScore: profile.engagement.questionUsage,
        brandConsistency: profile.confidence
      },
      contentThemes: profile.contentThemes.primaryTopics,
      brandVoice: profile.brandVoice.personality
    };

    res.json({ insights });
  } catch (error) {
    logger.error('Failed to get writing style insights:', error);
    res.status(500).json({ error: 'Failed to get writing style insights' });
  }
});

/**
 * Get writing style evolution (historical analysis)
 * GET /api/writing-style/evolution
 */
router.get('/evolution', async (req, res) => {
  try {
    const userId = req.user!.userId;
    const { limit = 10 } = req.query;

    // Get historical writing style profiles
    const { UserContextModel } = await import('@/models');
    const contexts = await UserContextModel.findByType(userId, 'writing_style');
    
    const evolution = contexts
      .slice(0, parseInt(limit as string))
      .map(context => ({
        version: context.version,
        date: context.createdAt,
        confidence: context.confidence,
        summary: {
          tone: context.data.tone,
          formality: context.data.formality,
          complexity: context.data.vocabulary?.complexity,
          sampleCount: context.data.sampleCount
        }
      }))
      .reverse(); // Show oldest to newest

    res.json({
      evolution,
      totalVersions: contexts.length
    });
  } catch (error) {
    logger.error('Failed to get writing style evolution:', error);
    res.status(500).json({ error: 'Failed to get writing style evolution' });
  }
});

/**
 * Generate writing style report
 * GET /api/writing-style/report
 */
router.get('/report', async (req, res) => {
  try {
    const userId = req.user!.userId;

    const profile = await WritingStyleService.getWritingStyleProfile(userId);
    
    if (!profile) {
      return res.status(404).json({
        error: 'No writing style profile found'
      });
    }

    const recommendations = await WritingStyleService.getStyleRecommendations(userId);

    const report = {
      generatedAt: new Date(),
      userId,
      profile: {
        overview: {
          tone: profile.tone,
          formality: profile.formality,
          communicationStyle: profile.brandVoice.communication_style,
          confidence: profile.confidence,
          samplesAnalyzed: profile.sampleCount
        },
        vocabulary: {
          complexity: profile.vocabulary.complexity,
          technicalLevel: profile.vocabulary.technicalLevel,
          topWords: profile.vocabulary.commonWords.slice(0, 10)
        },
        structure: {
          averageSentenceLength: profile.sentenceStructure.averageLength,
          complexity: profile.sentenceStructure.complexity,
          variety: profile.sentenceStructure.variety
        },
        engagement: {
          questionUsage: profile.engagement.questionUsage,
          storytelling: profile.engagement.storytellingElements,
          personalTouch: profile.engagement.personalAnecdotes,
          dataSupport: profile.engagement.dataUsage
        },
        brandVoice: {
          personality: profile.brandVoice.personality,
          values: profile.brandVoice.values,
          communicationStyle: profile.brandVoice.communication_style
        },
        contentFocus: {
          primaryTopics: profile.contentThemes.primaryTopics,
          expertise: profile.contentThemes.expertise,
          preferredFormats: profile.writingPatterns.preferredFormats
        }
      },
      recommendations: {
        strengths: recommendations.strengths,
        improvements: recommendations.improvements,
        suggestions: recommendations.suggestions
      },
      lastUpdated: profile.lastAnalyzed
    };

    res.json({ report });
  } catch (error) {
    logger.error('Failed to generate writing style report:', error);
    res.status(500).json({ error: 'Failed to generate writing style report' });
  }
});

export default router;