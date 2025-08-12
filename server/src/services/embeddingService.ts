import { VectorDatabaseService, VectorDocument } from '@/utils/vectorDatabase';
import { UserContextModel, ContentModel, IntelligenceDataModel } from '@/models';
import { logger } from '@/utils/logger';

export interface ContentEmbedding {
  contentId: string;
  vectorDocumentId: string;
  similarity?: number;
}

export interface WritingStyleAnalysis {
  tone: string;
  vocabulary: string[];
  commonPhrases: string[];
  sentenceStructure: string;
  topicPreferences: string[];
  confidence: number;
}

export interface SemanticSearchOptions {
  documentTypes?: string[];
  limit?: number;
  threshold?: number;
  includeMetadata?: boolean;
}

export class EmbeddingService {
  
  /**
   * Store user context as vector embeddings for semantic search
   */
  static async storeUserContext(userId: string, contextType: string, contextData: Record<string, any>): Promise<VectorDocument> {
    try {
      // Convert context data to searchable text
      const contextText = this.contextToText(contextType, contextData);
      
      const document = await VectorDatabaseService.storeDocument({
        userId,
        content: contextText,
        metadata: {
          contextType,
          originalData: contextData,
          timestamp: new Date().toISOString()
        },
        documentType: 'context'
      });

      logger.info(`Stored user context embedding: ${contextType} for user ${userId}`);
      return document;
    } catch (error) {
      logger.error('Failed to store user context embedding:', error);
      throw error;
    }
  }

  /**
   * Store content samples for writing style analysis
   */
  static async storeWritingSample(userId: string, content: string, platform: string, contentType: string): Promise<VectorDocument> {
    try {
      const document = await VectorDatabaseService.storeDocument({
        userId,
        content,
        metadata: {
          platform,
          contentType,
          wordCount: content.split(' ').length,
          timestamp: new Date().toISOString()
        },
        documentType: 'writing_sample'
      });

      logger.info(`Stored writing sample embedding for user ${userId}`);
      return document;
    } catch (error) {
      logger.error('Failed to store writing sample embedding:', error);
      throw error;
    }
  }

  /**
   * Store trend data for semantic matching
   */
  static async storeTrendData(userId: string, trendData: any): Promise<VectorDocument> {
    try {
      const trendText = this.trendToText(trendData);
      
      const document = await VectorDatabaseService.storeDocument({
        userId,
        content: trendText,
        metadata: {
          trendType: trendData.type,
          industry: trendData.industry,
          relevanceScore: trendData.relevanceScore,
          source: trendData.source,
          timestamp: new Date().toISOString()
        },
        documentType: 'trend'
      });

      logger.info(`Stored trend embedding for user ${userId}`);
      return document;
    } catch (error) {
      logger.error('Failed to store trend embedding:', error);
      throw error;
    }
  }

  /**
   * Store competitor analysis data
   */
  static async storeCompetitorData(userId: string, competitorData: any): Promise<VectorDocument> {
    try {
      const competitorText = this.competitorToText(competitorData);
      
      const document = await VectorDatabaseService.storeDocument({
        userId,
        content: competitorText,
        metadata: {
          competitorName: competitorData.name,
          industry: competitorData.industry,
          platforms: competitorData.platforms,
          strengths: competitorData.strengths,
          timestamp: new Date().toISOString()
        },
        documentType: 'competitor'
      });

      logger.info(`Stored competitor embedding for user ${userId}`);
      return document;
    } catch (error) {
      logger.error('Failed to store competitor embedding:', error);
      throw error;
    }
  }

  /**
   * Analyze writing style from stored samples
   */
  static async analyzeWritingStyle(userId: string): Promise<WritingStyleAnalysis> {
    try {
      const writingSamples = await VectorDatabaseService.getUserDocuments(userId, 'writing_sample');
      
      if (writingSamples.length === 0) {
        throw new Error('No writing samples found for analysis');
      }

      // Combine all writing samples for analysis
      const combinedText = writingSamples.map(doc => doc.content).join(' ');
      
      // Perform style analysis (this would typically use NLP libraries or AI services)
      const analysis = await this.performStyleAnalysis(combinedText, writingSamples);
      
      // Store the analysis as user context
      await UserContextModel.updateOrCreate(
        userId,
        'writing_style',
        analysis,
        analysis.confidence
      );

      return analysis;
    } catch (error) {
      logger.error('Failed to analyze writing style:', error);
      throw error;
    }
  }

  /**
   * Find semantically similar content for inspiration
   */
  static async findSimilarContent(userId: string, query: string, options: SemanticSearchOptions = {}): Promise<any[]> {
    try {
      const {
        documentTypes = ['content', 'writing_sample'],
        limit = 10,
        threshold = 0.7,
        includeMetadata = true
      } = options;

      const results = [];

      for (const docType of documentTypes) {
        const searchResults = await VectorDatabaseService.similaritySearch(
          query,
          userId,
          docType,
          limit,
          threshold
        );

        results.push(...searchResults.map(result => ({
          ...result,
          documentType: docType,
          metadata: includeMetadata ? result.document.metadata : undefined
        })));
      }

      // Sort by similarity and limit results
      return results
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, limit);
    } catch (error) {
      logger.error('Failed to find similar content:', error);
      throw error;
    }
  }

  /**
   * Find relevant trends based on user context
   */
  static async findRelevantTrends(userId: string, userContext: string): Promise<any[]> {
    try {
      const trendResults = await VectorDatabaseService.similaritySearch(
        userContext,
        userId,
        'trend',
        5,
        0.6
      );

      return trendResults.map(result => ({
        trend: result.document.metadata,
        relevance: result.similarity,
        content: result.document.content
      }));
    } catch (error) {
      logger.error('Failed to find relevant trends:', error);
      throw error;
    }
  }

  /**
   * Generate content ideas based on semantic similarity
   */
  static async generateContentIdeas(userId: string, topic: string, platform: string): Promise<any[]> {
    try {
      // Find similar content and trends
      const [similarContent, relevantTrends] = await Promise.all([
        this.findSimilarContent(userId, topic, { limit: 5 }),
        this.findRelevantTrends(userId, topic)
      ]);

      // Combine insights to generate ideas
      const ideas = [];

      // Ideas based on similar content
      similarContent.forEach(content => {
        ideas.push({
          type: 'similar_content',
          topic: `${topic} - inspired by previous content`,
          platform,
          confidence: content.similarity,
          source: 'user_content',
          metadata: content.metadata
        });
      });

      // Ideas based on trends
      relevantTrends.forEach(trend => {
        ideas.push({
          type: 'trend_based',
          topic: `${topic} - ${trend.trend.trendType}`,
          platform,
          confidence: trend.relevance,
          source: 'trend_analysis',
          metadata: trend.trend
        });
      });

      return ideas.sort((a, b) => b.confidence - a.confidence);
    } catch (error) {
      logger.error('Failed to generate content ideas:', error);
      throw error;
    }
  }

  /**
   * Update embeddings when content changes
   */
  static async updateContentEmbedding(contentId: string, newContent: string): Promise<void> {
    try {
      // Find existing vector document for this content
      const existingDocs = await VectorDatabaseService.getUserDocuments('', 'content');
      const existingDoc = existingDocs.find(doc => doc.metadata.contentId === contentId);

      if (existingDoc) {
        await VectorDatabaseService.updateDocument(existingDoc.id, {
          content: newContent,
          metadata: {
            ...existingDoc.metadata,
            lastUpdated: new Date().toISOString()
          }
        });
      }
    } catch (error) {
      logger.error('Failed to update content embedding:', error);
      throw error;
    }
  }

  /**
   * Convert context data to searchable text
   */
  private static contextToText(contextType: string, contextData: Record<string, any>): string {
    const parts = [`Context Type: ${contextType}`];
    
    Object.entries(contextData).forEach(([key, value]) => {
      if (typeof value === 'string') {
        parts.push(`${key}: ${value}`);
      } else if (Array.isArray(value)) {
        parts.push(`${key}: ${value.join(', ')}`);
      } else if (typeof value === 'object') {
        parts.push(`${key}: ${JSON.stringify(value)}`);
      }
    });

    return parts.join('. ');
  }

  /**
   * Convert trend data to searchable text
   */
  private static trendToText(trendData: any): string {
    const parts = [
      `Trend: ${trendData.topic || trendData.title}`,
      `Industry: ${trendData.industry}`,
      `Type: ${trendData.type}`,
    ];

    if (trendData.keywords) {
      parts.push(`Keywords: ${trendData.keywords.join(', ')}`);
    }

    if (trendData.description) {
      parts.push(`Description: ${trendData.description}`);
    }

    return parts.join('. ');
  }

  /**
   * Convert competitor data to searchable text
   */
  private static competitorToText(competitorData: any): string {
    const parts = [
      `Competitor: ${competitorData.name}`,
      `Industry: ${competitorData.industry}`,
    ];

    if (competitorData.platforms) {
      parts.push(`Platforms: ${competitorData.platforms.join(', ')}`);
    }

    if (competitorData.strengths) {
      parts.push(`Strengths: ${competitorData.strengths.join(', ')}`);
    }

    if (competitorData.contentStrategy) {
      parts.push(`Content Strategy: ${competitorData.contentStrategy.join(', ')}`);
    }

    return parts.join('. ');
  }

  /**
   * Perform basic writing style analysis
   */
  private static async performStyleAnalysis(text: string, samples: VectorDocument[]): Promise<WritingStyleAnalysis> {
    // This is a simplified analysis - in production, you'd use more sophisticated NLP
    const words = text.toLowerCase().split(/\s+/);
    const sentences = text.split(/[.!?]+/);
    
    // Calculate basic metrics
    const avgWordsPerSentence = words.length / sentences.length;
    const wordFrequency = this.calculateWordFrequency(words);
    
    // Determine tone based on word usage (simplified)
    const professionalWords = ['professional', 'business', 'strategy', 'development', 'growth'];
    const casualWords = ['awesome', 'cool', 'great', 'love', 'amazing'];
    
    const professionalScore = professionalWords.reduce((score, word) => 
      score + (wordFrequency[word] || 0), 0);
    const casualScore = casualWords.reduce((score, word) => 
      score + (wordFrequency[word] || 0), 0);
    
    const tone = professionalScore > casualScore ? 'professional' : 'casual';
    
    // Extract common phrases (simplified)
    const commonPhrases = this.extractCommonPhrases(text);
    
    // Get top vocabulary words
    const vocabulary = Object.entries(wordFrequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 20)
      .map(([word]) => word);

    return {
      tone,
      vocabulary,
      commonPhrases,
      sentenceStructure: avgWordsPerSentence > 15 ? 'complex' : 'simple',
      topicPreferences: this.extractTopics(samples),
      confidence: Math.min(samples.length / 10, 1) // Confidence based on sample size
    };
  }

  private static calculateWordFrequency(words: string[]): Record<string, number> {
    const frequency: Record<string, number> = {};
    words.forEach(word => {
      if (word.length > 3) { // Ignore short words
        frequency[word] = (frequency[word] || 0) + 1;
      }
    });
    return frequency;
  }

  private static extractCommonPhrases(text: string): string[] {
    // Simplified phrase extraction - in production, use proper NLP
    const sentences = text.split(/[.!?]+/);
    const phrases: Record<string, number> = {};
    
    sentences.forEach(sentence => {
      const words = sentence.trim().split(/\s+/);
      for (let i = 0; i < words.length - 2; i++) {
        const phrase = words.slice(i, i + 3).join(' ').toLowerCase();
        if (phrase.length > 10) {
          phrases[phrase] = (phrases[phrase] || 0) + 1;
        }
      }
    });

    return Object.entries(phrases)
      .filter(([, count]) => count > 1)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([phrase]) => phrase);
  }

  private static extractTopics(samples: VectorDocument[]): string[] {
    // Extract topics from metadata
    const topics = new Set<string>();
    
    samples.forEach(sample => {
      if (sample.metadata.platform) {
        topics.add(sample.metadata.platform);
      }
      if (sample.metadata.contentType) {
        topics.add(sample.metadata.contentType);
      }
    });

    return Array.from(topics);
  }
}