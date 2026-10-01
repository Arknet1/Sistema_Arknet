'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { AdminUser, UserRole } from './data-store'

interface AuthContextType {
  user: AdminUser | null
  role: UserRole | null
  isAuthenticated: boolean
  isLoading: boolean
  isAdmin: boolean
  isEditor: boolean
  failedAttempts: number
  isLocked: boolean
  lockCountdown: number
  login: (email: string, password?: string) => Promise<{ success: boolean; message: string }>
  logout: () => void
  recoverPassword: (email: string) => Promise<{ success: boolean; message: string }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [failedAttempts, setFailedAttempts] = useState(0)
  const [isLocked, setIsLocked] = useState(false)
  const [lockCountdown, setLockCountdown] = useState(0)

  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('arknet_admin_token') : null
    const headers: Record<string, string> = {}
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    fetch('/api/auth/session', { cache: 'no-store', headers, credentials: 'include' })
      .then((response) => response.json())
      .then((result) => {
        if (result.authenticated && result.kind === 'admin') {
          setUser(result.user as AdminUser)
          if (result.token) {
            localStorage.setItem('arknet_admin_token', result.token)
          }
        } else {
          setUser(null)
        }
      })
      .catch(() => setUser(null))
      .finally(() => setIsLoading(false))
  }, [])

  const login = async (email: string, password?: string): Promise<{ success: boolean; message: string }> => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ action: 'login', kind: 'admin', email, password }),
      })
      const result = await response.json()
      if (!response.ok || result.kind !== 'admin') return { success: false, message: result.message || 'Email ou palavra-passe inválidos.' }
      if (result.token) {
        localStorage.setItem('arknet_admin_token', result.token)
      }
      setFailedAttempts(0)
      setUser(result.user as AdminUser)
      return { success: true, message: result.message }
    } catch {
      return { success: false, message: 'Não foi possível contactar o serviço de autenticação.' }
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    await fetch('/api/auth/session', { method: 'DELETE', credentials: 'include' }).catch(() => undefined)
    if (typeof window !== 'undefined') {
      localStorage.removeItem('arknet_admin_token')
    }
    setUser(null)
    router.push('/login')
  }

  const recoverPassword = async (email: string): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await fetch('/api/auth/recovery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'send', email }),
      })
      const result = await response.json()
      return { success: response.ok && result.success, message: result.message }
    } catch {
      return { success: false, message: 'Não foi possível contactar o serviço de recuperação.' }
    }
  }

  const role = user?.role || null
  const isAdmin = role === 'admin'
  const isEditor = role === 'editor'
  const isAuthenticated = !!user

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAuthenticated,
        isLoading,
        isAdmin,
        isEditor,
        failedAttempts,
        isLocked,
        lockCountdown,
        login,
        logout,
        recoverPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth deve ser utilizado dentro de um AuthProvider')
  }
  return context
}
