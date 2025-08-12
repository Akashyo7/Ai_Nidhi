import { UserContextModel, UserProfileModel } from '@/models';
import { EmbeddingService } from '@/services/embeddingService';
import { logger } from '@/utils/logger';

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
  createdAt: Date;
  confidence: number;
}

export class ContextService {
  
  /**
   * Update user context with analysis and versioning
   */
  static async updateUserContext(
    userId: string, 
    contextContent: string
  ): Promise<{ context: any; analysis: ContextAnalysis }> {
    try {
      // Analyze the context content
      const analysis = await this.analyzeContext(contextContent);
      
      // Store the context with versioning
      const contextData = {
        content: contextContent,
        analysis,
        lastUpdated: new Date(),
        wordCount: analysis.wordCount,
        keywords: analysis.keywords,
        topics: analysis.topics,
        industries: analysis.industries
      };

      const context = await UserContextModel.updateOrCreate(
        userId,
        'context_box',
        contextData,
        analysis.confidence
      );

      // Store as vector embedding for semantic search
      await EmbeddingService.storeUserContext(
        userId,
        'context_box',
        {
          content: contextContent,
          analysis,
          version: context.version
        }
      );

      // Update user profile with the new context
      await UserProfileModel.update(userId, {
        contextBox: contextContent
      });

      logger.info(`Updated context for user ${userId}, version ${context.version}`);
      
      return { context, analysis };
    } catch (error) {
      logger.error('Failed to update user context:', error);
      throw error;
    }
  }

  /**
   * Get context history for a user
   */
  static async getContextHistory(userId: string): Promise<ContextVersion[]> {
    try {
      const contexts = await UserContextModel.findByType(userId, 'context_box');
      
      return contexts.map(context => ({
        id: context.id,
        version: context.version,
        content: context.data.content,
        analysis: context.data.analysis,
        createdAt: context.createdAt,
        confidence: context.confidence
      }));
    } catch (error) {
      logger.error('Failed to get context history:', error);
      throw error;
    }
  }

  /**
   * Get the latest context for a user
   */
  static async getLatestContext(userId: string): Promise<ContextVersion | null> {
    try {
      const context = await UserContextModel.findLatestByType(userId, 'context_box');
      
      if (!context) {
        return null;
      }

      return {
        id: context.id,
        version: context.version,
        content: context.data.content,
        analysis: context.data.analysis,
        createdAt: context.createdAt,
        confidence: context.confidence
      };
    } catch (error) {
      logger.error('Failed to get latest context:', error);
      throw error;
    }
  }

  /**
   * Analyze context content for keywords, topics, and insights
   */
  static async analyzeContext(content: string): Promise<ContextAnalysis> {
    try {
      const words = content.toLowerCase().split(/\s+/);
      const wordCount = words.length;
      
      // Extract keywords (words longer than 3 characters, excluding common words)
      const stopWords = new Set([
        'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
        'from', 'up', 'about', 'into', 'through', 'during', 'before', 'after', 'above',
        'below', 'between', 'among', 'this', 'that', 'these', 'those', 'i', 'me', 'my',
        'myself', 'we', 'our', 'ours', 'ourselves', 'you', 'your', 'yours', 'yourself',
        'yourselves', 'he', 'him', 'his', 'himself', 'she', 'her', 'hers', 'herself',
        'it', 'its', 'itself', 'they', 'them', 'their', 'theirs', 'themselves', 'what',
        'which', 'who', 'whom', 'this', 'that', 'these', 'those', 'am', 'is', 'are',
        'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'having', 'do',
        'does', 'did', 'doing', 'a', 'an', 'as', 'able', 'also', 'can', 'could',
        'should', 'would', 'will', 'shall', 'may', 'might', 'must'
      ]);

      const wordFreq: Record<string, number> = {};
      words.forEach(word => {
        const cleanWord = word.replace(/[^\w]/g, '');
        if (cleanWord.length > 3 && !stopWords.has(cleanWord)) {
          wordFreq[cleanWord] = (wordFreq[cleanWord] || 0) + 1;
        }
      });

      const keywords = Object.entries(wordFreq)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([word]) => word);

      // Identify professional terms and industries
      const professionalTerms = this.extractProfessionalTerms(content);
      const industries = this.identifyIndustries(content);
      const topics = this.extractTopics(content, keywords);

      // Simple sentiment analysis
      const sentiment = this.analyzeSentiment(content);

      // Calculate readability score (simplified Flesch Reading Ease)
      const sentences = content.split(/[.!?]+/).length;
      const avgWordsPerSentence = wordCount / sentences;
      const avgSyllablesPerWord = this.estimateAverageSyllables(words);
      const readabilityScore = 206.835 - (1.015 * avgWordsPerSentence) - (84.6 * avgSyllablesPerWord);

      // Calculate confidence based on content quality
      const confidence = this.calculateConfidence(content, wordCount, keywords.length);

      return {
        keywords,
        topics,
        sentiment,
        confidence,
        wordCount,
        readabilityScore: Math.max(0, Math.min(100, readabilityScore)),
        professionalTerms,
        industries
      };
    } catch (error) {
      logger.error('Failed to analyze context:', error);
      throw error;
    }
  }

  /**
   * Extract professional terms from content
   */
  private static extractProfessionalTerms(content: string): string[] {
    const professionalKeywords = [
      // Technology
      'software', 'development', 'programming', 'coding', 'javascript', 'python', 'react',
      'nodejs', 'database', 'api', 'frontend', 'backend', 'fullstack', 'devops', 'cloud',
      'aws', 'azure', 'docker', 'kubernetes', 'microservices', 'agile', 'scrum',
      
      // Business
      'management', 'leadership', 'strategy', 'marketing', 'sales', 'business', 'entrepreneur',
      'startup', 'innovation', 'growth', 'revenue', 'profit', 'roi', 'kpi', 'analytics',
      'consulting', 'operations', 'finance', 'accounting', 'hr', 'recruitment',
      
      // Design
      'design', 'ux', 'ui', 'user experience', 'user interface', 'figma', 'sketch',
      'photoshop', 'illustrator', 'branding', 'visual', 'creative', 'typography',
      
      // Data & Analytics
      'data', 'analytics', 'machine learning', 'ai', 'artificial intelligence',
      'statistics', 'visualization', 'tableau', 'sql', 'excel', 'reporting'
    ];

    const lowerContent = content.toLowerCase();
    return professionalKeywords.filter(term => 
      lowerContent.includes(term)
    );
  }

  /**
   * Identify industries from content
   */
  private static identifyIndustries(content: string): string[] {
    const industryKeywords = {
      'Technology': ['tech', 'software', 'programming', 'development', 'coding', 'startup', 'saas'],
      'Finance': ['finance', 'banking', 'investment', 'trading', 'fintech', 'accounting'],
      'Healthcare': ['healthcare', 'medical', 'health', 'hospital', 'pharmaceutical', 'biotech'],
      'Education': ['education', 'teaching', 'learning', 'university', 'school', 'training'],
      'Marketing': ['marketing', 'advertising', 'branding', 'social media', 'content', 'seo'],
      'Consulting': ['consulting', 'advisory', 'strategy', 'management', 'business'],
      'Design': ['design', 'creative', 'ux', 'ui', 'visual', 'graphic'],
      'Sales': ['sales', 'business development', 'account management', 'revenue'],
      'Operations': ['operations', 'logistics', 'supply chain', 'manufacturing'],
      'HR': ['human resources', 'recruitment', 'talent', 'people', 'culture']
    };

    const lowerContent = content.toLowerCase();
    const identifiedIndustries: string[] = [];

    Object.entries(industryKeywords).forEach(([industry, keywords]) => {
      const matches = keywords.filter(keyword => lowerContent.includes(keyword));
      if (matches.length > 0) {
        identifiedIndustries.push(industry);
      }
    });

    return identifiedIndustries;
  }

  /**
   * Extract topics from content
   */
  private static extractTopics(content: string, keywords: string[]): string[] {
    const topicPatterns = {
      'Leadership': ['lead', 'manage', 'team', 'leadership', 'management'],
      'Innovation': ['innovation', 'creative', 'new', 'innovative', 'breakthrough'],
      'Growth': ['growth', 'scale', 'expand', 'increase', 'develop'],
      'Strategy': ['strategy', 'strategic', 'plan', 'planning', 'vision'],
      'Technology': ['technology', 'tech', 'digital', 'software', 'system'],
      'Communication': ['communication', 'presentation', 'speaking', 'writing'],
      'Problem Solving': ['problem', 'solution', 'solve', 'challenge', 'issue'],
      'Collaboration': ['collaboration', 'team', 'work', 'together', 'partnership']
    };

    const lowerContent = content.toLowerCase();
    const topics: string[] = [];

    Object.entries(topicPatterns).forEach(([topic, patterns]) => {
      const matches = patterns.filter(pattern => 
        lowerContent.includes(pattern) || keywords.some(keyword => keyword.includes(pattern))
      );
      if (matches.length > 0) {
        topics.push(topic);
      }
    });

    return topics;
  }

  /**
   * Simple sentiment analysis
   */
  private static analyzeSentiment(content: string): 'positive' | 'neutral' | 'negative' {
    const positiveWords = [
      'good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'awesome',
      'love', 'like', 'enjoy', 'happy', 'excited', 'passionate', 'successful',
      'achieve', 'accomplish', 'win', 'best', 'better', 'improve', 'growth'
    ];

    const negativeWords = [
      'bad', 'terrible', 'awful', 'hate', 'dislike', 'sad', 'angry', 'frustrated',
      'difficult', 'challenge', 'problem', 'issue', 'fail', 'failure', 'worst',
      'worse', 'decline', 'decrease', 'loss'
    ];

    const lowerContent = content.toLowerCase();
    let positiveScore = 0;
    let negativeScore = 0;

    positiveWords.forEach(word => {
      if (lowerContent.includes(word)) positiveScore++;
    });

    negativeWords.forEach(word => {
      if (lowerContent.includes(word)) negativeScore++;
    });

    if (positiveScore > negativeScore) return 'positive';
    if (negativeScore > positiveScore) return 'negative';
    return 'neutral';
  }

  /**
   * Estimate average syllables per word
   */
  private static estimateAverageSyllables(words: string[]): number {
    const totalSyllables = words.reduce((sum, word) => {
      // Simple syllable estimation: count vowel groups
      const vowelGroups = word.match(/[aeiouy]+/gi);
      return sum + (vowelGroups ? vowelGroups.length : 1);
    }, 0);

    return totalSyllables / words.length;
  }

  /**
   * Calculate confidence score based on content quality
   */
  private static calculateConfidence(content: string, wordCount: number, keywordCount: number): number {
    let confidence = 0.5; // Base confidence

    // Word count factor
    if (wordCount >= 100) confidence += 0.2;
    else if (wordCount >= 50) confidence += 0.1;

    // Keyword diversity factor
    if (keywordCount >= 8) confidence += 0.2;
    else if (keywordCount >= 5) confidence += 0.1;

    // Structure factor (presence of punctuation suggests better structure)
    const sentences = content.split(/[.!?]+/).length;
    if (sentences > 3) confidence += 0.1;

    // Professional terms factor
    const professionalTerms = this.extractProfessionalTerms(content);
    if (professionalTerms.length >= 3) confidence += 0.1;

    return Math.min(1.0, confidence);
  }

  /**
   * Get context insights and recommendations
   */
  static async getContextInsights(userId: string): Promise<{
    strengths: string[];
    suggestions: string[];
    missingAreas: string[];
  }> {
    try {
      const context = await this.getLatestContext(userId);
      
      if (!context) {
        return {
          strengths: [],
          suggestions: ['Add your professional background and expertise to get personalized insights'],
          missingAreas: ['Professional background', 'Skills and expertise', 'Career goals', 'Industry experience']
        };
      }

      const analysis = context.analysis;
      const strengths: string[] = [];
      const suggestions: string[] = [];
      const missingAreas: string[] = [];

      // Analyze strengths
      if (analysis.professionalTerms.length > 0) {
        strengths.push(`Strong professional vocabulary (${analysis.professionalTerms.length} terms identified)`);
      }

      if (analysis.industries.length > 0) {
        strengths.push(`Clear industry focus: ${analysis.industries.join(', ')}`);
      }

      if (analysis.wordCount >= 100) {
        strengths.push('Comprehensive professional description');
      }

      if (analysis.readabilityScore >= 60) {
        strengths.push('Clear and readable communication style');
      }

      // Generate suggestions
      if (analysis.wordCount < 50) {
        suggestions.push('Consider adding more details about your experience and expertise');
      }

      if (analysis.industries.length === 0) {
        suggestions.push('Mention your industry or field of expertise for better targeting');
      }

      if (analysis.professionalTerms.length < 3) {
        suggestions.push('Include more specific skills and technologies you work with');
      }

      if (!analysis.topics.includes('Leadership') && !analysis.topics.includes('Strategy')) {
        suggestions.push('Consider highlighting your leadership experience or strategic thinking');
      }

      // Identify missing areas
      const commonAreas = ['Leadership', 'Strategy', 'Innovation', 'Communication', 'Problem Solving'];
      const missingTopics = commonAreas.filter(area => !analysis.topics.includes(area));
      
      if (missingTopics.length > 0) {
        missingAreas.push(...missingTopics.map(topic => `${topic} experience`));
      }

      return { strengths, suggestions, missingAreas };
    } catch (error) {
      logger.error('Failed to get context insights:', error);
      throw error;
    }
  }
}