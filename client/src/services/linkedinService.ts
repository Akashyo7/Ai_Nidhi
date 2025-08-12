import { api } from './api';

export interface LinkedInProfileInput {
  headline: string;
  summary?: string;
  currentPosition?: string;
  company?: string;
  industry: string;
  location?: string;
  skills: string[];
  experience: Array<{
    title: string;
    company: string;
    duration: string;
    description?: string;
  }>;
  education: Array<{
    school: string;
    degree?: string;
    field?: string;
  }>;
}

export interface LinkedInAnalysis {
  professionalSummary: {
    careerLevel: 'entry' | 'mid' | 'senior' | 'executive';
    industryExperience: number;
    primaryIndustry: string;
    keySkills: string[];
    leadershipIndicators: string[];
  };
  brandStrength: {
    profileCompleteness: number;
    networkSize: 'small' | 'medium' | 'large' | 'extensive';
    contentActivity: 'low' | 'moderate' | 'high';
    thoughtLeadership: number;
  };
  careerProgression: {
    trajectory: 'ascending' | 'stable' | 'transitioning';
    roleProgression: string[];
    industryConsistency: number;
    tenurePattern: 'short' | 'moderate' | 'long';
  };
  personalBrand: {
    brandKeywords: string[];
    valueProposition: string;
    targetAudience: string[];
    differentiators: string[];
  };
  recommendations: {
    profileOptimization: string[];
    contentStrategy: string[];
    networkingOpportunities: string[];
    skillDevelopment: string[];
  };
  confidence: number;
}

export interface ProfileRecommendations {
  profileOptimization: string[];
  contentStrategy: string[];
  networkingTips: string[];
  skillDevelopment: string[];
}

export interface BenchmarkComparison {
  profileStrength: number;
  industryComparison: {
    networkSize: 'below' | 'average' | 'above';
    profileCompleteness: 'below' | 'average' | 'above';
    skillEndorsements: 'below' | 'average' | 'above';
  };
  recommendations: string[];
}

export interface ProfileScore {
  overall: number;
  breakdown: {
    completeness: number;
    networkSize: string;
    thoughtLeadership: number;
    careerProgression: string;
  };
  careerLevel: string;
  confidence: number;
}

export const linkedinService = {
  // Analyze LinkedIn profile
  async analyzeProfile(profileData: LinkedInProfileInput): Promise<LinkedInAnalysis> {
    const response = await api.post('/linkedin/analyze', profileData);
    return response.data.analysis;
  },

  // Get current LinkedIn analysis
  async getAnalysis(): Promise<{ analysis: LinkedInAnalysis | null; profile: any | null }> {
    const response = await api.get('/linkedin/analysis');
    return {
      analysis: response.data.analysis,
      profile: response.data.profile
    };
  },

  // Get profile recommendations
  async getRecommendations(): Promise<ProfileRecommendations> {
    const response = await api.get('/linkedin/recommendations');
    return response.data.recommendations;
  },

  // Compare with industry benchmarks
  async getBenchmarks(): Promise<BenchmarkComparison> {
    const response = await api.get('/linkedin/benchmarks');
    return response.data.comparison;
  },

  // Get profile score
  async getScore(): Promise<ProfileScore | null> {
    const response = await api.get('/linkedin/score');
    return response.data.score;
  }
};