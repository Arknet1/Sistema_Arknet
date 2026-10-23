'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export interface HrDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  position?: 'bottom' | 'right';
}

export function HrDrawer({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  position = 'bottom',
}: HrDrawerProps) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 overflow-hidden flex items-end sm:items-center justify-end"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-[1px] transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Container */}
      <div
        className={`relative z-10 w-full bg-[var(--hr-surface)] shadow-[var(--hr-shadow-lg)] flex flex-col ${
          position === 'bottom'
            ? 'max-h-[85vh] rounded-t-2xl sm:rounded-t-[var(--hr-radius)] sm:max-w-md sm:h-full sm:max-h-full sm:rounded-none sm:border-l sm:border-[var(--hr-border)] animate-in slide-in-from-bottom sm:slide-in-from-right duration-200'
            : 'max-w-md h-full border-l border-[var(--hr-border)] animate-in slide-in-from-right duration-200'
        }`}
      >
        {/* Mobile handle indicator */}
        <div className="sm:hidden w-10 h-1 bg-[var(--hr-border)] rounded-full mx-auto mt-2" />

        {/* Header */}
        <div className="flex items-start justify-between p-4 border-b border-[var(--hr-border)] bg-[var(--hr-surface-muted)]">
          <div>
            <h3 className="text-base font-bold text-[var(--hr-text)] tracking-tight">
              {title}
            </h3>
            {description && (
              <p className="text-xs text-[var(--hr-text-muted)] mt-0.5">
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-[var(--hr-text-muted)] hover:text-[var(--hr-text)] rounded-[var(--hr-radius-sm)] min-h-[36px] min-w-[36px] flex items-center justify-center"
            aria-label="Fechar painel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 overflow-y-auto flex-1">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="p-4 border-t border-[var(--hr-border)] bg-[var(--hr-surface-muted)] flex items-center justify-end gap-2">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
