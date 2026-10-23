'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, Search, LogOut, ChevronRight, User } from 'lucide-react';

interface HrHeaderProps {
  onOpenMobileMenu?: () => void;
  user?: {
    name?: string;
    email?: string;
    role?: string;
  } | null;
}

export function HrHeader({ onOpenMobileMenu, user }: HrHeaderProps) {
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/session', { method: 'DELETE' });
    } catch {
      // ignore
    }
    window.location.href = '/rh/entrar';
  };

  // Derive breadcrumbs based on pathname
  const getBreadcrumbs = () => {
    if (pathname === '/rh') {
      return [{ label: 'Visão Geral' }];
    }
    if (pathname === '/rh/funcionarios') {
      return [{ label: 'Colaboradores' }];
    }
    if (pathname.startsWith('/rh/funcionarios/')) {
      return [
        { label: 'Colaboradores', href: '/rh/funcionarios' },
        { label: 'Ficha do Colaborador' },
      ];
    }
    if (pathname === '/rh/departamentos') {
      return [{ label: 'Departamentos' }];
    }
    if (pathname === '/rh/cargos') {
      return [{ label: 'Cargos' }];
    }
    if (pathname === '/rh/contratos') {
      return [{ label: 'Contratos' }];
    }
    if (pathname === '/rh/documentos') {
      return [{ label: 'Documentos' }];
    }
    if (pathname === '/rh/auditoria') {
      return [{ label: 'Auditoria & Logs' }];
    }
    return [];
  };

  const breadcrumbs = getBreadcrumbs();
  const userName = user?.name || user?.email?.split('@')[0] || 'Utilizador RH';
  const roleLabel =
    user?.role === 'ADMINISTRADOR' || user?.role === 'admin'
      ? 'Administrador'
      : 'Técnico de RH';

  return (
    <header className="sticky top-0 z-40 bg-[var(--hr-surface)] border-b border-[var(--hr-border)] select-none">
      <div className="px-4 sm:px-6 h-16 flex items-center justify-between gap-4 relative">
        {/* Left: Mobile hamburger + Area title + Breadcrumbs */}
        <div className="flex items-center gap-3 min-w-0">
          {onOpenMobileMenu && (
            <button
              type="button"
              onClick={onOpenMobileMenu}
              className="lg:hidden p-2 -ml-2 text-[var(--hr-text)] hover:bg-[var(--hr-surface-muted)] rounded-[var(--hr-radius-sm)] min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors"
              aria-label="Abrir menu de navegação"
            >
              <Menu className="w-5 h-5 text-[var(--hr-text-muted)]" />
            </button>
          )}

          <div className="flex items-center gap-2 overflow-hidden">
            <span className="text-[15px] font-bold text-[var(--hr-text)] tracking-tight whitespace-nowrap">
              Recursos Humanos
            </span>
            <span className="text-[13px] font-medium text-[var(--hr-text-muted)] hidden sm:inline whitespace-nowrap">
              · J.Matos Tecnologia
            </span>

            {breadcrumbs.length > 0 && (
              <div className="hidden md:flex items-center gap-2 pl-3 ml-3 border-l border-[var(--hr-border)] text-[13px] text-[var(--hr-text-muted)]">
                {breadcrumbs.map((b, idx) => (
                  <React.Fragment key={idx}>
                    {idx > 0 && (
                      <ChevronRight className="w-3.5 h-3.5 text-[var(--hr-text-light)] flex-shrink-0" />
                    )}
                    {b.href ? (
                      <Link
                        href={b.href}
                        className="hover:text-[var(--hr-primary)] transition-colors whitespace-nowrap font-medium"
                      >
                        {b.label}
                      </Link>
                    ) : (
                      <span className="font-bold text-[var(--hr-text)] whitespace-nowrap">
                        {b.label}
                      </span>
                    )}
                  </React.Fragment>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Center: Search input */}
        <div className="hidden md:flex items-center flex-1 max-w-sm lg:max-w-md mx-4">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-[var(--hr-text-muted)] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Pesquisar colaboradores, contratos, BI..."
              className="w-full text-[14px] bg-[var(--hr-bg)] hover:bg-[var(--hr-surface)] border border-[var(--hr-border)] rounded-[var(--hr-radius)] pl-9 pr-12 py-2 focus:outline-none focus:border-[var(--hr-primary)] focus:ring-2 focus:ring-[var(--hr-primary)]/15 text-[var(--hr-text)] placeholder:text-[var(--hr-text-light)] shadow-2xs transition"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const q = (e.target as HTMLInputElement).value.trim();
                  if (q) window.location.href = `/rh/funcionarios?busca=${encodeURIComponent(q)}`;
                }
              }}
            />
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] font-mono font-medium text-[var(--hr-text-light)] bg-[var(--hr-surface)] border border-[var(--hr-border-subtle)] px-1.5 py-0.5 rounded shadow-2xs pointer-events-none">
              ↵
            </span>
          </div>
        </div>

        {/* Right: User Menu with Name, Role & Sair */}
        <div className="flex items-center gap-3.5 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-[var(--hr-primary-soft)] text-[var(--hr-primary)] flex items-center justify-center font-bold text-sm flex-shrink-0 border border-[var(--hr-border)] shadow-xs">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="hidden sm:block text-left leading-tight">
              <div className="text-[14px] font-bold text-[var(--hr-text)] truncate max-w-[150px]">
                {userName}
              </div>
              <div className="text-[12px] font-medium text-[var(--hr-text-muted)] mt-0.5">
                {roleLabel}
              </div>
            </div>
          </div>

          <div className="h-6 w-px bg-[var(--hr-border)] hidden sm:block" />

          <button
            type="button"
            onClick={handleLogout}
            title="Encerrar sessão"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-bold text-[var(--hr-text-muted)] hover:text-[var(--hr-status-error)] hover:bg-[var(--hr-status-error-bg)] rounded-[var(--hr-radius-sm)] transition-colors min-h-[36px]"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Sair</span>
          </button>
        </div>

        {/* 2px Orange accent line under the top header */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[var(--hr-brand-orange)] pointer-events-none" />
      </div>
    </header>
  );
}
