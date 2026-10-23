import React from 'react';
import { Loader2 } from 'lucide-react';

export type HrButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
export type HrButtonSize = 'sm' | 'md' | 'lg';

export interface HrButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: HrButtonVariant;
  size?: HrButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const HrButton = React.forwardRef<HTMLButtonElement, HrButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      disabled,
      className = '',
      type = 'button',
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium select-none transition-colors duration-150 rounded-[var(--hr-radius)] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[var(--hr-primary)] disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed min-h-[44px] sm:min-h-[auto]';

    const sizeStyles = {
      sm: 'text-xs px-3 py-1.5 sm:min-h-[34px] gap-1.5',
      md: 'text-sm px-4 py-2 sm:min-h-[40px] gap-2',
      lg: 'text-base px-5 py-2.5 sm:min-h-[44px] gap-2.5',
    };

    const variantStyles = {
      primary:
        'bg-[var(--hr-primary)] text-white hover:bg-[var(--hr-primary-hover)] active:bg-[#054677] shadow-[var(--hr-shadow-sm)]',
      secondary:
        'bg-[var(--hr-primary-soft)] text-[var(--hr-primary)] hover:bg-[#D5E6F4] active:bg-[#C2DCF0]',
      outline:
        'bg-[var(--hr-surface)] border border-[var(--hr-border)] text-[var(--hr-text)] hover:bg-[var(--hr-surface-muted)] hover:border-[var(--hr-text-muted)]',
      danger:
        'bg-[var(--hr-status-error)] text-white hover:bg-[#9B1C12] active:bg-[#83170F]',
      ghost:
        'bg-transparent text-[var(--hr-text)] hover:bg-[var(--hr-surface-muted)] active:bg-[var(--hr-border-subtle)]',
    };

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${
          fullWidth ? 'w-full' : ''
        } ${className}`}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
        ) : (
          leftIcon && <span className="flex-shrink-0">{leftIcon}</span>
        )}
        <span>{children}</span>
        {!isLoading && rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

HrButton.displayName = 'HrButton';
