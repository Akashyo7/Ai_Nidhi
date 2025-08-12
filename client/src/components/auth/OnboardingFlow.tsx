import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle, 
  Target, 
  Lightbulb, 
  MessageSquare,
  Sparkles,
  User,
  Briefcase,
  Globe
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

const onboardingSchema = z.object({
  goals: z.array(z.string()).min(1, 'Please select at least one goal'),
  brandingObjectives: z.array(z.string()).min(1, 'Please select at least one objective'),
  contextBox: z.string().min(50, 'Please provide at least 50 characters about yourself'),
  socialMediaHandles: z.array(z.object({
    platform: z.string(),
    handle: z.string(),
    url: z.string().url().optional()
  })).optional()
});

type OnboardingFormData = z.infer<typeof onboardingSchema>;

interface OnboardingFlowProps {
  onComplete: (data: OnboardingFormData) => void;
  isLoading?: boolean;
}

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ 
  onComplete, 
  isLoading = false 
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    getValues
  } = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      goals: [],
      brandingObjectives: [],
      contextBox: '',
      socialMediaHandles: []
    }
  });

  const watchedGoals = watch('goals') || [];
  const watchedObjectives = watch('brandingObjectives') || [];

  const steps = [
    {
      title: 'Welcome to ANIDHI!',
      description: 'Let\'s set up your AI-powered personal branding assistant',
      icon: Sparkles
    },
    {
      title: 'What are your goals?',
      description: 'Help us understand what you want to achieve',
      icon: Target
    },
    {
      title: 'Branding objectives',
      description: 'What aspects of your brand do you want to focus on?',
      icon: Lightbulb
    },
    {
      title: 'Tell us about yourself',
      description: 'Share your background, interests, and expertise',
      icon: MessageSquare
    }
  ];

  const goalOptions = [
    'Build thought leadership',
    'Increase professional visibility',
    'Generate more leads',
    'Establish industry expertise',
    'Grow social media following',
    'Improve content consistency',
    'Network with professionals',
    'Career advancement'
  ];

  const objectiveOptions = [
    'Content strategy',
    'Brand voice development',
    'Social media optimization',
    'Thought leadership',
    'Professional networking',
    'Industry positioning',
    'Content creation',
    'Brand consistency'
  ];

  const toggleSelection = (value: string, field: 'goals' | 'brandingObjectives') => {
    const currentValues = getValues(field) || [];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(item => item !== value)
      : [...currentValues, value];
    setValue(field, newValues);
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmit = (data: OnboardingFormData) => {
    onComplete(data);
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return watchedGoals.length > 0;
      case 2:
        return watchedObjectives.length > 0;
      case 3:
        return getValues('contextBox')?.length >= 50;
      default:
        return true;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => (
              <div
                key={index}
                className={`flex items-center ${index < steps.length - 1 ? 'flex-1' : ''}`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    index <= currentStep
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-200 text-gray-400'
                  }`}
                >
                  {index < currentStep ? (
                    <CheckCircle size={20} />
                  ) : (
                    <span className="text-sm font-medium">{index + 1}</span>
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-4 rounded ${
                      index < currentStep ? 'bg-primary-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-500">
              Step {currentStep + 1} of {steps.length}
            </p>
          </div>
        </div>

        <Card variant="elevated">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              {React.createElement(steps[currentStep].icon, { 
                size: 28, 
                className: "text-white" 
              })}
            </div>
            <CardTitle className="text-2xl">{steps[currentStep].title}</CardTitle>
            <CardDescription className="text-lg">
              {steps[currentStep].description}
            </CardDescription>
          </CardHeader>

          <CardContent className="p-8">
            <form onSubmit={handleSubmit(onSubmit)}>
              {/* Step 0: Welcome */}
              {currentStep === 0 && (
                <div className="text-center space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-xl">
                      <User className="text-blue-600" size={20} />
                      <span className="text-blue-900">Personalized AI insights</span>
                    </div>
                    <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-xl">
                      <Briefcase className="text-green-600" size={20} />
                      <span className="text-green-900">Professional brand building</span>
                    </div>
                    <div className="flex items-center space-x-3 p-4 bg-purple-50 rounded-xl">
                      <Globe className="text-purple-600" size={20} />
                      <span className="text-purple-900">Multi-platform optimization</span>
                    </div>
                  </div>
                  <p className="text-gray-600">
                    This quick setup will help us customize ANIDHI to your specific needs and goals.
                  </p>
                </div>
              )}

              {/* Step 1: Goals */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {goalOptions.map((goal) => (
                      <button
                        key={goal}
                        type="button"
                        onClick={() => toggleSelection(goal, 'goals')}
                        className={`p-4 text-left rounded-xl border-2 transition-all duration-200 ${
                          watchedGoals.includes(goal)
                            ? 'border-primary-500 bg-primary-50 text-primary-900'
                            : 'border-gray-200 hover:border-gray-300 text-gray-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{goal}</span>
                          {watchedGoals.includes(goal) && (
                            <CheckCircle size={20} className="text-primary-600" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                  {errors.goals && (
                    <p className="text-sm text-red-600">{errors.goals.message}</p>
                  )}
                </div>
              )}

              {/* Step 2: Branding Objectives */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {objectiveOptions.map((objective) => (
                      <button
                        key={objective}
                        type="button"
                        onClick={() => toggleSelection(objective, 'brandingObjectives')}
                        className={`p-4 text-left rounded-xl border-2 transition-all duration-200 ${
                          watchedObjectives.includes(objective)
                            ? 'border-primary-500 bg-primary-50 text-primary-900'
                            : 'border-gray-200 hover:border-gray-300 text-gray-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{objective}</span>
                          {watchedObjectives.includes(objective) && (
                            <CheckCircle size={20} className="text-primary-600" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                  {errors.brandingObjectives && (
                    <p className="text-sm text-red-600">{errors.brandingObjectives.message}</p>
                  )}
                </div>
              )}

              {/* Step 3: Context Box */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tell us about yourself
                    </label>
                    <textarea
                      {...register('contextBox')}
                      rows={6}
                      className="input resize-none"
                      placeholder="Share your background, expertise, interests, and what makes you unique. This helps our AI provide more personalized recommendations..."
                    />
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-sm text-gray-500">
                        Minimum 50 characters
                      </p>
                      <p className="text-sm text-gray-500">
                        {getValues('contextBox')?.length || 0} characters
                      </p>
                    </div>
                    {errors.contextBox && (
                      <p className="text-sm text-red-600 mt-1">{errors.contextBox.message}</p>
                    )}
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <div className="flex items-start space-x-3">
                      <Lightbulb className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
                      <div>
                        <p className="text-sm font-medium text-blue-900">Pro tip</p>
                        <p className="text-sm text-blue-700 mt-1">
                          Include your industry, key skills, career goals, and any unique perspectives you bring. 
                          The more context you provide, the better our AI can assist you.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
                <div>
                  {currentStep > 0 && (
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={prevStep}
                      icon={ArrowLeft}
                    >
                      Back
                    </Button>
                  )}
                </div>

                <div className="flex items-center space-x-3">
                  {currentStep === 0 && (
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => navigate('/dashboard')}
                    >
                      Skip Setup
                    </Button>
                  )}
                  
                  {currentStep < steps.length - 1 ? (
                    <Button
                      type="button"
                      variant="primary"
                      onClick={nextStep}
                      disabled={!canProceed()}
                      icon={ArrowRight}
                      iconPosition="right"
                    >
                      Continue
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      variant="primary"
                      loading={isLoading}
                      icon={!isLoading ? CheckCircle : undefined}
                    >
                      {isLoading ? 'Completing setup...' : 'Complete Setup'}
                    </Button>
                  )}
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};