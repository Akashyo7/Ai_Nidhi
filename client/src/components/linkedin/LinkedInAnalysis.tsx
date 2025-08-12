import React from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { LinkedInAnalysis as LinkedInAnalysisType } from '@/services/linkedinService';

interface LinkedInAnalysisProps {
  analysis: LinkedInAnalysisType;
}

const LinkedInAnalysis: React.FC<LinkedInAnalysisProps> = ({ analysis }) => {
  const getCareerLevelColor = (level: string) => {
    switch (level) {
      case 'entry': return 'bg-green-100 text-green-800';
      case 'mid': return 'bg-blue-100 text-blue-800';
      case 'senior': return 'bg-purple-100 text-purple-800';
      case 'executive': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTrajectoryColor = (trajectory: string) => {
    switch (trajectory) {
      case 'ascending': return 'bg-green-100 text-green-800';
      case 'stable': return 'bg-blue-100 text-blue-800';
      case 'transitioning': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600';
    if (score >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatPercentage = (value: number) => Math.round(value * 100);

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-2xl font-semibold mb-6">LinkedIn Profile Analysis</h2>
        
        {/* Professional Summary */}
        <div className="mb-8">
          <h3 className="text-lg font-medium mb-4">Professional Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium text-gray-600">Career Level:</span>
                <Badge className={getCareerLevelColor(analysis.professionalSummary.careerLevel)}>
                  {analysis.professionalSummary.careerLevel.charAt(0).toUpperCase() + 
                   analysis.professionalSummary.careerLevel.slice(1)}
                </Badge>
              </div>
              
              <div className="mb-2">
                <span className="text-sm font-medium text-gray-600">Industry Experience:</span>
                <span className="ml-2">{analysis.professionalSummary.industryExperience} years</span>
              </div>
              
              <div className="mb-2">
                <span className="text-sm font-medium text-gray-600">Primary Industry:</span>
                <span className="ml-2">{analysis.professionalSummary.primaryIndustry}</span>
              </div>
            </div>
            
            <div>
              <div className="mb-4">
                <span className="text-sm font-medium text-gray-600 block mb-2">Key Skills:</span>
                <div className="flex flex-wrap gap-1">
                  {analysis.professionalSummary.keySkills.slice(0, 6).map((skill, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
              
              {analysis.professionalSummary.leadershipIndicators.length > 0 && (
                <div>
                  <span className="text-sm font-medium text-gray-600 block mb-2">Leadership Indicators:</span>
                  <div className="flex flex-wrap gap-1">
                    {analysis.professionalSummary.leadershipIndicators.slice(0, 3).map((indicator, index) => (
                      <Badge key={index} className="bg-purple-100 text-purple-800 text-xs">
                        {indicator}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Brand Strength */}
        <div className="mb-8">
          <h3 className="text-lg font-medium mb-4">Brand Strength</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className={`text-2xl font-bold ${getScoreColor(analysis.brandStrength.profileCompleteness)}`}>
                {formatPercentage(analysis.brandStrength.profileCompleteness)}%
              </div>
              <div className="text-sm text-gray-600">Profile Completeness</div>
            </div>
            
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-lg font-semibold capitalize">
                {analysis.brandStrength.networkSize}
              </div>
              <div className="text-sm text-gray-600">Network Size</div>
            </div>
            
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-lg font-semibold capitalize">
                {analysis.brandStrength.contentActivity}
              </div>
              <div className="text-sm text-gray-600">Content Activity</div>
            </div>
            
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className={`text-2xl font-bold ${getScoreColor(analysis.brandStrength.thoughtLeadership)}`}>
                {formatPercentage(analysis.brandStrength.thoughtLeadership)}%
              </div>
              <div className="text-sm text-gray-600">Thought Leadership</div>
            </div>
          </div>
        </div>

        {/* Career Progression */}
        <div className="mb-8">
          <h3 className="text-lg font-medium mb-4">Career Progression</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium text-gray-600">Trajectory:</span>
                <Badge className={getTrajectoryColor(analysis.careerProgression.trajectory)}>
                  {analysis.careerProgression.trajectory.charAt(0).toUpperCase() + 
                   analysis.careerProgression.trajectory.slice(1)}
                </Badge>
              </div>
              
              <div className="mb-2">
                <span className="text-sm font-medium text-gray-600">Tenure Pattern:</span>
                <span className="ml-2 capitalize">{analysis.careerProgression.tenurePattern}</span>
              </div>
              
              <div className="mb-2">
                <span className="text-sm font-medium text-gray-600">Industry Consistency:</span>
                <span className={`ml-2 font-medium ${getScoreColor(analysis.careerProgression.industryConsistency)}`}>
                  {formatPercentage(analysis.careerProgression.industryConsistency)}%
                </span>
              </div>
            </div>
            
            <div>
              <span className="text-sm font-medium text-gray-600 block mb-2">Recent Roles:</span>
              <div className="space-y-1">
                {analysis.careerProgression.roleProgression.slice(0, 4).map((role, index) => (
                  <div key={index} className="text-sm text-gray-700 bg-gray-50 px-3 py-1 rounded">
                    {role}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Personal Brand */}
        <div className="mb-8">
          <h3 className="text-lg font-medium mb-4">Personal Brand</h3>
          <div className="space-y-4">
            <div>
              <span className="text-sm font-medium text-gray-600 block mb-2">Value Proposition:</span>
              <p className="text-gray-700 bg-gray-50 p-3 rounded">
                {analysis.personalBrand.valueProposition}
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <span className="text-sm font-medium text-gray-600 block mb-2">Brand Keywords:</span>
                <div className="flex flex-wrap gap-1">
                  {analysis.personalBrand.brandKeywords.slice(0, 8).map((keyword, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div>
                <span className="text-sm font-medium text-gray-600 block mb-2">Target Audience:</span>
                <div className="flex flex-wrap gap-1">
                  {analysis.personalBrand.targetAudience.map((audience, index) => (
                    <Badge key={index} className="bg-blue-100 text-blue-800 text-xs">
                      {audience}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            
            {analysis.personalBrand.differentiators.length > 0 && (
              <div>
                <span className="text-sm font-medium text-gray-600 block mb-2">Differentiators:</span>
                <div className="flex flex-wrap gap-1">
                  {analysis.personalBrand.differentiators.map((diff, index) => (
                    <Badge key={index} className="bg-green-100 text-green-800 text-xs">
                      {diff}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Analysis Confidence */}
        <div className="pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Analysis Confidence:</span>
            <div className="flex items-center gap-2">
              <div className={`text-sm font-medium ${getScoreColor(analysis.confidence)}`}>
                {formatPercentage(analysis.confidence)}%
              </div>
              <div className="w-20 h-2 bg-gray-200 rounded-full">
                <div 
                  className={`h-full rounded-full ${
                    analysis.confidence >= 0.8 ? 'bg-green-500' :
                    analysis.confidence >= 0.6 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${analysis.confidence * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default LinkedInAnalysis;