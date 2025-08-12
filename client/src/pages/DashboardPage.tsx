import React, { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { Link } from 'react-router-dom';
import { 
  User, 
  Settings, 
  TrendingUp, 
  FileText, 
  Sparkles, 
  CheckCircle, 
  Clock, 
  ArrowRight,
  BarChart3,
  Target,
  Zap
} from 'lucide-react';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter 
} from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { LoadingState } from '@/components/ui/LoadingState';

export const DashboardPage: React.FC = () => {
  const { user, profile, loadProfile, isLoading } = useAuthStore();

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  if (isLoading) {
    return (
      <LoadingState 
        size="large" 
        text="Loading your dashboard..."
        className="min-h-screen"
      />
    );
  }

  const profileCompletion = Math.round(
    ((profile?.profession ? 1 : 0) + 
     (profile?.goals?.length ? 1 : 0) + 
     (profile?.contextBox ? 1 : 0)) / 3 * 100
  );

  const accountAge = user?.createdAt 
    ? Math.floor((Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <div className="min-h-screen section-padding">
      <div className="container-wide">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">
                {user?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h1 className="heading-2">
                Welcome back, {user?.name}!
              </h1>
              <p className="body text-gray-500">
                Your personal branding command center
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Badge variant="primary" icon={Sparkles}>
              AI-Powered Dashboard
            </Badge>
            <Badge variant={profileCompletion === 100 ? 'success' : 'warning'}>
              {profileCompletion}% Complete
            </Badge>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-12">
          {/* Profile Status */}
          <Card variant="elevated" className="group hover:scale-105 transition-all duration-300">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-blue-500/25 transition-all duration-300">
                  <User className="text-white" size={20} />
                </div>
                <Badge variant={profileCompletion === 100 ? 'success' : 'warning'} size="small">
                  {profileCompletion}%
                </Badge>
              </div>
              <CardTitle>Profile Status</CardTitle>
              <CardDescription>Complete your profile for better AI insights</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="body-small">Profession</span>
                  {profile?.profession ? (
                    <CheckCircle size={16} className="text-green-500" />
                  ) : (
                    <Clock size={16} className="text-gray-400" />
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="body-small">Goals</span>
                  {profile?.goals?.length ? (
                    <Badge variant="success" size="small">{profile.goals.length}</Badge>
                  ) : (
                    <Clock size={16} className="text-gray-400" />
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="body-small">Context</span>
                  {profile?.contextBox ? (
                    <CheckCircle size={16} className="text-green-500" />
                  ) : (
                    <Clock size={16} className="text-gray-400" />
                  )}
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                as={Link}
                to="/profile"
                variant="secondary"
                size="small"
                icon={Settings}
                fullWidth
              >
                Complete Profile
              </Button>
            </CardFooter>
          </Card>

          {/* Account Stats */}
          <Card variant="elevated" className="group hover:scale-105 transition-all duration-300">
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-green-500/25 transition-all duration-300">
                <BarChart3 className="text-white" size={20} />
              </div>
              <CardTitle>Account Stats</CardTitle>
              <CardDescription>Your journey with ANIDHI</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="body-small">Account Age</span>
                  <span className="font-medium">{accountAge} days</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="body-small">Last Active</span>
                  <span className="font-medium">
                    {user?.lastActive ? new Date(user.lastActive).toLocaleDateString() : 'Today'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="body-small">Status</span>
                  <Badge variant="success" size="small">Active</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Features */}
          <Card variant="elevated" className="group hover:scale-105 transition-all duration-300">
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-purple-500/25 transition-all duration-300">
                <Sparkles className="text-white" size={20} />
              </div>
              <CardTitle>AI Features</CardTitle>
              <CardDescription>Intelligent brand assistance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="body-small">Content Analysis</span>
                  <Badge variant="warning" size="small">Phase 2</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="body-small">Trend Monitoring</span>
                  <Badge variant="warning" size="small">Phase 2</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="body-small">Brand Strategy</span>
                  <Badge variant="warning" size="small">Phase 3</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Content Hub */}
          <Card variant="elevated" className="group hover:scale-105 transition-all duration-300">
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-orange-500/25 transition-all duration-300">
                <FileText className="text-white" size={20} />
              </div>
              <CardTitle>Content Hub</CardTitle>
              <CardDescription>AI-powered content creation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="body-small">Generated</span>
                  <span className="font-medium">0</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="body-small">Published</span>
                  <span className="font-medium">0</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="body-small">Drafts</span>
                  <span className="font-medium">0</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                variant="ghost"
                size="small"
                fullWidth
                disabled
              >
                Coming Soon
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Getting Started */}
          <div className="lg:col-span-2">
            <Card variant="elevated">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
                    <Target className="text-white" size={20} />
                  </div>
                  <div>
                    <CardTitle>Getting Started with ANIDHI</CardTitle>
                    <CardDescription>Complete these steps to unlock the full potential of AI-powered personal branding</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-primary-700 text-white rounded-xl flex items-center justify-center text-sm font-bold shadow-lg">
                      1
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="heading-4">Complete Your Profile</h3>
                        {profileCompletion === 100 ? (
                          <CheckCircle size={20} className="text-green-500" />
                        ) : (
                          <Badge variant="warning" size="small">{profileCompletion}%</Badge>
                        )}
                      </div>
                      <p className="body mb-3">
                        Add your profession, goals, and context to help ANIDHI understand your personal brand.
                      </p>
                      <Button
                        as={Link}
                        to="/profile"
                        variant="primary"
                        size="small"
                        icon={ArrowRight}
                        iconPosition="right"
                      >
                        Complete Profile
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-gray-300 text-white rounded-xl flex items-center justify-center text-sm font-bold">
                      2
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="heading-4 text-gray-500">Connect Your Accounts</h3>
                        <Badge variant="warning" size="small">Phase 2</Badge>
                      </div>
                      <p className="body text-gray-500 mb-3">
                        Link your LinkedIn and other social media accounts for comprehensive brand analysis.
                      </p>
                      <Button variant="ghost" size="small" disabled>
                        Coming Soon
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-gray-300 text-white rounded-xl flex items-center justify-center text-sm font-bold">
                      3
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="heading-4 text-gray-500">Start Creating Content</h3>
                        <Badge variant="warning" size="small">Phase 3</Badge>
                      </div>
                      <p className="body text-gray-500 mb-3">
                        Use AI-powered content generation to create consistent, on-brand content.
                      </p>
                      <Button variant="ghost" size="small" disabled>
                        Coming Soon
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <Card variant="elevated">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                    <Zap className="text-white" size={20} />
                  </div>
                  <div>
                    <CardTitle>Quick Actions</CardTitle>
                    <CardDescription>Common tasks and shortcuts</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button
                    as={Link}
                    to="/profile"
                    variant="secondary"
                    size="small"
                    icon={User}
                    fullWidth
                  >
                    Edit Profile
                  </Button>
                  <Button
                    variant="ghost"
                    size="small"
                    icon={TrendingUp}
                    fullWidth
                    disabled
                  >
                    View Analytics
                  </Button>
                  <Button
                    variant="ghost"
                    size="small"
                    icon={FileText}
                    fullWidth
                    disabled
                  >
                    Create Content
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card variant="elevated">
              <CardHeader>
                <CardTitle>Need Help?</CardTitle>
                <CardDescription>Get support and learn more</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button
                    as={Link}
                    to="/about"
                    variant="secondary"
                    size="small"
                    fullWidth
                  >
                    Learn More
                  </Button>
                  <Button
                    variant="ghost"
                    size="small"
                    fullWidth
                    disabled
                  >
                    Contact Support
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};