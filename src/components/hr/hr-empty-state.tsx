import React from 'react';
import { Inbox } from 'lucide-react';

export interface HrEmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
  /** Optional illustration variant for richer visuals */
  illustration?: 'inbox' | 'search' | 'calendar' | 'money' | 'chart' | 'people';
}

/** Decorative ring set behind the icon */
function DecorativeRings({ color }: { color: string }) {
  return (
    <>
      <div
        className="absolute inset-0 rounded-full hr-empty-pulse-ring"
        style={{
          border: `2px solid ${color}`,
          opacity: 0.12,
        }}
      />
      <div
        className="absolute -inset-3 rounded-full hr-empty-pulse-ring"
        style={{
          border: `1.5px dashed ${color}`,
          opacity: 0.07,
          animationDelay: '0.8s',
        }}
      />
    </>
  );
}

/** Abstract SVG illustration based on variant */
function EmptyIllustration({ variant }: { variant: string }) {
  const colors = {
    primary: 'var(--hr-primary)',
    soft: 'var(--hr-primary-soft)',
    muted: 'var(--hr-text-light)',
  };

  switch (variant) {
    case 'search':
      return (
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <circle cx="22" cy="22" r="14" stroke={colors.primary} strokeWidth="2.5" fill={colors.soft} />
          <line x1="32" y1="32" x2="42" y2="42" stroke={colors.primary} strokeWidth="3" strokeLinecap="round" />
          <circle cx="22" cy="22" r="6" stroke={colors.muted} strokeWidth="1.5" strokeDasharray="3 3" fill="none" />
        </svg>
      );
    case 'calendar':
      return (
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <rect x="6" y="10" width="36" height="32" rx="4" stroke={colors.primary} strokeWidth="2" fill={colors.soft} />
          <line x1="6" y1="20" x2="42" y2="20" stroke={colors.primary} strokeWidth="2" />
          <line x1="16" y1="6" x2="16" y2="14" stroke={colors.primary} strokeWidth="2.5" strokeLinecap="round" />
          <line x1="32" y1="6" x2="32" y2="14" stroke={colors.primary} strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="24" cy="30" r="3" fill={colors.primary} opacity="0.3" />
        </svg>
      );
    case 'money':
      return (
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <rect x="4" y="14" width="40" height="24" rx="4" stroke={colors.primary} strokeWidth="2" fill={colors.soft} />
          <circle cx="24" cy="26" r="8" stroke={colors.primary} strokeWidth="2" fill="none" />
          <text x="24" y="30" textAnchor="middle" fontSize="12" fontWeight="bold" fill={colors.primary}>Kz</text>
          <circle cx="8" cy="18" r="2" fill={colors.primary} opacity="0.2" />
          <circle cx="40" cy="34" r="2" fill={colors.primary} opacity="0.2" />
        </svg>
      );
    case 'chart':
      return (
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <rect x="6" y="34" width="8" height="10" rx="2" fill={colors.primary} opacity="0.2" />
          <rect x="18" y="24" width="8" height="20" rx="2" fill={colors.primary} opacity="0.4" />
          <rect x="30" y="14" width="8" height="30" rx="2" fill={colors.primary} opacity="0.6" />
          <path d="M 6 30 Q 18 10, 38 8" stroke={colors.primary} strokeWidth="2" strokeLinecap="round" fill="none" />
          <circle cx="38" cy="8" r="3" fill={colors.primary} />
        </svg>
      );
    case 'people':
      return (
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <circle cx="24" cy="16" r="8" stroke={colors.primary} strokeWidth="2" fill={colors.soft} />
          <path d="M8 42 C8 32 16 26 24 26 C32 26 40 32 40 42" stroke={colors.primary} strokeWidth="2" fill={colors.soft} />
          <circle cx="38" cy="14" r="5" stroke={colors.muted} strokeWidth="1.5" fill="none" strokeDasharray="3 2" />
          <circle cx="10" cy="14" r="5" stroke={colors.muted} strokeWidth="1.5" fill="none" strokeDasharray="3 2" />
        </svg>
      );
    default: // 'inbox'
      return (
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <rect x="6" y="6" width="36" height="36" rx="6" stroke={colors.primary} strokeWidth="2" fill={colors.soft} />
          <path d="M6 28 L16 28 L20 34 L28 34 L32 28 L42 28" stroke={colors.primary} strokeWidth="2" strokeLinecap="round" />
          <line x1="24" y1="14" x2="24" y2="22" stroke={colors.muted} strokeWidth="2" strokeLinecap="round" strokeDasharray="3 3" />
          <polyline points="20,18 24,22 28,18" stroke={colors.muted} strokeWidth="2" fill="none" strokeLinecap="round" />
        </svg>
      );
  }
}

export function HrEmptyState({
  icon,
  title,
  description,
  action,
  className = '',
  illustration,
}: HrEmptyStateProps) {
  const showIllustration = illustration && !icon;

  return (
    <div
      className={`p-8 sm:p-12 text-center bg-[var(--hr-surface)] border border-[var(--hr-border)] rounded-[var(--hr-radius)] shadow-[var(--hr-shadow-sm)] flex flex-col items-center justify-center hr-animate-in ${className}`}
    >
      {/* Icon / Illustration area */}
      <div className="relative mb-4 hr-empty-float">
        {showIllustration ? (
          <div className="relative w-16 h-16 flex items-center justify-center">
            <DecorativeRings color="var(--hr-primary)" />
            <EmptyIllustration variant={illustration} />
          </div>
        ) : (
          <div className="relative">
            <DecorativeRings color="var(--hr-primary)" />
            <div className="relative p-3.5 bg-[var(--hr-primary-soft)] border border-[var(--hr-border-subtle)] rounded-full text-[var(--hr-primary)]">
              {icon || <Inbox className="w-7 h-7" />}
            </div>
          </div>
        )}
      </div>

      <h3 className="text-sm sm:text-base font-bold text-[var(--hr-text)] tracking-tight">
        {title}
      </h3>
      {description && (
        <p className="text-xs sm:text-sm text-[var(--hr-text-muted)] mt-1.5 max-w-sm leading-relaxed">
          {description}
        </p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
