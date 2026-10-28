import React from 'react';

export interface HrColumn<T> {
  key: string;
  header: React.ReactNode;
  render?: (row: T) => React.ReactNode;
  align?: 'left' | 'center' | 'right';
  className?: string;
  width?: string;
}

export interface HrTableProps<T> {
  columns: HrColumn<T>[];
  data: T[];
  keyExtractor: (row: T) => string | number;
  onRowClick?: (row: T) => void;
  isLoading?: boolean;
  emptyMessage?: string;
  className?: string;
}

export function HrTable<T>({
  columns,
  data,
  keyExtractor,
  onRowClick,
  isLoading,
  emptyMessage = 'Nenhum registo encontrado.',
  className = '',
}: HrTableProps<T>) {
  return (
    <div
      className={`w-full overflow-x-auto bg-[var(--hr-surface)] border border-[var(--hr-border)] rounded-2xl shadow-[var(--hr-shadow-sm)] ${className}`}
    >
      <table className="w-full min-w-[680px] text-left border-collapse text-[14px] sm:text-sm">
        <thead>
          <tr className="h-12 bg-[var(--hr-surface-muted)]/70 border-b border-[var(--hr-border)] text-[11px] font-bold text-[var(--hr-text-muted)] uppercase tracking-[0.12em]">
            {columns.map((col) => (
              <th
                key={col.key}
                style={{ width: col.width }}
                className={`h-12 px-5 align-middle ${
                  col.align === 'right'
                    ? 'text-right'
                    : col.align === 'center'
                    ? 'text-center'
                    : 'text-left'
                } ${col.className || ''}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--hr-border-subtle)] text-[var(--hr-text)] text-sm">
          {isLoading ? (
            <tr aria-label="A carregar dados">
              <td colSpan={columns.length} className="px-5 py-7">
                <div className="space-y-3" aria-hidden="true">
                  {[0, 1, 2].map((row) => (
                    <div key={row} className="grid grid-cols-4 gap-4">
                      {[0, 1, 2, 3].map((cell) => <span key={cell} className="h-4 animate-pulse rounded bg-[var(--hr-surface-muted)]" />)}
                    </div>
                  ))}
                </div>
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="h-28 px-5 py-7 text-center text-sm text-[var(--hr-text-muted)]"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row) => (
              <tr
                key={keyExtractor(row)}
                onClick={() => onRowClick?.(row)}
                tabIndex={onRowClick ? 0 : undefined}
                onKeyDown={onRowClick ? (event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onRowClick(row); } } : undefined}
                className={`min-h-[56px] transition-colors duration-150 ${
                  onRowClick
                    ? 'cursor-pointer hover:bg-[var(--hr-primary-soft)]/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--hr-primary)]'
                    : 'hover:bg-[var(--hr-surface-muted)]/55'
                }`}
              >
                {columns.map((col) => {
                  const val = (row as Record<string, unknown>)[col.key];
                  return (
                    <td
                      key={col.key}
                      className={`py-4 px-5 align-middle text-sm ${
                        col.align === 'right'
                          ? 'text-right tabular-nums font-mono'
                          : col.align === 'center'
                          ? 'text-center'
                          : 'text-left'
                      } ${col.className || ''}`}
                    >
                      {col.render ? col.render(row) : (val as React.ReactNode)}
                    </td>
                  );
                })}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
