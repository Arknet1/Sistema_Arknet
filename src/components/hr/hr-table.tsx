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
      className={`w-full overflow-x-auto bg-[var(--hr-surface)] border border-[var(--hr-border)] rounded-[var(--hr-radius)] shadow-[var(--hr-shadow-sm)] ${className}`}
    >
      <table className="w-full text-left border-collapse text-[14px] sm:text-[15px]">
        <thead>
          <tr className="h-12 bg-[var(--hr-surface-muted)] border-b border-[var(--hr-border)] text-[12px] font-bold text-[var(--hr-text-muted)] uppercase tracking-wider">
            {columns.map((col) => (
              <th
                key={col.key}
                style={{ width: col.width }}
                className={`h-12 px-4.5 align-middle ${
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
        <tbody className="divide-y divide-[var(--hr-border-subtle)] text-[var(--hr-text)] text-[14px] sm:text-[15px]">
          {isLoading ? (
            <tr>
              <td colSpan={columns.length} className="h-20 py-6 text-center text-[var(--hr-text-muted)] text-[14px]">
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-[var(--hr-primary)] border-t-transparent rounded-full animate-spin" />
                  <span>A carregar dados...</span>
                </div>
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="h-20 py-6 text-center text-[var(--hr-text-muted)] text-[14px] italic"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row) => (
              <tr
                key={keyExtractor(row)}
                onClick={() => onRowClick?.(row)}
                className={`min-h-[52px] transition-colors duration-150 ${
                  onRowClick
                    ? 'cursor-pointer hover:bg-[var(--hr-primary-soft)]/60'
                    : 'hover:bg-[var(--hr-surface-muted)]/80'
                }`}
              >
                {columns.map((col) => {
                  const val = (row as Record<string, unknown>)[col.key];
                  return (
                    <td
                      key={col.key}
                      className={`py-3.5 px-4.5 align-middle text-[14px] sm:text-[15px] ${
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
