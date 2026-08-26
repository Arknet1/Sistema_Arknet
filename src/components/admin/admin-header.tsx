'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Menu,
  Bell,
  Search,
  ExternalLink,
  ChevronRight,
  User,
  LogOut,
  Shield,
  CheckCircle2,
  Inbox,
  ShoppingCart,
  UserCheck,
  X,
} from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { dataStore, ServiceLead, StoreOrder, JobApplication } from '@/lib/data-store'

interface AdminHeaderProps {
  onOpenMobileMenu: () => void
}

export function AdminHeader({ onOpenMobileMenu }: AdminHeaderProps) {
  const pathname = usePathname()
  const { user, role, isAdmin, logout } = useAuth()

  const [isNotifOpen, setIsNotifOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [recentNotifications, setRecentNotifications] = useState<{
    id: string
    title: string
    description: string
    time: string
    link: string
    type: 'lead' | 'order' | 'application'
  }[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  const notifRef = useRef<HTMLDivElement>(null)
  const userMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false)
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    const updateNotifs = () => {
      const db = dataStore.getSnapshot()
      const list: typeof recentNotifications = []

      // Leads não lidos
      db.leads
        .filter((l) => l.status === 'novo')
        .slice(0, 4)
        .forEach((l) => {
          list.push({
            id: l.id,
            title: `Novo Lead: ${l.name}`,
            description: `${l.service} — ${l.email}`,
            time: new Date(l.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            link: '/admin/leads',
            type: 'lead',
          })
        })

      // Pedidos novos
      db.orders
        .filter((o) => o.status === 'novo')
        .slice(0, 3)
        .forEach((o) => {
          list.push({
            id: o.id,
            title: `Novo Pedido ${o.orderNumber}`,
            description: `${o.customerName} (${o.items.length} itens)`,
            time: new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            link: '/admin/pedidos',
            type: 'order',
          })
        })

      // Candidaturas recentes
      db.applications
        .filter((a) => a.status === 'recebida')
        .slice(0, 2)
        .forEach((a) => {
          list.push({
            id: a.id,
            title: `Candidatura: ${a.candidateName}`,
            description: a.jobTitle,
            time: new Date(a.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            link: '/admin/candidaturas',
            type: 'application',
          })
        })

      setRecentNotifications(list)
      setUnreadCount(list.length)
    }

    updateNotifs()
    const unsubscribe = dataStore.subscribe(updateNotifs)
    return () => unsubscribe()
  }, [])

  const getBreadcrumbTitle = () => {
    switch (pathname) {
      case '/admin':
        return 'Visão Geral'
      case '/admin/produtos':
        return 'Catálogo de Produtos'
      case '/admin/categorias':
        return 'Categorias de Produtos'
      case '/admin/pedidos':
        return 'Pedidos & Cotações da Loja'
      case '/admin/leads':
        return 'Pedidos de Serviço / Leads'
      case '/admin/newsletter':
        return 'Subscritores da Newsletter'
      case '/admin/academia':
        return 'Academia & Formações'
      case '/admin/eventos':
        return 'Eventos & Workshops'
      case '/admin/carreiras':
        return 'Vagas de Emprego'
      case '/admin/candidaturas':
        return 'Candidaturas Recebidas'
      case '/admin/testemunhos':
        return 'Testemunhos de Clientes'
      case '/admin/parceiros':
        return 'Marcas & Parceiros'
      case '/admin/definicoes':
        return 'Definições Gerais da Empresa'
      case '/admin/utilizadores':
        return 'Gestão de Utilizadores'
      default:
        return 'Painel de Gestão'
    }
  }

  return (
    <header className="sticky top-0 z-20 h-20 bg-white/95 backdrop-blur-md border-b border-slate-200 px-6 flex items-center justify-between shadow-xs">
      {/* Left: Mobile Trigger & Breadcrumbs */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
          aria-label="Abrir Menu"
        >
          <Menu className="h-6 w-6" />
        </button>

        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <Link href="/admin" className="hover:text-primary transition">
            ARKNET
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
          <span className="text-slate-900 font-bold text-sm tracking-tight">
            {getBreadcrumbTitle()}
          </span>
        </div>
      </div>

      {/* Right: Actions, Notifications & Profile */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Quick Link to Public Site */}
        <Link
          href="/"
          target="_blank"
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-md transition"
        >
          <ExternalLink className="h-3.5 w-3.5 text-slate-500" />
          Ver Site
        </Link>

        {/* Notifications Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="relative p-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-full transition"
            aria-label="Notificações"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-secondary text-[10px] font-bold text-white shadow-sm ring-2 ring-white animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white border border-slate-200 shadow-xl rounded-xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-4 py-3 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs uppercase tracking-wider text-slate-800">
                    Notificações Recentes
                  </span>
                  {unreadCount > 0 && (
                    <span className="bg-secondary/15 text-secondary text-[10px] px-2 py-0.5 rounded-full font-bold">
                      {unreadCount} novas
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setIsNotifOpen(false)}
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                {recentNotifications.length === 0 ? (
                  <div className="py-8 text-center text-slate-400 text-xs">
                    Nenhuma notificação pendente no momento.
                  </div>
                ) : (
                  recentNotifications.map((n) => (
                    <Link
                      key={n.id}
                      href={n.link}
                      onClick={() => setIsNotifOpen(false)}
                      className="block p-3.5 hover:bg-slate-50 transition group"
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`p-2 rounded-lg shrink-0 ${
                            n.type === 'lead'
                              ? 'bg-rose-50 text-secondary'
                              : n.type === 'order'
                              ? 'bg-blue-50 text-primary'
                              : 'bg-emerald-50 text-emerald-600'
                          }`}
                        >
                          {n.type === 'lead' && <Inbox className="h-4 w-4" />}
                          {n.type === 'order' && <ShoppingCart className="h-4 w-4" />}
                          {n.type === 'application' && <UserCheck className="h-4 w-4" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-900 group-hover:text-primary transition truncate">
                            {n.title}
                          </p>
                          <p className="text-[11px] text-slate-500 truncate mt-0.5">{n.description}</p>
                          <span className="text-[10px] text-slate-400 mt-1 block">{n.time}</span>
                        </div>
                      </div>
                    </Link>
                  ))
                )}
              </div>

              <div className="p-2 border-t border-slate-100 bg-slate-50 text-center">
                <Link
                  href="/admin/leads"
                  onClick={() => setIsNotifOpen(false)}
                  className="text-[11px] font-bold text-primary hover:underline"
                >
                  Ver todos os pedidos e leads &rarr;
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Menu */}
        <div className="relative" ref={userMenuRef}>
          <button
            type="button"
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 transition text-left"
          >
            <div className="h-9 w-9 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-bold text-sm">
              {user?.name ? user.name.charAt(0) : 'A'}
            </div>
            <div className="hidden md:block">
              <p className="text-xs font-bold text-slate-900 leading-tight truncate max-w-[120px]">
                {user?.name || 'Administrador'}
              </p>
              <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-500">
                {isAdmin ? 'Admin' : 'Editor'}
              </p>
            </div>
          </button>

          {isUserMenuOpen && (
            <div className="absolute right-0 mt-3 w-56 bg-white border border-slate-200 shadow-xl rounded-xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
                <p className="text-xs font-bold text-slate-900">{user?.name}</p>
                <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-primary/10 text-primary">
                  <Shield className="h-3 w-3" />
                  {isAdmin ? 'Acesso Total (Admin)' : 'Gestor de Conteúdo (Editor)'}
                </div>
              </div>

              <div className="p-1">
                <Link
                  href="/admin/definicoes"
                  onClick={() => setIsUserMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition"
                >
                  <User className="h-4 w-4 text-slate-400" />
                  Definições da Empresa
                </Link>
                {isAdmin && (
                  <Link
                    href="/admin/utilizadores"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition"
                  >
                    <Shield className="h-4 w-4 text-slate-400" />
                    Gerir Utilizadores
                  </Link>
                )}
              </div>

              <div className="p-1 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsUserMenuOpen(false)
                    logout()
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-lg transition"
                >
                  <LogOut className="h-4 w-4" />
                  Terminar Sessão
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
