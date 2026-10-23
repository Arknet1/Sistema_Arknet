'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HrLogo } from './hr-logo';
import {
  LayoutDashboard,
  Users,
  Building2,
  Briefcase,
  FileText,
  FileCheck,
  ShieldCheck,
  User,
  LogOut,
  X,
} from 'lucide-react';

interface HrSidebarProps {
  userRole?: string;
  userName?: string;
  userEmail?: string;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export function HrSidebar({
  userRole = 'TECNICO_RH',
  userName = 'Utilizador RH',
  userEmail = 'rh@jmatos.co.ao',
  isOpenMobile = false,
  onCloseMobile,
}: HrSidebarProps) {
  const pathname = usePathname();

  const navItems = [
    {
      label: 'Visão Geral',
      href: '/rh',
      icon: <LayoutDashboard className="w-4 h-4" />,
      exact: true,
    },
    {
      label: 'Colaboradores',
      href: '/rh/funcionarios',
      icon: <Users className="w-4 h-4" />,
    },
    {
      label: 'Departamentos',
      href: '/rh/departamentos',
      icon: <Building2 className="w-4 h-4" />,
    },
    {
      label: 'Cargos',
      href: '/rh/cargos',
      icon: <Briefcase className="w-4 h-4" />,
    },
    {
      label: 'Contratos',
      href: '/rh/contratos',
      icon: <FileCheck className="w-4 h-4" />,
    },
    {
      label: 'Documentos',
      href: '/rh/documentos',
      icon: <FileText className="w-4 h-4" />,
    },
    {
      label: 'Auditoria & Logs',
      href: '/rh/auditoria',
      icon: <ShieldCheck className="w-4 h-4" />,
      adminOnly: true,
    },
  ];

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/session', { method: 'DELETE' });
    } catch {
      // ignore
    }
    window.location.href = '/rh/entrar';
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[var(--hr-surface)] border-r border-[var(--hr-border)] w-64 select-none">
      {/* Brand Header */}
      <div className="p-4 sm:p-5 flex items-center justify-between border-b border-[var(--hr-border)] relative">
        <HrLogo href="/rh" showSubtitle />
        {onCloseMobile && (
          <button
            type="button"
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 text-[var(--hr-text-muted)] hover:text-[var(--hr-text)] rounded-[var(--hr-radius-sm)]"
            aria-label="Fechar menu"
          >
            <X className="w-5 h-5" />
          </button>
        )}
        {/* Subtle orange accent line below header */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[var(--hr-brand-orange)]" />
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto" aria-label="Menu principal">
        <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--hr-text-light)] px-3 mb-2">
          Gestão de Pessoas
        </div>
        {navItems.map((item) => {
          if (item.adminOnly && userRole !== 'ADMINISTRADOR' && userRole !== 'admin') {
            return null;
          }

          const isActive = item.exact
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(item.href + '/');

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onCloseMobile}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-[var(--hr-radius)] text-xs sm:text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-[var(--hr-primary-soft)] text-[var(--hr-primary)] font-bold'
                  : 'text-[var(--hr-text)] hover:bg-[var(--hr-surface-muted)] hover:text-[var(--hr-primary)]'
              }`}
            >
              <span className={isActive ? 'text-[var(--hr-primary)]' : 'text-[var(--hr-text-muted)]'}>
                {item.icon}
              </span>
              <span>{item.label}</span>
            </Link>
          );
        })}

        <div className="pt-4 mt-4 border-t border-[var(--hr-border-subtle)]">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--hr-text-light)] px-3 mb-2">
            Auto-Serviço
          </div>
          <Link
            href="/portal"
            onClick={onCloseMobile}
            className="flex items-center gap-3 px-3 py-2 rounded-[var(--hr-radius)] text-xs sm:text-sm font-medium text-[var(--hr-text-muted)] hover:text-[var(--hr-primary)] hover:bg-[var(--hr-surface-muted)] transition-colors"
          >
            <User className="w-4 h-4 text-[var(--hr-text-muted)]" />
            <span>Meu Portal do Colaborador</span>
          </Link>
        </div>
      </nav>

      {/* User Footer */}
      <div className="p-3 border-t border-[var(--hr-border)] bg-[var(--hr-surface-muted)] flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-full bg-[var(--hr-primary-soft)] text-[var(--hr-primary)] flex items-center justify-center font-bold text-xs flex-shrink-0 border border-[var(--hr-border)]">
            {userName ? userName.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-[var(--hr-text)] truncate leading-tight">
              {userName}
            </p>
            <p className="text-[10px] text-[var(--hr-text-muted)] truncate">
              {userRole === 'ADMINISTRADOR' || userRole === 'admin'
                ? 'Administrador'
                : 'Técnico de RH'}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          title="Encerrar sessão"
          className="p-1.5 text-[var(--hr-text-muted)] hover:text-[var(--hr-status-error)] hover:bg-[var(--hr-status-error-bg)] rounded-[var(--hr-radius-sm)] transition-colors flex-shrink-0 min-h-[32px] min-w-[32px] flex items-center justify-center"
          aria-label="Sair"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col h-screen sticky top-0 z-30">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {isOpenMobile && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-[1px] transition-opacity"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <div className="relative z-10 w-64 max-w-[80vw] h-full animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
