'use client';

import React from 'react';

export interface HrBottomNavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  badge?: React.ReactNode;
}

export interface HrBottomNavProps {
  items: HrBottomNavItem[];
  activeId: string;
  onChange: (id: string) => void;
  className?: string;
}

export function HrBottomNav({
  items,
  activeId,
  onChange,
  className = '',
}: HrBottomNavProps) {
  return (
    <nav
      aria-label="Navegação móvel inferior"
      className={`fixed bottom-0 left-0 right-0 z-40 bg-[var(--hr-surface)] border-t border-[var(--hr-border)] shadow-[var(--hr-shadow-lg)] select-none pb-[env(safe-area-inset-bottom,0px)] md:hidden ${className}`}
    >
      <div className="flex items-center justify-around h-16 px-1">
        {items.map((item) => {
          const isActive = item.id === activeId;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChange(item.id)}
              className={`flex-1 flex flex-col items-center justify-center py-1 px-1 h-full min-h-[44px] transition-colors relative ${
                isActive
                  ? 'text-[var(--hr-primary)] font-bold'
                  : 'text-[var(--hr-text-muted)] hover:text-[var(--hr-text)]'
              }`}
            >
              <div className="relative">
                <span className={`transition-transform duration-150 ${isActive ? 'scale-110' : ''}`}>
                  {item.icon}
                </span>
                {item.badge && (
                  <span className="absolute -top-1 -right-2">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-xs mt-1 truncate max-w-[80px] leading-tight">
                {item.label}
              </span>
              {isActive && (
                <div className="absolute top-0 left-4 right-4 h-[2px] bg-[var(--hr-primary)] rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
