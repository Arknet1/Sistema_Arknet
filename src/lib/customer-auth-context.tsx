'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { dataStore, CustomerAccount } from './data-store'
import { sanitizeInput } from './security-utils'

export interface UserSessionDevice {
  id: string
  browser: string
  os: string
  ip: string
  lastActive: string
  isCurrent: boolean
}

interface CustomerAuthContextType {
  customer: CustomerAccount | null
  isLoading: boolean
  failedAttempts: number
  isLocked: boolean
  lockCountdown: number
  recoveryCode: string | null
  login: (email: string, password?: string, rememberMe?: boolean) => Promise<{ success: boolean; message: string; customer?: CustomerAccount }>
  register: (data: {
    name: string
    email: string
    password?: string
    phone: string
    company?: string
    nif?: string
    address?: string
    city?: string
  }) => Promise<{ success: boolean; message: string; customer?: CustomerAccount }>
  sendRecoveryCode: (email: string) => Promise<{ success: boolean; message: string; previewUrl?: string | false }>
  verifyRecoveryCode: (email: string, code: string) => Promise<{ success: boolean; message: string }>
  resetPasswordWithCode: (email: string, code: string, newPassword: string) => Promise<{ success: boolean; message: string }>
  updateProfile: (updates: Partial<CustomerAccount>) => { success: boolean; message: string; customer?: CustomerAccount }
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; message: string }>
  logout: () => void
  terminateOtherSessions: () => void
  quickLogin: (email: string) => Promise<boolean>
  sessions: UserSessionDevice[]
}

const CustomerAuthContext = createContext<CustomerAuthContextType | undefined>(undefined)

export function CustomerAuthProvider({ children }: { children: React.ReactNode }) {
  const [customer, setCustomer] = useState<CustomerAccount | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Security / Rate Limiting
  const [failedAttempts, setFailedAttempts] = useState(0)
  const [isLocked, setIsLocked] = useState(false)
  const [lockCountdown, setLockCountdown] = useState(0)

  // Simulated Device Sessions
  const [sessions, setSessions] = useState<UserSessionDevice[]>([
    {
      id: 'sess-current',
      browser: 'Google Chrome / Navegador Seguro',
      os: 'Windows 11 / Desktop',
      ip: '197.234.219.45 (Luanda, AO)',
      lastActive: 'Agora (Sessão Atual)',
      isCurrent: true,
    },
    {
      id: 'sess-mobile',
      browser: 'Safari Mobile',
      os: 'iOS 18 (iPhone)',
      ip: '102.164.88.12 (Luanda, AO)',
      lastActive: 'Há 2 dias',
      isCurrent: false,
    },
  ])

  // Carregar sessão validada pelo servidor
  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('arknet_customer_token') : null
    const headers: Record<string, string> = {}
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    fetch('/api/auth/session', { cache: 'no-store', headers, credentials: 'include' })
      .then((response) => response.json())
      .then((result) => {
        if (result.authenticated && result.kind === 'customer') {
          setCustomer(result.user as CustomerAccount)
          if (result.token) {
            localStorage.setItem('arknet_customer_token', result.token)
          }
        } else {
          setCustomer(null)
        }
      })
      .catch(() => setCustomer(null))
      .finally(() => setIsLoading(false))
  }, [])

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

  // Sincronizar com atualizações no dataStore
  useEffect(() => {
    const unsub = dataStore.subscribe((db) => {
      if (customer) {
        const fresh = db.customers?.find((c) => c.id === customer.id)
        if (fresh) {
          setCustomer(fresh)
        }
      }
    })
    return () => unsub()
  }, [customer])

  const login = useCallback(async (email: string, password?: string, rememberMe: boolean = true) => {
    try {
      const response = await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ action: 'login', kind: 'customer', email, password, rememberMe }),
      })
      const result = await response.json()
      if (!response.ok || result.kind !== 'customer') return { success: false, message: result.message || 'Email ou palavra-passe inválidos.' }
      if (result.token) {
        localStorage.setItem('arknet_customer_token', result.token)
      }
      setFailedAttempts(0)
      setCustomer(result.user as CustomerAccount)
      return { success: true, message: result.message, customer: result.user as CustomerAccount }
    } catch {
      return { success: false, message: 'Não foi possível contactar o serviço de autenticação.' }
    }
  }, [])

  const register = useCallback(
    async (data: {
      name: string
      email: string
      password?: string
      phone: string
      company?: string
      nif?: string
      address?: string
      city?: string
    }) => {
      const response = await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ action: 'register', ...data }),
      })
      const result = await response.json()
      if (!response.ok) return { success: false, message: result.message || 'Não foi possível criar a conta.' }
      if (result.token) {
        localStorage.setItem('arknet_customer_token', result.token)
      }
      setCustomer(result.user as CustomerAccount)
      return { success: true, message: result.message, customer: result.user as CustomerAccount }
    },
    []
  )

  const sendRecoveryCode = useCallback(async (email: string) => {
    const response = await fetch('/api/auth/recovery', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'send', email: sanitizeInput(email).toLowerCase().trim() }),
    })
    const result = await response.json()
    return result
  }, [])

  const verifyRecoveryCode = useCallback(async (email: string, code: string) => {
    const response = await fetch('/api/auth/recovery', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'verify', email: sanitizeInput(email).toLowerCase().trim(), code: code.trim() }),
    })
    const result = await response.json()
    return result
  }, [])

  const resetPasswordWithCode = useCallback(
    async (email: string, code: string, newPassword: string) => {
      const cleanEmail = sanitizeInput(email).toLowerCase().trim()
      const cleanCode = code.trim()
      const cleanNewPassword = newPassword.trim()
      const response = await fetch('/api/auth/recovery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset', email: cleanEmail, code: cleanCode, password: cleanNewPassword }),
      })
      return response.json()
    },
    []
  )

  const updateProfile = useCallback(
    (updates: Partial<CustomerAccount>) => {
      if (!customer) return { success: false, message: 'Nenhuma sessão ativa.' }

      const sanitizedUpdates: Partial<CustomerAccount> = {}
      if (updates.name) sanitizedUpdates.name = sanitizeInput(updates.name)
      if (updates.phone) sanitizedUpdates.phone = sanitizeInput(updates.phone)
      if (updates.company !== undefined) sanitizedUpdates.company = sanitizeInput(updates.company)
      if (updates.nif !== undefined) sanitizedUpdates.nif = sanitizeInput(updates.nif)
      if (updates.address !== undefined) sanitizedUpdates.address = sanitizeInput(updates.address)
      if (updates.city !== undefined) sanitizedUpdates.city = sanitizeInput(updates.city)

      const updated = dataStore.updateCustomer(customer.id, sanitizedUpdates)
      if (updated) {
        setCustomer(updated)
        return { success: true, message: 'Perfil atualizado com sucesso!', customer: updated }
      }
      return { success: false, message: 'Erro ao atualizar dados do perfil.' }
    },
    [customer]
  )

  const changePassword = useCallback(async (currentPassword: string, newPassword: string) => {
    if (!customer) return { success: false, message: 'Nenhuma sessão ativa.' }
    try {
      const response = await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ action: 'change-password', currentPassword, newPassword }),
      })
      const result = await response.json()
      return { success: response.ok && result.success, message: result.message }
    } catch {
      return { success: false, message: 'Não foi possível contactar o serviço de autenticação.' }
    }
  }, [customer])

  const terminateOtherSessions = useCallback(() => {
    setSessions((prev) => prev.filter((s) => s.isCurrent))
  }, [])

  const logout = useCallback(async () => {
    await fetch('/api/auth/session', { method: 'DELETE', credentials: 'include' }).catch(() => undefined)
    if (typeof window !== 'undefined') {
      localStorage.removeItem('arknet_customer_token')
    }
    setCustomer(null)
  }, [])

  const quickLogin = useCallback(
    async (email: string) => {
      const res = await login(email, undefined, true)
      return res.success
    },
    [login]
  )

  return (
    <CustomerAuthContext.Provider
      value={{
        customer,
        isLoading,
        failedAttempts,
        isLocked,
        lockCountdown,
        recoveryCode: null,
        login,
        register,
        sendRecoveryCode,
        verifyRecoveryCode,
        resetPasswordWithCode,
        updateProfile,
        changePassword,
        logout,
        terminateOtherSessions,
        quickLogin,
        sessions,
      }}
    >
      {children}
    </CustomerAuthContext.Provider>
  )
}

export function useCustomerAuth() {
  const context = useContext(CustomerAuthContext)
  if (!context) {
    throw new Error('useCustomerAuth deve ser utilizado dentro de um CustomerAuthProvider')
  }
  return context
}
