'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import {
  User,
  Building2,
  Phone,
  Mail,
  MapPin,
  FileText,
  ShoppingBag,
  Clock,
  ShieldCheck,
  CheckCircle2,
  LogOut,
  Save,
  KeyRound,
  ExternalLink,
  Package,
  Headset,
  AlertCircle,
  Briefcase,
  Layers,
  Laptop,
  Smartphone,
  Shield,
  Lock,
  Printer,
  MessageCircle,
  X,
  Receipt,
  CreditCard,
  ArrowRight,
} from 'lucide-react'
import arknetLogo from '@/assets/icon18.png'
import { useCustomerAuth } from '@/lib/customer-auth-context'
import { dataStore, StoreOrder, ServiceLead } from '@/lib/data-store'
import { formatProdutoPrice, formatLinhaPreco } from '@/lib/format-produto-price'

export default function ClientePerfilPage() {
  const router = useRouter()
  const {
    customer,
    isLoading,
    updateProfile,
    changePassword,
    logout,
    sessions,
    terminateOtherSessions,
  } = useCustomerAuth()

  const [activeTab, setActiveTab] = useState<'perfil' | 'pedidos' | 'servicos' | 'seguranca'>('perfil')
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  // Edit Profile Form State
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    company: '',
    nif: '',
    address: '',
    city: '',
  })

  // Password Change State
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)

  // Notifications
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  // Orders and Leads
  const [orders, setOrders] = useState<StoreOrder[]>([])
  const [leads, setLeads] = useState<ServiceLead[]>([])

  useEffect(() => {
    if (isLoggingOut) return

    if (!isLoading && !customer) {
      router.push('/login')
      return
    }

    if (customer) {
      setFormData({
        name: customer.name || '',
        phone: customer.phone || '',
        company: customer.company || '',
        nif: customer.nif || '',
        address: customer.address || '',
        city: customer.city || 'Luanda',
      })

      // Carregar pedidos e leads do cliente
      const syncData = () => {
        const clientOrders = dataStore.getCustomerOrders(customer.email)
        const clientLeads = dataStore.getCustomerLeads(customer.email)
        setOrders([...clientOrders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()))
        setLeads([...clientLeads].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()))
      }

      syncData()
      const unsub = dataStore.subscribe(syncData)
      return () => unsub()
    }
  }, [customer, isLoading, isLoggingOut, router])

  if (isLoggingOut) {
    return (
      <main className="min-h-screen pt-32 pb-20 bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-rose-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm font-bold text-slate-800">A terminar sessão...</p>
          <p className="text-xs text-slate-500 mt-1">A redirecionar com segurança...</p>
        </div>
      </main>
    )
  }

  if (isLoading || !customer) {
    return (
      <main className="min-h-screen pt-32 pb-20 bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm font-bold text-slate-600">A carregar os seus dados...</p>
        </div>
      </main>
    )
  }

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault()
    setFeedback(null)

    const res = updateProfile({
      name: formData.name.trim(),
      phone: formData.phone.trim(),
      company: formData.company.trim(),
      nif: formData.nif.trim(),
      address: formData.address.trim(),
      city: formData.city.trim(),
    })

    if (res.success) {
      setFeedback({ type: 'success', message: 'Dados de perfil atualizados com sucesso!' })
    } else {
      setFeedback({ type: 'error', message: res.message })
    }
  }

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault()
    setFeedback(null)

    if (newPassword.length < 6) {
      setFeedback({ type: 'error', message: 'A nova palavra-passe deve ter no mínimo 6 caracteres.' })
      return
    }

    if (newPassword !== confirmPassword) {
      setFeedback({ type: 'error', message: 'A confirmação de palavra-passe não coincide.' })
      return
    }

    const res = changePassword(currentPassword, newPassword)
    if (res.success) {
      setFeedback({ type: 'success', message: res.message })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } else {
      setFeedback({ type: 'error', message: res.message })
    }
  }

  const handleTerminateSessions = () => {
    terminateOtherSessions()
    setFeedback({ type: 'success', message: 'Todas as outras sessões foram terminadas com sucesso.' })
  }

  const handleLogout = () => {
    setIsLoggingOut(true)
    logout()
    setTimeout(() => {
      router.push('/')
    }, 150)
  }

  // Invoice Modal State
  const [viewInvoiceOrder, setViewInvoiceOrder] = useState<StoreOrder | null>(null)

  // Password strength helper
  const getPasswordStrength = (pwd: string) => {
    let score = 0
    if (pwd.length >= 6) score += 25
    if (pwd.length >= 8) score += 25
    if (/[A-Z]/.test(pwd)) score += 25
    if (/[0-9]/.test(pwd) || /[^A-Za-z0-9]/.test(pwd)) score += 25
    return score
  }

  const pwdScore = getPasswordStrength(newPassword)

  // Estatísticas
  const totalSpent = orders.reduce((acc, order) => (order.total ? acc + order.total : acc), 0)
  const approvedOrdersCount = orders.filter((o) => o.status === 'fechado').length
  const pendingOrdersCount = orders.filter((o) => o.status === 'novo' || o.status === 'em_contacto').length

  const getOrderStatusBadge = (status: StoreOrder['status']) => {
    switch (status) {
      case 'novo':
        return (
          <span className="px-2.5 py-1 text-[10px] font-bold uppercase bg-amber-100 text-amber-900 border border-amber-300 rounded-full inline-flex items-center gap-1">
            <Clock className="h-3 w-3 text-amber-700" />
            Aguardando Confirmação Admin
          </span>
        )
      case 'em_contacto':
        return (
          <span className="px-2.5 py-1 text-[10px] font-bold uppercase bg-blue-100 text-blue-900 border border-blue-300 rounded-full inline-flex items-center gap-1">
            <MessageCircle className="h-3 w-3 text-blue-700" />
            Em Validação WhatsApp
          </span>
        )
      case 'fechado':
        return (
          <span className="px-2.5 py-1 text-[10px] font-bold uppercase bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-full inline-flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3 text-emerald-700" />
            Aprovado / Fatura Emitida
          </span>
        )
      case 'cancelado':
        return (
          <span className="px-2.5 py-1 text-[10px] font-bold uppercase bg-slate-100 text-slate-600 rounded-full">
            Cancelado
          </span>
        )
    }
  }

  const getLeadStatusBadge = (status: ServiceLead['status']) => {
    switch (status) {
      case 'novo':
        return <span className="px-2.5 py-1 text-[10px] font-bold uppercase bg-blue-50 text-primary rounded-full">Recebido</span>
      case 'contactado':
        return <span className="px-2.5 py-1 text-[10px] font-bold uppercase bg-indigo-100 text-indigo-800 rounded-full">Proposta Enviada</span>
      case 'convertido':
        return <span className="px-2.5 py-1 text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 rounded-full">Ativo / Aprovado</span>
      case 'arquivado':
        return <span className="px-2.5 py-1 text-[10px] font-bold uppercase bg-slate-100 text-slate-500 rounded-full">Arquivado</span>
    }
  }

  return (
    <main className="min-h-screen pt-28 pb-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-6">

        {/* Customer Header Banner */}
        <div className="bg-slate-950 text-white p-8 border border-slate-800 shadow-md mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="h-16 w-16 rounded-full bg-primary/20 border-2 border-primary text-primary flex items-center justify-center font-extrabold text-2xl shrink-0">
              {customer.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-white">{customer.name}</h1>
                <span className="px-2.5 py-0.5 bg-emerald-950 border border-emerald-700 text-emerald-400 text-[10px] font-bold uppercase rounded-full">
                  Conta Ativa
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 flex flex-wrap items-center gap-3">
                <span className="font-mono">{customer.email}</span>
                <span>•</span>
                <span>{customer.phone}</span>
                {customer.company && (
                  <>
                    <span>•</span>
                    <span className="text-primary font-bold">{customer.company}</span>
                  </>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/loja"
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold uppercase transition"
            >
              Loja Online
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-rose-900/40 hover:bg-rose-900 border border-rose-700 text-rose-200 text-xs font-bold uppercase transition"
            >
              <LogOut className="h-4 w-4" />
              Terminar Sessão
            </button>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-5 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400 text-xs font-bold uppercase">Total de Pedidos</span>
              <ShoppingBag className="h-5 w-5 text-primary" />
            </div>
            <p className="text-2xl font-black text-slate-900 font-mono">{orders.length}</p>
            <p className="text-[11px] text-slate-500 mt-1">Compras registadas na loja</p>
          </div>

          <div className="bg-white p-5 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400 text-xs font-bold uppercase">Total Faturado</span>
              <Package className="h-5 w-5 text-emerald-600" />
            </div>
            <p className="text-2xl font-black text-slate-900 font-mono">
              {totalSpent > 0 ? formatProdutoPrice(totalSpent) : '0 Kz'}
            </p>
            <p className="text-[11px] text-slate-500 mt-1">Valor acumulado em compras</p>
          </div>

          <div className="bg-white p-5 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400 text-xs font-bold uppercase">Cotações de Serviços</span>
              <Headset className="h-5 w-5 text-secondary" />
            </div>
            <p className="text-2xl font-black text-slate-900 font-mono">{leads.length}</p>
            <p className="text-[11px] text-slate-500 mt-1">Propostas técnicas solicitadas</p>
          </div>

          <div className="bg-white p-5 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400 text-xs font-bold uppercase">Último Acesso</span>
              <Clock className="h-5 w-5 text-slate-400" />
            </div>
            <p className="text-sm font-bold text-slate-900">
              {customer.lastLogin ? new Date(customer.lastLogin).toLocaleDateString('pt-PT') : 'Hoje'}
            </p>
            <p className="text-[11px] text-slate-500 mt-1 font-mono">Sessão segura ativa</p>
          </div>
        </div>

        {/* Notificação de Encomendas Aprovadas / Novidades */}
        {approvedOrdersCount > 0 && (
          <div className="mb-6 p-4 sm:p-5 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-100/70 border-2 border-emerald-500/50 text-emerald-950 text-xs rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
            <div className="flex items-start sm:items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-200/90 px-2 py-0.5 rounded">
                    Notificação de Faturação
                  </span>
                </div>
                <p className="font-black text-slate-900 text-sm mt-1">
                  🎉 Tem {approvedOrdersCount} {approvedOrdersCount === 1 ? 'encomenda aprovada' : 'encomendas aprovadas'} pelo Administrador!
                </p>
                <p className="text-slate-600 text-xs mt-0.5">
                  A sua fatura oficial com carimbo fiscal já foi emitida e está pronta para visualização, descarregamento e impressão.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('pedidos')}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs uppercase tracking-wider rounded transition shrink-0 shadow-sm flex items-center justify-center gap-1.5"
            >
              <FileText className="h-4 w-4" />
              <span>Ver Minhas Faturas</span>
            </button>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="bg-white border border-slate-200 mb-6 shadow-xs flex border-b-0 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('perfil')}
            className={`flex items-center gap-2 px-6 py-4 text-xs font-bold uppercase tracking-wider border-b-2 transition ${
              activeTab === 'perfil'
                ? 'border-primary text-primary bg-primary/5'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <User className="h-4 w-4" />
            Dados da Conta & Empresa
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('pedidos')}
            className={`flex items-center gap-2 px-6 py-4 text-xs font-bold uppercase tracking-wider border-b-2 transition ${
              activeTab === 'pedidos'
                ? 'border-primary text-primary bg-primary/5'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShoppingBag className="h-4 w-4" />
            Minhas Encomendas ({orders.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('servicos')}
            className={`flex items-center gap-2 px-6 py-4 text-xs font-bold uppercase tracking-wider border-b-2 transition ${
              activeTab === 'servicos'
                ? 'border-primary text-primary bg-primary/5'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Headset className="h-4 w-4" />
            Cotações & Serviços ({leads.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('seguranca')}
            className={`flex items-center gap-2 px-6 py-4 text-xs font-bold uppercase tracking-wider border-b-2 transition ${
              activeTab === 'seguranca'
                ? 'border-primary text-primary bg-primary/5'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <KeyRound className="h-4 w-4" />
            Segurança & Sessões
          </button>
        </div>

        {/* Global Feedback Banner */}
        {feedback && (
          <div
            className={`mb-6 p-4 text-xs font-semibold rounded flex items-center justify-between ${
              feedback.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}
          >
            <div className="flex items-center gap-2">
              {feedback.type === 'success' ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-rose-600" />
              )}
              <span>{feedback.message}</span>
            </div>
            <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-slate-700">
              ✕
            </button>
          </div>
        )}

        {/* TAB 1: Profile & Company Details */}
        {activeTab === 'perfil' && (
          <div className="bg-white border border-slate-200 p-8 shadow-xs">
            <h3 className="text-lg font-extrabold text-slate-900 mb-2">Informações Pessoais & Faturação</h3>
            <p className="text-xs text-slate-500 mb-6">
              Mantenha os seus dados atualizados para agilizar o processamento de encomendas e faturas.
            </p>

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs max-w-2xl">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Nome Completo / Representante
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2.5 text-sm border border-slate-300 focus:border-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Endereço de Email (Fixo)
                  </label>
                  <input
                    type="email"
                    disabled
                    value={customer.email}
                    className="w-full px-4 py-2.5 text-sm border border-slate-200 bg-slate-100 text-slate-500 font-mono cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Telefone de Contacto
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2.5 text-sm border border-slate-300 focus:border-primary focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Empresa / Instituição
                  </label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full px-4 py-2.5 text-sm border border-slate-300 focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    NIF (Número de Identificação Fiscal)
                  </label>
                  <input
                    type="text"
                    value={formData.nif}
                    onChange={(e) => setFormData({ ...formData, nif: e.target.value })}
                    className="w-full px-4 py-2.5 text-sm border border-slate-300 focus:border-primary focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Cidade
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-4 py-2.5 text-sm border border-slate-300 focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Endereço Físico de Entrega / Sede
                </label>
                <textarea
                  rows={3}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full p-3 text-sm border border-slate-300 focus:border-primary focus:outline-none resize-none"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white font-bold text-xs uppercase shadow-sm transition"
                >
                  <Save className="h-4 w-4" />
                  Guardar Alterações
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 2: Orders */}
        {activeTab === 'pedidos' && (
          <div className="bg-white border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Histórico de Pedidos na Loja</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Acompanhe a validação de pagamentos via WhatsApp e aceda às faturas oficiais emitidas.
                </p>
              </div>
              <Link
                href="/loja"
                className="px-4 py-2 bg-secondary text-white text-xs font-bold uppercase hover:bg-secondary/90 transition text-center"
              >
                Fazer Novo Pedido
              </Link>
            </div>

            {/* Aviso Informativo sobre o fluxo WhatsApp & Fatura */}
            <div className="bg-slate-50 border-b border-slate-200 p-4 text-xs text-slate-600 flex items-start gap-3">
              <MessageCircle className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-slate-800">
                  Como funciona o pagamento e a faturação na ARKNET:
                </p>
                <p className="mt-0.5 text-slate-500 text-[11px] leading-relaxed">
                  1. O pagamento é finalizado no WhatsApp com envio do comprovativo. • 2. O administrador valida e aprova a compra no sistema. • 3. A fatura oficial e recibo fiscal são desbloqueados automaticamente para download e impressão abaixo.
                </p>
              </div>
            </div>

            {orders.length === 0 ? (
              <div className="py-16 text-center">
                <ShoppingBag className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                <p className="text-sm font-bold text-slate-700">Ainda não realizou encomendas na loja.</p>
                <p className="text-xs text-slate-500 mt-1">Consulte o catálogo de equipamentos e tecnologias ARKNET.</p>
                <Link
                  href="/loja"
                  className="mt-4 inline-block px-5 py-2.5 bg-primary text-white text-xs font-bold uppercase hover:bg-primary/90 transition"
                >
                  Explorar Loja Online
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {orders.map((order) => {
                  const formattedTotal = order.total ? formatProdutoPrice(order.total) : 'Sob Consulta'
                  const whatsappText = `Ol%C3%A1%20ARKNET!%20Gostaria%20de%20saber%20o%20estado%20do%20meu%20pedido%20*${order.orderNumber}*%20no%20valor%20de%20*${encodeURIComponent(formattedTotal)}*.`

                  return (
                    <div key={order.id} className="p-6 hover:bg-slate-50/70 transition">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sm font-black text-slate-900">
                              #{order.orderNumber}
                            </span>
                            <span className="text-xs text-slate-400">
                              • {new Date(order.createdAt).toLocaleDateString('pt-PT', { day: '2-digit', month: 'long', year: 'numeric' })}
                            </span>
                          </div>
                        </div>
                        <div>{getOrderStatusBadge(order.status)}</div>
                      </div>

                      {/* Items */}
                      <div className="space-y-2 mb-4 bg-slate-50 p-4 border border-slate-100">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center text-xs">
                            <span className="font-bold text-slate-800">
                              {item.productName} <span className="text-primary font-mono font-normal">x{item.quantity}</span>
                            </span>
                            <span className="font-mono font-semibold text-slate-700">
                              {formatLinhaPreco(item.price, item.quantity)}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Summary & Actions Bar */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t border-slate-100">
                        <div className="text-xs">
                          <span className="text-slate-500">Valor Total:</span>{' '}
                          <span className="font-mono font-black text-sm text-slate-900">
                            {formattedTotal}
                          </span>
                          {order.paymentMethod && (
                            <span className="text-[11px] text-slate-400 block mt-0.5">
                              Método: <strong className="text-slate-700 uppercase">{order.paymentMethod}</strong>
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          {order.status === 'fechado' ? (
                            <button
                              type="button"
                              onClick={() => setViewInvoiceOrder(order)}
                              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-slate-900 hover:bg-primary text-white text-xs font-bold uppercase tracking-wider rounded transition shadow-xs"
                            >
                              <FileText className="h-4 w-4 text-emerald-400" />
                              <span>Visualizar / Imprimir Fatura Oficial</span>
                            </button>
                          ) : order.status === 'cancelado' ? (
                            <span className="text-xs text-slate-400 italic">Pedido Cancelado</span>
                          ) : (
                            <>
                              <a
                                href={`https://wa.me/244935208449?text=${whatsappText}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider rounded transition shadow-xs"
                              >
                                <MessageCircle className="h-4 w-4" />
                                <span>Falar no WhatsApp</span>
                              </a>
                              <span className="text-[11px] text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded flex items-center gap-1 font-medium">
                                <Lock className="h-3 w-3 text-amber-600" />
                                Fatura disponível após aprovação do admin
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: Services & Quotes */}
        {activeTab === 'servicos' && (
          <div className="bg-white border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Solicitações de Serviço & Cotações</h3>
                <p className="text-xs text-slate-500 mt-0.5">Pedidos de propostas técnicas submetidas à nossa equipa.</p>
              </div>
              <Link
                href="/#contacto"
                className="px-4 py-2 bg-primary text-white text-xs font-bold uppercase hover:bg-primary/90 transition"
              >
                Pedir Novo Serviço
              </Link>
            </div>

            {leads.length === 0 ? (
              <div className="py-16 text-center">
                <Headset className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                <p className="text-sm font-bold text-slate-700">Nenhum pedido de cotação registado.</p>
                <p className="text-xs text-slate-500 mt-1">Precisa de Internet Dedicada, Cloud ou Cibersegurança?</p>
                <Link
                  href="/#contacto"
                  className="mt-4 inline-block px-5 py-2.5 bg-primary text-white text-xs font-bold uppercase hover:bg-primary/90 transition"
                >
                  Solicitar Proposta
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {leads.map((lead) => (
                  <div key={lead.id} className="p-6 hover:bg-slate-50 transition">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                      <div>
                        <h4 className="font-extrabold text-slate-900 text-sm">{lead.service}</h4>
                        <p className="text-xs text-slate-400">
                          Submetido em: {new Date(lead.createdAt).toLocaleDateString('pt-PT')}
                        </p>
                      </div>
                      <div>{getLeadStatusBadge(lead.status)}</div>
                    </div>

                    <div className="p-3 bg-slate-50 border border-slate-100 text-slate-700 text-xs leading-relaxed mb-2">
                      <p className="font-bold text-[11px] text-slate-400 uppercase mb-1">A sua mensagem:</p>
                      {lead.message}
                    </div>

                    {lead.notes && (
                      <p className="text-xs text-primary font-medium mt-2">
                        <strong>Nota de acompanhamento:</strong> {lead.notes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: Security, Password & Active Sessions */}
        {activeTab === 'seguranca' && (
          <div className="space-y-8">
            {/* Change Password Card */}
            <div className="bg-white border border-slate-200 p-8 shadow-xs max-w-2xl">
              <div className="flex items-center gap-2 mb-2">
                <Lock className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-extrabold text-slate-900">Alteração Segura de Palavra-passe</h3>
              </div>
              <p className="text-xs text-slate-500 mb-6">
                Para sua proteção, introduza a sua palavra-passe atual e defina uma nova credencial com padrão de segurança forte.
              </p>

              <form onSubmit={handleChangePassword} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Palavra-passe Atual *
                  </label>
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 text-sm border border-slate-300 focus:border-primary focus:outline-none font-mono"
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Nova Palavra-passe *
                    </label>
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      className="w-full px-4 py-2.5 text-sm border border-slate-300 focus:border-primary focus:outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Confirmar Nova Palavra-passe *
                    </label>
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repita a nova senha"
                      className="w-full px-4 py-2.5 text-sm border border-slate-300 focus:border-primary focus:outline-none font-mono"
                    />
                  </div>
                </div>

                {/* Password strength indicator */}
                {newPassword && (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] font-bold uppercase text-slate-500">Força da Nova Senha:</span>
                      <span className="text-[10px] font-bold text-primary">
                        {pwdScore <= 50 ? 'Média' : pwdScore <= 75 ? 'Boa' : 'Excelente'}
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          pwdScore <= 50 ? 'bg-amber-500' : pwdScore <= 75 ? 'bg-blue-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${pwdScore}%` }}
                      />
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t border-slate-100 flex justify-end">
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white font-bold text-xs uppercase shadow-sm transition"
                  >
                    <KeyRound className="h-4 w-4" />
                    Guardar Nova Palavra-passe
                  </button>
                </div>
              </form>
            </div>

            {/* Active Sessions & Devices */}
            <div className="bg-white border border-slate-200 p-8 shadow-xs max-w-2xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-emerald-600" />
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">Sessões Ativas & Dispositivos</h3>
                    <p className="text-xs text-slate-500">Controlo de acessos recentes à sua conta.</p>
                  </div>
                </div>

                {sessions.length > 1 && (
                  <button
                    type="button"
                    onClick={handleTerminateSessions}
                    className="px-3 py-1.5 text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 uppercase transition"
                  >
                    Terminar Outras Sessões
                  </button>
                )}
              </div>

              <div className="space-y-3">
                {sessions.map((sess) => (
                  <div
                    key={sess.id}
                    className={`p-4 border flex items-center justify-between text-xs ${
                      sess.isCurrent ? 'bg-primary/5 border-primary/20' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white border border-slate-200 rounded text-slate-700">
                        {sess.os.includes('iPhone') || sess.os.includes('Android') ? (
                          <Smartphone className="h-4 w-4" />
                        ) : (
                          <Laptop className="h-4 w-4" />
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">
                          {sess.browser} — {sess.os}
                        </p>
                        <p className="text-[11px] text-slate-500 font-mono">
                          IP: {sess.ip} • {sess.lastActive}
                        </p>
                      </div>
                    </div>

                    {sess.isCurrent && (
                      <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 font-bold uppercase text-[9px] rounded-full">
                        Esta Sessão
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* MODAL DE FATURA OFICIAL (DOCUMENTO FISCAL) */}
        {viewInvoiceOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto print:p-0 print:bg-white">
            <div className="relative w-full max-w-4xl bg-white border border-slate-200 shadow-2xl overflow-hidden my-8 print:my-0 print:border-none print:shadow-none">
              
              {/* Modal Top Bar (Hidden on print) */}
              <div className="p-4 bg-slate-900 text-white flex items-center justify-between print:hidden">
                <div className="flex items-center gap-2">
                  <Receipt className="h-5 w-5 text-emerald-400" />
                  <span className="font-bold text-xs uppercase tracking-wider">
                    Fatura Oficial ARKNET — #{viewInvoiceOrder.orderNumber}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider rounded flex items-center gap-1.5 transition"
                  >
                    <Printer className="h-4 w-4" />
                    <span>Imprimir / PDF</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewInvoiceOrder(null)}
                    className="p-2 text-slate-400 hover:text-white rounded transition"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Printable Invoice Container */}
              <div className="p-8 sm:p-12 text-slate-800 text-xs">
                
                {/* Header Documento Fiscal */}
                <div className="flex flex-col sm:flex-row justify-between items-start border-b-2 border-slate-900 pb-6 gap-6">
                  <div>
                    <Image
                      src={arknetLogo}
                      alt="ARKNET"
                      width={180}
                      height={60}
                      className="h-12 w-auto object-contain mb-3"
                    />
                    <p className="text-xs font-black uppercase text-slate-900">
                      ARKNET — Soluções Tecnológicas & Telecomunicações Lda.
                    </p>
                    <p className="text-slate-500">NIF: 5412398760 • Kilamba, Luanda - Angola</p>
                    <p className="text-slate-500">Email: comercial@arknet.co.ao • Tel: +244 935 208 449</p>
                  </div>

                  <div className="sm:text-right bg-slate-50 p-4 border border-slate-200 rounded sm:min-w-[260px]">
                    <div className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 rounded mb-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-700" />
                      <span>Fatura Aprovada & Emitida</span>
                    </div>
                    <h2 className="text-xl font-black text-slate-900 font-mono">
                      {viewInvoiceOrder.orderNumber}
                    </h2>
                    <p className="text-slate-500 mt-1">
                      Data de Emissão: {new Date(viewInvoiceOrder.confirmedAt || viewInvoiceOrder.createdAt).toLocaleDateString('pt-AO', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                    <p className="text-slate-700 font-semibold mt-0.5">
                      Estado: <span className="text-emerald-700 uppercase font-bold">Liquidado / Aprovado</span>
                    </p>
                  </div>
                </div>

                {/* Selo / Carimbo de Aprovação do Administrador */}
                <div className="my-6 p-4 bg-emerald-50/70 border-2 border-dashed border-emerald-400 rounded flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-black">
                      ✓
                    </div>
                    <div>
                      <p className="font-black text-emerald-950 uppercase text-[11px] tracking-wider">
                        Documento Validado & Autorizado pelo Administrador
                      </p>
                      <p className="text-[11px] text-emerald-800">
                        Pagamento conferido com sucesso. Equipamentos prontos para levantamento / entrega.
                      </p>
                    </div>
                  </div>
                  <span className="font-mono text-[11px] font-bold text-emerald-900 bg-white px-3 py-1 border border-emerald-200 rounded">
                    AUTORIZAÇÃO: {viewInvoiceOrder.orderNumber}-AUTH
                  </span>
                </div>

                {/* Dados do Cliente & Entrega */}
                <div className="grid sm:grid-cols-2 gap-6 my-6 p-5 bg-slate-50 border border-slate-200">
                  <div>
                    <h3 className="font-black text-slate-900 uppercase tracking-wider mb-2 text-[11px] text-primary">
                      Dados de Faturação (Cliente):
                    </h3>
                    <p className="font-bold text-slate-900 text-sm">{viewInvoiceOrder.customerName}</p>
                    {viewInvoiceOrder.customerCompany && (
                      <p className="text-slate-700">Empresa: <strong>{viewInvoiceOrder.customerCompany}</strong></p>
                    )}
                    {viewInvoiceOrder.customerNif && (
                      <p className="text-slate-700">NIF: <strong className="font-mono">{viewInvoiceOrder.customerNif}</strong></p>
                    )}
                    <p className="text-slate-600">Email: {viewInvoiceOrder.customerEmail}</p>
                    <p className="text-slate-600">Telefone: {viewInvoiceOrder.customerPhone}</p>
                  </div>

                  <div>
                    <h3 className="font-black text-slate-900 uppercase tracking-wider mb-2 text-[11px] text-primary">
                      Local de Entrega & Pagamento:
                    </h3>
                    <p className="text-slate-800 font-semibold">{viewInvoiceOrder.customerAddress || 'A combinar com o cliente'}</p>
                    <p className="text-slate-600">{viewInvoiceOrder.customerCity || 'Luanda'}, Angola</p>
                    <p className="text-slate-700 mt-2">
                      Método de Pagamento:{' '}
                      <strong className="text-slate-900 uppercase">
                        {viewInvoiceOrder.paymentMethod || 'Transferência Bancária / MCX'}
                      </strong>
                    </p>
                  </div>
                </div>

                {/* Tabela de Itens */}
                <div className="my-6 overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b-2 border-slate-900 bg-slate-100 text-slate-800 uppercase tracking-wider font-bold">
                        <th className="py-3 px-3">Item / Equipamento</th>
                        <th className="py-3 px-3 text-center">Qtd</th>
                        <th className="py-3 px-3 text-right">Preço Unitário</th>
                        <th className="py-3 px-3 text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {viewInvoiceOrder.items.map((item, idx) => (
                        <tr key={idx}>
                          <td className="py-3 px-3">
                            <p className="font-bold text-slate-900">{item.productName}</p>
                            <p className="text-[10px] text-slate-400 font-mono">Código: {item.productId}</p>
                          </td>
                          <td className="py-3 px-3 text-center font-bold font-mono">{item.quantity}</td>
                          <td className="py-3 px-3 text-right font-mono">
                            {item.price === null ? 'Sob consulta' : formatProdutoPrice(item.price)}
                          </td>
                          <td className="py-3 px-3 text-right font-bold text-slate-900 font-mono">
                            {formatLinhaPreco(item.price, item.quantity)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Totais */}
                <div className="flex justify-end my-6 border-t border-slate-200 pt-4">
                  <div className="w-full sm:w-72 space-y-2 text-xs">
                    <div className="flex justify-between text-slate-600">
                      <span>Subtotal Equipamentos:</span>
                      <span className="font-semibold font-mono">
                        {viewInvoiceOrder.total === null ? 'Sob consulta' : formatProdutoPrice(viewInvoiceOrder.total)}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Taxa de IVA (14% Incluso):</span>
                      <span>Regime Geral</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Custo de Envio:</span>
                      <span className="text-emerald-700 font-bold">Grátis</span>
                    </div>
                    <div className="flex justify-between text-base font-black text-slate-900 border-t-2 border-slate-900 pt-2">
                      <span>Total Liquidado:</span>
                      <span className="font-mono">
                        {viewInvoiceOrder.total === null ? 'Sob consulta' : formatProdutoPrice(viewInvoiceOrder.total)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Termos & Rodapé Fiscal */}
                <div className="mt-8 pt-6 border-t border-slate-200 text-[10px] text-slate-500 flex flex-col sm:flex-row justify-between items-center gap-4">
                  <p>
                    Documento processado por computador • ARKNET Soluções Tecnológicas Lda. • Garantia oficial de hardware.
                  </p>
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="px-5 py-2.5 bg-slate-900 text-white font-bold text-xs uppercase rounded hover:bg-primary transition print:hidden"
                  >
                    Imprimir / Guardar Fatura PDF
                  </button>
                </div>

              </div>
            </div>
          </div>
        )}

      </div>
    </main>
  )
}
