'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'warning' | 'error' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
}

interface ToastContextValue {
  showToast: (toast: Omit<ToastItem, 'id'>) => void;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  warning: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
}

const HrToastContext = createContext<ToastContextValue | null>(null);

export function HrToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    ({ type, title, message, duration = 4000 }: Omit<ToastItem, 'id'>) => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev, { id, type, title, message, duration }]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  const success = useCallback(
    (message: string, title?: string) => showToast({ type: 'success', message, title }),
    [showToast]
  );
  const error = useCallback(
    (message: string, title?: string) => showToast({ type: 'error', message, title }),
    [showToast]
  );
  const warning = useCallback(
    (message: string, title?: string) => showToast({ type: 'warning', message, title }),
    [showToast]
  );
  const info = useCallback(
    (message: string, title?: string) => showToast({ type: 'info', message, title }),
    [showToast]
  );

  return (
    <HrToastContext.Provider value={{ showToast, success, error, warning, info }}>
      {children}
      {/* Toast Notification Container */}
      <div
        role="region"
        aria-live="polite"
        className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 max-w-sm w-full px-4 sm:px-0 pointer-events-none"
      >
        {toasts.map((toast) => {
          const icons = {
            success: <CheckCircle2 className="w-5 h-5 text-[var(--hr-status-success)] flex-shrink-0" />,
            warning: <AlertTriangle className="w-5 h-5 text-[var(--hr-status-warning)] flex-shrink-0" />,
            error: <AlertCircle className="w-5 h-5 text-[var(--hr-status-error)] flex-shrink-0" />,
            info: <Info className="w-5 h-5 text-[var(--hr-primary)] flex-shrink-0" />,
          };

          const borderColors = {
            success: 'border-l-[var(--hr-status-success)]',
            warning: 'border-l-[var(--hr-status-warning)]',
            error: 'border-l-[var(--hr-status-error)]',
            info: 'border-l-[var(--hr-primary)]',
          };

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto bg-[var(--hr-surface)] border border-[var(--hr-border)] border-l-4 ${borderColors[toast.type]} rounded-[var(--hr-radius)] shadow-[var(--hr-shadow-md)] p-3.5 flex items-start gap-3 transition-all animate-in fade-in duration-200`}
            >
              {icons[toast.type]}
              <div className="flex-1 min-w-0">
                {toast.title && (
                  <h4 className="text-xs font-semibold text-[var(--hr-text)] uppercase tracking-wide">
                    {toast.title}
                  </h4>
                )}
                <p className="text-sm text-[var(--hr-text)] break-words leading-tight mt-0.5">
                  {toast.message}
                </p>
              </div>
              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                className="text-[var(--hr-text-muted)] hover:text-[var(--hr-text)] p-1 rounded transition min-h-[32px] min-w-[32px] flex items-center justify-center"
                aria-label="Fechar notificação"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </HrToastContext.Provider>
  );
}

export function useHrToast() {
  const ctx = useContext(HrToastContext);
  if (!ctx) {
    throw new Error('useHrToast must be used within an HrToastProvider');
  }
  return ctx;
}
