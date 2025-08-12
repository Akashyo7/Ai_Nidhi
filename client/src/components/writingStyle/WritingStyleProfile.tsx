import React from 'react';
import { 
  User, 
  MessageSquare, 
  TrendingUp, 
  Target, 
  Zap,
  BarChart3,
  Clock,
  CheckCircle
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { WritingStyleProfile as WritingStyleProfileType } from '@/services/writingStyleService';

interface WritingStyleProfileProps {
  profile: WritingStyleProfileType;
}

export const WritingStyleProfile: React.FC<WritingStyleProfileProps> = ({ profile }) => {
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'success';
    if (confidence >= 0.6) return 'primary';
    if (confidence >= 0.4) return 'warning';
    return 'error';
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.8) return 'Excellent';
    if (confidence >= 0.6) return 'Good';
    if (confidence >= 0.4) return 'Fair';
    return 'Needs More Data';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Overview */}
      <Card variant="elevated">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <User className="text-white" size={20} />
              </div>
              <div>
                <CardTitle>Writing Style Overview</CardTitle>
                <CardDescription>
                  Analysis based on {profile.sampleCount} content samples
                </CardDescription>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Badge variant={getConfidenceColor(profile.confidence)} size="small">
                {getConfidenceLabel(profile.confidence)}
              </Badge>
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">
                  {Math.round(profile.confidence * 100)}% Confidence
                </div>
                <div className="text-xs text-gray-500">
                  Updated {formatDate(profile.lastAnalyzed)}
                </div>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            {/* Core Style */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Core Style</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Tone</span>
                  <Badge variant="primary" size="small">
                    {profile.tone}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Formality</span>
                  <Badge variant="neutral" size="small">
                    {profile.formality}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Communication</span>
                  <Badge variant="success" size="small">
                    {profile.brandVoice.communication_style}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Vocabulary */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Vocabulary</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Complexity</span>
                  <Badge variant="primary" size="small">
                    {profile.vocabulary.complexity}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Technical Level</span>
                  <Badge variant="neutral" size="small">
                    {profile.vocabulary.technicalLevel}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Unique Words</span>
                  <Badge variant="success" size="small">
                    {profile.vocabulary.uniqueWords.length}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Structure */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Structure</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Avg. Sentence</span>
                  <Badge variant="primary" size="small">
                    {profile.sentenceStructure.averageLength} words
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Complexity</span>
                  <Badge variant="neutral" size="small">
                    {profile.sentenceStructure.complexity}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Variety</span>
                  <Badge variant="success" size="small">
                    {Math.round(profile.sentenceStructure.variety * 100)}%
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content Themes */}
      <Card variant="elevated">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
              <Target className="text-white" size={20} />
            </div>
            <div>
              <CardTitle>Content Themes</CardTitle>
              <CardDescription>
                Topics and areas of expertise in your writing
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Primary Topics</h4>
              {profile.contentThemes.primaryTopics.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {profile.contentThemes.primaryTopics.map((topic) => (
                    <Badge key={topic} variant="primary" size="small">
                      {topic}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No specific topics identified</p>
              )}
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-3">Expertise Areas</h4>
              {profile.contentThemes.expertise.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {profile.contentThemes.expertise.map((expertise) => (
                    <Badge key={expertise} variant="success" size="small">
                      {expertise}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No expertise indicators found</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Brand Voice */}
      <Card variant="elevated">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
              <MessageSquare className="text-white" size={20} />
            </div>
            <div>
              <CardTitle>Brand Voice</CardTitle>
              <CardDescription>
                Personality and communication style
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Personality Traits</h4>
              {profile.brandVoice.personality.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {profile.brandVoice.personality.map((trait) => (
                    <Badge key={trait} variant="primary" size="small">
                      {trait}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No personality traits identified</p>
              )}
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-3">Core Values</h4>
              {profile.brandVoice.values.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {profile.brandVoice.values.map((value) => (
                    <Badge key={value} variant="success" size="small">
                      {value}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No core values identified</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Engagement Style */}
      <Card variant="elevated">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
              <Zap className="text-white" size={20} />
            </div>
            <div>
              <CardTitle>Engagement Style</CardTitle>
              <CardDescription>
                How you connect with your audience
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Question Usage</span>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-primary-600 h-2 rounded-full"
                      style={{ width: `${Math.min(100, profile.engagement.questionUsage * 500)}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium">
                    {Math.round(profile.engagement.questionUsage * 100)}%
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Storytelling</span>
                {profile.engagement.storytellingElements ? (
                  <CheckCircle size={16} className="text-green-500" />
                ) : (
                  <div className="w-4 h-4 border-2 border-gray-300 rounded-full" />
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Personal Touch</span>
                {profile.engagement.personalAnecdotes ? (
                  <CheckCircle size={16} className="text-green-500" />
                ) : (
                  <div className="w-4 h-4 border-2 border-gray-300 rounded-full" />
                )}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Data Support</span>
                {profile.engagement.dataUsage ? (
                  <CheckCircle size={16} className="text-green-500" />
                ) : (
                  <div className="w-4 h-4 border-2 border-gray-300 rounded-full" />
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Writing Patterns */}
      <Card variant="elevated">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <BarChart3 className="text-white" size={20} />
            </div>
            <div>
              <CardTitle>Writing Patterns</CardTitle>
              <CardDescription>
                Formats and phrases you commonly use
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Preferred Formats</h4>
              {profile.writingPatterns.preferredFormats.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {profile.writingPatterns.preferredFormats.map((format) => (
                    <Badge key={format} variant="primary" size="small">
                      {format}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No format preferences identified</p>
              )}
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-3">Common Phrases</h4>
              {profile.writingPatterns.commonPhrases.length > 0 ? (
                <div className="space-y-2">
                  {profile.writingPatterns.commonPhrases.slice(0, 3).map((phrase, index) => (
                    <div key={index} className="text-sm text-gray-600 bg-gray-50 px-3 py-1 rounded-lg">
                      "{phrase}"
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No common phrases identified</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Words */}
      <Card variant="elevated">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center">
              <MessageSquare className="text-white" size={20} />
            </div>
            <div>
              <CardTitle>Vocabulary Analysis</CardTitle>
              <CardDescription>
                Most frequently used words in your writing
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Common Words</h4>
              <div className="flex flex-wrap gap-2">
                {profile.vocabulary.commonWords.slice(0, 10).map((word) => (
                  <Badge key={word} variant="neutral" size="small">
                    {word}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-3">Unique Words</h4>
              <div className="flex flex-wrap gap-2">
                {profile.vocabulary.uniqueWords.slice(0, 8).map((word) => (
                  <Badge key={word} variant="success" size="small">
                    {word}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};