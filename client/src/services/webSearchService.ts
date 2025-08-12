import { api } from './api';

export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  source: string;
  publishedDate?: string;
  relevanceScore: number;
  sentiment?: 'positive' | 'negative' | 'neutral';
}

export interface TrendData {
  keyword: string;
  volume: number;
  growth: number;
  category: string;
  relatedTerms: string[];
  timeframe: string;
  sources: string[];
}

export interface CompetitorInfo {
  name: string;
  domain: string;
  industry: string;
  recentContent: SearchResult[];
  socialPresence: {
    platform: string;
    followers?: number;
    engagement?: number;
  }[];
  keyTopics: string[];
  contentFrequency: 'low' | 'moderate' | 'high';
}

export interface IndustryInsight {
  topic: string;
  trend: 'rising' | 'stable' | 'declining';
  impact: 'high' | 'medium' | 'low';
  description: string;
  sources: string[];
  keywords: string[];
  opportunities: string[];
  threats: string[];
}

export interface ContentOpportunity {
  topic: string;
  angle: string;
  difficulty: 'easy' | 'medium' | 'hard';
  potential: 'high' | 'medium' | 'low';
}

export interface TrendAlert {
  type: 'trend_alert' | 'competitor_alert' | 'opportunity_alert';
  priority: 'high' | 'medium' | 'low';
  title: string;
  message: string;
  actionable: boolean;
  action?: string;
}

export interface TrendDashboard {
  industryTrends?: {
    industry: string;
    trends: TrendData[];
    insights: IndustryInsight[];
    searchResults: SearchResult[];
    lastUpdated: string;
  };
  competitorAnalysis?: {
    industry: string;
    competitors: CompetitorInfo[];
    lastUpdated: string;
  };
  trendingTopics?: {
    industry: string;
    topics: string[];
    contentOpportunities: ContentOpportunity[];
    hashtags: string[];
    lastUpdated: string;
  };
  brandMentions?: {
    brandName: string;
    mentions: SearchResult[];
    sentiment: {
      positive: number;
      negative: number;
      neutral: number;
    };
    topSources: string[];
    keyThemes: string[];
    lastUpdated: string;
  };
}

export const webSearchService = {
  // Search industry trends
  async searchIndustryTrends(industry: string, keywords: string[] = []): Promise<{
    trends: TrendData[];
    insights: IndustryInsight[];
    searchResults: SearchResult[];
  }> {
    const response = await api.post('/web-search/trends', { industry, keywords });
    return {
      trends: response.data.trends,
      insights: response.data.insights,
      searchResults: response.data.searchResults
    };
  },

  // Monitor competitors
  async monitorCompetitors(industry: string, competitorNames: string[] = []): Promise<CompetitorInfo[]> {
    const response = await api.post('/web-search/competitors', { industry, competitorNames });
    return response.data.competitors;
  },

  // Get trending topics
  async getTrendingTopics(industry: string, userInterests: string[] = []): Promise<{
    topics: string[];
    contentOpportunities: ContentOpportunity[];
    hashtags: string[];
  }> {
    const response = await api.post('/web-search/trending-topics', { industry, userInterests });
    return {
      topics: response.data.topics,
      contentOpportunities: response.data.contentOpportunities,
      hashtags: response.data.hashtags
    };
  },

  // Search brand mentions
  async searchBrandMentions(brandName: string, keywords: string[] = []): Promise<{
    mentions: SearchResult[];
    sentiment: {
      positive: number;
      negative: number;
      neutral: number;
    };
    topSources: string[];
    keyThemes: string[];
  }> {
    const response = await api.post('/web-search/brand-mentions', { brandName, keywords });
    return {
      mentions: response.data.mentions,
      sentiment: response.data.sentiment,
      topSources: response.data.topSources,
      keyThemes: response.data.keyThemes
    };
  },

  // Get trend dashboard
  async getTrendDashboard(): Promise<TrendDashboard> {
    const response = await api.get('/web-search/dashboard');
    return response.data.dashboard;
  },

  // Get insights summary
  async getInsightsSummary(): Promise<{
    totalTrends: number;
    totalCompetitors: number;
    totalTopics: number;
    totalMentions: number;
    lastUpdated: string | null;
    keyInsights: any[];
    topTrends: TrendData[];
    contentOpportunities: ContentOpportunity[];
  }> {
    const response = await api.get('/web-search/insights');
    return response.data.insights;
  },

  // Get trend alerts
  async getTrendAlerts(): Promise<{
    alerts: TrendAlert[];
    totalAlerts: number;
  }> {
    const response = await api.get('/web-search/alerts');
    return {
      alerts: response.data.alerts,
      totalAlerts: response.data.totalAlerts
    };
  }
};