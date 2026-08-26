'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { AdminSidebar } from './admin-sidebar'
import { AdminHeader } from './admin-header'
import { Loader2, ShieldAlert } from 'lucide-react'

interface AdminLayoutWrapperProps {
  children: React.ReactNode
  requireAdmin?: boolean
}

export function AdminLayoutWrapper({ children, requireAdmin = false }: AdminLayoutWrapperProps) {
  const { isAuthenticated, isLoading, isAdmin, user } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const isLoginPage = pathname === '/admin/login'

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated && !isLoginPage) {
        router.push('/admin/login')
      } else if (isAuthenticated && isLoginPage) {
        router.push('/admin')
      }
    }
  }, [isAuthenticated, isLoading, isLoginPage, router])

  if (isLoginPage) {
    return <>{children}</>
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#080e1e] flex flex-col items-center justify-center text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 shadow-2xl flex items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
          <div className="text-center">
            <h3 className="font-extrabold text-lg tracking-tight">ARKNET Admin</h3>
            <p className="text-xs text-slate-400 mt-1">A carregar o painel de gestão...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  if (requireAdmin && !isAdmin) {
    return (
      <div className="flex h-screen bg-slate-50 overflow-hidden">
        <AdminSidebar isMobileOpen={isMobileOpen} onCloseMobile={() => setIsMobileOpen(false)} />
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          <AdminHeader onOpenMobileMenu={() => setIsMobileOpen(true)} />
          <main className="flex-1 p-6 md:p-10 flex items-center justify-center">
            <div className="max-w-md w-full bg-white border border-rose-200 p-8 text-center shadow-lg rounded-2xl">
              <div className="w-14 h-14 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShieldAlert className="h-8 w-8" />
              </div>
              <h2 className="text-xl font-extrabold text-slate-900 mb-2">Acesso Restrito a Administradores</h2>
              <p className="text-xs sm:text-sm text-slate-600 mb-6 leading-relaxed">
                O seu perfil atual (<strong>Editor</strong>) não possui permissões para aceder ou modificar este módulo de configurações do sistema.
              </p>
              <button
                onClick={() => router.push('/admin')}
                className="px-6 py-2.5 bg-primary text-white text-xs font-bold uppercase rounded-lg hover:bg-primary/90 transition shadow-sm"
              >
                Voltar à Visão Geral
              </button>
            </div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans text-slate-900">
      {/* Sidebar Navigation */}
      <AdminSidebar isMobileOpen={isMobileOpen} onCloseMobile={() => setIsMobileOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <AdminHeader onOpenMobileMenu={() => setIsMobileOpen(true)} />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-50/80">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
