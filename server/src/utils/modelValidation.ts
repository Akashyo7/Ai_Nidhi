import { Content, Project, IntelligenceData, UserContext, BrandStrategy } from '@/types';

// Content validation
export const validateContent = (content: Partial<Content>): string[] => {
  const errors: string[] = [];

  if (!content.userId) {
    errors.push('User ID is required');
  }

  if (!content.platform) {
    errors.push('Platform is required');
  }

  if (!content.contentType) {
    errors.push('Content type is required');
  }

  if (!content.body || content.body.trim().length === 0) {
    errors.push('Content body is required');
  }

  if (content.brandAlignment !== undefined && (content.brandAlignment < 0 || content.brandAlignment > 1)) {
    errors.push('Brand alignment must be between 0 and 1');
  }

  if (content.performanceScore !== undefined && (content.performanceScore < 0 || content.performanceScore > 1)) {
    errors.push('Performance score must be between 0 and 1');
  }

  if (content.status && !['draft', 'published', 'archived'].includes(content.status)) {
    errors.push('Status must be draft, published, or archived');
  }

  return errors;
};

// Project validation
export const validateProject = (project: Partial<Project>): string[] => {
  const errors: string[] = [];

  if (!project.userId) {
    errors.push('User ID is required');
  }

  if (!project.name || project.name.trim().length === 0) {
    errors.push('Project name is required');
  }

  if (!project.type) {
    errors.push('Project type is required');
  }

  if (project.type && !['opportunity', 'linkedin_voice', 'achievement_series', 'custom'].includes(project.type)) {
    errors.push('Project type must be opportunity, linkedin_voice, achievement_series, or custom');
  }

  if (project.status && !['active', 'completed', 'paused', 'cancelled'].includes(project.status)) {
    errors.push('Status must be active, completed, paused, or cancelled');
  }

  if (project.startDate && project.endDate && project.startDate > project.endDate) {
    errors.push('Start date cannot be after end date');
  }

  return errors;
};

// Intelligence Data validation
export const validateIntelligenceData = (intelligence: Partial<IntelligenceData>): string[] => {
  const errors: string[] = [];

  if (!intelligence.userId) {
    errors.push('User ID is required');
  }

  if (!intelligence.type) {
    errors.push('Intelligence type is required');
  }

  if (intelligence.type && !['trend', 'competitor', 'opportunity', 'threat', 'news'].includes(intelligence.type)) {
    errors.push('Intelligence type must be trend, competitor, opportunity, threat, or news');
  }

  if (!intelligence.data || typeof intelligence.data !== 'object') {
    errors.push('Intelligence data is required and must be an object');
  }

  if (intelligence.relevanceScore !== undefined && (intelligence.relevanceScore < 0 || intelligence.relevanceScore > 1)) {
    errors.push('Relevance score must be between 0 and 1');
  }

  if (intelligence.expiresAt && intelligence.expiresAt <= new Date()) {
    errors.push('Expiration date must be in the future');
  }

  return errors;
};

// User Context validation
export const validateUserContext = (context: Partial<UserContext>): string[] => {
  const errors: string[] = [];

  if (!context.userId) {
    errors.push('User ID is required');
  }

  if (!context.contextType) {
    errors.push('Context type is required');
  }

  if (context.contextType && !['writing_style', 'preferences', 'goals', 'industry', 'skills'].includes(context.contextType)) {
    errors.push('Context type must be writing_style, preferences, goals, industry, or skills');
  }

  if (!context.data || typeof context.data !== 'object') {
    errors.push('Context data is required and must be an object');
  }

  if (context.confidence !== undefined && (context.confidence < 0 || context.confidence > 1)) {
    errors.push('Confidence must be between 0 and 1');
  }

  if (context.version !== undefined && context.version < 1) {
    errors.push('Version must be a positive integer');
  }

  return errors;
};

// Brand Strategy validation
export const validateBrandStrategy = (strategy: Partial<BrandStrategy>): string[] => {
  const errors: string[] = [];

  if (!strategy.userId) {
    errors.push('User ID is required');
  }

  if (strategy.targetAudience && !Array.isArray(strategy.targetAudience)) {
    errors.push('Target audience must be an array');
  }

  if (strategy.contentPillars && !Array.isArray(strategy.contentPillars)) {
    errors.push('Content pillars must be an array');
  }

  if (strategy.voiceAndTone && typeof strategy.voiceAndTone !== 'object') {
    errors.push('Voice and tone must be an object');
  }

  if (strategy.platformStrategy && typeof strategy.platformStrategy !== 'object') {
    errors.push('Platform strategy must be an object');
  }

  return errors;
};

// Generic validation helper
export const validateRequired = (value: any, fieldName: string): string | null => {
  if (value === undefined || value === null || (typeof value === 'string' && value.trim().length === 0)) {
    return `${fieldName} is required`;
  }
  return null;
};

export const validateEmail = (email: string): string | null => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return 'Invalid email format';
  }
  return null;
};

export const validateUUID = (uuid: string): string | null => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(uuid)) {
    return 'Invalid UUID format';
  }
  return null;
};

export const validateRange = (value: number, min: number, max: number, fieldName: string): string | null => {
  if (value < min || value > max) {
    return `${fieldName} must be between ${min} and ${max}`;
  }
  return null;
};

export const validateArray = (value: any, fieldName: string): string | null => {
  if (!Array.isArray(value)) {
    return `${fieldName} must be an array`;
  }
  return null;
};

export const validateObject = (value: any, fieldName: string): string | null => {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return `${fieldName} must be an object`;
  }
  return null;
};