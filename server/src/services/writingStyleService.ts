import { EmbeddingService } from '@/services/embeddingService';
import { UserContextModel } from '@/models';
import { VectorDatabaseService } from '@/utils/vectorDatabase';
import { logger } from '@/utils/logger';

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
    variety: number; // 0-1 score
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
  lastAnalyzed: Date;
}

export interface ContentSample {
  id?: string;
  content: string;
  platform: string;
  contentType: string;
  metadata?: {
    engagement?: number;
    reach?: number;
    publishedAt?: Date;
    tags?: string[];
  };
}

export interface StyleComparison {
  similarity: number;
  differences: string[];
  recommendations: string[];
}

export class WritingStyleService {
  
  /**
   * Analyze writing style from multiple content samples
   */
  static async analyzeWritingStyle(userId: string, samples: ContentSample[]): Promise<WritingStyleProfile> {
    try {
      if (samples.length === 0) {
        throw new Error('No content samples provided');
      }

      // Store samples as vector embeddings
      for (const sample of samples) {
        await EmbeddingService.storeWritingSample(
          userId,
          sample.content,
          sample.platform,
          sample.contentType
        );
      }

      // Combine all content for analysis
      const combinedContent = samples.map(s => s.content).join('\n\n');
      
      // Perform comprehensive style analysis
      const profile = await this.performStyleAnalysis(combinedContent, samples);
      
      // Store the writing style profile
      await UserContextModel.updateOrCreate(
        userId,
        'writing_style',
        profile,
        profile.confidence
      );

      logger.info(`Analyzed writing style for user ${userId} with ${samples.length} samples`);
      
      return profile;
    } catch (error) {
      logger.error('Failed to analyze writing style:', error);
      throw error;
    }
  }

  /**
   * Get user's current writing style profile
   */
  static async getWritingStyleProfile(userId: string): Promise<WritingStyleProfile | null> {
    try {
      const context = await UserContextModel.findLatestByType(userId, 'writing_style');
      
      if (!context) {
        return null;
      }

      return context.data as WritingStyleProfile;
    } catch (error) {
      logger.error('Failed to get writing style profile:', error);
      throw error;
    }
  }

  /**
   * Add new content sample and update style profile
   */
  static async addContentSample(userId: string, sample: ContentSample): Promise<WritingStyleProfile> {
    try {
      // Store the new sample
      await EmbeddingService.storeWritingSample(
        userId,
        sample.content,
        sample.platform,
        sample.contentType
      );

      // Get all existing samples
      const existingSamples = await VectorDatabaseService.getUserDocuments(userId, 'writing_sample');
      
      // Convert to ContentSample format
      const allSamples: ContentSample[] = existingSamples.map(doc => ({
        id: doc.id,
        content: doc.content,
        platform: doc.metadata.platform,
        contentType: doc.metadata.contentType,
        metadata: doc.metadata
      }));

      // Re-analyze with all samples
      return await this.analyzeWritingStyle(userId, allSamples);
    } catch (error) {
      logger.error('Failed to add content sample:', error);
      throw error;
    }
  }

  /**
   * Compare writing styles between two profiles or samples
   */
  static async compareWritingStyles(
    profile1: WritingStyleProfile,
    profile2: WritingStyleProfile
  ): Promise<StyleComparison> {
    try {
      let similarity = 0;
      const differences: string[] = [];
      const recommendations: string[] = [];

      // Compare tone
      if (profile1.tone === profile2.tone) {
        similarity += 0.2;
      } else {
        differences.push(`Tone differs: ${profile1.tone} vs ${profile2.tone}`);
      }

      // Compare formality
      if (profile1.formality === profile2.formality) {
        similarity += 0.15;
      } else {
        differences.push(`Formality differs: ${profile1.formality} vs ${profile2.formality}`);
      }

      // Compare vocabulary complexity
      if (profile1.vocabulary.complexity === profile2.vocabulary.complexity) {
        similarity += 0.15;
      } else {
        differences.push(`Vocabulary complexity differs: ${profile1.vocabulary.complexity} vs ${profile2.vocabulary.complexity}`);
      }

      // Compare sentence structure
      const lengthDiff = Math.abs(profile1.sentenceStructure.averageLength - profile2.sentenceStructure.averageLength);
      if (lengthDiff < 5) {
        similarity += 0.1;
      } else {
        differences.push(`Sentence length differs significantly: ${profile1.sentenceStructure.averageLength} vs ${profile2.sentenceStructure.averageLength} words`);
      }

      // Compare topics overlap
      const topicOverlap = this.calculateArrayOverlap(profile1.contentThemes.primaryTopics, profile2.contentThemes.primaryTopics);
      similarity += topicOverlap * 0.2;

      if (topicOverlap < 0.3) {
        differences.push('Different content focus areas');
      }

      // Compare brand voice
      const personalityOverlap = this.calculateArrayOverlap(profile1.brandVoice.personality, profile2.brandVoice.personality);
      similarity += personalityOverlap * 0.2;

      // Generate recommendations based on differences
      if (similarity < 0.7) {
        recommendations.push('Consider maintaining more consistent tone across platforms');
      }
      
      if (profile1.formality !== profile2.formality) {
        recommendations.push('Align formality level with your target audience expectations');
      }

      if (topicOverlap < 0.5) {
        recommendations.push('Focus on core expertise areas for better brand consistency');
      }

      return {
        similarity: Math.min(1, similarity),
        differences,
        recommendations
      };
    } catch (error) {
      logger.error('Failed to compare writing styles:', error);
      throw error;
    }
  }

  /**
   * Get writing style recommendations
   */
  static async getStyleRecommendations(userId: string): Promise<{
    strengths: string[];
    improvements: string[];
    suggestions: string[];
  }> {
    try {
      const profile = await this.getWritingStyleProfile(userId);
      
      if (!profile) {
        return {
          strengths: [],
          improvements: ['Add content samples to analyze your writing style'],
          suggestions: ['Upload recent posts, articles, or other content you\'ve written']
        };
      }

      const strengths: string[] = [];
      const improvements: string[] = [];
      const suggestions: string[] = [];

      // Analyze strengths
      if (profile.confidence >= 0.8) {
        strengths.push('Consistent writing style across samples');
      }

      if (profile.vocabulary.technicalLevel === 'advanced') {
        strengths.push('Strong technical vocabulary');
      }

      if (profile.engagement.storytellingElements) {
        strengths.push('Effective use of storytelling');
      }

      if (profile.sentenceStructure.variety >= 0.7) {
        strengths.push('Good sentence structure variety');
      }

      // Identify improvements
      if (profile.confidence < 0.6) {
        improvements.push('Develop more consistent voice across content');
      }

      if (profile.sampleCount < 5) {
        improvements.push('Add more content samples for better analysis');
      }

      if (profile.engagement.questionUsage < 0.1) {
        improvements.push('Consider using more questions to engage readers');
      }

      if (profile.sentenceStructure.complexity === 'simple' && profile.vocabulary.complexity === 'simple') {
        improvements.push('Consider varying sentence complexity for more engaging content');
      }

      // Generate suggestions
      if (profile.contentThemes.primaryTopics.length < 3) {
        suggestions.push('Expand content topics to showcase broader expertise');
      }

      if (!profile.engagement.dataUsage) {
        suggestions.push('Include data and statistics to support your points');
      }

      if (profile.brandVoice.personality.length < 3) {
        suggestions.push('Develop clearer brand personality traits');
      }

      return { strengths, improvements, suggestions };
    } catch (error) {
      logger.error('Failed to get style recommendations:', error);
      throw error;
    }
  }

  /**
   * Perform comprehensive style analysis
   */
  private static async performStyleAnalysis(content: string, samples: ContentSample[]): Promise<WritingStyleProfile> {
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = content.toLowerCase().split(/\s+/).filter(w => w.length > 0);
    const wordCount = words.length;

    // Analyze tone
    const tone = this.analyzeTone(content);
    
    // Analyze formality
    const formality = this.analyzeFormality(content, words);
    
    // Analyze vocabulary
    const vocabulary = this.analyzeVocabulary(words);
    
    // Analyze sentence structure
    const sentenceStructure = this.analyzeSentenceStructure(sentences);
    
    // Analyze writing patterns
    const writingPatterns = this.analyzeWritingPatterns(content, samples);
    
    // Analyze content themes
    const contentThemes = this.analyzeContentThemes(content, words);
    
    // Analyze engagement elements
    const engagement = this.analyzeEngagement(content);
    
    // Analyze brand voice
    const brandVoice = this.analyzeBrandVoice(content, contentThemes);
    
    // Calculate confidence
    const confidence = this.calculateStyleConfidence(samples.length, wordCount, vocabulary, sentenceStructure);

    return {
      tone,
      formality,
      vocabulary,
      sentenceStructure,
      writingPatterns,
      contentThemes,
      engagement,
      brandVoice,
      confidence,
      sampleCount: samples.length,
      lastAnalyzed: new Date()
    };
  }

  private static analyzeTone(content: string): string {
    const lowerContent = content.toLowerCase();
    
    const toneIndicators = {
      professional: ['expertise', 'experience', 'industry', 'business', 'strategy', 'professional', 'corporate'],
      friendly: ['thanks', 'appreciate', 'love', 'enjoy', 'excited', 'happy', 'wonderful'],
      authoritative: ['must', 'should', 'need to', 'important', 'critical', 'essential', 'required'],
      conversational: ['you know', 'i think', 'personally', 'in my opinion', 'let me', 'what do you'],
      inspirational: ['achieve', 'success', 'dream', 'inspire', 'motivate', 'believe', 'possible']
    };

    let maxScore = 0;
    let dominantTone = 'neutral';

    Object.entries(toneIndicators).forEach(([tone, indicators]) => {
      const score = indicators.reduce((sum, indicator) => {
        return sum + (lowerContent.includes(indicator) ? 1 : 0);
      }, 0);
      
      if (score > maxScore) {
        maxScore = score;
        dominantTone = tone;
      }
    });

    return dominantTone;
  }

  private static analyzeFormality(content: string, words: string[]): 'formal' | 'semi-formal' | 'casual' {
    const formalIndicators = ['furthermore', 'therefore', 'consequently', 'nevertheless', 'moreover'];
    const casualIndicators = ['gonna', 'wanna', 'yeah', 'ok', 'cool', 'awesome'];
    const contractions = content.match(/\b\w+'\w+\b/g) || [];
    
    let formalScore = 0;
    let casualScore = 0;

    formalIndicators.forEach(indicator => {
      if (content.toLowerCase().includes(indicator)) formalScore++;
    });

    casualIndicators.forEach(indicator => {
      if (content.toLowerCase().includes(indicator)) casualScore++;
    });

    // Contractions indicate casual style
    casualScore += contractions.length;

    // Long sentences indicate formal style
    const avgSentenceLength = words.length / (content.split(/[.!?]+/).length - 1);
    if (avgSentenceLength > 20) formalScore++;
    if (avgSentenceLength < 12) casualScore++;

    if (formalScore > casualScore + 1) return 'formal';
    if (casualScore > formalScore + 1) return 'casual';
    return 'semi-formal';
  }

  private static analyzeVocabulary(words: string[]) {
    const uniqueWords = new Set(words);
    const wordFreq: Record<string, number> = {};
    
    words.forEach(word => {
      const cleanWord = word.replace(/[^\w]/g, '').toLowerCase();
      if (cleanWord.length > 3) {
        wordFreq[cleanWord] = (wordFreq[cleanWord] || 0) + 1;
      }
    });

    const sortedWords = Object.entries(wordFreq).sort(([,a], [,b]) => b - a);
    const commonWords = sortedWords.slice(0, 20).map(([word]) => word);
    const uniqueWordsArray = sortedWords.filter(([,freq]) => freq === 1).map(([word]) => word);

    // Determine complexity
    const avgWordLength = words.reduce((sum, word) => sum + word.length, 0) / words.length;
    let complexity: 'simple' | 'moderate' | 'complex';
    
    if (avgWordLength < 4.5) complexity = 'simple';
    else if (avgWordLength < 6) complexity = 'moderate';
    else complexity = 'complex';

    // Determine technical level
    const technicalTerms = ['algorithm', 'framework', 'methodology', 'implementation', 'optimization'];
    const technicalCount = technicalTerms.filter(term => 
      words.some(word => word.toLowerCase().includes(term))
    ).length;
    
    let technicalLevel: 'basic' | 'intermediate' | 'advanced';
    if (technicalCount >= 3) technicalLevel = 'advanced';
    else if (technicalCount >= 1) technicalLevel = 'intermediate';
    else technicalLevel = 'basic';

    return {
      complexity,
      technicalLevel,
      commonWords,
      uniqueWords: uniqueWordsArray.slice(0, 10)
    };
  }

  private static analyzeSentenceStructure(sentences: string[]) {
    const lengths = sentences.map(s => s.trim().split(/\s+/).length);
    const averageLength = lengths.reduce((sum, len) => sum + len, 0) / lengths.length;
    
    // Calculate variety (standard deviation normalized)
    const variance = lengths.reduce((sum, len) => sum + Math.pow(len - averageLength, 2), 0) / lengths.length;
    const variety = Math.min(1, Math.sqrt(variance) / averageLength);

    // Determine complexity
    let complexity: 'simple' | 'compound' | 'complex';
    if (averageLength < 12) complexity = 'simple';
    else if (averageLength < 18) complexity = 'compound';
    else complexity = 'complex';

    return {
      averageLength: Math.round(averageLength),
      complexity,
      variety: Math.round(variety * 100) / 100
    };
  }

  private static analyzeWritingPatterns(content: string, samples: ContentSample[]) {
    // Analyze preferred formats
    const formatCounts: Record<string, number> = {};
    samples.forEach(sample => {
      formatCounts[sample.contentType] = (formatCounts[sample.contentType] || 0) + 1;
    });
    
    const preferredFormats = Object.entries(formatCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([format]) => format);

    // Extract common phrases
    const sentences = content.split(/[.!?]+/);
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

    const commonPhrases = Object.entries(phrases)
      .filter(([,count]) => count > 1)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([phrase]) => phrase);

    // Identify transition words
    const transitionWords = ['however', 'therefore', 'moreover', 'furthermore', 'additionally', 'consequently'];
    const usedTransitions = transitionWords.filter(word => 
      content.toLowerCase().includes(word)
    );

    // Identify call-to-action patterns
    const ctaPatterns = ['learn more', 'get started', 'contact me', 'let\'s connect', 'reach out'];
    const callToActionStyle = ctaPatterns.filter(pattern => 
      content.toLowerCase().includes(pattern)
    );

    return {
      preferredFormats,
      commonPhrases,
      transitionWords: usedTransitions,
      callToActionStyle
    };
  }

  private static analyzeContentThemes(content: string, words: string[]) {
    const lowerContent = content.toLowerCase();
    
    // Topic identification
    const topicKeywords = {
      'Leadership': ['lead', 'manage', 'team', 'leadership', 'management', 'vision'],
      'Technology': ['tech', 'software', 'development', 'coding', 'programming'],
      'Business': ['business', 'strategy', 'growth', 'revenue', 'market'],
      'Innovation': ['innovation', 'creative', 'new', 'breakthrough', 'disrupt'],
      'Career': ['career', 'professional', 'job', 'work', 'experience'],
      'Education': ['learn', 'education', 'teach', 'knowledge', 'skill']
    };

    const primaryTopics: string[] = [];
    Object.entries(topicKeywords).forEach(([topic, keywords]) => {
      const matches = keywords.filter(keyword => lowerContent.includes(keyword));
      if (matches.length >= 2) {
        primaryTopics.push(topic);
      }
    });

    // Extract expertise indicators
    const expertiseWords = ['expert', 'specialist', 'experienced', 'skilled', 'proficient'];
    const expertise = expertiseWords.filter(word => lowerContent.includes(word));

    // Identify perspectives
    const perspectiveIndicators = ['i believe', 'in my opinion', 'my experience', 'i think'];
    const perspectives = perspectiveIndicators.filter(indicator => lowerContent.includes(indicator));

    return {
      primaryTopics,
      expertise,
      perspectives
    };
  }

  private static analyzeEngagement(content: string) {
    const questionCount = (content.match(/\?/g) || []).length;
    const questionUsage = questionCount / content.split(/[.!?]+/).length;

    const storytellingElements = /\b(once|story|experience|remember|happened)\b/i.test(content);
    const personalAnecdotes = /\b(i|my|me|personally)\b/i.test(content);
    const dataUsage = /\b(\d+%|\d+\s*(percent|million|billion|thousand))\b/i.test(content);

    return {
      questionUsage: Math.round(questionUsage * 100) / 100,
      storytellingElements,
      personalAnecdotes,
      dataUsage
    };
  }

  private static analyzeBrandVoice(content: string, contentThemes: any) {
    const lowerContent = content.toLowerCase();
    
    const personalityTraits = {
      'authentic': ['genuine', 'real', 'honest', 'transparent'],
      'innovative': ['innovative', 'creative', 'new', 'cutting-edge'],
      'reliable': ['consistent', 'dependable', 'trust', 'reliable'],
      'passionate': ['passionate', 'love', 'excited', 'enthusiastic'],
      'analytical': ['data', 'analysis', 'research', 'evidence']
    };

    const personality: string[] = [];
    Object.entries(personalityTraits).forEach(([trait, indicators]) => {
      const matches = indicators.filter(indicator => lowerContent.includes(indicator));
      if (matches.length > 0) {
        personality.push(trait);
      }
    });

    const values = contentThemes.primaryTopics.map((topic: string) => topic.toLowerCase());
    
    let communication_style = 'direct';
    if (lowerContent.includes('story') || lowerContent.includes('experience')) {
      communication_style = 'narrative';
    } else if (lowerContent.includes('data') || lowerContent.includes('research')) {
      communication_style = 'analytical';
    }

    return {
      personality,
      values,
      communication_style
    };
  }

  private static calculateStyleConfidence(
    sampleCount: number,
    wordCount: number,
    vocabulary: any,
    sentenceStructure: any
  ): number {
    let confidence = 0.3; // Base confidence

    // Sample count factor
    if (sampleCount >= 10) confidence += 0.3;
    else if (sampleCount >= 5) confidence += 0.2;
    else if (sampleCount >= 3) confidence += 0.1;

    // Word count factor
    if (wordCount >= 1000) confidence += 0.2;
    else if (wordCount >= 500) confidence += 0.1;

    // Vocabulary diversity
    if (vocabulary.uniqueWords.length >= 8) confidence += 0.1;

    // Sentence variety
    if (sentenceStructure.variety >= 0.5) confidence += 0.1;

    return Math.min(1.0, confidence);
  }

  private static calculateArrayOverlap(arr1: string[], arr2: string[]): number {
    if (arr1.length === 0 || arr2.length === 0) return 0;
    
    const set1 = new Set(arr1.map(item => item.toLowerCase()));
    const set2 = new Set(arr2.map(item => item.toLowerCase()));
    
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    
    return intersection.size / union.size;
  }
}