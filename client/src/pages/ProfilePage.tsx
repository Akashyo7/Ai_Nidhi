import React, { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  User, 
  Briefcase, 
  Target, 
  MessageSquare, 
  TrendingUp,
  History,
  Lightbulb,
  Settings
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { LoadingState } from '@/components/ui/LoadingSpinner';
import { ContextBox, ContextInsights, ContextHistory } from '@/components/context';
import { ContextAnalysis } from '@/services/contextService';

const profileSchema = z.object({
  profession: z.string().max(255, 'Profession too long').optional(),
  goals: z.string().optional(),
  brandingObjectives: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export const ProfilePage: React.FC = () => {
  const { user, profile, loadProfile, updateProfile, isLoading } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'context' | 'insights' | 'history'>('context');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  useEffect(() => {
    if (profile) {
      reset({
        profession: profile.profession || '',
        goals: profile.goals?.join(', ') || '',
        brandingObjectives: profile.brandingObjectives?.join(', ') || '',
      });
    }
  }, [profile, reset]);

  const onSubmit = async (data: ProfileFormData) => {
    try {
      setUpdateLoading(true);
      await updateProfile({
        profession: data.profession,
        goals: data.goals ? data.goals.split(',').map(g => g.trim()).filter(Boolean) : [],
        brandingObjectives: data.brandingObjectives ? data.brandingObjectives.split(',').map(b => b.trim()).filter(Boolean) : [],
        contextBox: profile?.contextBox, // Keep existing context
      });
      setIsEditing(false);
    } catch (error) {
      // Error handled by store
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleContextSave = (content: string, analysis: ContextAnalysis) => {
    // Context is automatically saved by the ContextBox component
    // We could show a success message here if needed
    console.log('Context saved with analysis:', analysis);
  };

  if (isLoading) {
    return <LoadingState text="Loading your profile..." className="min-h-screen" />;
  }

  const tabs = [
    { id: 'context', label: 'Context', icon: MessageSquare, description: 'Your professional background' },
    { id: 'insights', label: 'Insights', icon: Lightbulb, description: 'AI-powered recommendations' },
    { id: 'history', label: 'History', icon: History, description: 'Context version history' },
    { id: 'profile', label: 'Settings', icon: Settings, description: 'Profile settings' },
  ];

  return (
    <div className="min-h-screen section-padding">
      <div className="container-wide">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-xl">
                {user?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h1 className="heading-2">{user?.name}</h1>
              <p className="body text-gray-500">{user?.email}</p>
              <div className="flex items-center space-x-4 mt-2">
                <Badge variant="primary" size="small">
                  {profile?.profession || 'No profession set'}
                </Badge>
                <span className="body-small text-gray-400">
                  Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon
                    className={`-ml-0.5 mr-2 h-5 w-5 ${
                      activeTab === tab.id ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500'
                    }`}
                  />
                  <div className="text-left">
                    <div>{tab.label}</div>
                    <div className="text-xs text-gray-400">{tab.description}</div>
                  </div>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-8">
          {/* Context Tab */}
          {activeTab === 'context' && (
            <ContextBox
              initialContent={profile?.contextBox || ''}
              onSave={handleContextSave}
              showAnalysis={true}
              showHistory={false}
            />
          )}

          {/* Insights Tab */}
          {activeTab === 'insights' && <ContextInsights />}

          {/* History Tab */}
          {activeTab === 'history' && <ContextHistory />}

          {/* Profile Settings Tab */}
          {activeTab === 'profile' && (
            <Card variant="elevated">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-gray-500 to-gray-600 rounded-xl flex items-center justify-center">
                      <Settings className="text-white" size={20} />
                    </div>
                    <div>
                      <CardTitle>Profile Settings</CardTitle>
                      <CardDescription>
                        Manage your basic profile information and preferences
                      </CardDescription>
                    </div>
                  </div>
                  
                  {!isEditing && (
                    <Button
                      variant="secondary"
                      onClick={() => setIsEditing(true)}
                    >
                      Edit Profile
                    </Button>
                  )}
                </div>
              </CardHeader>

              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <Input
                    {...register('profession')}
                    label="Profession"
                    placeholder="e.g., Software Engineer, Marketing Manager"
                    icon={Briefcase}
                    error={errors.profession?.message}
                    disabled={!isEditing}
                  />

                  <Input
                    {...register('goals')}
                    label="Goals"
                    placeholder="e.g., Build thought leadership, Grow network, Launch startup"
                    icon={Target}
                    error={errors.goals?.message}
                    disabled={!isEditing}
                  />
                  {isEditing && (
                    <p className="text-sm text-gray-500 -mt-4">
                      Separate multiple goals with commas
                    </p>
                  )}

                  <Input
                    {...register('brandingObjectives')}
                    label="Branding Objectives"
                    placeholder="e.g., Increase visibility, Establish expertise, Build community"
                    icon={TrendingUp}
                    error={errors.brandingObjectives?.message}
                    disabled={!isEditing}
                  />
                  {isEditing && (
                    <p className="text-sm text-gray-500 -mt-4">
                      Separate multiple objectives with commas
                    </p>
                  )}

                  {isEditing && (
                    <CardFooter className="px-0">
                      <div className="flex items-center space-x-4">
                        <Button
                          type="submit"
                          variant="primary"
                          loading={updateLoading}
                          disabled={!isDirty}
                        >
                          {updateLoading ? 'Saving...' : 'Save Changes'}
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => {
                            setIsEditing(false);
                            reset();
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </CardFooter>
                  )}
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};