import React from 'react';
import { LucideIcon } from 'lucide-react';

interface BaseButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'small' | 'medium' | 'large';
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
  className?: string;
}

interface ButtonAsButton extends BaseButtonProps, React.ButtonHTMLAttributes<HTMLButtonElement> {
  as?: 'button';
}

interface ButtonAsComponent extends BaseButtonProps {
  as: React.ElementType;
  to?: string;
  href?: string;
  [key: string]: any;
}

type ButtonProps = ButtonAsButton | ButtonAsComponent;

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'medium',
  icon: Icon,
  iconPosition = 'left',
  loading = false,
  fullWidth = false,
  className = '',
  as: Component = 'button',
  ...props
}) => {
  const baseClasses = 'btn';
  
  const variantClasses = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    ghost: 'btn-ghost',
    danger: 'btn bg-red-600 text-white hover:bg-red-700 hover:shadow-lg hover:shadow-red-500/25 focus:ring-red-500 active:scale-[0.98]'
  };
  
  const sizeClasses = {
    small: 'btn-small',
    medium: '',
    large: 'btn-large'
  };
  
  const classes = [
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    fullWidth ? 'w-full' : '',
    className
  ].filter(Boolean).join(' ');

  const isDisabled = (Component === 'button' && (props.disabled || loading));

  return (
    <Component
      className={classes}
      disabled={isDisabled}
      {...props}
    >
      {loading ? (
        <div className="loading-spinner w-4 h-4 mr-2" />
      ) : (
        Icon && iconPosition === 'left' && <Icon size={16} className="mr-2" />
      )}
      
      {children}
      
      {!loading && Icon && iconPosition === 'right' && (
        <Icon size={16} className="ml-2" />
      )}
    </Component>
  );
};