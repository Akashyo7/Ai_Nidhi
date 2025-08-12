import React, { useState, useEffect } from 'react';
import { 
  Lightbulb, 
  TrendingUp, 
  Target, 
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  BarChart3
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { LoadingState } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { writingStyleService, StyleInsights } from '@/services/writingStyleService';

export const WritingStyleInsights: React.FC = () => {
  const [insights, setInsights] = useState<StyleInsights | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadInsights();
  }, []);

  const loadInsights = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const insightsData = await writingStyleService.getInsights();
      setInsights(insightsData);
    } catch (error) {
      console.error('Failed to load writing style insights:', error);
      setError('Failed to load insights');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingState text="Analyzing your writing style..." />;
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-8">
          <EmptyState
            icon={AlertTriangle}
            title="Failed to load insights"
            description={error}
            action={{
              label: 'Try Again',
              onClick: loadInsights,
              icon: RefreshCw
            }}
          />
        </CardContent>
      </Card>
    );
  }

  if (!insights || !insights.hasProfile) {
    return (
      <Card>
        <CardContent className="py-8">
          <EmptyState
            icon={Lightbulb}
            title="No writing style analysis yet"
            description={insights?.message || "Add content samples to get personalized writing style insights."}
            action={insights?.suggestions ? undefined : {
              label: 'Add Content Samples',
              onClick: () => {}, // This would navigate to the samples input
              icon: Target
            }}
          />
          {insights?.suggestions && (
            <div className="mt-6 max-w-md mx-auto">
              <h4 className="font-medium text-gray-900 mb-3">Getting Started:</h4>
              <ul className="text-sm text-gray-600 space-y-2">
                {insights.suggestions.map((suggestion, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <div className="w-1.5 h-1.5 bg-primary-600 rounded-full mt-2 flex-shrink-0" />
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary */}
      {insights.summary && (
        <Card variant="elevated">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <BarChart3 className="text-white" size={20} />
                </div>
                <div>
                  <CardTitle>Style Summary</CardTitle>
                  <CardDescription>
                    Overview of your writing characteristics
                  </CardDescription>
                </div>
              </div>
              
              <Badge 
                variant={insights.summary.confidence >= 0.7 ? 'success' : insights.summary.confidence >= 0.5 ? 'warning' : 'error'} 
                size="small"
              >
                {Math.round(insights.summary.confidence * 100)}% Confidence
              </Badge>
            </div>
          </CardHeader>

          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {insights.summary.tone}
                </div>
                <div className="text-sm text-gray-500">Tone</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {insights.summary.formality}
                </div>
                <div className="text-sm text-gray-500">Formality</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {insights.summary.complexity}
                </div>
                <div className="text-sm text-gray-500">Complexity</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {insights.summary.sampleCount}
                </div>
                <div className="text-sm text-gray-500">Samples</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Key Metrics */}
      {insights.keyMetrics && (
        <Card variant="elevated">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                <TrendingUp className="text-white" size={20} />
              </div>
              <div>
                <CardTitle>Key Metrics</CardTitle>
                <CardDescription>
                  Quantitative analysis of your writing style
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Average Sentence Length</span>
                  <Badge variant="primary" size="small">
                    {insights.keyMetrics.averageSentenceLength} words
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Vocabulary Level</span>
                  <Badge variant="neutral" size="small">
                    {insights.keyMetrics.vocabularyLevel}
                  </Badge>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Engagement Score</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${Math.min(100, insights.keyMetrics.engagementScore * 500)}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">
                      {Math.round(insights.keyMetrics.engagementScore * 100)}%
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Brand Consistency</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${insights.keyMetrics.brandConsistency * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">
                      {Math.round(insights.keyMetrics.brandConsistency * 100)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Strengths */}
      {insights.strengths.length > 0 && (
        <Card variant="elevated">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                <CheckCircle className="text-white" size={20} />
              </div>
              <div>
                <CardTitle className="text-green-900">Your Strengths</CardTitle>
                <CardDescription>
                  What's working well in your writing style
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-3">
              {insights.strengths.map((strength, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-green-50 rounded-xl">
                  <CheckCircle size={16} className="text-green-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-green-800">{strength}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Improvements */}
      {insights.improvements.length > 0 && (
        <Card variant="elevated">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                <Target className="text-white" size={20} />
              </div>
              <div>
                <CardTitle className="text-orange-900">Areas for Improvement</CardTitle>
                <CardDescription>
                  Opportunities to enhance your writing style
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-3">
              {insights.improvements.map((improvement, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-orange-50 rounded-xl">
                  <Target size={16} className="text-orange-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-orange-800">{improvement}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Suggestions */}
      {insights.suggestions.length > 0 && (
        <Card variant="elevated">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <Lightbulb className="text-white" size={20} />
              </div>
              <div>
                <CardTitle className="text-blue-900">Suggestions</CardTitle>
                <CardDescription>
                  Actionable recommendations for your writing
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-3">
              {insights.suggestions.map((suggestion, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 rounded-xl">
                  <Lightbulb size={16} className="text-blue-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-blue-800">{suggestion}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Content Themes & Brand Voice */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Content Themes */}
        {insights.contentThemes.length > 0 && (
          <Card variant="elevated">
            <CardHeader>
              <CardTitle>Content Themes</CardTitle>
              <CardDescription>
                Topics you frequently write about
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {insights.contentThemes.map((theme) => (
                  <Badge key={theme} variant="primary" size="small">
                    {theme}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Brand Voice */}
        {insights.brandVoice.length > 0 && (
          <Card variant="elevated">
            <CardHeader>
              <CardTitle>Brand Voice</CardTitle>
              <CardDescription>
                Your personality traits in writing
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {insights.brandVoice.map((trait) => (
                  <Badge key={trait} variant="success" size="small">
                    {trait}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Refresh Button */}
      <div className="flex justify-center">
        <Button
          variant="ghost"
          onClick={loadInsights}
          icon={RefreshCw}
          size="small"
        >
          Refresh Insights
        </Button>
      </div>
    </div>
  );
};