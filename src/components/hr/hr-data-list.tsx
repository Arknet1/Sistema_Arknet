'use client';

import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export interface HrDataItem {
  label: string;
  value: React.ReactNode;
  masked?: boolean;
  rawUnmaskedValue?: string;
  copyable?: boolean;
}

export function HrDataList({
  items,
  columns = 2,
  className = '',
}: {
  items: HrDataItem[];
  columns?: 1 | 2 | 3;
  className?: string;
}) {
  const [unmaskedKeys, setUnmaskedKeys] = useState<Record<number, boolean>>({});

  const toggleMask = (idx: number) => {
    setUnmaskedKeys((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const colClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  };

  return (
    <dl
      className={`grid ${colClasses[columns]} gap-x-6 gap-y-4 py-2 ${className}`}
    >
      {items.map((item, idx) => {
        const isCurrentlyUnmasked = !!unmaskedKeys[idx];

        return (
          <div key={idx} className="flex flex-col min-w-0">
            <dt className="text-xs font-medium text-[var(--hr-text-muted)] select-none">
              {item.label}
            </dt>
            <dd className="text-sm font-semibold text-[var(--hr-text)] mt-0.5 flex items-center gap-2 break-words">
              {item.masked && item.rawUnmaskedValue ? (
                <>
                  <span className="tabular-nums font-mono text-xs">
                    {isCurrentlyUnmasked ? item.rawUnmaskedValue : '••••••••••••••••'}
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleMask(idx)}
                    className="p-1 text-[var(--hr-text-muted)] hover:text-[var(--hr-primary)] rounded min-h-[32px] min-w-[32px] flex items-center justify-center transition-colors"
                    title={isCurrentlyUnmasked ? 'Ocultar dado sensível' : 'Revelar dado sensível'}
                    aria-label={isCurrentlyUnmasked ? 'Ocultar' : 'Revelar'}
                  >
                    {isCurrentlyUnmasked ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </>
              ) : (
                <span>{item.value || '—'}</span>
              )}
            </dd>
          </div>
        );
      })}
    </dl>
  );
}
