import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { User, Mail, Lock, UserPlus, AlertCircle, CheckCircle, Briefcase } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { Button } from '@/components/ui/Button';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  profession: z.string().min(2, 'Profession is required for better AI insights'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain uppercase, lowercase, and number'),
  confirmPassword: z.string(),
  agreeToTerms: z.boolean().refine(val => val === true, {
    message: 'You must agree to the terms and conditions'
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export const RegisterForm: React.FC = () => {
  const navigate = useNavigate();
  const { register: registerUser, isLoading, error, clearError } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const watchedFields = watch();
  const password = watch('password');

  const onSubmit = async (data: RegisterFormData) => {
    try {
      clearError();
      await registerUser(data.email, data.password, data.name);
      navigate('/dashboard');
    } catch (error) {
      // Error is handled by the store
    }
  };

  React.useEffect(() => {
    if (error) {
      clearError();
    }
  }, [watchedFields, clearError, error]);

  // Password strength indicator
  const getPasswordStrength = (password: string) => {
    if (!password) return { strength: 0, label: '', color: '' };
    
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z\d]/.test(password)) strength++;

    const labels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
    const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500'];
    
    return {
      strength,
      label: labels[Math.min(strength - 1, 4)] || '',
      color: colors[Math.min(strength - 1, 4)] || 'bg-gray-300'
    };
  };

  const passwordStrength = getPasswordStrength(password || '');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center space-x-3 animate-slide-down">
          <AlertCircle size={20} className="text-red-500 flex-shrink-0" />
          <div>
            <p className="font-medium">Registration failed</p>
            <p className="text-sm text-red-600">{error}</p>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <Input
          {...register('name')}
          type="text"
          label="Full name"
          placeholder="Enter your full name"
          icon={User}
          error={errors.name?.message}
          autoComplete="name"
        />

        <Input
          {...register('email')}
          type="email"
          label="Email address"
          placeholder="Enter your email"
          icon={Mail}
          error={errors.email?.message}
          autoComplete="email"
        />

        <Input
          {...register('profession')}
          type="text"
          label="Profession"
          placeholder="e.g., Software Developer, Marketing Manager"
          icon={Briefcase}
          error={errors.profession?.message}
          autoComplete="organization-title"
        />

        <div>
          <PasswordInput
            {...register('password')}
            label="Password"
            placeholder="Create a strong password"
            icon={Lock}
            error={errors.password?.message}
            autoComplete="new-password"
          />
          
          {password && (
            <div className="mt-2">
              <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                <span>Password strength</span>
                <span className={`font-medium ${
                  passwordStrength.strength >= 4 ? 'text-green-600' : 
                  passwordStrength.strength >= 3 ? 'text-blue-600' :
                  passwordStrength.strength >= 2 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {passwordStrength.label}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                  style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>

        <PasswordInput
          {...register('confirmPassword')}
          label="Confirm password"
          placeholder="Confirm your password"
          icon={Lock}
          error={errors.confirmPassword?.message}
          autoComplete="new-password"
        />
      </div>

      <div className="space-y-4">
        <label className="flex items-start space-x-3">
          <input
            {...register('agreeToTerms')}
            type="checkbox"
            className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 focus:ring-2 mt-0.5"
          />
          <span className="text-sm text-gray-600 leading-relaxed">
            I agree to the{' '}
            <button type="button" className="text-primary-600 hover:text-primary-700 font-medium">
              Terms of Service
            </button>{' '}
            and{' '}
            <button type="button" className="text-primary-600 hover:text-primary-700 font-medium">
              Privacy Policy
            </button>
          </span>
        </label>
        {errors.agreeToTerms && (
          <p className="text-sm text-red-600 animate-slide-down">{errors.agreeToTerms.message}</p>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-start space-x-3">
            <CheckCircle size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-900">Why we collect this information</p>
              <p className="text-sm text-blue-700 mt-1">
                Your profession helps our AI provide more relevant content suggestions and industry-specific insights for your personal brand.
              </p>
            </div>
          </div>
        </div>
      </div>

      <Button
        type="submit"
        variant="primary"
        size="large"
        fullWidth
        loading={isLoading}
        icon={!isLoading ? UserPlus : undefined}
      >
        {isLoading ? 'Creating account...' : 'Create account'}
      </Button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-white text-gray-500">Or sign up with</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Button
          type="button"
          variant="secondary"
          disabled
          className="flex items-center justify-center space-x-2"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          <span>Google</span>
        </Button>
        
        <Button
          type="button"
          variant="secondary"
          disabled
          className="flex items-center justify-center space-x-2"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
          <span>Facebook</span>
        </Button>
      </div>
    </form>
  );
};