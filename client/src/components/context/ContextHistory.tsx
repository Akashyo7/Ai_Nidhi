import React, { useState, useEffect } from 'react';
import { 
  History, 
  Eye, 
  Calendar,
  TrendingUp,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { LoadingState } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { contextService, ContextVersion } from '@/services/contextService';

interface ContextHistoryProps {
  onVersionSelect?: (version: ContextVersion) => void;
}

export const ContextHistory: React.FC<ContextHistoryProps> = ({ onVersionSelect }) => {
  const [history, setHistory] = useState<ContextVersion[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVersion, setSelectedVersion] = useState<string | null>(null);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const historyData = await contextService.getContextHistory(20);
      setHistory(historyData.history);
      setTotal(historyData.total);
    } catch (error) {
      console.error('Failed to load history:', error);
      setError('Failed to load context history');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVersionClick = async (version: ContextVersion) => {
    try {
      setSelectedVersion(version.id);
      
      // Load full version details if needed
      const fullVersion = await contextService.getContextVersion(version.id);
      
      if (onVersionSelect) {
        onVersionSelect(fullVersion);
      }
    } catch (error) {
      console.error('Failed to load version details:', error);
    } finally {
      setSelectedVersion(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} hours ago`;
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'success';
    if (confidence >= 0.6) return 'primary';
    if (confidence >= 0.4) return 'warning';
    return 'error';
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'success';
      case 'negative': return 'error';
      default: return 'neutral';
    }
  };

  if (isLoading) {
    return <LoadingState text="Loading context history..." />;
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-8">
          <EmptyState
            icon={AlertTriangle}
            title="Failed to load history"
            description={error}
            action={{
              label: 'Try Again',
              onClick: loadHistory,
              icon: RefreshCw
            }}
          />
        </CardContent>
      </Card>
    );
  }

  if (history.length === 0) {
    return (
      <Card>
        <CardContent className="py-8">
          <EmptyState
            icon={History}
            title="No context history"
            description="Your context versions will appear here as you update your professional information."
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="elevated">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
              <History className="text-white" size={20} />
            </div>
            <div>
              <CardTitle>Context History</CardTitle>
              <CardDescription>
                Track changes and improvements to your professional context
              </CardDescription>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Badge variant="neutral" size="small">
              {total} versions
            </Badge>
            <Button
              variant="ghost"
              size="small"
              onClick={loadHistory}
              icon={RefreshCw}
            >
              Refresh
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {history.map((version, index) => (
            <div
              key={version.id}
              className="border border-gray-200 rounded-xl p-4 hover:border-gray-300 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <Badge variant="primary" size="small">
                      v{version.version}
                    </Badge>
                    {index === 0 && (
                      <Badge variant="success" size="small">
                        Current
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center space-x-1 text-sm text-gray-500">
                    <Calendar size={14} />
                    <span>{formatDate(version.createdAt)}</span>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="small"
                  onClick={() => handleVersionClick(version)}
                  loading={selectedVersion === version.id}
                  icon={!selectedVersion ? Eye : undefined}
                >
                  {selectedVersion === version.id ? 'Loading...' : 'View'}
                </Button>
              </div>

              <div className="mb-3">
                <p className="text-sm text-gray-700 line-clamp-2">
                  {version.content}
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500">Quality:</span>
                    <Badge 
                      variant={getConfidenceColor(version.confidence)} 
                      size="small"
                    >
                      {Math.round(version.confidence * 100)}%
                    </Badge>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500">Words:</span>
                    <Badge variant="neutral" size="small">
                      {version.analysis.wordCount}
                    </Badge>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500">Sentiment:</span>
                    <Badge 
                      variant={getSentimentColor(version.analysis.sentiment)} 
                      size="small"
                    >
                      {version.analysis.sentiment}
                    </Badge>
                  </div>
                </div>

                {version.analysis.keywords.length > 0 && (
                  <div className="flex items-center space-x-1">
                    <span className="text-xs text-gray-500">Keywords:</span>
                    <div className="flex space-x-1">
                      {version.analysis.keywords.slice(0, 3).map((keyword) => (
                        <Badge key={keyword} variant="neutral" size="small">
                          {keyword}
                        </Badge>
                      ))}
                      {version.analysis.keywords.length > 3 && (
                        <Badge variant="neutral" size="small">
                          +{version.analysis.keywords.length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {version.analysis.topics.length > 0 && (
                <div className="mt-2 pt-2 border-t border-gray-100">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500">Topics:</span>
                    <div className="flex flex-wrap gap-1">
                      {version.analysis.topics.map((topic) => (
                        <Badge key={topic} variant="success" size="small">
                          {topic}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};