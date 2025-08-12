import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Save, 
  RotateCcw, 
  TrendingUp, 
  Eye, 
  Clock,
  Lightbulb,
  Target,
  AlertCircle,
  CheckCircle,
  BarChart3
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { LoadingState } from '@/components/ui/LoadingSpinner';
import { contextService, ContextAnalysis, ContextVersion } from '@/services/contextService';

interface ContextBoxProps {
  initialContent?: string;
  onSave?: (content: string, analysis: ContextAnalysis) => void;
  showAnalysis?: boolean;
  showHistory?: boolean;
}

export const ContextBox: React.FC<ContextBoxProps> = ({
  initialContent = '',
  onSave,
  showAnalysis = true,
  showHistory = true
}) => {
  const [content, setContent] = useState(initialContent);
  const [originalContent, setOriginalContent] = useState(initialContent);
  const [analysis, setAnalysis] = useState<ContextAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Load current context on mount
  useEffect(() => {
    loadCurrentContext();
  }, []);

  // Track unsaved changes
  useEffect(() => {
    setHasUnsavedChanges(content !== originalContent);
  }, [content, originalContent]);

  // Auto-analyze content as user types (debounced)
  useEffect(() => {
    if (!content || content.length < 10) {
      setAnalysis(null);
      return;
    }

    const timeoutId = setTimeout(() => {
      if (showAnalysis) {
        analyzeContent();
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [content, showAnalysis]);

  const loadCurrentContext = async () => {
    try {
      setIsLoading(true);
      const currentContext = await contextService.getCurrentContext();
      
      if (currentContext) {
        setContent(currentContext.content);
        setOriginalContent(currentContext.content);
        setAnalysis(currentContext.analysis);
      }
    } catch (error) {
      console.error('Failed to load context:', error);
      setError('Failed to load your current context');
    } finally {
      setIsLoading(false);
    }
  };

  const analyzeContent = async () => {
    if (!content || content.length < 10) return;

    try {
      setIsAnalyzing(true);
      setError(null);
      const analysisResult = await contextService.analyzeContext(content);
      setAnalysis(analysisResult);
    } catch (error) {
      console.error('Failed to analyze content:', error);
      setError('Failed to analyze content');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSave = async () => {
    if (!content.trim()) {
      setError('Please enter some content before saving');
      return;
    }

    if (content.length < 50) {
      setError('Please provide at least 50 characters for better AI insights');
      return;
    }

    try {
      setIsSaving(true);
      setError(null);
      
      const result = await contextService.updateContext(content);
      
      setOriginalContent(content);
      setAnalysis(result.analysis);
      setHasUnsavedChanges(false);
      
      if (onSave) {
        onSave(content, result.analysis);
      }
    } catch (error) {
      console.error('Failed to save context:', error);
      setError('Failed to save your context');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setContent(originalContent);
    setHasUnsavedChanges(false);
    setError(null);
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-blue-600';
    if (confidence >= 0.4) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.8) return 'Excellent';
    if (confidence >= 0.6) return 'Good';
    if (confidence >= 0.4) return 'Fair';
    return 'Needs Improvement';
  };

  if (isLoading) {
    return <LoadingState text="Loading your context..." />;
  }

  return (
    <div className="space-y-6">
      {/* Main Context Input */}
      <Card variant="elevated">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <MessageSquare className="text-white" size={20} />
              </div>
              <div>
                <CardTitle>Your Professional Context</CardTitle>
                <CardDescription>
                  Tell us about your background, expertise, and goals to get personalized AI insights
                </CardDescription>
              </div>
            </div>
            
            {hasUnsavedChanges && (
              <Badge variant="warning" size="small">
                <Clock size={12} />
                Unsaved changes
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            <div>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Share your professional background, expertise, interests, career goals, and what makes you unique. Include your industry, key skills, and any specific areas you want to focus on for your personal brand..."
                rows={8}
                className="input resize-none"
              />
              
              <div className="flex items-center justify-between mt-2 text-sm text-gray-500">
                <span>
                  {content.length < 50 ? (
                    <span className="text-orange-600">
                      {50 - content.length} more characters needed for analysis
                    </span>
                  ) : (
                    <span className="text-green-600">
                      Ready for analysis
                    </span>
                  )}
                </span>
                <span>{content.length} characters</span>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center space-x-3">
                <AlertCircle size={20} className="text-red-500 flex-shrink-0" />
                <p>{error}</p>
              </div>
            )}

            {/* Quick Tips */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-start space-x-3">
                <Lightbulb className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
                <div>
                  <p className="text-sm font-medium text-blue-900">Tips for better AI insights:</p>
                  <ul className="text-sm text-blue-700 mt-1 space-y-1">
                    <li>• Include your industry and role</li>
                    <li>• Mention specific skills and technologies</li>
                    <li>• Describe your career goals and aspirations</li>
                    <li>• Share what makes you unique in your field</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter>
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center space-x-3">
              {hasUnsavedChanges && (
                <Button
                  variant="ghost"
                  size="small"
                  onClick={handleReset}
                  icon={RotateCcw}
                >
                  Reset
                </Button>
              )}
              
              {showAnalysis && content.length >= 10 && (
                <Button
                  variant="ghost"
                  size="small"
                  onClick={() => setShowPreview(!showPreview)}
                  icon={Eye}
                >
                  {showPreview ? 'Hide' : 'Preview'} Analysis
                </Button>
              )}
            </div>

            <Button
              variant="primary"
              onClick={handleSave}
              loading={isSaving}
              disabled={!content.trim() || content.length < 50}
              icon={!isSaving ? Save : undefined}
            >
              {isSaving ? 'Saving...' : 'Save Context'}
            </Button>
          </div>
        </CardFooter>
      </Card>

      {/* Analysis Preview */}
      {showPreview && analysis && (
        <Card variant="elevated">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                <BarChart3 className="text-white" size={20} />
              </div>
              <div>
                <CardTitle>Content Analysis</CardTitle>
                <CardDescription>
                  AI-powered insights about your professional context
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Basic Stats */}
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Content Quality</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Word Count</span>
                      <Badge variant="neutral" size="small">{analysis.wordCount}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Readability</span>
                      <Badge variant="neutral" size="small">{Math.round(analysis.readabilityScore)}/100</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Confidence</span>
                      <Badge 
                        variant={analysis.confidence >= 0.7 ? 'success' : analysis.confidence >= 0.5 ? 'warning' : 'error'} 
                        size="small"
                      >
                        {getConfidenceLabel(analysis.confidence)}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Sentiment</span>
                      <Badge 
                        variant={analysis.sentiment === 'positive' ? 'success' : analysis.sentiment === 'negative' ? 'error' : 'neutral'} 
                        size="small"
                      >
                        {analysis.sentiment}
                      </Badge>
                    </div>
                  </div>
                </div>

                {analysis.industries.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Industries</h4>
                    <div className="flex flex-wrap gap-2">
                      {analysis.industries.map((industry) => (
                        <Badge key={industry} variant="primary" size="small">
                          {industry}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Keywords and Topics */}
              <div className="space-y-4">
                {analysis.keywords.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Key Terms</h4>
                    <div className="flex flex-wrap gap-2">
                      {analysis.keywords.slice(0, 8).map((keyword) => (
                        <Badge key={keyword} variant="neutral" size="small">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {analysis.topics.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Topics</h4>
                    <div className="flex flex-wrap gap-2">
                      {analysis.topics.map((topic) => (
                        <Badge key={topic} variant="success" size="small">
                          {topic}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {analysis.professionalTerms.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Professional Terms</h4>
                    <div className="flex flex-wrap gap-2">
                      {analysis.professionalTerms.slice(0, 6).map((term) => (
                        <Badge key={term} variant="primary" size="small">
                          {term}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading State for Analysis */}
      {isAnalyzing && (
        <Card>
          <CardContent className="py-8">
            <LoadingState 
              size="small" 
              text="Analyzing your content..." 
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
};