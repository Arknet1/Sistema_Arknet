'use client';

import React from 'react';
import { HrLogo } from './hr-logo';
import { Menu, LogOut } from 'lucide-react';

export interface HrAppBarProps {
  title?: string;
  onOpenMenu?: () => void;
  showLogo?: boolean;
  logoHref?: string;
  userName?: string;
  actions?: React.ReactNode;
  onLogout?: () => void;
}

export function HrAppBar({
  title,
  onOpenMenu,
  showLogo = true,
  logoHref = '/rh',
  userName,
  actions,
  onLogout,
}: HrAppBarProps) {
  const handleLogout = async () => {
    if (onLogout) {
      onLogout();
      return;
    }
    try {
      await fetch('/api/auth/session', { method: 'DELETE' });
    } catch {
      // ignore
    }
    window.location.href = '/rh/entrar';
  };

  return (
    <header className="sticky top-0 z-40 bg-[var(--hr-surface)] border-b border-[var(--hr-border)] select-none">
      <div className="px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-3 relative">
        <div className="flex items-center gap-3 min-w-0">
          {onOpenMenu && (
            <button
              type="button"
              onClick={onOpenMenu}
              className="lg:hidden p-2 -ml-2 text-[var(--hr-text)] hover:bg-[var(--hr-surface-muted)] rounded-[var(--hr-radius-sm)] min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors"
              aria-label="Abrir menu de navegação"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          {showLogo ? (
            <HrLogo href={logoHref} showSubtitle={!title} />
          ) : null}

          {title && (
            <div className="truncate">
              <h1 className="text-sm sm:text-base font-bold text-[var(--hr-text)] truncate">
                {title}
              </h1>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {actions}
          {userName && (
            <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-[var(--hr-border-subtle)]">
              <div className="w-7 h-7 rounded-full bg-[var(--hr-primary-soft)] text-[var(--hr-primary)] font-bold text-xs flex items-center justify-center">
                {userName.charAt(0).toUpperCase()}
              </div>
              <span className="text-xs font-semibold text-[var(--hr-text)] truncate max-w-[120px]">
                {userName}
              </span>
            </div>
          )}
          <button
            type="button"
            onClick={handleLogout}
            title="Encerrar sessão"
            className="p-2 text-[var(--hr-text-muted)] hover:text-[var(--hr-status-error)] hover:bg-[var(--hr-status-error-bg)] rounded-[var(--hr-radius-sm)] min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors"
            aria-label="Encerrar sessão"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        {/* J.Matos signature orange 2px line beneath header */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[var(--hr-brand-orange)] pointer-events-none" />
      </div>
    </header>
  );
}
