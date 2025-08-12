import React, { useState, useEffect } from 'react';
import { 
  Lightbulb, 
  Target, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { LoadingState } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { contextService, ContextInsights as ContextInsightsType } from '@/services/contextService';

export const ContextInsights: React.FC = () => {
  const [insights, setInsights] = useState<ContextInsightsType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadInsights();
  }, []);

  const loadInsights = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const insightsData = await contextService.getContextInsights();
      setInsights(insightsData);
    } catch (error) {
      console.error('Failed to load insights:', error);
      setError('Failed to load insights');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingState text="Analyzing your context..." />;
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

  if (!insights || (insights.strengths.length === 0 && insights.suggestions.length === 0)) {
    return (
      <Card>
        <CardContent className="py-8">
          <EmptyState
            icon={Lightbulb}
            title="No insights available"
            description="Add your professional context to get personalized insights and recommendations."
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
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
                  What's working well in your professional context
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
                  Ways to improve your professional context
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

      {/* Missing Areas */}
      {insights.missingAreas.length > 0 && (
        <Card variant="elevated">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                <Target className="text-white" size={20} />
              </div>
              <div>
                <CardTitle className="text-orange-900">Growth Opportunities</CardTitle>
                <CardDescription>
                  Areas you might want to highlight in your context
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-sm text-gray-600 mb-3">
                Consider adding information about these areas to strengthen your professional profile:
              </p>
              <div className="flex flex-wrap gap-2">
                {insights.missingAreas.map((area, index) => (
                  <Badge key={index} variant="warning" size="small">
                    {area}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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