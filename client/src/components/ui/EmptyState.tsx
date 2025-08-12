import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: LucideIcon;
  };
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  action,
  className = ''
}) => (
  <div className={`flex flex-col items-center justify-center p-12 text-center ${className}`}>
    {Icon && (
      <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-6">
        <Icon size={32} className="text-gray-400" />
      </div>
    )}
    
    <h3 className="heading-4 mb-2">{title}</h3>
    
    {description && (
      <p className="body text-center max-w-md mb-6">
        {description}
      </p>
    )}
    
    {action && (
      <Button
        onClick={action.onClick}
        icon={action.icon}
        variant="primary"
      >
        {action.label}
      </Button>
    )}
  </div>
);