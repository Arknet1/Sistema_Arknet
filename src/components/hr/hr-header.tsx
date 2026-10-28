'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, Search, LogOut, ChevronRight, User, Bell, Moon, Sun, PanelLeftClose, PanelLeftOpen } from 'lucide-react';

interface HrHeaderProps {
  onOpenMobileMenu?: () => void;
  onToggleSidebar?: () => void;
  isSidebarCollapsed?: boolean;
  user?: {
    name?: string;
    email?: string;
    role?: string;
  } | null;
}

export function HrHeader({ onOpenMobileMenu, onToggleSidebar, isSidebarCollapsed, user }: HrHeaderProps) {
  const pathname = usePathname();
  const [notificationsOpen, setNotificationsOpen] = React.useState(false);
  const [notifications, setNotifications] = React.useState<any[]>([]);
  const [unreadCount, setUnreadCount] = React.useState(0);
  const [isDark, setIsDark] = React.useState(false);

  const loadNotifications = React.useCallback(async () => {
    try {
      const response = await fetch('/api/rh/notificacoes');
      if (!response.ok) return;
      const data = await response.json();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch {
      // A falha de notificações não deve bloquear a navegação principal.
    }
  }, []);

  React.useEffect(() => {
    const darkMode = localStorage.getItem('jmatos-rh-theme') === 'dark';
    document.documentElement.classList.toggle('hr-dark', darkMode);
    setIsDark(darkMode);
    loadNotifications();
  }, [loadNotifications]);

  const toggleTheme = () => {
    const next = !isDark;
    document.documentElement.classList.toggle('hr-dark', next);
    localStorage.setItem('jmatos-rh-theme', next ? 'dark' : 'light');
    setIsDark(next);
  };

  const markNotificationRead = async (notification: any) => {
    if (notification.isRead) return;
    setNotifications((current) => current.map((item) => item.id === notification.id ? { ...item, isRead: true } : item));
    setUnreadCount((count) => Math.max(0, count - 1));
    await fetch(`/api/rh/notificacoes/${notification.id}/ler`, { method: 'POST' }).catch(() => undefined);
  };

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
          {onToggleSidebar && (
            <button type="button" onClick={onToggleSidebar} className="hidden lg:flex h-10 w-10 items-center justify-center rounded-lg text-[var(--hr-text-muted)] hover:bg-[var(--hr-surface-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--hr-primary)]" aria-label={isSidebarCollapsed ? 'Expandir menu lateral' : 'Recolher menu lateral'} title={isSidebarCollapsed ? 'Expandir menu' : 'Recolher menu'}>
              {isSidebarCollapsed ? <PanelLeftOpen className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
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
                  if (q) window.location.href = `/rh/funcionarios?search=${encodeURIComponent(q)}`;
                }
              }}
            />
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] font-mono font-medium text-[var(--hr-text-light)] bg-[var(--hr-surface)] border border-[var(--hr-border-subtle)] px-1.5 py-0.5 rounded shadow-2xs pointer-events-none">
              ↵
            </span>
          </div>
        </div>

        {/* Right: User Menu with Name, Role & Sair */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          <button type="button" onClick={toggleTheme} title={isDark ? 'Activar modo claro' : 'Activar modo escuro'} aria-label={isDark ? 'Activar modo claro' : 'Activar modo escuro'} className="flex h-10 w-10 items-center justify-center rounded-lg text-[var(--hr-text-muted)] hover:bg-[var(--hr-surface-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--hr-primary)]">
            {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
          <div className="relative">
            <button type="button" onClick={() => { setNotificationsOpen((open) => !open); if (!notificationsOpen) loadNotifications(); }} aria-label={`Notificações${unreadCount ? `, ${unreadCount} por ler` : ''}`} aria-expanded={notificationsOpen} className="relative flex h-10 w-10 items-center justify-center rounded-lg text-[var(--hr-text-muted)] hover:bg-[var(--hr-surface-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--hr-primary)]">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--hr-status-error)] px-1 text-[10px] font-bold text-white">{unreadCount > 9 ? '9+' : unreadCount}</span>}
            </button>
            {notificationsOpen && <section aria-label="Notificações" className="absolute right-0 top-12 z-50 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-[var(--hr-border)] bg-[var(--hr-surface)] shadow-[var(--hr-shadow-lg)]">
              <div className="flex items-center justify-between border-b border-[var(--hr-border-subtle)] px-4 py-3"><h2 className="font-semibold text-[var(--hr-text)]">Notificações</h2><span className="text-xs text-[var(--hr-text-muted)]">{unreadCount} por ler</span></div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? <p className="px-4 py-8 text-center text-sm text-[var(--hr-text-muted)]">Não tem notificações.</p> : notifications.slice(0, 8).map((notification) => <Link key={notification.id} href={notification.link || '/rh'} onClick={() => markNotificationRead(notification)} className={`block border-b border-[var(--hr-border-subtle)] px-4 py-3 hover:bg-[var(--hr-surface-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--hr-primary)] ${notification.isRead ? '' : 'bg-[var(--hr-primary-soft)]/40'}`}><span className="block text-sm font-semibold text-[var(--hr-text)]">{notification.title}</span><span className="mt-1 block text-xs leading-relaxed text-[var(--hr-text-muted)]">{notification.message}</span><time className="mt-1 block text-[11px] text-[var(--hr-text-light)]" dateTime={notification.createdAt}>{new Date(notification.createdAt).toLocaleString('pt-AO')}</time></Link>)}
              </div>
            </section>}
          </div>
          <Link
            href="/portal?tab=perfil"
            aria-label="Abrir meu perfil"
            className="flex items-center gap-2.5 rounded-[var(--hr-radius-sm)] hover:bg-[var(--hr-surface-muted)] p-1.5 -m-1.5 transition-colors"
          >
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
          </Link>

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
