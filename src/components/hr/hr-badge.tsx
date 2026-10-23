import React from 'react';

export type HrBadgeVariant = 'success' | 'warning' | 'error' | 'neutral' | 'info';
export type HrBadgeSize = 'sm' | 'md';

export interface HrBadgeProps {
  children: React.ReactNode;
  variant?: HrBadgeVariant;
  size?: HrBadgeSize;
  dot?: boolean;
  className?: string;
}

export function HrBadge({
  children,
  variant = 'neutral',
  size = 'sm',
  dot = true,
  className = '',
}: HrBadgeProps) {
  const variantStyles = {
    success: 'bg-[var(--hr-status-success-bg)] text-[var(--hr-status-success)] border-[#BFE6CC]',
    warning: 'bg-[var(--hr-status-warning-bg)] text-[var(--hr-status-warning)] border-[#FEE199]',
    error: 'bg-[var(--hr-status-error-bg)] text-[var(--hr-status-error)] border-[#FECDCA]',
    neutral: 'bg-[var(--hr-status-neutral-bg)] text-[var(--hr-status-neutral)] border-[var(--hr-border)]',
    info: 'bg-[var(--hr-primary-soft)] text-[var(--hr-primary)] border-[#CBE0F1]',
  };

  const dotColors = {
    success: 'bg-[var(--hr-status-success)]',
    warning: 'bg-[var(--hr-status-warning)]',
    error: 'bg-[var(--hr-status-error)]',
    neutral: 'bg-[var(--hr-status-neutral)]',
    info: 'bg-[var(--hr-primary)]',
  };

  const sizeStyles = {
    sm: 'text-[13px] px-2.5 py-0.5 font-semibold leading-normal',
    md: 'text-[14px] px-3 py-1 font-semibold leading-normal',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 border rounded-[var(--hr-radius-sm)] select-none whitespace-nowrap shadow-xs ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {dot && <span className={`w-2 h-2 rounded-full flex-shrink-0 ${dotColors[variant]}`} />}
      <span>{children}</span>
    </span>
  );
}
