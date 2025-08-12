import React, { forwardRef, useState } from 'react';
import { Eye, EyeOff, LucideIcon } from 'lucide-react';

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  success?: string;
  icon?: LucideIcon;
  fullWidth?: boolean;
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(({
  label,
  error,
  success,
  icon: Icon,
  fullWidth = true,
  className = '',
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);

  const inputClasses = [
    'input',
    error ? 'input-error' : '',
    success ? 'input-success' : '',
    Icon ? 'pl-10' : '',
    'pr-10', // Always add right padding for eye icon
    fullWidth ? 'w-full' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={fullWidth ? 'w-full' : ''}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon size={18} className="text-gray-400" />
          </div>
        )}
        
        <input
          ref={ref}
          type={showPassword ? 'text' : 'password'}
          className={inputClasses}
          {...props}
        />
        
        <button
          type="button"
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      
      {error && (
        <p className="mt-2 text-sm text-red-600 animate-slide-down">
          {error}
        </p>
      )}
      
      {success && (
        <p className="mt-2 text-sm text-green-600 animate-slide-down">
          {success}
        </p>
      )}
    </div>
  );
});

PasswordInput.displayName = 'PasswordInput';