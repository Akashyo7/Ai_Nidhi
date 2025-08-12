import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { LoginForm } from '@/components/auth/LoginForm';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { Sparkles, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();
  const { isAuthenticated, checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate, checkAuth]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-blue-50">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative min-h-screen flex">
        {/* Left Side - Branding */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 via-primary-700 to-blue-700 p-12 items-center justify-center">
          <div className="max-w-md text-white">
            <div className="flex items-center space-x-3 mb-8">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <Sparkles size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">ANIDHI</h1>
                <p className="text-primary-100 text-sm">Personal Branding Platform</p>
              </div>
            </div>
            
            <h2 className="text-4xl font-bold mb-6 leading-tight">
              Build Your Personal Brand with AI
            </h2>
            
            <p className="text-xl text-primary-100 mb-8 leading-relaxed">
              Join thousands of professionals who are creating powerful personal brands with ANIDHI's intelligent platform.
            </p>

            <div className="space-y-4">
              {[
                'AI-powered content generation',
                'Trend monitoring and analysis',
                'Brand consistency tracking',
                'Multi-platform optimization'
              ].map((feature, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <span className="text-primary-100">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side - Auth Form */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            {/* Back to Home Button */}
            <div className="mb-8">
              <Button
                variant="ghost"
                icon={ArrowLeft}
                onClick={() => navigate('/')}
                className="text-gray-600 hover:text-gray-900"
              >
                Back to Home
              </Button>
            </div>

            {/* Header */}
            <div className="text-center mb-8">
              <div className="lg:hidden flex items-center justify-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center shadow-lg">
                  <Sparkles size={28} className="text-white" />
                </div>
              </div>
              
              <Badge variant="primary" className="mb-4">
                <Sparkles size={12} />
                {isLogin ? 'Welcome Back' : 'Get Started'}
              </Badge>
              
              <h2 className="heading-2 mb-3">
                {isLogin ? 'Welcome back' : 'Create your account'}
              </h2>
              
              <p className="body text-gray-500">
                {isLogin 
                  ? 'Sign in to continue building your personal brand' 
                  : 'Start your journey to a powerful personal brand'
                }
              </p>
            </div>

            {/* Auth Form */}
            <Card variant="elevated" className="mb-6">
              <CardContent className="p-8">
                {isLogin ? <LoginForm /> : <RegisterForm />}
              </CardContent>
            </Card>
            
            {/* Toggle Auth Mode */}
            <div className="text-center">
              <p className="body-small mb-3">
                {isLogin 
                  ? "Don't have an account?" 
                  : 'Already have an account?'
                }
              </p>
              <Button
                variant="ghost"
                onClick={() => setIsLogin(!isLogin)}
                className="font-medium"
              >
                {isLogin ? 'Create account' : 'Sign in instead'}
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="mt-8 text-center">
              <p className="body-small text-gray-400 mb-4">
                Trusted by professionals worldwide
              </p>
              <div className="flex items-center justify-center space-x-6 opacity-60">
                <div className="text-xs font-medium text-gray-400">🔒 Secure</div>
                <div className="text-xs font-medium text-gray-400">⚡ Fast</div>
                <div className="text-xs font-medium text-gray-400">🎯 AI-Powered</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};