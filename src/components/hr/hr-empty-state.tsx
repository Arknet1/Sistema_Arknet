import React from 'react';
import { Inbox } from 'lucide-react';

export interface HrEmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function HrEmptyState({
  icon = <Inbox className="w-8 h-8 text-[var(--hr-text-muted)]" />,
  title,
  description,
  action,
  className = '',
}: HrEmptyStateProps) {
  return (
    <div
      className={`p-8 sm:p-12 text-center bg-[var(--hr-surface)] border border-[var(--hr-border)] rounded-[var(--hr-radius)] shadow-[var(--hr-shadow-sm)] flex flex-col items-center justify-center ${className}`}
    >
      <div className="p-3 bg-[var(--hr-surface-muted)] border border-[var(--hr-border-subtle)] rounded-full mb-3 text-[var(--hr-text-muted)]">
        {icon}
      </div>
      <h3 className="text-sm sm:text-base font-bold text-[var(--hr-text)] tracking-tight">
        {title}
      </h3>
      {description && (
        <p className="text-xs sm:text-sm text-[var(--hr-text-muted)] mt-1 max-w-sm leading-relaxed">
          {description}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
