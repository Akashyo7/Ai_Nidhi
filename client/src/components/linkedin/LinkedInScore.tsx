import React from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ProfileScore } from '@/services/linkedinService';

interface LinkedInScoreProps {
  score: ProfileScore;
}

const LinkedInScore: React.FC<LinkedInScoreProps> = ({ score }) => {
  const getScoreColor = (value: number) => {
    if (value >= 80) return 'text-green-600';
    if (value >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBackground = (value: number) => {
    if (value >= 80) return 'bg-green-500';
    if (value >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getScoreLabel = (value: number) => {
    if (value >= 80) return 'Excellent';
    if (value >= 60) return 'Good';
    if (value >= 40) return 'Fair';
    return 'Needs Improvement';
  };

  const CircularProgress = ({ value, size = 120 }: { value: number; size?: number }) => {
    const radius = (size - 8) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (value / 100) * circumference;

    return (
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          className="transform -rotate-90"
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            className="text-gray-200"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            className={getScoreColor(value).replace('text-', 'text-')}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className={`text-2xl font-bold ${getScoreColor(value)}`}>
              {value}
            </div>
            <div className="text-xs text-gray-500">SCORE</div>
          </div>
        </div>
      </div>
    );
  };

  const ScoreBar = ({ label, value, isNumeric = true }: { label: string; value: number | string; isNumeric?: boolean }) => (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        {isNumeric ? (
          <span className={`text-sm font-semibold ${getScoreColor(value as number)}`}>
            {value}%
          </span>
        ) : (
          <Badge variant="outline" className="text-xs capitalize">
            {value}
          </Badge>
        )}
      </div>
      {isNumeric && (
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full ${getScoreBackground(value as number)}`}
            style={{ width: `${value}%` }}
          />
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-2xl font-semibold mb-6">LinkedIn Profile Score</h2>
        
        {/* Overall Score */}
        <div className="flex flex-col lg:flex-row items-center gap-8 mb-8">
          <div className="flex-shrink-0">
            <CircularProgress value={score.overall} />
          </div>
          
          <div className="flex-1 text-center lg:text-left">
            <h3 className="text-xl font-semibold mb-2">Overall Profile Strength</h3>
            <p className={`text-lg font-medium mb-2 ${getScoreColor(score.overall)}`}>
              {getScoreLabel(score.overall)}
            </p>
            <p className="text-gray-600 mb-4">
              Your LinkedIn profile is performing {score.overall >= 80 ? 'exceptionally well' : 
              score.overall >= 60 ? 'well with room for improvement' : 'below average and needs attention'}.
            </p>
            
            <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
              <Badge className="bg-blue-100 text-blue-800">
                {score.careerLevel.charAt(0).toUpperCase() + score.careerLevel.slice(1)} Level
              </Badge>
              <Badge className="bg-green-100 text-green-800">
                {score.confidence}% Confidence
              </Badge>
            </div>
          </div>
        </div>

        {/* Score Breakdown */}
        <div>
          <h3 className="text-lg font-medium mb-4">Score Breakdown</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <ScoreBar 
                label="Profile Completeness" 
                value={score.breakdown.completeness} 
              />
              <ScoreBar 
                label="Thought Leadership" 
                value={score.breakdown.thoughtLeadership} 
              />
            </div>
            
            <div className="space-y-4">
              <ScoreBar 
                label="Network Size" 
                value={score.breakdown.networkSize} 
                isNumeric={false}
              />
              <ScoreBar 
                label="Career Progression" 
                value={score.breakdown.careerProgression} 
                isNumeric={false}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Improvement Areas */}
      <Card className="p-6">
        <h3 className="text-lg font-medium mb-4">Areas for Improvement</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {score.breakdown.completeness < 80 && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-red-600">📝</span>
                <span className="font-medium text-red-800">Profile Completeness</span>
              </div>
              <p className="text-sm text-red-700">
                Complete missing sections to improve visibility
              </p>
            </div>
          )}
          
          {score.breakdown.thoughtLeadership < 60 && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-yellow-600">💡</span>
                <span className="font-medium text-yellow-800">Thought Leadership</span>
              </div>
              <p className="text-sm text-yellow-700">
                Share more insights and original content
              </p>
            </div>
          )}
          
          {score.breakdown.networkSize === 'small' && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-blue-600">🤝</span>
                <span className="font-medium text-blue-800">Network Growth</span>
              </div>
              <p className="text-sm text-blue-700">
                Connect with more industry professionals
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Score History Placeholder */}
      <Card className="p-6">
        <h3 className="text-lg font-medium mb-4">Score Tracking</h3>
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-2">📈</div>
          <p>Score tracking will be available after multiple analyses</p>
          <p className="text-sm mt-1">Re-analyze your profile periodically to track improvements</p>
        </div>
      </Card>
    </div>
  );
};

export default LinkedInScore;