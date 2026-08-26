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
} from 'lucide-react'
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
  }, [customer, isLoading, router])

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
    logout()
    router.push('/')
  }

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

  const getOrderStatusBadge = (status: StoreOrder['status']) => {
    switch (status) {
      case 'novo':
        return <span className="px-2.5 py-1 text-[10px] font-bold uppercase bg-blue-50 text-primary rounded-full">Novo Pedido</span>
      case 'em_contacto':
        return <span className="px-2.5 py-1 text-[10px] font-bold uppercase bg-amber-100 text-amber-800 rounded-full">Em Processamento</span>
      case 'fechado':
        return <span className="px-2.5 py-1 text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 rounded-full">Concluído / Entregue</span>
      case 'cancelado':
        return <span className="px-2.5 py-1 text-[10px] font-bold uppercase bg-slate-100 text-slate-600 rounded-full">Cancelado</span>
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
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Histórico de Pedidos na Loja</h3>
                <p className="text-xs text-slate-500 mt-0.5">Todas as compras realizadas com este endereço de email.</p>
              </div>
              <Link
                href="/loja"
                className="px-4 py-2 bg-secondary text-white text-xs font-bold uppercase hover:bg-secondary/90 transition"
              >
                Fazer Novo Pedido
              </Link>
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
                {orders.map((order) => (
                  <div key={order.id} className="p-6 hover:bg-slate-50 transition">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                      <div>
                        <span className="font-mono text-xs font-bold text-primary mr-3">
                          #{order.orderNumber}
                        </span>
                        <span className="text-xs text-slate-400">
                          {new Date(order.createdAt).toLocaleDateString('pt-PT', { day: '2-digit', month: 'long', year: 'numeric' })}
                        </span>
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

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                      <span className="text-slate-500">Valor Total do Pedido:</span>
                      <span className="font-mono font-black text-sm text-slate-900">
                        {order.total ? formatProdutoPrice(order.total) : 'Sob Consulta'}
                      </span>
                    </div>
                  </div>
                ))}
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

      </div>
    </main>
  )
}
