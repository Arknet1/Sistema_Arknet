import React from 'react';
import { ChevronRight } from 'lucide-react';

export interface HrCardListItem<T> {
  item: T;
  key: string | number;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  badge?: React.ReactNode;
  fields?: { label: string; value: React.ReactNode }[];
  actions?: React.ReactNode;
  onClick?: () => void;
}

export interface HrCardListProps<T> {
  items: T[];
  renderItem: (item: T) => HrCardListItem<T>;
  isLoading?: boolean;
  emptyMessage?: string;
  className?: string;
}

export function HrCardList<T>({
  items,
  renderItem,
  isLoading,
  emptyMessage = 'Nenhum registo encontrado.',
  className = '',
}: HrCardListProps<T>) {
  if (isLoading) {
    return (
      <div className={`flex flex-col gap-3 ${className}`}>
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="p-4 bg-[var(--hr-surface)] border border-[var(--hr-border)] rounded-[var(--hr-radius)] animate-pulse flex flex-col gap-2.5"
          >
            <div className="h-4 bg-[var(--hr-border-subtle)] rounded w-1/3" />
            <div className="h-3 bg-[var(--hr-border-subtle)] rounded w-1/2" />
            <div className="h-3 bg-[var(--hr-border-subtle)] rounded w-2/3" />
          </div>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="p-8 text-center text-[var(--hr-text-muted)] bg-[var(--hr-surface)] border border-[var(--hr-border)] rounded-[var(--hr-radius)] text-sm italic">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className={`flex flex-col gap-2.5 ${className}`}>
      {items.map((raw) => {
        const card = renderItem(raw);
        return (
          <div
            key={card.key}
            onClick={card.onClick}
            className={`p-3.5 sm:p-4 bg-[var(--hr-surface)] border border-[var(--hr-border)] rounded-[var(--hr-radius)] shadow-[var(--hr-shadow-sm)] flex flex-col gap-2 transition-colors ${
              card.onClick ? 'cursor-pointer hover:border-[var(--hr-primary)] active:bg-[var(--hr-surface-muted)]' : ''
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-[var(--hr-text)] truncate leading-tight">
                  {card.title}
                </div>
                {card.subtitle && (
                  <div className="text-xs text-[var(--hr-text-muted)] mt-0.5 truncate">
                    {card.subtitle}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                {card.badge}
                {card.onClick && (
                  <ChevronRight className="w-4 h-4 text-[var(--hr-text-muted)] ml-0.5" />
                )}
              </div>
            </div>

            {card.fields && card.fields.length > 0 && (
              <div className="grid grid-cols-2 gap-x-2 gap-y-1 pt-2 mt-1 border-t border-[var(--hr-border-subtle)] text-xs">
                {card.fields.map((f, idx) => (
                  <div key={idx} className="flex flex-col min-w-0">
                    <span className="text-[11px] text-[var(--hr-text-muted)] font-medium">
                      {f.label}
                    </span>
                    <span className="text-[var(--hr-text)] font-semibold truncate">
                      {f.value}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {card.actions && (
              <div className="pt-2 mt-1 border-t border-[var(--hr-border-subtle)] flex items-center justify-end gap-2">
                {card.actions}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
