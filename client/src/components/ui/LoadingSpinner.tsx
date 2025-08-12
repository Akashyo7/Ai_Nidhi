import React from 'react';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  className = ''
}) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-6 h-6',
    large: 'w-8 h-8'
  };
  
  const classes = [
    'loading-spinner',
    sizeClasses[size],
    className
  ].filter(Boolean).join(' ');

  return <div className={classes} />;
};

interface LoadingStateProps {
  children?: React.ReactNode;
  size?: 'small' | 'medium' | 'large';
  text?: string;
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  children,
  size = 'medium',
  text = 'Loading...',
  className = ''
}) => (
  <div className={`flex flex-col items-center justify-center p-8 ${className}`}>
    <LoadingSpinner size={size} />
    {(text || children) && (
      <div className="mt-4 text-center">
        {children || <p className="body-small">{text}</p>}
      </div>
    )}
  </div>
);