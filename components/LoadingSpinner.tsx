import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info';
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  variant = 'default',
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  const variantClasses = {
    default: 'border-foreground/20 border-t-button',
    primary: 'border-primary/20 border-t-button',
    success: 'border-emerald-500/20 border-t-emerald-400',
    warning: 'border-amber-500/20 border-t-amber-400',
    error: 'border-red-500/20 border-t-red-400',
    info: 'border-blue-500/20 border-t-blue-400',
  };

  return (
    <div className="flex justify-center items-center">
      <div className="relative">
        <div
          className={`${sizeClasses[size]} ${variantClasses[variant]} rounded-full animate-spin`}
        />
        {/* Premium glow effect */}
        <div className={`absolute inset-0 ${sizeClasses[size]} rounded-full ${variantClasses[variant]} animate-spin opacity-50 blur-sm`} />
      </div>
    </div>
  );
};

