import { api } from './api';

export interface WritingStyleProfile {
  tone: string;
  formality: 'formal' | 'semi-formal' | 'casual';
  vocabulary: {
    complexity: 'simple' | 'moderate' | 'complex';
    technicalLevel: 'basic' | 'intermediate' | 'advanced';
    commonWords: string[];
    uniqueWords: string[];
  };
  sentenceStructure: {
    averageLength: number;
    complexity: 'simple' | 'compound' | 'complex';
    variety: number;
  };
  writingPatterns: {
    preferredFormats: string[];
    commonPhrases: string[];
    transitionWords: string[];
    callToActionStyle: string[];
  };
  contentThemes: {
    primaryTopics: string[];
    expertise: string[];
    perspectives: string[];
  };
  engagement: {
    questionUsage: number;
    storytellingElements: boolean;
    personalAnecdotes: boolean;
    dataUsage: boolean;
  };
  brandVoice: {
    personality: string[];
    values: string[];
    communication_style: string;
  };
  confidence: number;
  sampleCount: number;
  lastAnalyzed: string;
}

export interface ContentSample {
  content: string;
  platform: string;
  contentType: string;
  metadata?: {
    engagement?: number;
    reach?: number;
    publishedAt?: string;
    tags?: string[];
  };
}

export interface StyleRecommendations {
  strengths: string[];
  improvements: string[];
  suggestions: string[];
}

export interface StyleComparison {
  similarity: number;
  differences: string[];
  recommendations: string[];
}

export interface StyleInsights {
  hasProfile: boolean;
  message?: string;
  summary?: {
    tone: string;
    formality: string;
    complexity: string;
    confidence: number;
    sampleCount: number;
    lastAnalyzed: string;
  };
  strengths: string[];
  improvements: string[];
  suggestions: string[];
  keyMetrics?: {
    averageSentenceLength: number;
    vocabularyLevel: string;
    engagementScore: number;
    brandConsistency: number;
  };
  contentThemes: string[];
  brandVoice: string[];
}

export interface StyleEvolution {
  version: number;
  date: string;
  confidence: number;
  summary: {
    tone: string;
    formality: string;
    complexity: string;
    sampleCount: number;
  };
}

export const writingStyleService = {
  // Analyze writing style from samples
  async analyzeWritingStyle(samples: ContentSample[]): Promise<{
    profile: WritingStyleProfile;
    samplesAnalyzed: number;
  }> {
    const response = await api.post('/writing-style/analyze', { samples });
    return response.data;
  },

  // Get current writing style profile
  async getProfile(): Promise<WritingStyleProfile | null> {
    const response = await api.get('/writing-style/profile');
    return response.data.profile;
  },

  // Add a new content sample
  async addContentSample(sample: ContentSample): Promise<WritingStyleProfile> {
    const response = await api.post('/writing-style/sample', sample);
    return response.data.profile;
  },

  // Get writing style recommendations
  async getRecommendations(): Promise<StyleRecommendations> {
    const response = await api.get('/writing-style/recommendations');
    return response.data.recommendations;
  },

  // Compare two sets of writing samples
  async compareWritingStyles(samples1: ContentSample[], samples2: ContentSample[]): Promise<{
    comparison: StyleComparison;
    profile1: Partial<WritingStyleProfile>;
    profile2: Partial<WritingStyleProfile>;
  }> {
    const response = await api.post('/writing-style/compare', { samples1, samples2 });
    return response.data;
  },

  // Get comprehensive writing style insights
  async getInsights(): Promise<StyleInsights> {
    const response = await api.get('/writing-style/insights');
    return response.data.insights;
  },

  // Get writing style evolution over time
  async getEvolution(limit = 10): Promise<{
    evolution: StyleEvolution[];
    totalVersions: number;
  }> {
    const response = await api.get(`/writing-style/evolution?limit=${limit}`);
    return response.data;
  },

  // Generate comprehensive writing style report
  async generateReport(): Promise<{
    report: {
      generatedAt: string;
      userId: string;
      profile: any;
      recommendations: StyleRecommendations;
      lastUpdated: string;
    };
  }> {
    const response = await api.get('/writing-style/report');
    return response.data;
  }
};