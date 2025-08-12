import { UserContextModel } from '@/models';
import { EmbeddingService } from '@/services/embeddingService';
import { logger } from '@/utils/logger';
import axios from 'axios';

export interface LinkedInProfile {
  id: string;
  firstName: string;
  lastName: string;
  headline: string;
  summary: string;
  location: {
    country: string;
    region: string;
  };
  industry: string;
  positions: LinkedInPosition[];
  educations: LinkedInEducation[];
  skills: LinkedInSkill[];
  connections: number;
  profileUrl: string;
  profilePicture?: string;
  languages: LinkedInLanguage[];
  certifications: LinkedInCertification[];
  publications: LinkedInPublication[];
  honors: LinkedInHonor[];
}

export interface LinkedInPosition {
  id: string;
  title: string;
  companyName: string;
  companyId?: string;
  description?: string;
  location?: string;
  startDate: {
    month: number;
    year: number;
  };
  endDate?: {
    month: number;
    year: number;
  };
  isCurrent: boolean;
}

export interface LinkedInEducation {
  id: string;
  schoolName: string;
  degree?: string;
  fieldOfStudy?: string;
  startDate?: {
    year: number;
  };
  endDate?: {
    year: number;
  };
  description?: string;
}

export interface LinkedInSkill {
  name: string;
  endorsements: number;
}

export interface LinkedInLanguage {
  name: string;
  proficiency: string;
}

export interface LinkedInCertification {
  name: string;
  authority: string;
  licenseNumber?: string;
  startDate?: {
    month: number;
    year: number;
  };
  endDate?: {
    month: number;
    year: number;
  };
  url?: string;
}

export interface LinkedInPublication {
  name: string;
  publisher: string;
  publishedDate?: {
    month: number;
    year: number;
  };
  description?: string;
  url?: string;
}

export interface LinkedInHonor {
  name: string;
  issuer: string;
  issueDate?: {
    month: number;
    year: number;
  };
  description?: string;
}

export interface LinkedInAnalysis {
  professionalSummary: {
    careerLevel: 'entry' | 'mid' | 'senior' | 'executive';
    industryExperience: number; // years
    primaryIndustry: string;
    keySkills: string[];
    leadershipIndicators: string[];
  };
  brandStrength: {
    profileCompleteness: number; // 0-1
    networkSize: 'small' | 'medium' | 'large' | 'extensive';
    contentActivity: 'low' | 'moderate' | 'high';
    thoughtLeadership: number; // 0-1 score
  };
  careerProgression: {
    trajectory: 'ascending' | 'stable' | 'transitioning';
    roleProgression: string[];
    industryConsistency: number; // 0-1
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

export class LinkedInService {
  
  /**
   * Analyze LinkedIn profile data and generate insights
   */
  static async analyzeLinkedInProfile(userId: string, profileData: LinkedInProfile): Promise<LinkedInAnalysis> {
    try {
      // Perform comprehensive profile analysis
      const analysis = await this.performProfileAnalysis(profileData);
      
      // Store the LinkedIn profile data
      await UserContextModel.updateOrCreate(
        userId,
        'linkedin_profile',
        {
          profile: profileData,
          analysis,
          lastUpdated: new Date()
        },
        analysis.confidence
      );

      // Store profile content as vector embeddings for semantic search
      const profileText = this.extractProfileText(profileData);
      await EmbeddingService.storeUserContext(
        userId,
        'linkedin_profile',
        {
          profileText,
          analysis,
          extractedAt: new Date()
        }
      );

      logger.info(`Analyzed LinkedIn profile for user ${userId}`);
      
      return analysis;
    } catch (error) {
      logger.error('Failed to analyze LinkedIn profile:', error);
      throw error;
    }
  }

  /**
   * Get stored LinkedIn profile analysis
   */
  static async getLinkedInAnalysis(userId: string): Promise<{
    profile: LinkedInProfile;
    analysis: LinkedInAnalysis;
  } | null> {
    try {
      const context = await UserContextModel.findLatestByType(userId, 'linkedin_profile');
      
      if (!context) {
        return null;
      }

      return {
        profile: context.data.profile,
        analysis: context.data.analysis
      };
    } catch (error) {
      logger.error('Failed to get LinkedIn analysis:', error);
      throw error;
    }
  }

  /**
   * Extract LinkedIn profile data from manual input
   */
  static async extractFromManualInput(userId: string, manualData: {
    headline: string;
    summary: string;
    currentPosition: string;
    company: string;
    industry: string;
    location: string;
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
  }): Promise<LinkedInAnalysis> {
    try {
      // Convert manual input to LinkedIn profile format
      const profileData: LinkedInProfile = {
        id: `manual_${userId}`,
        firstName: '',
        lastName: '',
        headline: manualData.headline,
        summary: manualData.summary,
        location: {
          country: '',
          region: manualData.location
        },
        industry: manualData.industry,
        positions: manualData.experience.map((exp, index) => ({
          id: `pos_${index}`,
          title: exp.title,
          companyName: exp.company,
          description: exp.description,
          startDate: { month: 1, year: 2020 }, // Placeholder
          isCurrent: index === 0
        })),
        educations: manualData.education.map((edu, index) => ({
          id: `edu_${index}`,
          schoolName: edu.school,
          degree: edu.degree,
          fieldOfStudy: edu.field
        })),
        skills: manualData.skills.map(skill => ({
          name: skill,
          endorsements: 0
        })),
        connections: 0,
        profileUrl: '',
        languages: [],
        certifications: [],
        publications: [],
        honors: []
      };

      return await this.analyzeLinkedInProfile(userId, profileData);
    } catch (error) {
      logger.error('Failed to extract from manual input:', error);
      throw error;
    }
  }

  /**
   * Generate LinkedIn profile recommendations
   */
  static async generateProfileRecommendations(userId: string): Promise<{
    profileOptimization: string[];
    contentStrategy: string[];
    networkingTips: string[];
    skillDevelopment: string[];
  }> {
    try {
      const data = await this.getLinkedInAnalysis(userId);
      
      if (!data) {
        return {
          profileOptimization: ['Connect your LinkedIn profile to get personalized recommendations'],
          contentStrategy: ['Add your LinkedIn data to receive content strategy suggestions'],
          networkingTips: ['Profile analysis needed for networking recommendations'],
          skillDevelopment: ['Connect LinkedIn to identify skill development opportunities']
        };
      }

      return data.analysis.recommendations;
    } catch (error) {
      logger.error('Failed to generate profile recommendations:', error);
      throw error;
    }
  }

  /**
   * Compare LinkedIn profile with industry benchmarks
   */
  static async compareWithBenchmarks(userId: string): Promise<{
    profileStrength: number;
    industryComparison: {
      networkSize: 'below' | 'average' | 'above';
      profileCompleteness: 'below' | 'average' | 'above';
      skillEndorsements: 'below' | 'average' | 'above';
    };
    recommendations: string[];
  }> {
    try {
      const data = await this.getLinkedInAnalysis(userId);
      
      if (!data) {
        throw new Error('No LinkedIn profile data found');
      }

      const { profile, analysis } = data;

      // Industry benchmarks (simplified - in production, these would come from real data)
      const benchmarks = {
        networkSize: {
          entry: { min: 50, avg: 150, good: 300 },
          mid: { min: 200, avg: 500, good: 1000 },
          senior: { min: 500, avg: 1000, good: 2000 },
          executive: { min: 1000, avg: 2500, good: 5000 }
        },
        profileCompleteness: 0.8,
        skillCount: {
          entry: 10,
          mid: 15,
          senior: 20,
          executive: 25
        }
      };

      const careerLevel = analysis.professionalSummary.careerLevel;
      const networkBenchmark = benchmarks.networkSize[careerLevel];
      
      const comparison = {
        networkSize: profile.connections < networkBenchmark.min ? 'below' as const :
                    profile.connections > networkBenchmark.good ? 'above' as const : 'average' as const,
        profileCompleteness: analysis.brandStrength.profileCompleteness < benchmarks.profileCompleteness ? 'below' as const :
                           analysis.brandStrength.profileCompleteness > 0.9 ? 'above' as const : 'average' as const,
        skillEndorsements: profile.skills.length < benchmarks.skillCount[careerLevel] ? 'below' as const :
                          profile.skills.length > benchmarks.skillCount[careerLevel] * 1.5 ? 'above' as const : 'average' as const
      };

      const recommendations: string[] = [];
      
      if (comparison.networkSize === 'below') {
        recommendations.push('Expand your professional network by connecting with colleagues and industry peers');
      }
      
      if (comparison.profileCompleteness === 'below') {
        recommendations.push('Complete missing profile sections to improve visibility');
      }
      
      if (comparison.skillEndorsements === 'below') {
        recommendations.push('Add more relevant skills and seek endorsements from connections');
      }

      const profileStrength = (
        (comparison.networkSize === 'above' ? 1 : comparison.networkSize === 'average' ? 0.7 : 0.3) +
        (comparison.profileCompleteness === 'above' ? 1 : comparison.profileCompleteness === 'average' ? 0.7 : 0.3) +
        (comparison.skillEndorsements === 'above' ? 1 : comparison.skillEndorsements === 'average' ? 0.7 : 0.3)
      ) / 3;

      return {
        profileStrength,
        industryComparison: comparison,
        recommendations
      };
    } catch (error) {
      logger.error('Failed to compare with benchmarks:', error);
      throw error;
    }
  }

  /**
   * Perform comprehensive profile analysis
   */
  private static async performProfileAnalysis(profile: LinkedInProfile): Promise<LinkedInAnalysis> {
    // Analyze professional summary
    const professionalSummary = this.analyzeProfessionalSummary(profile);
    
    // Analyze brand strength
    const brandStrength = this.analyzeBrandStrength(profile);
    
    // Analyze career progression
    const careerProgression = this.analyzeCareerProgression(profile);
    
    // Analyze personal brand
    const personalBrand = this.analyzePersonalBrand(profile);
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(profile, professionalSummary, brandStrength, careerProgression);
    
    // Calculate overall confidence
    const confidence = this.calculateAnalysisConfidence(profile);

    return {
      professionalSummary,
      brandStrength,
      careerProgression,
      personalBrand,
      recommendations,
      confidence
    };
  }

  private static analyzeProfessionalSummary(profile: LinkedInProfile) {
    const positions = profile.positions || [];
    const currentPosition = positions.find(p => p.isCurrent) || positions[0];
    
    // Calculate industry experience
    const industryExperience = positions.reduce((years, pos) => {
      const start = pos.startDate.year;
      const end = pos.endDate?.year || new Date().getFullYear();
      return years + (end - start);
    }, 0);

    // Determine career level
    let careerLevel: 'entry' | 'mid' | 'senior' | 'executive' = 'entry';
    if (industryExperience >= 15) careerLevel = 'executive';
    else if (industryExperience >= 8) careerLevel = 'senior';
    else if (industryExperience >= 3) careerLevel = 'mid';

    // Extract key skills
    const keySkills = profile.skills.slice(0, 10).map(s => s.name);

    // Identify leadership indicators
    const leadershipKeywords = ['lead', 'manage', 'director', 'head', 'vp', 'ceo', 'cto', 'manager'];
    const leadershipIndicators = positions
      .filter(pos => leadershipKeywords.some(keyword => 
        pos.title.toLowerCase().includes(keyword)
      ))
      .map(pos => pos.title);

    return {
      careerLevel,
      industryExperience,
      primaryIndustry: profile.industry,
      keySkills,
      leadershipIndicators
    };
  }

  private static analyzeBrandStrength(profile: LinkedInProfile) {
    // Calculate profile completeness
    let completeness = 0;
    if (profile.headline) completeness += 0.2;
    if (profile.summary) completeness += 0.3;
    if (profile.positions.length > 0) completeness += 0.2;
    if (profile.educations.length > 0) completeness += 0.1;
    if (profile.skills.length >= 5) completeness += 0.1;
    if (profile.profilePicture) completeness += 0.1;

    // Determine network size category
    let networkSize: 'small' | 'medium' | 'large' | 'extensive' = 'small';
    if (profile.connections >= 2000) networkSize = 'extensive';
    else if (profile.connections >= 500) networkSize = 'large';
    else if (profile.connections >= 150) networkSize = 'medium';

    // Estimate content activity (simplified)
    const contentActivity: 'low' | 'moderate' | 'high' = 'moderate'; // Would need API data

    // Calculate thought leadership score
    const thoughtLeadership = Math.min(1, 
      (profile.publications.length * 0.3) + 
      (profile.honors.length * 0.2) + 
      (profile.certifications.length * 0.1)
    );

    return {
      profileCompleteness: completeness,
      networkSize,
      contentActivity,
      thoughtLeadership
    };
  }

  private static analyzeCareerProgression(profile: LinkedInProfile) {
    const positions = profile.positions.sort((a, b) => 
      (b.startDate.year * 12 + b.startDate.month) - (a.startDate.year * 12 + a.startDate.month)
    );

    // Analyze trajectory
    let trajectory: 'ascending' | 'stable' | 'transitioning' = 'stable';
    if (positions.length >= 2) {
      const recent = positions[0];
      const previous = positions[1];
      
      const seniorityKeywords = ['senior', 'lead', 'principal', 'director', 'vp', 'head', 'manager'];
      const recentSeniority = seniorityKeywords.filter(k => recent.title.toLowerCase().includes(k)).length;
      const previousSeniority = seniorityKeywords.filter(k => previous.title.toLowerCase().includes(k)).length;
      
      if (recentSeniority > previousSeniority) trajectory = 'ascending';
      else if (recent.companyName !== previous.companyName) trajectory = 'transitioning';
    }

    // Role progression
    const roleProgression = positions.slice(0, 5).map(p => p.title);

    // Industry consistency
    const industries = positions.map(p => p.companyName).filter(Boolean);
    const uniqueIndustries = new Set(industries);
    const industryConsistency = 1 - (uniqueIndustries.size - 1) / Math.max(1, industries.length - 1);

    // Tenure pattern
    const tenures = positions.map(pos => {
      const start = pos.startDate.year;
      const end = pos.endDate?.year || new Date().getFullYear();
      return end - start;
    });
    const avgTenure = tenures.reduce((sum, t) => sum + t, 0) / tenures.length;
    
    let tenurePattern: 'short' | 'moderate' | 'long' = 'moderate';
    if (avgTenure < 2) tenurePattern = 'short';
    else if (avgTenure > 4) tenurePattern = 'long';

    return {
      trajectory,
      roleProgression,
      industryConsistency,
      tenurePattern
    };
  }

  private static analyzePersonalBrand(profile: LinkedInProfile) {
    const text = `${profile.headline} ${profile.summary}`.toLowerCase();
    
    // Extract brand keywords
    const brandKeywords = profile.skills.slice(0, 8).map(s => s.name);

    // Generate value proposition
    const valueProposition = profile.headline || 'Professional in ' + profile.industry;

    // Identify target audience
    const targetAudience = [profile.industry];
    if (profile.positions.length > 0) {
      targetAudience.push(profile.positions[0].companyName + ' professionals');
    }

    // Identify differentiators
    const differentiators: string[] = [];
    if (profile.certifications.length > 0) {
      differentiators.push('Certified professional');
    }
    if (profile.publications.length > 0) {
      differentiators.push('Published author');
    }
    if (profile.languages.length > 1) {
      differentiators.push('Multilingual professional');
    }

    return {
      brandKeywords,
      valueProposition,
      targetAudience,
      differentiators
    };
  }

  private static generateRecommendations(
    profile: LinkedInProfile,
    professionalSummary: any,
    brandStrength: any,
    careerProgression: any
  ) {
    const profileOptimization: string[] = [];
    const contentStrategy: string[] = [];
    const networkingOpportunities: string[] = [];
    const skillDevelopment: string[] = [];

    // Profile optimization recommendations
    if (brandStrength.profileCompleteness < 0.8) {
      profileOptimization.push('Complete missing profile sections for better visibility');
    }
    if (!profile.summary || profile.summary.length < 100) {
      profileOptimization.push('Expand your summary to better showcase your expertise');
    }
    if (profile.skills.length < 10) {
      profileOptimization.push('Add more relevant skills to your profile');
    }

    // Content strategy recommendations
    if (brandStrength.contentActivity === 'low') {
      contentStrategy.push('Increase content sharing to build thought leadership');
    }
    contentStrategy.push('Share insights about ' + professionalSummary.primaryIndustry);
    if (professionalSummary.leadershipIndicators.length > 0) {
      contentStrategy.push('Share leadership experiences and lessons learned');
    }

    // Networking recommendations
    if (brandStrength.networkSize === 'small') {
      networkingOpportunities.push('Expand your network by connecting with industry peers');
    }
    networkingOpportunities.push('Engage with content from professionals in ' + professionalSummary.primaryIndustry);

    // Skill development recommendations
    const emergingSkills = ['AI', 'Machine Learning', 'Data Analysis', 'Digital Marketing'];
    const currentSkills = profile.skills.map(s => s.name.toLowerCase());
    const missingSkills = emergingSkills.filter(skill => 
      !currentSkills.some(current => current.includes(skill.toLowerCase()))
    );
    
    if (missingSkills.length > 0) {
      skillDevelopment.push(`Consider developing skills in: ${missingSkills.slice(0, 2).join(', ')}`);
    }

    return {
      profileOptimization,
      contentStrategy,
      networkingOpportunities,
      skillDevelopment
    };
  }

  private static calculateAnalysisConfidence(profile: LinkedInProfile): number {
    let confidence = 0.3; // Base confidence

    // Profile completeness factor
    if (profile.headline) confidence += 0.1;
    if (profile.summary && profile.summary.length > 50) confidence += 0.2;
    if (profile.positions.length >= 2) confidence += 0.2;
    if (profile.skills.length >= 5) confidence += 0.1;
    if (profile.educations.length > 0) confidence += 0.1;

    return Math.min(1.0, confidence);
  }

  private static extractProfileText(profile: LinkedInProfile): string {
    const parts = [
      profile.headline,
      profile.summary,
      profile.positions.map(p => `${p.title} at ${p.companyName}: ${p.description || ''}`).join('. '),
      profile.skills.map(s => s.name).join(', '),
      profile.educations.map(e => `${e.degree || ''} ${e.fieldOfStudy || ''} from ${e.schoolName}`).join('. ')
    ].filter(Boolean);

    return parts.join('. ');
  }
}