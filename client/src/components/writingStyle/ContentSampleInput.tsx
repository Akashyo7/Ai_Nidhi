import React, { useState } from 'react';
import { Plus, FileText, Trash2, Upload } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ContentSample } from '@/services/writingStyleService';

interface ContentSampleInputProps {
  samples: ContentSample[];
  onSamplesChange: (samples: ContentSample[]) => void;
  onAnalyze: () => void;
  isAnalyzing?: boolean;
}

export const ContentSampleInput: React.FC<ContentSampleInputProps> = ({
  samples,
  onSamplesChange,
  onAnalyze,
  isAnalyzing = false
}) => {
  const [newSample, setNewSample] = useState<ContentSample>({
    content: '',
    platform: '',
    contentType: ''
  });
  const [showAddForm, setShowAddForm] = useState(false);

  const platformOptions = [
    'LinkedIn', 'Twitter', 'Blog', 'Medium', 'Newsletter', 'Website', 'Email', 'Other'
  ];

  const contentTypeOptions = [
    'Post', 'Article', 'Thread', 'Story', 'Update', 'Comment', 'Email', 'Other'
  ];

  const addSample = () => {
    if (newSample.content.trim() && newSample.platform && newSample.contentType) {
      onSamplesChange([...samples, { ...newSample }]);
      setNewSample({ content: '', platform: '', contentType: '' });
      setShowAddForm(false);
    }
  };

  const removeSample = (index: number) => {
    const updatedSamples = samples.filter((_, i) => i !== index);
    onSamplesChange(updatedSamples);
  };

  const canAnalyze = samples.length > 0 && samples.every(s => s.content.length >= 50);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card variant="elevated">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                <FileText className="text-white" size={20} />
              </div>
              <div>
                <CardTitle>Content Samples</CardTitle>
                <CardDescription>
                  Add your writing samples to analyze your unique style
                </CardDescription>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Badge variant="primary" size="small">
                {samples.length} samples
              </Badge>
              {!showAddForm && (
                <Button
                  variant="secondary"
                  size="small"
                  onClick={() => setShowAddForm(true)}
                  icon={Plus}
                >
                  Add Sample
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        {/* Add Sample Form */}
        {showAddForm && (
          <CardContent>
            <div className="space-y-4 p-4 bg-gray-50 rounded-xl">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Platform
                  </label>
                  <select
                    value={newSample.platform}
                    onChange={(e) => setNewSample({ ...newSample, platform: e.target.value })}
                    className="input"
                  >
                    <option value="">Select platform</option>
                    {platformOptions.map(platform => (
                      <option key={platform} value={platform.toLowerCase()}>
                        {platform}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Content Type
                  </label>
                  <select
                    value={newSample.contentType}
                    onChange={(e) => setNewSample({ ...newSample, contentType: e.target.value })}
                    className="input"
                  >
                    <option value="">Select type</option>
                    {contentTypeOptions.map(type => (
                      <option key={type} value={type.toLowerCase()}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content
                </label>
                <textarea
                  value={newSample.content}
                  onChange={(e) => setNewSample({ ...newSample, content: e.target.value })}
                  placeholder="Paste your content here (minimum 50 characters)..."
                  rows={6}
                  className="input resize-none"
                />
                <div className="flex items-center justify-between mt-2 text-sm">
                  <span className={`${
                    newSample.content.length < 50 ? 'text-orange-600' : 'text-green-600'
                  }`}>
                    {newSample.content.length < 50 
                      ? `${50 - newSample.content.length} more characters needed`
                      : 'Ready to add'
                    }
                  </span>
                  <span className="text-gray-500">{newSample.content.length} characters</span>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3">
                <Button
                  variant="ghost"
                  size="small"
                  onClick={() => {
                    setShowAddForm(false);
                    setNewSample({ content: '', platform: '', contentType: '' });
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="small"
                  onClick={addSample}
                  disabled={!newSample.content.trim() || !newSample.platform || !newSample.contentType || newSample.content.length < 50}
                  icon={Plus}
                >
                  Add Sample
                </Button>
              </div>
            </div>
          </CardContent>
        )}

        {/* Analyze Button */}
        {samples.length > 0 && (
          <CardFooter>
            <div className="flex items-center justify-between w-full">
              <div className="text-sm text-gray-600">
                {canAnalyze 
                  ? `Ready to analyze ${samples.length} sample${samples.length > 1 ? 's' : ''}`
                  : 'Some samples need more content (minimum 50 characters)'
                }
              </div>
              <Button
                variant="primary"
                onClick={onAnalyze}
                disabled={!canAnalyze}
                loading={isAnalyzing}
                icon={!isAnalyzing ? Upload : undefined}
              >
                {isAnalyzing ? 'Analyzing...' : 'Analyze Writing Style'}
              </Button>
            </div>
          </CardFooter>
        )}
      </Card>

      {/* Sample List */}
      {samples.length > 0 && (
        <div className="space-y-4">
          {samples.map((sample, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <Badge variant="primary" size="small">
                      {sample.platform}
                    </Badge>
                    <Badge variant="neutral" size="small">
                      {sample.contentType}
                    </Badge>
                    <span className="text-sm text-gray-500">
                      {sample.content.length} characters
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="small"
                    onClick={() => removeSample(index)}
                    icon={Trash2}
                    className="text-red-600 hover:text-red-700"
                  >
                    Remove
                  </Button>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-700 line-clamp-3">
                    {sample.content}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {samples.length === 0 && !showAddForm && (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FileText size={32} className="text-gray-400" />
            </div>
            <h3 className="heading-4 mb-2">No content samples yet</h3>
            <p className="body text-gray-500 mb-6 max-w-md mx-auto">
              Add samples of your writing from different platforms to analyze your unique style and get personalized recommendations.
            </p>
            <Button
              variant="primary"
              onClick={() => setShowAddForm(true)}
              icon={Plus}
            >
              Add Your First Sample
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Tips */}
      <Card>
        <CardContent className="p-4">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <h4 className="font-medium text-blue-900 mb-2">Tips for better analysis:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Include samples from different platforms (LinkedIn, blog, email, etc.)</li>
              <li>• Add various content types (posts, articles, comments, etc.)</li>
              <li>• Use recent content that represents your current style</li>
              <li>• Include at least 3-5 samples for accurate analysis</li>
              <li>• Each sample should be at least 50 characters long</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};