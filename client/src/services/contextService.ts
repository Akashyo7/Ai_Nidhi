import { api } from './api';

export interface ContextAnalysis {
  keywords: string[];
  topics: string[];
  sentiment: 'positive' | 'neutral' | 'negative';
  confidence: number;
  wordCount: number;
  readabilityScore: number;
  professionalTerms: string[];
  industries: string[];
}

export interface ContextVersion {
  id: string;
  version: number;
  content: string;
  analysis: ContextAnalysis;
  createdAt: string;
  confidence: number;
}

export interface ContextInsights {
  strengths: string[];
  suggestions: string[];
  missingAreas: string[];
}

export interface ContextStats {
  totalVersions: number;
  currentVersion: number;
  averageConfidence: number;
  totalWords: number;
  lastUpdated: string | null;
  topKeywords: string[];
  identifiedIndustries: string[];
  mainTopics: string[];
}

export const contextService = {
  // Update user context
  async updateContext(content: string): Promise<{
    context: ContextVersion;
    analysis: ContextAnalysis;
  }> {
    const response = await api.put('/context', { content });
    return response.data;
  },

  // Get current context
  async getCurrentContext(): Promise<ContextVersion | null> {
    const response = await api.get('/context');
    return response.data.context;
  },

  // Get context history
  async getContextHistory(limit = 10): Promise<{
    history: ContextVersion[];
    total: number;
  }> {
    const response = await api.get(`/context/history?limit=${limit}`);
    return response.data;
  },

  // Get context insights
  async getContextInsights(): Promise<ContextInsights> {
    const response = await api.get('/context/insights');
    return response.data.insights;
  },

  // Analyze context without saving
  async analyzeContext(content: string): Promise<ContextAnalysis> {
    const response = await api.post('/context/analyze', { content });
    return response.data.analysis;
  },

  // Get context version by ID
  async getContextVersion(id: string): Promise<ContextVersion> {
    const response = await api.get(`/context/version/${id}`);
    return response.data.version;
  },

  // Get context statistics
  async getContextStats(): Promise<ContextStats> {
    const response = await api.get('/context/stats');
    return response.data.stats;
  }
};