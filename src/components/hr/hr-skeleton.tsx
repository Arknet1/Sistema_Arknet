import React from 'react';

export function HrSkeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`bg-[var(--hr-border-subtle)] animate-pulse rounded-[var(--hr-radius-sm)] ${className}`}
    />
  );
}

export function HrCardSkeleton() {
  return (
    <div className="p-4 bg-[var(--hr-surface)] border border-[var(--hr-border)] rounded-[var(--hr-radius)] flex flex-col gap-3 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-4 bg-[var(--hr-border-subtle)] rounded w-1/3" />
        <div className="h-4 bg-[var(--hr-border-subtle)] rounded w-16" />
      </div>
      <div className="h-3 bg-[var(--hr-border-subtle)] rounded w-1/2" />
      <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-[var(--hr-border-subtle)]">
        <div className="h-3 bg-[var(--hr-border-subtle)] rounded w-2/3" />
        <div className="h-3 bg-[var(--hr-border-subtle)] rounded w-2/3" />
      </div>
    </div>
  );
}
