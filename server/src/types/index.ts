export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  lastActive: Date;
  isVerified: boolean;
}

export interface UserProfile {
  id: string;
  userId: string;
  profession: string;
  goals: string[];
  brandingObjectives: string[];
  contextBox: string;
  socialMediaHandles: SocialMediaProfile[];
  createdAt: Date;
  updatedAt: Date;
}

export interface SocialMediaProfile {
  platform: string;
  handle: string;
  url: string;
  isVerified: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  user: Omit<User, 'password'>;
  tokens: AuthTokens;
}

export interface JWTPayload {
  userId: string;
  email: string;
  iat: number;
  exp: number;
}

// Content Management Types
export interface Content {
  id: string;
  userId: string;
  platform: string;
  contentType: string;
  title?: string;
  body: string;
  tags: string[];
  brandAlignment: number;
  performanceScore: number;
  status: 'draft' | 'published' | 'archived';
  createdAt: Date;
  updatedAt: Date;
}

export interface ContentPerformance {
  views: number;
  likes: number;
  shares: number;
  comments: number;
  engagementRate: number;
  reachScore: number;
}

// Project Management Types
export interface Project {
  id: string;
  userId: string;
  name: string;
  type: 'opportunity' | 'linkedin_voice' | 'achievement_series' | 'custom';
  description?: string;
  goals: string[];
  status: 'active' | 'completed' | 'paused' | 'cancelled';
  startDate?: Date;
  endDate?: Date;
  context: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectTimeline {
  milestones: ProjectMilestone[];
  deadlines: ProjectDeadline[];
}

export interface ProjectMilestone {
  id: string;
  name: string;
  description: string;
  targetDate: Date;
  completed: boolean;
  completedAt?: Date;
}

export interface ProjectDeadline {
  id: string;
  name: string;
  date: Date;
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
}

// Intelligence and Context Types
export interface IntelligenceData {
  id: string;
  userId: string;
  type: 'trend' | 'competitor' | 'opportunity' | 'threat' | 'news';
  data: Record<string, any>;
  relevanceScore: number;
  isActionable: boolean;
  source?: string;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserContext {
  id: string;
  userId: string;
  contextType: 'writing_style' | 'preferences' | 'goals' | 'industry' | 'skills';
  data: Record<string, any>;
  confidence: number;
  lastUpdated: Date;
  version: number;
  createdAt: Date;
}

// Brand Strategy Types
export interface BrandStrategy {
  id: string;
  userId: string;
  coreMessage?: string;
  targetAudience: string[];
  contentPillars: string[];
  voiceAndTone: VoiceProfile;
  platformStrategy: PlatformStrategy;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface VoiceProfile {
  tone: string;
  personality: string[];
  vocabulary: string;
  writingStyle: string;
}

export interface PlatformStrategy {
  linkedin?: PlatformConfig;
  twitter?: PlatformConfig;
  instagram?: PlatformConfig;
  youtube?: PlatformConfig;
  blog?: PlatformConfig;
}

export interface PlatformConfig {
  active: boolean;
  postingFrequency: string;
  contentTypes: string[];
  hashtagStrategy: string[];
  engagementStrategy: string;
}

// External Intelligence Types
export interface TrendData {
  id: string;
  topic: string;
  industry: string;
  trendScore: number;
  momentum: 'rising' | 'stable' | 'declining';
  keywords: string[];
  sources: string[];
  detectedAt: Date;
  relevanceToUser: number;
}

export interface CompetitorProfile {
  id: string;
  name: string;
  industry: string;
  platforms: string[];
  strengths: string[];
  contentStrategy: string[];
  engagementMetrics: Record<string, number>;
  lastAnalyzed: Date;
}

export interface Opportunity {
  id: string;
  title: string;
  description: string;
  type: 'networking' | 'content' | 'collaboration' | 'speaking' | 'writing';
  priority: 'low' | 'medium' | 'high';
  deadline?: Date;
  source: string;
  actionRequired: string[];
  detectedAt: Date;
}

export interface Threat {
  id: string;
  title: string;
  description: string;
  type: 'reputation' | 'competition' | 'market_shift' | 'negative_sentiment';
  severity: 'low' | 'medium' | 'high';
  mitigation: string[];
  source: string;
  detectedAt: Date;
}

export interface SentimentAnalysis {
  overall: number;
  positive: number;
  negative: number;
  neutral: number;
  sources: string[];
  keywords: string[];
  analyzedAt: Date;
}