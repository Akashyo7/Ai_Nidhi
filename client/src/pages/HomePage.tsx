import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Brain, TrendingUp, Zap, Shield, Sparkles, Star, Users } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export const HomePage: React.FC = () => {
  const features = [
    {
      icon: Brain,
      title: 'Internal Awareness',
      description: 'Learns from your content, LinkedIn profile, and personal context to understand your unique voice and style.',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: TrendingUp,
      title: 'External Intelligence',
      description: 'Monitors industry trends, competitors, and opportunities to keep you ahead of the curve.',
      color: 'from-green-500 to-green-600'
    },
    {
      icon: Zap,
      title: 'Smart Automation',
      description: 'Powered by Huginn workflows and MCP servers for seamless content creation and brand management.',
      color: 'from-yellow-500 to-yellow-600'
    },
    {
      icon: Shield,
      title: 'Self-Hosted & Secure',
      description: 'Complete control over your data with self-hosted deployment and student-friendly pricing.',
      color: 'from-purple-500 to-purple-600'
    }
  ];

  const stats = [
    { icon: Users, value: '1K+', label: 'Active Users' },
    { icon: Star, value: '4.9', label: 'User Rating' },
    { icon: Sparkles, value: '10K+', label: 'Content Generated' }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="section-padding">
        <div className="container-narrow text-center">
          <div className="mb-8">
            <Badge variant="primary" className="mb-6">
              <Sparkles size={12} />
              AI-Powered Personal Branding
            </Badge>
            
            <h1 className="heading-1 mb-6 text-balance">
              Your AI-Powered
              <span className="bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent"> Personal Brand</span>
              <br />
              Assistant
            </h1>
            
            <p className="body-large mb-8 max-w-2xl mx-auto text-balance">
              ANIDHI creates an intelligent ecosystem that learns from your content, 
              monitors trends, and helps you build a consistent, powerful personal brand.
            </p>
          </div>
          
          {/* Interactive Search Preview */}
          <div className="max-w-2xl mx-auto mb-12">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary-600 to-blue-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-300"></div>
              <div className="relative">
                <input
                  type="text"
                  placeholder="What would you like to create today?"
                  className="w-full px-6 py-4 text-lg rounded-2xl border-0 bg-white shadow-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 placeholder-gray-400"
                  disabled
                />
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                  <div className="w-10 h-10 bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl flex items-center justify-center shadow-lg">
                    <ArrowRight size={18} className="text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button
              as={Link}
              to="/auth"
              variant="primary"
              size="large"
              icon={Sparkles}
              className="shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40"
            >
              Start Building Your Brand
            </Button>
            <Button
              as={Link}
              to="/about"
              variant="secondary"
              size="large"
            >
              Learn More
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-md mx-auto">
            {stats.map(({ icon: Icon, value, label }) => (
              <div key={label} className="text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-primary-200 rounded-2xl flex items-center justify-center mx-auto mb-2">
                  <Icon size={20} className="text-primary-600" />
                </div>
                <div className="heading-4 text-gray-900">{value}</div>
                <div className="body-small">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section-padding bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <div className="container-wide">
          <div className="text-center mb-16">
            <Badge variant="primary" className="mb-6">
              Intelligent Features
            </Badge>
            <h2 className="heading-2 mb-4">
              Intelligent Brand Management
            </h2>
            <p className="body-large max-w-2xl mx-auto">
              ANIDHI combines AI-powered insights with automation to help you 
              build and maintain a consistent personal brand across all platforms.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map(({ icon: Icon, title, description, color }) => (
              <Card key={title} variant="elevated" className="text-center group hover:scale-105 transition-all duration-300">
                <CardContent>
                  <div className={`w-16 h-16 bg-gradient-to-br ${color} rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300`}>
                    <Icon className="text-white" size={28} />
                  </div>
                  <h3 className="heading-4 mb-3">
                    {title}
                  </h3>
                  <p className="body">
                    {description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="section-padding">
        <div className="container-wide">
          <div className="text-center mb-16">
            <Badge variant="primary" className="mb-6">
              Simple Process
            </Badge>
            <h2 className="heading-2 mb-4">
              How ANIDHI Works
            </h2>
            <p className="body-large max-w-2xl mx-auto">
              Get started with your AI-powered personal brand assistant in three simple steps.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                step: '01',
                title: 'Connect & Learn',
                description: 'Connect your LinkedIn, upload writing samples, and let ANIDHI learn your unique voice and style.'
              },
              {
                step: '02',
                title: 'Analyze & Discover',
                description: 'ANIDHI monitors trends, analyzes competitors, and identifies opportunities in your industry.'
              },
              {
                step: '03',
                title: 'Create & Optimize',
                description: 'Generate content ideas, optimize your brand strategy, and maintain consistency across platforms.'
              }
            ].map(({ step, title, description }) => (
              <div key={step} className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <span className="text-white font-bold text-lg">{step}</span>
                </div>
                <h3 className="heading-4 mb-3">{title}</h3>
                <p className="body">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding bg-gradient-to-br from-primary-600 via-primary-700 to-blue-700 text-white">
        <div className="container-narrow text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="heading-2 mb-4 text-white">
              Ready to Transform Your Personal Brand?
            </h2>
            <p className="body-large mb-8 text-primary-100">
              Join thousands of professionals who are building powerful personal brands with ANIDHI's AI-powered platform.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                as={Link}
                to="/auth"
                variant="secondary"
                size="large"
                icon={Sparkles}
                className="bg-white text-primary-700 hover:bg-gray-50 shadow-lg"
              >
                Get Started for Free
              </Button>
              <Button
                as={Link}
                to="/about"
                variant="ghost"
                size="large"
                className="text-white border-white/20 hover:bg-white/10"
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};