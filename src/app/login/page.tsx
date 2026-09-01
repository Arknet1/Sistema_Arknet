'use client'

import React, { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import {
  User,
  UserCheck,
  Lock,
  ArrowRight,
  Eye,
  EyeOff,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  ShieldAlert,
  Send,
  Building2,
} from 'lucide-react'
import arknetLogo from '@/assets/icon18.png'
import { useAuth } from '@/lib/auth-context'
import { useCustomerAuth } from '@/lib/customer-auth-context'
import { dataStore } from '@/lib/data-store'

function UnifiedLoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectUrl = searchParams.get('redirect')
  const initialTab =
    searchParams.get('tab') === 'registo'
      ? 'registo'
      : searchParams.get('tab') === 'recuperar'
        ? 'recuperar'
        : 'login'

  const { login: adminLogin, logout: adminLogout, user: adminUser } = useAuth()
  const {
    login: customerLogin,
    logout: customerLogout,
    register: customerRegister,
    customer,
    sendRecoveryCode,
    resetPasswordWithCode,
    isLocked,
    lockCountdown,
  } = useCustomerAuth()

  const [activeTab, setActiveTab] = useState<'login' | 'registo' | 'recuperar'>(initialTab)

  // Login Form State
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [showLoginPassword, setShowLoginPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)

  // Register Form State
  const [regData, setRegData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    company: '',
    nif: '',
    city: 'Luanda',
    address: '',
    acceptTerms: true,
  })
  const [showRegPassword, setShowRegPassword] = useState(false)

  // Recovery Form State
  const [recoveryEmail, setRecoveryEmail] = useState('')
  const [recoveryCode, setRecoveryCode] = useState('')
  const [recoveryNewPassword, setRecoveryNewPassword] = useState('')
  const [recoveryStep, setRecoveryStep] = useState<1 | 2>(1)
  const [simulatedCodeSent, setSimulatedCodeSent] = useState<string | null>(null)

  // Feedback Messages
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Cálculo da Força da Senha para Registo
  const getPasswordStrength = (pwd: string) => {
    let score = 0
    if (pwd.length >= 6) score += 25
    if (pwd.length >= 8) score += 25
    if (/[A-Z]/.test(pwd)) score += 25
    if (/[0-9]/.test(pwd) || /[^A-Za-z0-9]/.test(pwd)) score += 25
    return score
  }

  const pwdStrength = getPasswordStrength(regData.password)
  const getStrengthLabel = (score: number) => {
    if (score <= 25) return { label: 'Fraca', color: 'bg-rose-500', text: 'text-rose-600' }
    if (score <= 50) return { label: 'Média', color: 'bg-amber-500', text: 'text-amber-600' }
    if (score <= 75) return { label: 'Boa', color: 'bg-blue-500', text: 'text-blue-600' }
    return { label: 'Excelente', color: 'bg-emerald-500', text: 'text-emerald-600' }
  }

  // --- SUBMISSÃO ÚNICA DE LOGIN (Admin ou Cliente) ---
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')
    setIsLoading(true)

    const cleanEmail = loginEmail.trim().toLowerCase()

    try {
      // 1. Verificar se é uma conta de Administrador / Editor
      const adminUsers = dataStore.getUsers()
      const isAdminAccount = adminUsers.some((u) => u.email.toLowerCase() === cleanEmail)

      if (isAdminAccount) {
        // Limpar qualquer sessão de cliente anterior
        customerLogout()
        const adminRes = await adminLogin(cleanEmail, loginPassword)
        if (adminRes.success) {
          setSuccessMessage('Autenticação de gestão confirmada. A aceder ao Painel Admin...')
          setTimeout(() => {
            router.push('/admin')
          }, 400)
          return
        } else {
          setErrorMessage(adminRes.message)
          setIsLoading(false)
          return
        }
      }

      // 2. Caso contrário, autenticar como Conta de Cliente
      // Limpar qualquer sessão de administrador anterior
      adminLogout()
      const clientRes = customerLogin(cleanEmail, loginPassword, rememberMe)
      if (clientRes.success) {
        setSuccessMessage(clientRes.message)
        setTimeout(() => {
          router.push(redirectUrl || '/cliente/perfil')
        }, 400)
      } else {
        setErrorMessage(clientRes.message)
      }
    } catch (err) {
      setErrorMessage('Ocorreu um erro ao processar as suas credenciais. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  // --- REGISTO DE NOVO CLIENTE ---
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')

    if (regData.password.length < 6) {
      setErrorMessage('A palavra-passe deve conter pelo menos 6 caracteres.')
      return
    }

    if (regData.password !== regData.confirmPassword) {
      setErrorMessage('As palavras-passe não coincidem.')
      return
    }

    if (!regData.acceptTerms) {
      setErrorMessage('Deve aceitar os Termos de Serviço da ARKNET para prosseguir.')
      return
    }

    setIsLoading(true)

    try {
      adminLogout()
      const res = customerRegister({
        name: regData.name,
        email: regData.email,
        password: regData.password,
        phone: regData.phone,
        company: regData.company,
        nif: regData.nif,
        city: regData.city,
        address: regData.address,
      })

      if (res.success) {
        setSuccessMessage('Conta de cliente criada com sucesso! A entrar no seu perfil...')
        setTimeout(() => router.push('/cliente/perfil'), 500)
      } else {
        setErrorMessage(res.message)
      }
    } catch (err) {
      setErrorMessage('Erro ao criar conta de cliente.')
    } finally {
      setIsLoading(false)
    }
  }

  // --- RECUPERAÇÃO DE SENHA ---
  const handleSendRecoveryCode = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')

    if (!recoveryEmail.trim()) {
      setErrorMessage('Por favor, introduza o seu endereço de email.')
      return
    }

    const res = sendRecoveryCode(recoveryEmail.trim())
    if (res.success && res.code) {
      setSimulatedCodeSent(res.code)
      setRecoveryCode(res.code) // Preencher automaticamente para facilidade de teste
      setSuccessMessage(`Código de verificação enviado! Código de teste: ${res.code}`)
      setRecoveryStep(2)
    } else {
      setErrorMessage(res.message || 'Não foi possível enviar o código de verificação.')
    }
  }

  const handleResetPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')

    if (!recoveryCode.trim()) {
      setErrorMessage('Por favor, introduza o código de verificação de 6 dígitos.')
      return
    }

    if (recoveryNewPassword.length < 6) {
      setErrorMessage('A nova palavra-passe deve conter pelo menos 6 caracteres.')
      return
    }

    const res = resetPasswordWithCode(recoveryEmail.trim(), recoveryCode.trim(), recoveryNewPassword)
    if (res.success) {
      setSuccessMessage('Palavra-passe alterada com sucesso! As suas novas credenciais foram preenchidas. Clique em "Iniciar Sessão".')
      setRecoveryStep(1)
      setRecoveryCode('')
      setActiveTab('login')
      setLoginEmail(recoveryEmail.trim())
      setLoginPassword(recoveryNewPassword)
      setRecoveryNewPassword('')
    } else {
      setErrorMessage(res.message)
    }
  }

  return (
    <main className="min-h-screen pt-24 pb-16 bg-slate-900 flex items-center justify-center px-4 sm:px-6">
      <div className="w-full max-w-lg bg-white border border-slate-200 shadow-2xl overflow-hidden">

        {/* Top Branding Banner */}
        <div className="bg-slate-950 px-8 py-8 text-white text-center relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-36 h-36 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 w-36 h-36 bg-secondary/20 rounded-full blur-3xl pointer-events-none" />

          <Link href="/" className="inline-block mb-3">
            <Image
              src={arknetLogo}
              alt="ARKNET"
              width={160}
              height={160}
              className="h-14 w-auto mx-auto object-contain"
            />
          </Link>

          <span className="inline-block text-[11px] font-bold uppercase tracking-[0.2em] text-primary bg-primary/10 px-3 py-1 rounded-full mb-1">
            Portal ARKNET
          </span>
          <h1 className="text-xl font-black text-white uppercase tracking-wide">
            Acesso ao Sistema
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
            Introduza as suas credenciais para aceder ao seu painel.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-bold uppercase tracking-wider">
          <button
            type="button"
            onClick={() => {
              setActiveTab('login')
              setErrorMessage('')
              setSuccessMessage('')
            }}
            className={`flex-1 py-3.5 text-center transition border-b-2 ${activeTab === 'login'
              ? 'border-primary text-primary bg-white shadow-xs'
              : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
          >
            Iniciar Sessão
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('registo')
              setErrorMessage('')
              setSuccessMessage('')
            }}
            className={`flex-1 py-3.5 text-center transition border-b-2 ${activeTab === 'registo'
              ? 'border-secondary text-secondary bg-white shadow-xs'
              : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
          >
            Criar Conta
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('recuperar')
              setErrorMessage('')
              setSuccessMessage('')
            }}
            className={`flex-1 py-3.5 text-center transition border-b-2 ${activeTab === 'recuperar'
              ? 'border-slate-800 text-slate-900 bg-white shadow-xs'
              : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
          >
            Recuperar Senha
          </button>
        </div>

        {/* Form Container */}
        <div className="p-8">
          {/* Active Session Alert */}
          {customer ? (
            <div className="mb-6 p-4 bg-primary/5 border border-primary/20 text-slate-800 text-xs rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="font-bold text-slate-900 flex items-center gap-1.5">
                  <UserCheck className="h-4 w-4 text-primary" />
                  Sessão ativa como {customer.name}
                </p>
                <p className="text-slate-500 font-mono text-[11px] mt-0.5">{customer.email}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Link
                  href="/cliente/perfil"
                  className="px-3 py-1.5 bg-primary text-white font-bold text-[11px] uppercase rounded hover:bg-primary/90 transition"
                >
                  Meu Perfil
                </Link>
                <button
                  type="button"
                  onClick={customerLogout}
                  className="px-3 py-1.5 bg-rose-50 border border-rose-200 text-rose-600 font-bold text-[11px] uppercase rounded hover:bg-rose-100 transition"
                >
                  Terminar Sessão
                </button>
              </div>
            </div>
          ) : adminUser ? (
            <div className="mb-6 p-4 bg-slate-900 border border-slate-700 text-white text-xs rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="font-bold text-white flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  Sessão ativa como {adminUser.name}
                </p>
                <p className="text-slate-400 font-mono text-[11px] mt-0.5">{adminUser.email}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Link
                  href="/admin"
                  className="px-3 py-1.5 bg-primary text-white font-bold text-[11px] uppercase rounded hover:bg-primary/90 transition"
                >
                  Painel Admin
                </Link>
                <button
                  type="button"
                  onClick={adminLogout}
                  className="px-3 py-1.5 bg-rose-950/50 border border-rose-800 text-rose-300 font-bold text-[11px] uppercase rounded hover:bg-rose-900 transition"
                >
                  Terminar Sessão
                </button>
              </div>
            </div>
          ) : null}

          {/* Status Feedback */}
          {errorMessage && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold rounded flex items-center gap-3">
              <AlertCircle className="h-5 w-5 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
              <span>{successMessage}</span>
            </div>
          )}

          {isLocked && (
            <div className="mb-6 p-4 bg-amber-50 border border-amber-300 text-amber-900 text-xs font-bold rounded flex items-center gap-3">
              <ShieldAlert className="h-5 w-5 shrink-0 text-amber-600" />
              <div>
                <p>Acesso temporariamente bloqueado por segurança.</p>
                <p className="font-normal mt-0.5">
                  Aguarde <strong>{lockCountdown} segundos</strong> para tentar novamente.
                </p>
              </div>
            </div>
          )}

          {/* TAB 1: INICIAR SESSÃO (ÚNICO: ADMIN & CLIENTES) */}
          {activeTab === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Endereço de Email
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="exemplo@arknet.co.ao ou cliente@empresa.co.ao"
                    className="w-full pl-10 pr-4 py-3 text-sm bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-bold uppercase tracking-wider text-slate-700">
                    Palavra-passe
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('recuperar')
                      setRecoveryEmail(loginEmail)
                    }}
                    className="text-[11px] text-primary hover:underline font-semibold"
                  >
                    Esqueceu a senha?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-3 text-sm bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:border-primary focus:outline-none font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1"
                  >
                    {showLoginPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-slate-300 text-primary focus:ring-primary h-4 w-4"
                  />
                  <span className="text-slate-600 text-xs">Lembrar neste dispositivo</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading || isLocked}
                className="w-full mt-2 bg-primary hover:bg-primary/90 text-white font-bold text-xs uppercase tracking-wider py-3.5 transition flex items-center justify-center gap-2 shadow-md disabled:opacity-60"
              >
                <span>{isLoading ? 'A autenticar...' : 'Entrar no Sistema'}</span>
                <ArrowRight className="h-4 w-4" />
              </button>


            </form>
          )}

          {/* TAB 2: CRIAR CONTA (NOVO CLIENTE) */}
          {activeTab === 'registo' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-4 text-xs">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Nome Completo / Representante *
                  </label>
                  <input
                    type="text"
                    required
                    value={regData.name}
                    onChange={(e) => setRegData({ ...regData, name: e.target.value })}
                    placeholder="João Miguel Silva"
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:border-secondary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Endereço de Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={regData.email}
                    onChange={(e) => setRegData({ ...regData, email: e.target.value })}
                    placeholder="cliente@empresa.co.ao"
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:border-secondary focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Telefone de Contacto *
                  </label>
                  <input
                    type="tel"
                    required
                    value={regData.phone}
                    onChange={(e) => setRegData({ ...regData, phone: e.target.value })}
                    placeholder="+244 923 000 000"
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:border-secondary focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Empresa / Instituição
                  </label>
                  <input
                    type="text"
                    value={regData.company}
                    onChange={(e) => setRegData({ ...regData, company: e.target.value })}
                    placeholder="Empresa Lda ou Particular"
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:border-secondary focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    NIF (Opcional)
                  </label>
                  <input
                    type="text"
                    value={regData.nif}
                    onChange={(e) => setRegData({ ...regData, nif: e.target.value })}
                    placeholder="5400000000"
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:border-secondary focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Cidade
                  </label>
                  <input
                    type="text"
                    value={regData.city}
                    onChange={(e) => setRegData({ ...regData, city: e.target.value })}
                    placeholder="Luanda"
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:border-secondary focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 pt-1">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Palavra-passe *
                  </label>
                  <input
                    type={showRegPassword ? 'text' : 'password'}
                    required
                    value={regData.password}
                    onChange={(e) => setRegData({ ...regData, password: e.target.value })}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:border-secondary focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Confirmar Palavra-passe *
                  </label>
                  <input
                    type={showRegPassword ? 'text' : 'password'}
                    required
                    value={regData.confirmPassword}
                    onChange={(e) => setRegData({ ...regData, confirmPassword: e.target.value })}
                    placeholder="Repita a senha"
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:border-secondary focus:outline-none font-mono"
                  />
                </div>
              </div>

              {/* Medidor de Força da Senha */}
              {regData.password && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-[10px] font-bold uppercase text-slate-500">Força da Senha:</span>
                    <span className={`text-[10px] font-bold ${getStrengthLabel(pwdStrength).text}`}>
                      {getStrengthLabel(pwdStrength).label}
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${getStrengthLabel(pwdStrength).color}`}
                      style={{ width: `${pwdStrength}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="pt-2">
                <label className="flex items-start gap-2.5 cursor-pointer text-slate-600">
                  <input
                    type="checkbox"
                    checked={regData.acceptTerms}
                    onChange={(e) => setRegData({ ...regData, acceptTerms: e.target.checked })}
                    className="mt-0.5 rounded border-slate-300 text-secondary focus:ring-secondary h-4 w-4"
                  />
                  <span>
                    Concordo com os Termos de Serviço e Política de Privacidade da ARKNET.
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-3 bg-secondary hover:bg-secondary/90 text-white font-bold text-xs uppercase tracking-wider py-3.5 transition flex items-center justify-center gap-2 shadow-md disabled:opacity-60"
              >
                <span>{isLoading ? 'A criar conta...' : 'Concluir Registo e Aceder'}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          )}

          {/* TAB 3: RECUPERAR PALAVRA-PASSE */}
          {activeTab === 'recuperar' && (
            <div className="space-y-6">
              {recoveryStep === 1 ? (
                <form onSubmit={handleSendRecoveryCode} className="space-y-4 text-xs">
                  <div className="p-4 bg-slate-50 border border-slate-200 text-slate-600 leading-relaxed">
                    <p className="font-bold text-slate-800 mb-1">Recuperar Acesso</p>
                    <p>
                      Indique o seu endereço de email para enviarmos um código de verificação seguro.
                    </p>
                  </div>

                  <div>
                    <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Endereço de Email *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        type="email"
                        required
                        value={recoveryEmail}
                        onChange={(e) => setRecoveryEmail(e.target.value)}
                        placeholder="seu.email@empresa.co.ao"
                        className="w-full pl-10 pr-4 py-3 text-sm bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:border-primary focus:outline-none font-mono"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-slate-900 hover:bg-primary text-white font-bold text-xs uppercase tracking-wider py-3.5 transition flex items-center justify-center gap-2 shadow-md"
                  >
                    <Send className="h-4 w-4" />
                    Enviar Código de Recuperação
                  </button>
                </form>
              ) : (
                <form onSubmit={handleResetPasswordSubmit} className="space-y-4 text-xs">
                  <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded">
                    Código de verificação para <strong>{recoveryEmail}</strong>: <span className="font-mono font-bold">{simulatedCodeSent || '123456'}</span>
                  </div>

                  <div>
                    <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Código de 6 Dígitos *
                    </label>
                    <input
                      type="text"
                      required
                      value={recoveryCode}
                      onChange={(e) => setRecoveryCode(e.target.value)}
                      placeholder="ex: 123456"
                      className="w-full px-4 py-2.5 text-center font-mono text-lg tracking-[0.25em] font-bold border border-slate-300 focus:border-primary focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Nova Palavra-passe *
                    </label>
                    <input
                      type="password"
                      required
                      value={recoveryNewPassword}
                      onChange={(e) => setRecoveryNewPassword(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      className="w-full px-4 py-2.5 text-sm border border-slate-300 focus:border-primary focus:outline-none font-mono"
                    />
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setRecoveryStep(1)}
                      className="px-4 py-3 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 uppercase"
                    >
                      Voltar
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-primary hover:bg-primary/90 text-white font-bold text-xs uppercase tracking-wider py-3 transition"
                    >
                      Redefinir Palavra-passe
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div >
    </main >
  )
}

export default function UnifiedLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen pt-32 pb-20 bg-slate-900 flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <UnifiedLoginForm />
    </Suspense>
  )
}
