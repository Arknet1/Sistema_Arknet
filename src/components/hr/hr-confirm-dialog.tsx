'use client';

import React from 'react';
import { HrDialog } from './hr-dialog';
import { HrButton } from './hr-button';
import { AlertTriangle } from 'lucide-react';

export interface HrConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  isLoading?: boolean;
}

export function HrConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  isDestructive = false,
  isLoading = false,
}: HrConfirmDialogProps) {
  return (
    <HrDialog
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      maxWidth="sm"
      footer={
        <>
          <HrButton
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelText}
          </HrButton>
          <HrButton
            variant={isDestructive ? 'danger' : 'primary'}
            size="sm"
            onClick={onConfirm}
            isLoading={isLoading}
          >
            {confirmText}
          </HrButton>
        </>
      }
    >
      <div className="flex items-start gap-3.5">
        <div
          className={`p-2.5 rounded-[var(--hr-radius-sm)] flex-shrink-0 ${
            isDestructive
              ? 'bg-[var(--hr-status-error-bg)] text-[var(--hr-status-error)]'
              : 'bg-[var(--hr-status-warning-bg)] text-[var(--hr-status-warning)]'
          }`}
        >
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <p className="text-sm text-[var(--hr-text)] leading-relaxed">{message}</p>
        </div>
      </div>
    </HrDialog>
  );
}
