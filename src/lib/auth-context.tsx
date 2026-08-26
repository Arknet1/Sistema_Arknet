'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { AdminUser, UserRole, dataStore } from './data-store'

interface AuthContextType {
  user: AdminUser | null
  role: UserRole | null
  isAuthenticated: boolean
  isLoading: boolean
  isAdmin: boolean
  isEditor: boolean
  login: (email: string, password?: string) => Promise<{ success: boolean; message: string }>
  logout: () => void
  recoverPassword: (email: string) => Promise<{ success: boolean; message: string }>
  switchRole: (role: UserRole) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const AUTH_STORAGE_KEY = 'arknet_admin_session'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Carregar sessão existente
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored) as AdminUser
        // Validar se o utilizador ainda existe na base de dados
        const currentUsers = dataStore.getUsers()
        const existing = currentUsers.find((u) => u.id === parsed.id && u.status === 'active')
        if (existing) {
          setUser(existing)
        } else if (parsed.email === 'admin@arknet.co.ao') {
          setUser(currentUsers[0] || parsed)
        } else {
          localStorage.removeItem(AUTH_STORAGE_KEY)
          setUser(null)
        }
      }
    } catch (e) {
      console.error('Error loading admin session', e)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const login = async (email: string, password?: string): Promise<{ success: boolean; message: string }> => {
    setIsLoading(true)
    // Simular delay de rede pequeno para sensação realista
    await new Promise((r) => setTimeout(r, 400))

    const cleanEmail = email.trim().toLowerCase()
    const allUsers = dataStore.getUsers()
    const foundUser = allUsers.find((u) => u.email.toLowerCase() === cleanEmail)

    if (!foundUser) {
      setIsLoading(false)
      return {
        success: false,
        message: 'Utilizador não encontrado. Verifique o email introduzido.',
      }
    }

    if (foundUser.status === 'inactive') {
      setIsLoading(false)
      return {
        success: false,
        message: 'Esta conta de utilizador encontra-se inativa. Contacte o Administrador.',
      }
    }

    // Validação de password (aceita senhas padrão e qualquer senha para testes)
    if (password && password.length < 3) {
      setIsLoading(false)
      return {
        success: false,
        message: 'Palavra-passe inválida. Mínimo de 4 caracteres.',
      }
    }

    const updatedUser = {
      ...foundUser,
      lastLogin: new Date().toISOString(),
    }

    dataStore.updateUser(foundUser.id, { lastLogin: updatedUser.lastLogin })
    setUser(updatedUser)
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updatedUser))
    setIsLoading(false)

    return {
      success: true,
      message: `Bem-vindo de volta, ${foundUser.name}!`,
    }
  }

  const logout = () => {
    localStorage.removeItem(AUTH_STORAGE_KEY)
    setUser(null)
    router.push('/admin/login')
  }

  const recoverPassword = async (email: string): Promise<{ success: boolean; message: string }> => {
    await new Promise((r) => setTimeout(r, 500))
    const cleanEmail = email.trim().toLowerCase()
    const allUsers = dataStore.getUsers()
    const foundUser = allUsers.find((u) => u.email.toLowerCase() === cleanEmail)

    if (!foundUser) {
      return {
        success: false,
        message: 'Não existe nenhuma conta associada a este endereço de email.',
      }
    }

    return {
      success: true,
      message: `Enviámos instruções de reposição de palavra-passe para ${cleanEmail}. Por favor, verifique a sua caixa de entrada.`,
    }
  }

  const switchRole = (newRole: UserRole) => {
    const users = dataStore.getUsers()
    const targetUser = users.find((u) => u.role === newRole && u.status === 'active') || {
      id: newRole === 'admin' ? 'user-admin' : 'user-editor',
      name: newRole === 'admin' ? 'Administrador ARKNET' : 'Editor de Conteúdo',
      email: newRole === 'admin' ? 'admin@arknet.co.ao' : 'editor@arknet.co.ao',
      role: newRole,
      status: 'active' as const,
      createdAt: new Date().toISOString(),
    }
    setUser(targetUser)
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(targetUser))
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
        login,
        logout,
        recoverPassword,
        switchRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
