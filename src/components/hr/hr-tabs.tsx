import React from 'react';
import { Lock } from 'lucide-react';

export interface HrTabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  disabled?: boolean;
}

export interface HrTabsProps {
  tabs: HrTabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}

export function HrTabs({ tabs, activeTab, onChange, className = '' }: HrTabsProps) {
  return (
    <div className={`border-b border-[var(--hr-border)] w-full overflow-x-auto no-scrollbar ${className}`}>
      <nav className="flex space-x-1 sm:space-x-4 min-w-max px-1" aria-label="Abas de navegação">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => { if (!tab.disabled) onChange(tab.id); }}
              disabled={tab.disabled}
              title={tab.disabled ? 'Disponível depois da associação à ficha de colaborador' : undefined}
              aria-disabled={tab.disabled || undefined}
              className={`flex items-center gap-2 py-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-all whitespace-nowrap min-h-[44px] ${
                tab.disabled
                  ? 'cursor-not-allowed border-transparent text-[var(--hr-text-light)] opacity-60'
                  : isActive
                  ? 'border-[var(--hr-primary)] text-[var(--hr-primary)] bg-[var(--hr-primary-soft)]/30 rounded-t-[var(--hr-radius-sm)]'
                  : 'border-transparent text-[var(--hr-text-muted)] hover:text-[var(--hr-text)] hover:border-[var(--hr-border)]'
              }`}
            >
              {tab.icon && <span className="flex-shrink-0">{tab.icon}</span>}
              <span>{tab.label}</span>
              {tab.badge && <span className="ml-1">{tab.badge}</span>}
              {tab.disabled && <Lock className="h-3 w-3" aria-hidden="true" />}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
