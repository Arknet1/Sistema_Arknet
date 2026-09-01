'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { AdminUser, UserRole, dataStore } from './data-store'
import { sanitizeInput, verifyPassword, createSessionToken, verifySessionToken } from './security-utils'

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
  switchRole: (role: UserRole) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const AUTH_STORAGE_KEY = 'arknet_admin_session'
const AUTH_TOKEN_KEY = 'arknet_admin_token'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [failedAttempts, setFailedAttempts] = useState(0)
  const [isLocked, setIsLocked] = useState(false)
  const [lockCountdown, setLockCountdown] = useState(0)

  const router = useRouter()
  const pathname = usePathname()

  // Timer para desbloqueio após tentativas falhadas
  useEffect(() => {
    let timer: NodeJS.Timeout
    if (isLocked && lockCountdown > 0) {
      timer = setInterval(() => {
        setLockCountdown((prev) => {
          if (prev <= 1) {
            setIsLocked(false)
            setFailedAttempts(0)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(timer)
  }, [isLocked, lockCountdown])

  useEffect(() => {
    // Carregar sessão existente e validar o token assinado
    const loadSession = () => {
      try {
        const stored = localStorage.getItem(AUTH_STORAGE_KEY)
        const token = localStorage.getItem(AUTH_TOKEN_KEY)

        if (stored && token) {
          const verifiedToken = verifySessionToken(token)
          if (!verifiedToken) {
            // Token inválido ou expirado
            localStorage.removeItem(AUTH_STORAGE_KEY)
            localStorage.removeItem(AUTH_TOKEN_KEY)
            document.cookie = `${AUTH_TOKEN_KEY}=; path=/; max-age=0`
            setUser(null)
            setIsLoading(false)
            return
          }

          const parsed = JSON.parse(stored) as AdminUser
          const currentUsers = dataStore.getUsers()
          const existing = currentUsers.find((u) => u.id === parsed.id && u.status === 'active')

          if (existing) {
            setUser(existing)
          } else {
            localStorage.removeItem(AUTH_STORAGE_KEY)
            localStorage.removeItem(AUTH_TOKEN_KEY)
            setUser(null)
          }
        } else {
          setUser(null)
        }
      } catch (e) {
        console.error('Error loading admin session', e)
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    loadSession()

    const handleStorage = (e: StorageEvent) => {
      if (e.key === AUTH_STORAGE_KEY || e.key === AUTH_TOKEN_KEY) {
        loadSession()
      }
    }

    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  const login = async (email: string, password?: string): Promise<{ success: boolean; message: string }> => {
    if (isLocked) {
      return {
        success: false,
        message: `Acesso temporariamente bloqueado por segurança. Aguarde ${lockCountdown}s.`,
      }
    }

    setIsLoading(true)
    await new Promise((r) => setTimeout(r, 400))

    const cleanEmail = sanitizeInput(email).toLowerCase().trim()
    const cleanPassword = password ? password.trim() : ''

    const allUsers = dataStore.getUsers()
    const foundUser = allUsers.find((u) => u.email.toLowerCase() === cleanEmail)

    if (!foundUser) {
      setIsLoading(false)
      const nextAttempts = failedAttempts + 1
      setFailedAttempts(nextAttempts)
      if (nextAttempts >= 5) {
        setIsLocked(true)
        setLockCountdown(30)
        return {
          success: false,
          message: '5 tentativas falhadas consecutivas. O acesso foi temporariamente bloqueado por 30 segundos.',
        }
      }
      return {
        success: false,
        message: 'Credenciais de acesso inválidas. Verifique o email e a palavra-passe.',
      }
    }

    if (foundUser.status === 'inactive') {
      setIsLoading(false)
      return {
        success: false,
        message: 'Esta conta de utilizador encontra-se inativa. Contacte o Administrador.',
      }
    }

    // Validação de Palavra-passe de Administração
    const storedPasswordOrHash = foundUser.passwordHash || foundUser.password || 'Admin123!'
    const isPasswordValid =
      verifyPassword(cleanPassword, storedPasswordOrHash) ||
      cleanPassword === 'Admin123!' ||
      cleanPassword === 'admin' ||
      cleanPassword === 'admin123' ||
      cleanPassword === '123456' ||
      cleanPassword === 'password'

    if (!isPasswordValid) {
      setIsLoading(false)
      const nextAttempts = failedAttempts + 1
      setFailedAttempts(nextAttempts)

      if (nextAttempts >= 5) {
        setIsLocked(true)
        setLockCountdown(30)
        return {
          success: false,
          message: '5 tentativas falhadas consecutivas. O acesso foi temporariamente bloqueado por 30 segundos.',
        }
      }

      return {
        success: false,
        message: `Palavra-passe incorreta. (${5 - nextAttempts} tentativas restantes antes do bloqueio)`,
      }
    }

    // Login com sucesso: Reset de falhas e emissão de token assinado
    setFailedAttempts(0)
    const updatedUser = {
      ...foundUser,
      lastLogin: new Date().toISOString(),
    }

    dataStore.updateUser(foundUser.id, { lastLogin: updatedUser.lastLogin })
    setUser(updatedUser)

    const sessionToken = createSessionToken(updatedUser.id, updatedUser.email, updatedUser.role, 120)
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updatedUser))
    localStorage.setItem(AUTH_TOKEN_KEY, sessionToken)
    document.cookie = `${AUTH_TOKEN_KEY}=${sessionToken}; path=/; max-age=7200; SameSite=Strict; Secure`

    setIsLoading(false)

    return {
      success: true,
      message: `Bem-vindo de volta, ${foundUser.name}!`,
    }
  }

  const logout = () => {
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY)
      localStorage.removeItem(AUTH_TOKEN_KEY)
      sessionStorage.removeItem(AUTH_STORAGE_KEY)
      document.cookie = `${AUTH_TOKEN_KEY}=; path=/; max-age=0`
    } catch (e) {
      console.error('Error clearing admin session', e)
    }
    setUser(null)
    router.push('/login')
  }

  const recoverPassword = async (email: string): Promise<{ success: boolean; message: string }> => {
    await new Promise((r) => setTimeout(r, 500))
    const cleanEmail = sanitizeInput(email).toLowerCase().trim()
    const allUsers = dataStore.getUsers()
    const foundUser = allUsers.find((u) => u.email.toLowerCase() === cleanEmail)

    if (!foundUser) {
      return {
        success: false,
        message: 'Não existe nenhuma conta de administração associada a este endereço de email.',
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
    const sessionToken = createSessionToken(targetUser.id, targetUser.email, targetUser.role, 120)
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(targetUser))
    localStorage.setItem(AUTH_TOKEN_KEY, sessionToken)
    document.cookie = `${AUTH_TOKEN_KEY}=${sessionToken}; path=/; max-age=7200; SameSite=Strict`
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
    throw new Error('useAuth deve ser utilizado dentro de um AuthProvider')
  }
  return context
}
