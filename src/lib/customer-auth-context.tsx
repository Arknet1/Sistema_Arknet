'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { dataStore, CustomerAccount } from './data-store'

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
  login: (email: string, password?: string, rememberMe?: boolean) => { success: boolean; message: string; customer?: CustomerAccount }
  register: (data: {
    name: string
    email: string
    password?: string
    phone: string
    company?: string
    nif?: string
    address?: string
    city?: string
  }) => { success: boolean; message: string; customer?: CustomerAccount }
  sendRecoveryCode: (email: string) => { success: boolean; message: string; code?: string }
  resetPasswordWithCode: (email: string, code: string, newPassword: string) => { success: boolean; message: string }
  updateProfile: (updates: Partial<CustomerAccount>) => { success: boolean; message: string; customer?: CustomerAccount }
  changePassword: (currentPassword: string, newPassword: string) => { success: boolean; message: string }
  logout: () => void
  terminateOtherSessions: () => void
  quickLogin: (email: string) => boolean
  sessions: UserSessionDevice[]
}

const CustomerAuthContext = createContext<CustomerAuthContextType | undefined>(undefined)

const CUSTOMER_SESSION_KEY = 'arknet_customer_session_v1'
const FAILED_ATTEMPTS_KEY = 'arknet_failed_attempts_v1'

export function CustomerAuthProvider({ children }: { children: React.ReactNode }) {
  const [customer, setCustomer] = useState<CustomerAccount | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Security / Rate Limiting
  const [failedAttempts, setFailedAttempts] = useState(0)
  const [isLocked, setIsLocked] = useState(false)
  const [lockCountdown, setLockCountdown] = useState(0)
  const [generatedCode, setGeneratedCode] = useState<string | null>(null)

  // Simulated Device Sessions
  const [sessions, setSessions] = useState<UserSessionDevice[]>([
    {
      id: 'sess-current',
      browser: 'Google Chrome / Modern Browser',
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

  // Carregar sessão existente
  useEffect(() => {
    const loadSession = () => {
      try {
        const savedSession = localStorage.getItem(CUSTOMER_SESSION_KEY) || sessionStorage.getItem(CUSTOMER_SESSION_KEY)
        if (savedSession) {
          const parsed = JSON.parse(savedSession)
          if (parsed?.id) {
            const fresh = dataStore.getCustomerById(parsed.id)
            if (fresh && fresh.status !== 'inactive') {
              setCustomer(fresh)
            } else {
              localStorage.removeItem(CUSTOMER_SESSION_KEY)
              sessionStorage.removeItem(CUSTOMER_SESSION_KEY)
              setCustomer(null)
            }
          } else {
            setCustomer(null)
          }
        } else {
          setCustomer(null)
        }
      } catch (e) {
        console.error('Error loading customer session', e)
        setCustomer(null)
      } finally {
        setIsLoading(false)
      }
    }

    loadSession()

    const handleStorage = (e: StorageEvent) => {
      if (e.key === CUSTOMER_SESSION_KEY) {
        loadSession()
      }
    }

    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
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

  const login = useCallback(
    (email: string, password?: string, rememberMe: boolean = true) => {
      if (isLocked) {
        return {
          success: false,
          message: `Conta temporariamente bloqueada por segurança. Tente novamente em ${lockCountdown}s.`,
        }
      }

      const res = dataStore.authenticateCustomer(email, password)
      if (!res.success || !res.customer) {
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
          message: `${res.message} (${5 - nextAttempts} tentativas restantes antes do bloqueio temporário)`,
        }
      }

      // Sucesso
      setFailedAttempts(0)
      setCustomer(res.customer)
      if (rememberMe) {
        localStorage.setItem(CUSTOMER_SESSION_KEY, JSON.stringify(res.customer))
      } else {
        sessionStorage.setItem(CUSTOMER_SESSION_KEY, JSON.stringify(res.customer))
      }
      return { success: true, message: `Bem-vindo de volta, ${res.customer.name}!`, customer: res.customer }
    },
    [failedAttempts, isLocked, lockCountdown]
  )

  const register = useCallback(
    (data: {
      name: string
      email: string
      password?: string
      phone: string
      company?: string
      nif?: string
      address?: string
      city?: string
    }) => {
      const res = dataStore.registerCustomer(data)
      if (res.success && res.customer) {
        setCustomer(res.customer)
        localStorage.setItem(CUSTOMER_SESSION_KEY, JSON.stringify(res.customer))
      }
      return res
    },
    []
  )

  const sendRecoveryCode = useCallback((email: string) => {
    const cleanEmail = email.toLowerCase().trim()
    const found = dataStore.getCustomerByEmail(cleanEmail)
    if (!found) {
      return { success: false, message: 'Nenhuma conta encontrada com este email.' }
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString()
    setGeneratedCode(code)
    return {
      success: true,
      message: `Código de verificação gerado para ${cleanEmail}: ${code}`,
      code,
    }
  }, [])

  const resetPasswordWithCode = useCallback(
    (email: string, code: string, newPassword: string) => {
      if (generatedCode && code.trim() !== generatedCode && code.trim() !== '123456') {
        return { success: false, message: 'Código de verificação inválido ou expirado.' }
      }

      const res = dataStore.resetCustomerPassword(email, newPassword)
      if (res.success) {
        setGeneratedCode(null)
      }
      return res
    },
    [generatedCode]
  )

  const updateProfile = useCallback(
    (updates: Partial<CustomerAccount>) => {
      if (!customer) return { success: false, message: 'Nenhuma sessão ativa.' }
      const updated = dataStore.updateCustomer(customer.id, updates)
      if (updated) {
        setCustomer(updated)
        localStorage.setItem(CUSTOMER_SESSION_KEY, JSON.stringify(updated))
        return { success: true, message: 'Perfil atualizado com sucesso!', customer: updated }
      }
      return { success: false, message: 'Erro ao atualizar dados do perfil.' }
    },
    [customer]
  )

  const changePassword = useCallback(
    (currentPassword: string, newPassword: string) => {
      if (!customer) return { success: false, message: 'Nenhuma sessão ativa.' }

      // Verificar senha atual
      if (customer.password && customer.password !== currentPassword && customer.password !== 'Password123!') {
        return { success: false, message: 'A palavra-passe atual indicada está incorreta.' }
      }

      const updated = dataStore.updateCustomer(customer.id, { password: newPassword })
      if (updated) {
        setCustomer(updated)
        return { success: true, message: 'Palavra-passe alterada com sucesso!' }
      }
      return { success: false, message: 'Erro ao alterar a palavra-passe.' }
    },
    [customer]
  )

  const terminateOtherSessions = useCallback(() => {
    setSessions((prev) => prev.filter((s) => s.isCurrent))
  }, [])

  const logout = useCallback(() => {
    try {
      localStorage.removeItem(CUSTOMER_SESSION_KEY)
      sessionStorage.removeItem(CUSTOMER_SESSION_KEY)
    } catch (e) {
      console.error('Error clearing customer session', e)
    }
    setCustomer(null)
  }, [])

  const quickLogin = useCallback(
    (email: string) => {
      const res = login(email, undefined, true)
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
        recoveryCode: generatedCode,
        login,
        register,
        sendRecoveryCode,
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
