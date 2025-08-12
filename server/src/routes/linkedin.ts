import { Router } from 'express';
import { authenticateToken } from '@/middleware/auth';
import { LinkedInService } from '@/services/linkedinService';
import { validateRequired } from '@/utils/modelValidation';
import { logger } from '@/utils/logger';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

/**
 * Analyze LinkedIn profile from manual input
 * POST /api/linkedin/analyze
 */
router.post('/analyze', async (req, res) => {
  try {
    const { 
      headline, 
      summary, 
      currentPosition, 
      company, 
      industry, 
      location, 
      skills = [], 
      experience = [], 
      education = [] 
    } = req.body;
    const userId = req.user!.userId;

    // Validate required fields
    const errors = [
      validateRequired(headline, 'headline'),
      validateRequired(industry, 'industry')
    ].filter(Boolean);

    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    const analysis = await LinkedInService.extractFromManualInput(userId, {
      headline,
      summary: summary || '',
      currentPosition: currentPosition || '',
      company: company || '',
      industry,
      location: location || '',
      skills,
      experience,
      education
    });

    res.json({
      message: 'LinkedIn profile analyzed successfully',
      analysis
    });
  } catch (error) {
    logger.error('Failed to analyze LinkedIn profile:', error);
    res.status(500).json({ error: 'Failed to analyze LinkedIn profile' });
  }
});

/**
 * Get LinkedIn analysis
 * GET /api/linkedin/analysis
 */
router.get('/analysis', async (req, res) => {
  try {
    const userId = req.user!.userId;
    const data = await LinkedInService.getLinkedInAnalysis(userId);

    if (!data) {
      return res.json({
        analysis: null,
        profile: null,
        message: 'No LinkedIn analysis found. Add your profile data to get started.'
      });
    }

    res.json({
      analysis: data.analysis,
      profile: data.profile
    });
  } catch (error) {
    logger.error('Failed to get LinkedIn analysis:', error);
    res.status(500).json({ error: 'Failed to get LinkedIn analysis' });
  }
});

/**
 * Get profile recommendations
 * GET /api/linkedin/recommendations
 */
router.get('/recommendations', async (req, res) => {
  try {
    const userId = req.user!.userId;
    const recommendations = await LinkedInService.generateProfileRecommendations(userId);

    res.json({
      recommendations
    });
  } catch (error) {
    logger.error('Failed to get profile recommendations:', error);
    res.status(500).json({ error: 'Failed to get profile recommendations' });
  }
});

/**
 * Compare with industry benchmarks
 * GET /api/linkedin/benchmarks
 */
router.get('/benchmarks', async (req, res) => {
  try {
    const userId = req.user!.userId;
    const comparison = await LinkedInService.compareWithBenchmarks(userId);

    res.json({
      comparison
    });
  } catch (error) {
    logger.error('Failed to compare with benchmarks:', error);
    res.status(500).json({ error: 'Failed to compare with benchmarks' });
  }
});

/**
 * Get profile strength score
 * GET /api/linkedin/score
 */
router.get('/score', async (req, res) => {
  try {
    const userId = req.user!.userId;
    const data = await LinkedInService.getLinkedInAnalysis(userId);

    if (!data) {
      return res.json({
        score: null,
        message: 'No LinkedIn analysis found'
      });
    }

    const score = {
      overall: Math.round(data.analysis.brandStrength.profileCompleteness * 100),
      breakdown: {
        completeness: Math.round(data.analysis.brandStrength.profileCompleteness * 100),
        networkSize: data.analysis.brandStrength.networkSize,
        thoughtLeadership: Math.round(data.analysis.brandStrength.thoughtLeadership * 100),
        careerProgression: data.analysis.careerProgression.trajectory
      },
      careerLevel: data.analysis.professionalSummary.careerLevel,
      confidence: Math.round(data.analysis.confidence * 100)
    };

    res.json({
      score
    });
  } catch (error) {
    logger.error('Failed to get profile score:', error);
    res.status(500).json({ error: 'Failed to get profile score' });
  }
});

export default router;