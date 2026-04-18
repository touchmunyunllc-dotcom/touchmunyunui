import React from 'react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  variant?: 'default' | 'products' | 'orders' | 'cart' | 'search';
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  variant = 'default',
}) => {
  const variantConfig = {
    products: {
      icon: (
        <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      gradient: 'from-blue-500/20 to-cyan-500/20',
      iconColor: 'text-blue-400',
    },
    orders: {
      icon: (
        <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      gradient: 'from-purple-500/20 to-indigo-500/20',
      iconColor: 'text-purple-400',
    },
    cart: {
      icon: (
        <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      gradient: 'from-amber-500/20 to-yellow-500/20',
      iconColor: 'text-amber-400',
    },
    search: {
      icon: (
        <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
      gradient: 'from-emerald-500/20 to-green-500/20',
      iconColor: 'text-emerald-400',
    },
    default: {
      icon: (
        <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      gradient: 'from-foreground/10 to-foreground/5',
      iconColor: 'text-foreground/60',
    },
  };

  const config = variantConfig[variant];
  const displayIcon = icon || config.icon;

  return (
    <div className="relative flex flex-col items-center justify-center py-16 px-4">
      {/* Premium background effects */}
      <div className={`absolute inset-0 bg-gradient-to-br ${config.gradient} rounded-3xl opacity-50 blur-3xl`} />
      
      {/* Glass container */}
      <div className="relative bg-primary/80 backdrop-blur-xl rounded-3xl shadow-glass-lg p-12 border-2 border-foreground/10 max-w-md w-full text-center">
        {/* Animated gradient accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-button to-transparent opacity-50" />
        
        {/* Icon with context color */}
        <div className={`inline-flex items-center justify-center mb-6 ${config.iconColor} transform hover:scale-110 transition-transform duration-500`}>
          {displayIcon}
        </div>
        
        {/* Title */}
        <h3 className="text-2xl font-bold text-foreground mb-3">
          {title}
        </h3>
        
        {/* Description */}
        {description && (
          <p className="text-foreground/70 mb-6 leading-relaxed">
            {description}
          </p>
        )}
        
        {/* Action button */}
        {action && (
          <button
            onClick={action.onClick}
            className="inline-flex items-center gap-2 px-6 py-3 bg-button text-button-text font-semibold rounded-xl hover:bg-button-200 hover:shadow-xl transform hover:scale-105 active:scale-95 transition-all duration-200 shadow-lg border border-button-300/50"
          >
            {action.label}
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

