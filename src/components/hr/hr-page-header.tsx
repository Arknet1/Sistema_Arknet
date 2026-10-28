import React from 'react';
import { HrBreadcrumbs, BreadcrumbItem } from './hr-breadcrumbs';

export interface HrPageHeaderProps {
  title: string;
  subtitle?: string;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
  breadcrumbs?: BreadcrumbItem[];
  className?: string;
}

export function HrPageHeader({
  title,
  subtitle,
  badge,
  actions,
  breadcrumbs,
  className = '',
}: HrPageHeaderProps) {
  return (
    <div className={`mb-6 ${className}`}>
      {breadcrumbs && <div className="mb-3"><HrBreadcrumbs items={breadcrumbs} /></div>}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-2xl sm:text-[28px] font-bold text-[var(--hr-text)] tracking-tight">
              {title}
            </h1>
            {badge && <span className="flex-shrink-0">{badge}</span>}
          </div>
          {subtitle && (
            <p className="text-sm text-[var(--hr-text-muted)] mt-1.5">
              {subtitle}
            </p>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap flex-shrink-0">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
