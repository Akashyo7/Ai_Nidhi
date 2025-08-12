import { Router } from 'express';
import { authenticateToken } from '@/middleware/auth';
import { WebSearchService } from '@/services/webSearchService';
import { validateRequired } from '@/utils/modelValidation';
import { logger } from '@/utils/logger';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

/**
 * Search industry trends
 * POST /api/web-search/trends
 */
router.post('/trends', async (req, res) => {
  try {
    const { industry, keywords = [] } = req.body;
    const userId = req.user!.userId;

    // Validate required fields
    const errors = [
      validateRequired(industry, 'industry')
    ].filter(Boolean);

    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    const result = await WebSearchService.searchIndustryTrends(userId, industry, keywords);

    res.json({
      message: 'Industry trends retrieved successfully',
      ...result
    });
  } catch (error) {
    logger.error('Failed to search industry trends:', error);
    res.status(500).json({ error: 'Failed to search industry trends' });
  }
});

/**
 * Monitor competitors
 * POST /api/web-search/competitors
 */
router.post('/competitors', async (req, res) => {
  try {
    const { industry, competitorNames = [] } = req.body;
    const userId = req.user!.userId;

    // Validate required fields
    const errors = [
      validateRequired(industry, 'industry')
    ].filter(Boolean);

    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    const competitors = await WebSearchService.monitorCompetitors(userId, industry, competitorNames);

    res.json({
      message: 'Competitor analysis completed successfully',
      competitors
    });
  } catch (error) {
    logger.error('Failed to monitor competitors:', error);
    res.status(500).json({ error: 'Failed to monitor competitors' });
  }
});

/**
 * Get trending topics for content creation
 * POST /api/web-search/trending-topics
 */
router.post('/trending-topics', async (req, res) => {
  try {
    const { industry, userInterests = [] } = req.body;
    const userId = req.user!.userId;

    // Validate required fields
    const errors = [
      validateRequired(industry, 'industry')
    ].filter(Boolean);

    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    const result = await WebSearchService.getTrendingTopics(userId, industry, userInterests);

    res.json({
      message: 'Trending topics retrieved successfully',
      ...result
    });
  } catch (error) {
    logger.error('Failed to get trending topics:', error);
    res.status(500).json({ error: 'Failed to get trending topics' });
  }
});

/**
 * Search brand mentions
 * POST /api/web-search/brand-mentions
 */
router.post('/brand-mentions', async (req, res) => {
  try {
    const { brandName, keywords = [] } = req.body;
    const userId = req.user!.userId;

    // Validate required fields
    const errors = [
      validateRequired(brandName, 'brandName')
    ].filter(Boolean);

    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    const result = await WebSearchService.searchBrandMentions(userId, brandName, keywords);

    res.json({
      message: 'Brand mentions retrieved successfully',
      ...result
    });
  } catch (error) {
    logger.error('Failed to search brand mentions:', error);
    res.status(500).json({ error: 'Failed to search brand mentions' });
  }
});

/**
 * Get all stored trend data
 * GET /api/web-search/dashboard
 */
router.get('/dashboard', async (req, res) => {
  try {
    const userId = req.user!.userId;
    const data = await WebSearchService.getStoredTrends(userId);

    res.json({
      dashboard: data
    });
  } catch (error) {
    logger.error('Failed to get trend dashboard:', error);
    res.status(500).json({ error: 'Failed to get trend dashboard' });
  }
});

/**
 * Get industry insights summary
 * GET /api/web-search/insights
 */
router.get('/insights', async (req, res) => {
  try {
    const userId = req.user!.userId;
    const data = await WebSearchService.getStoredTrends(userId);

    // Compile insights summary
    const summary = {
      totalTrends: data.industryTrends?.trends?.length || 0,
      totalCompetitors: data.competitorAnalysis?.competitors?.length || 0,
      totalTopics: data.trendingTopics?.topics?.length || 0,
      totalMentions: data.brandMentions?.mentions?.length || 0,
      lastUpdated: data.industryTrends?.lastUpdated || null,
      keyInsights: [
        ...(data.industryTrends?.insights || []).slice(0, 3),
        ...(data.trendingTopics?.contentOpportunities || []).slice(0, 2)
      ],
      topTrends: (data.industryTrends?.trends || []).slice(0, 5),
      contentOpportunities: (data.trendingTopics?.contentOpportunities || []).slice(0, 5)
    };

    res.json({
      insights: summary
    });
  } catch (error) {
    logger.error('Failed to get insights summary:', error);
    res.status(500).json({ error: 'Failed to get insights summary' });
  }
});

/**
 * Get trend alerts and notifications
 * GET /api/web-search/alerts
 */
router.get('/alerts', async (req, res) => {
  try {
    const userId = req.user!.userId;
    const data = await WebSearchService.getStoredTrends(userId);

    // Generate alerts based on stored data
    const alerts = [];

    // High growth trends
    if (data.industryTrends?.trends) {
      const highGrowthTrends = data.industryTrends.trends.filter((trend: any) => trend.growth > 30);
      alerts.push(...highGrowthTrends.map((trend: any) => ({
        type: 'trend_alert',
        priority: 'high',
        title: `High Growth Trend: ${trend.keyword}`,
        message: `${trend.keyword} is showing ${trend.growth}% growth`,
        actionable: true,
        action: 'Create content about this trending topic'
      })));
    }

    // Competitor activity
    if (data.competitorAnalysis?.competitors) {
      const activeCompetitors = data.competitorAnalysis.competitors.filter((comp: any) => 
        comp.contentFrequency === 'high'
      );
      alerts.push(...activeCompetitors.map((comp: any) => ({
        type: 'competitor_alert',
        priority: 'medium',
        title: `Competitor Activity: ${comp.name}`,
        message: `${comp.name} has high content activity`,
        actionable: true,
        action: 'Review their recent content strategy'
      })));
    }

    // Content opportunities
    if (data.trendingTopics?.contentOpportunities) {
      const highPotentialOpps = data.trendingTopics.contentOpportunities.filter((opp: any) => 
        opp.potential === 'high' && opp.difficulty === 'easy'
      );
      alerts.push(...highPotentialOpps.map((opp: any) => ({
        type: 'opportunity_alert',
        priority: 'medium',
        title: `Content Opportunity: ${opp.topic}`,
        message: `High potential, easy difficulty content opportunity`,
        actionable: true,
        action: 'Create content with this angle: ' + opp.angle
      })));
    }

    res.json({
      alerts: alerts.slice(0, 10), // Limit to 10 alerts
      totalAlerts: alerts.length
    });
  } catch (error) {
    logger.error('Failed to get trend alerts:', error);
    res.status(500).json({ error: 'Failed to get trend alerts' });
  }
});

export default router;