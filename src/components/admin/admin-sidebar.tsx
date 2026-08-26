'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import {
  LayoutDashboard,
  Package,
  Tags,
  ShoppingCart,
  Inbox,
  Mail,
  GraduationCap,
  Calendar,
  Briefcase,
  UserCheck,
  MessageSquareQuote,
  Handshake,
  Settings,
  Users,
  ChevronDown,
  LogOut,
  ExternalLink,
  Shield,
  ShieldAlert,
  Sparkles,
} from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { dataStore } from '@/lib/data-store'
import arknetIcon from '@/assets/icon18.png'

interface AdminSidebarProps {
  isMobileOpen: boolean
  onCloseMobile: () => void
}

interface NavItem {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string
  badgeColor?: string
  adminOnly?: boolean
}

interface NavSection {
  title: string
  items: NavItem[]
}

export function AdminSidebar({ isMobileOpen, onCloseMobile }: AdminSidebarProps) {
  const pathname = usePathname()
  const { user, role, isAdmin, isEditor, logout, switchRole } = useAuth()

  const [unreadLeads, setUnreadLeads] = useState(0)
  const [newOrders, setNewOrders] = useState(0)
  const [newApplications, setNewApplications] = useState(0)
  const [activeProductsCount, setActiveProductsCount] = useState(0)

  useEffect(() => {
    const updateCounts = () => {
      const db = dataStore.getSnapshot()
      setUnreadLeads(db.leads.filter((l) => l.status === 'novo').length)
      setNewOrders(db.orders.filter((o) => o.status === 'novo').length)
      setNewApplications(db.applications.filter((a) => a.status === 'recebida').length)
      setActiveProductsCount(db.products.length)
    }

    updateCounts()
    const unsubscribe = dataStore.subscribe(updateCounts)
    return () => unsubscribe()
  }, [])

  const navSections: NavSection[] = [
    {
      title: 'Principal',
      items: [
        {
          label: 'Visão Geral',
          href: '/admin',
          icon: LayoutDashboard,
        },
      ],
    },
    {
      title: 'Loja & Vendas',
      items: [
        {
          label: 'Produtos',
          href: '/admin/produtos',
          icon: Package,
          badge: activeProductsCount > 0 ? `${activeProductsCount}` : undefined,
          badgeColor: 'bg-slate-800 text-slate-300',
        },
        {
          label: 'Categorias',
          href: '/admin/categorias',
          icon: Tags,
        },
        {
          label: 'Pedidos & Cotações',
          href: '/admin/pedidos',
          icon: ShoppingCart,
          badge: newOrders > 0 ? `${newOrders} novo` : undefined,
          badgeColor: 'bg-secondary text-white font-bold',
        },
      ],
    },
    {
      title: 'Comercial & Clientes',
      items: [
        {
          label: 'Clientes',
          href: '/admin/clientes',
          icon: Users,
        },
        {
          label: 'Leads (Serviços)',
          href: '/admin/leads',
          icon: Inbox,
          badge: unreadLeads > 0 ? `${unreadLeads} novos` : undefined,
          badgeColor: 'bg-secondary text-white font-bold animate-pulse',
        },
        {
          label: 'Newsletter',
          href: '/admin/newsletter',
          icon: Mail,
        },
      ],
    },
    {
      title: 'Conteúdos Dinâmicos',
      items: [
        {
          label: 'Academia (Cursos)',
          href: '/admin/academia',
          icon: GraduationCap,
        },
        {
          label: 'Eventos & Workshops',
          href: '/admin/eventos',
          icon: Calendar,
        },
        {
          label: 'Vagas de Emprego',
          href: '/admin/carreiras',
          icon: Briefcase,
        },
        {
          label: 'Candidaturas',
          href: '/admin/candidaturas',
          icon: UserCheck,
          badge: newApplications > 0 ? `${newApplications}` : undefined,
          badgeColor: 'bg-primary text-white',
        },
        {
          label: 'Testemunhos',
          href: '/admin/testemunhos',
          icon: MessageSquareQuote,
        },
        {
          label: 'Parceiros & Clientes',
          href: '/admin/parceiros',
          icon: Handshake,
        },
      ],
    },
    {
      title: 'Administração & Sistema',
      items: [
        {
          label: 'Definições Gerais',
          href: '/admin/definicoes',
          icon: Settings,
        },
        {
          label: 'Utilizadores',
          href: '/admin/utilizadores',
          icon: Users,
          adminOnly: true,
        },
      ],
    },
  ]

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#080e1e] text-slate-300 border-r border-slate-800/80">
      {/* Brand Header */}
      <div className="h-20 px-6 flex items-center justify-between border-b border-slate-800 bg-[#060b18]">
        <Link href="/admin" className="flex items-center gap-3">
          <div className="bg-white/10 p-1.5 rounded-lg border border-white/10 shrink-0">
            <Image src={arknetIcon} alt="ARKNET" width={32} height={32} className="h-7 w-auto object-contain" />
          </div>
          <div>
            <span className="font-extrabold text-lg tracking-tight text-white flex items-center gap-1.5">
              ARKNET <span className="text-secondary text-xs px-1.5 py-0.5 bg-secondary/15 rounded font-mono font-bold">ADMIN</span>
            </span>
            <p className="text-[11px] text-slate-400 font-medium">Gestão & Controlo</p>
          </div>
        </Link>
      </div>

      {/* User Role Quick Info */}
      <div className="px-6 py-4 border-b border-slate-800/60 bg-slate-900/40 flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-9 w-9 rounded-full bg-primary/20 border border-primary/40 text-primary flex items-center justify-center font-bold text-sm shrink-0">
            {user?.name ? user.name.charAt(0) : 'A'}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-white truncate">{user?.name || 'Administrador'}</p>
            <div className="flex items-center gap-1.5">
              <span
                className={`inline-block h-2 w-2 rounded-full ${
                  isAdmin ? 'bg-emerald-400 ring-2 ring-emerald-400/20' : 'bg-blue-400 ring-2 ring-blue-400/20'
                }`}
              />
              <span className="text-[11px] uppercase font-bold tracking-wider text-slate-400">
                {isAdmin ? 'Admin (Acesso Total)' : 'Editor de Conteúdo'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Role Switcher for Testing/Dev */}
      <div className="px-6 py-2 bg-slate-950/60 border-b border-slate-800/40 flex items-center justify-between text-[11px]">
        <span className="text-slate-400">Perfil ativo:</span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => switchRole('admin')}
            className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase transition ${
              isAdmin ? 'bg-primary text-white shadow-sm' : 'text-slate-400 hover:text-white bg-white/5'
            }`}
            title="Alternar para Administrador"
          >
            Admin
          </button>
          <button
            type="button"
            onClick={() => switchRole('editor')}
            className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase transition ${
              isEditor ? 'bg-secondary text-white shadow-sm' : 'text-slate-400 hover:text-white bg-white/5'
            }`}
            title="Alternar para Editor"
          >
            Editor
          </button>
        </div>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6 scrollbar-thin scrollbar-thumb-slate-800">
        {navSections.map((sec, idx) => {
          // Filtrar secções ou itens exclusivos de admin
          const visibleItems = sec.items.filter((item) => {
            if (item.adminOnly && !isAdmin) return false
            return true
          })

          if (visibleItems.length === 0) return null

          return (
            <div key={idx} className="space-y-1">
              <p className="px-3 text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
                {sec.title}
              </p>
              {visibleItems.map((item) => {
                const isActive = pathname === item.href
                const Icon = item.icon

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onCloseMobile}
                    className={`group flex items-center justify-between px-3 py-2.5 text-xs font-semibold rounded-lg transition-all ${
                      isActive
                        ? 'bg-primary text-white shadow-md shadow-primary/20 font-bold'
                        : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Icon
                        className={`h-4 w-4 shrink-0 transition ${
                          isActive ? 'text-white' : 'text-slate-400 group-hover:text-primary'
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                    </div>

                    {item.badge && (
                      <span className={`px-2 py-0.5 text-[10px] rounded-full ${item.badgeColor || 'bg-slate-800 text-slate-300'}`}>
                        {item.badge}
                      </span>
                    )}
                  </Link>
                )
              })}
            </div>
          )
        })}
      </div>

      {/* Footer Navigation: View Public Site & Logout */}
      <div className="p-4 border-t border-slate-800 bg-[#060b18] space-y-2">
        <Link
          href="/"
          target="_blank"
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-slate-300 bg-slate-900/80 hover:bg-slate-800 hover:text-white rounded-lg border border-slate-700/60 transition"
        >
          <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
          Ver Site Público
        </Link>
        <button
          type="button"
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold text-rose-300 bg-rose-950/30 hover:bg-rose-900/50 rounded-lg border border-rose-800/40 transition"
        >
          <LogOut className="h-3.5 w-3.5" />
          Terminar Sessão
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <aside className="hidden lg:block w-72 shrink-0 h-screen sticky top-0 z-30">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            onClick={onCloseMobile}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
          />
          <div className="relative w-80 max-w-[85vw] h-full shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  )
}
