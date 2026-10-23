'use client';

import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

export interface HrDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
}

export function HrDialog({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  maxWidth = 'md',
}: HrDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

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

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="hr-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-[1px] transition-opacity animate-in fade-in duration-150"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Card */}
      <div
        ref={dialogRef}
        className={`relative w-full ${maxWidthClasses[maxWidth]} bg-[var(--hr-surface)] border border-[var(--hr-border)] rounded-[var(--hr-radius)] shadow-[var(--hr-shadow-lg)] overflow-hidden z-10 animate-in zoom-in-95 duration-150 my-auto`}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-4 sm:p-5 border-b border-[var(--hr-border)] bg-[var(--hr-surface-muted)]">
          <div className="flex-1 pr-4">
            <h2
              id="hr-dialog-title"
              className="text-base sm:text-lg font-bold text-[var(--hr-text)] tracking-tight"
            >
              {title}
            </h2>
            {description && (
              <p className="text-xs text-[var(--hr-text-muted)] mt-0.5 leading-relaxed">
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-[var(--hr-text-muted)] hover:text-[var(--hr-text)] hover:bg-[var(--hr-border-subtle)] rounded-[var(--hr-radius-sm)] transition min-h-[36px] min-w-[36px] flex items-center justify-center"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 max-h-[calc(85vh-130px)] overflow-y-auto">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-2.5 p-3.5 sm:p-4 border-t border-[var(--hr-border)] bg-[var(--hr-surface-muted)]">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
