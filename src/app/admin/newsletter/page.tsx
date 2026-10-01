'use client'

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import {
  Mail,
  Search,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  Users,
  X,
  Send,
  FileText,
  Clock,
  Eye,
  AlertCircle,
  Loader2,
  RefreshCw,
  Bold,
  Italic,
  List,
  Link2,
  Type,
  AlignLeft,
} from 'lucide-react'
import { dataStore, NewsletterSubscriber } from '@/lib/data-store'
import { useToast } from '@/lib/toast-context'
import { ConfirmModal } from '@/components/admin/confirm-modal'
import { ExportButton } from '@/components/admin/export-button'
import { exportToCSV } from '@/lib/export-utils'

type Tab = 'subscritores' | 'compor' | 'historico'

interface Campaign {
  id: string
  subject: string
  body: string
  recipientCount: number
  successCount: number
  failCount: number
  status: string
  sentBy: string | null
  sentAt: string | null
  createdAt: string
}

export default function AdminNewsletterPage() {
  const { success, error, info } = useToast()

  const [activeTab, setActiveTab] = useState<Tab>('subscritores')
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')

  // Modal Novo Subscritor
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newEmail, setNewEmail] = useState('')

  // Delete Modal
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  // Compor Newsletter
  const [nlSubject, setNlSubject] = useState('')
  const [nlBody, setNlBody] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [isSendingTest, setIsSendingTest] = useState(false)
  const [testEmail, setTestEmail] = useState('')
  const [showPreview, setShowPreview] = useState(false)
  const [showTestInput, setShowTestInput] = useState(false)
  const [sendConfirmOpen, setSendConfirmOpen] = useState(false)

  // Historico
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [isLoadingCampaigns, setIsLoadingCampaigns] = useState(false)
  const [expandedCampaign, setExpandedCampaign] = useState<string | null>(null)

  // Subscritores State
  const [isLoadingSubscribers, setIsLoadingSubscribers] = useState(false)

  const loadSubscribers = useCallback(async () => {
    setIsLoadingSubscribers(true)
    try {
      await dataStore.syncWithServer().catch(() => undefined)
      const token = typeof window !== 'undefined' ? localStorage.getItem('arknet_admin_token') : null
      const headers: Record<string, string> = {}
      if (token) headers['Authorization'] = `Bearer ${token}`

      const res = await fetch('/api/newsletter/subscribers', { headers, credentials: 'include' })
      const data = await res.json()
      if (data.success && Array.isArray(data.subscribers)) {
        setSubscribers(data.subscribers)
      } else {
        const db = dataStore.getSnapshot()
        setSubscribers([...(db.subscribers || [])].sort((a, b) => new Date(b.subscribedAt).getTime() - new Date(a.subscribedAt).getTime()))
      }
    } catch {
      const db = dataStore.getSnapshot()
      setSubscribers([...(db.subscribers || [])].sort((a, b) => new Date(b.subscribedAt).getTime() - new Date(a.subscribedAt).getTime()))
    } finally {
      setIsLoadingSubscribers(false)
    }
  }, [])

  useEffect(() => {
    loadSubscribers()
    const sync = () => {
      loadSubscribers()
    }
    const unsub = dataStore.subscribe(sync)
    return () => unsub()
  }, [loadSubscribers])

  const filteredSubscribers = useMemo(() => {
    return subscribers.filter((sub) => {
      const matchSearch = sub.email.toLowerCase().includes(searchTerm.toLowerCase())
      const matchStatus = statusFilter === 'all' || sub.status === statusFilter
      return matchSearch && matchStatus
    })
  }, [subscribers, searchTerm, statusFilter])

  const activeCount = subscribers.filter((s) => s.status === 'active').length

  // --- Handlers Subscritores ---
  const handleAddSubscriber = async (e: React.FormEvent) => {
    e.preventDefault()
    const emailToAdd = newEmail.trim()
    if (!emailToAdd) return

    try {
      const res = await fetch('/api/newsletter/subscribers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailToAdd, sendWelcome: true }),
      })
      const data = await res.json()
      if (data.success) {
        dataStore.addSubscriber(emailToAdd)
        await loadSubscribers()
        success('Subscritor adicionado e email de boas-vindas enviado!', 'Subscritor Adicionado')
        setIsModalOpen(false)
        setNewEmail('')
      } else {
        error(data.message || 'Erro ao adicionar subscritor.', 'Erro na Subscrição')
      }
    } catch {
      dataStore.addSubscriber(emailToAdd)
      await loadSubscribers()
      success('Subscritor adicionado!', 'Subscritor Adicionado')
      setIsModalOpen(false)
      setNewEmail('')
    }
  }

  const handleToggleStatus = async (sub: NewsletterSubscriber) => {
    const nextStatus = sub.status === 'active' ? 'inactive' : 'active'
    try {
      const token = getAdminToken()
      await fetch('/api/newsletter/subscribers', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ id: sub.id, status: nextStatus }),
      })
    } catch {
      // continua
    }
    dataStore.updateSubscriberStatus(sub.id, nextStatus)
    await loadSubscribers()
    info(`Estado do subscritor "${sub.email}" alterado para ${nextStatus === 'active' ? 'Ativo' : 'Inativo'}.`)
  }

  const handleDeleteConfirm = async () => {
    if (deletingId) {
      try {
        const token = getAdminToken()
        await fetch(`/api/newsletter/subscribers?id=${deletingId}`, {
          method: 'DELETE',
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        })
      } catch {
        // continua
      }
      dataStore.deleteSubscriber(deletingId)
      await loadSubscribers()
      success('Subscritor removido da lista.', 'Subscritor Eliminado')
      setIsDeleteModalOpen(false)
      setDeletingId(null)
    }
  }

  const handleExportCSV = () => {
    exportToCSV(
      filteredSubscribers,
      'ARKNET_Newsletter_Subscritores',
      [
        { key: 'email', header: 'Endereco de Email' },
        { key: 'status', header: 'Estado', format: (st) => (st === 'active' ? 'Ativo' : 'Inativo') },
        { key: 'subscribedAt', header: 'Data de Subscricao', format: (val) => new Date(val).toLocaleString('pt-PT') },
      ]
    )
  }

  // --- Handlers Compor Newsletter ---
  const getAdminToken = () => {
    const cookies = document.cookie.split(';')
    for (const c of cookies) {
      const [key, val] = c.trim().split('=')
      if (key === 'arknet_admin_token') return val
    }
    return null
  }

  const insertMarkup = (tag: string) => {
    const textarea = document.getElementById('nl-body-editor') as HTMLTextAreaElement
    if (!textarea) return
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selected = nlBody.substring(start, end)

    let replacement = ''
    switch (tag) {
      case 'bold':
        replacement = `<strong>${selected || 'texto'}</strong>`
        break
      case 'italic':
        replacement = `<em>${selected || 'texto'}</em>`
        break
      case 'heading':
        replacement = `<h2 style="font-size:18px; font-weight:700; color:#0f172a; margin:16px 0 8px 0;">${selected || 'Titulo'}</h2>`
        break
      case 'paragraph':
        replacement = `<p style="margin:0 0 12px 0;">${selected || 'Paragrafo...'}</p>`
        break
      case 'list':
        replacement = `<ul style="padding-left:20px; margin:8px 0;">
  <li>${selected || 'Item 1'}</li>
  <li>Item 2</li>
  <li>Item 3</li>
</ul>`
        break
      case 'link':
        replacement = `<a href="https://arknet.co.ao" style="color:#0284c7; text-decoration:underline;">${selected || 'Clique aqui'}</a>`
        break
      case 'divider':
        replacement = `<hr style="border:none; border-top:1px solid #e2e8f0; margin:20px 0;" />`
        break
      default:
        return
    }

    const newBody = nlBody.substring(0, start) + replacement + nlBody.substring(end)
    setNlBody(newBody)
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + replacement.length, start + replacement.length)
    }, 50)
  }

  const handleSendTest = async () => {
    if (!testEmail.trim() || !nlSubject.trim() || !nlBody.trim()) {
      error('Preencha o assunto, conteudo e email de teste.', 'Campos Obrigatorios')
      return
    }

    setIsSendingTest(true)
    try {
      const token = getAdminToken()
      const res = await fetch('/api/newsletter/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          subject: nlSubject.trim(),
          htmlBody: nlBody.trim(),
          testEmail: testEmail.trim(),
        }),
      })

      const data = await res.json()
      if (data.success) {
        success(data.message, 'Email de Teste Enviado')
      } else {
        error(data.message, 'Falha no Envio de Teste')
      }
    } catch (err: any) {
      error('Erro ao enviar email de teste.', 'Erro')
    } finally {
      setIsSendingTest(false)
    }
  }

  const handleSendNewsletter = async () => {
    setSendConfirmOpen(false)
    if (!nlSubject.trim() || !nlBody.trim()) {
      error('Preencha o assunto e o conteudo da newsletter.', 'Campos Obrigatorios')
      return
    }

    setIsSending(true)
    try {
      const token = getAdminToken()
      const res = await fetch('/api/newsletter/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          subject: nlSubject.trim(),
          htmlBody: nlBody.trim(),
        }),
      })

      const data = await res.json()
      if (data.success) {
        success(data.message, 'Newsletter Enviada')
        setNlSubject('')
        setNlBody('')
        setShowPreview(false)
        // Reload campaigns
        loadCampaigns()
      } else {
        error(data.message, 'Falha no Envio')
      }
    } catch (err: any) {
      error('Erro ao enviar newsletter.', 'Erro')
    } finally {
      setIsSending(false)
    }
  }

  // --- Handlers Historico ---
  const loadCampaigns = useCallback(async () => {
    setIsLoadingCampaigns(true)
    try {
      const token = getAdminToken()
      const res = await fetch('/api/newsletter/send', {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      })
      const data = await res.json()
      if (data.success && data.campaigns) {
        setCampaigns(data.campaigns)
      }
    } catch {
      // Silencioso
    } finally {
      setIsLoadingCampaigns(false)
    }
  }, [])

  useEffect(() => {
    if (activeTab === 'historico') {
      loadCampaigns()
    }
  }, [activeTab, loadCampaigns])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'enviada':
        return { label: 'Enviada', cls: 'bg-emerald-100 text-emerald-800' }
      case 'a_enviar':
        return { label: 'A enviar...', cls: 'bg-amber-100 text-amber-800 animate-pulse' }
      case 'erro':
        return { label: 'Erro', cls: 'bg-rose-100 text-rose-800' }
      case 'rascunho':
        return { label: 'Rascunho', cls: 'bg-slate-100 text-slate-600' }
      default:
        return { label: status, cls: 'bg-slate-100 text-slate-600' }
    }
  }

  // Converte corpo simples em HTML paragrafos se necessario
  const bodyToHtml = (body: string) => {
    if (body.includes('<') && body.includes('>')) return body
    return body
      .split('\n')
      .filter((l) => l.trim())
      .map((l) => `<p style="margin:0 0 12px 0;">${l}</p>`)
      .join('\n')
  }

  const tabs: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: 'subscritores', label: 'Subscritores', icon: Users },
    { key: 'compor', label: 'Compor Newsletter', icon: FileText },
    { key: 'historico', label: 'Historico de Envios', icon: Clock },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2 mb-1">
          <Mail className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-extrabold text-slate-900">Newsletter ARKNET</h1>
        </div>
        <p className="text-xs text-slate-500">
          Gestao completa de subscritores, composicao e envio de newsletters para a base de contactos.
        </p>
      </div>

      {/* Tabs */}
      <div className="bg-white border border-slate-200 shadow-xs overflow-hidden">
        <div className="flex border-b border-slate-200">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.key
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-6 py-3.5 text-xs font-bold uppercase tracking-wider transition-all border-b-2 ${
                  isActive
                    ? 'border-primary text-primary bg-primary/5'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
                {tab.key === 'subscritores' && (
                  <span className="ml-1 px-1.5 py-0.5 text-[10px] font-bold bg-slate-100 text-slate-600 rounded-full">
                    {activeCount}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* ============================================ */}
        {/* TAB: SUBSCRITORES */}
        {/* ============================================ */}
        {activeTab === 'subscritores' && (
          <div className="p-6 space-y-5">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-slate-50 border border-slate-200 p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase text-slate-400">Total Registados</p>
                  <p className="text-2xl font-extrabold text-slate-900 mt-1">{subscribers.length}</p>
                </div>
                <div className="p-3 bg-primary/10 text-primary rounded-lg">
                  <Users className="h-5 w-5" />
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase text-slate-400">Subscritores Ativos</p>
                  <p className="text-2xl font-extrabold text-emerald-600 mt-1">{activeCount}</p>
                </div>
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase text-slate-400">Inativos / Cancelados</p>
                  <p className="text-2xl font-extrabold text-slate-500 mt-1">{subscribers.length - activeCount}</p>
                </div>
                <div className="p-3 bg-slate-100 text-slate-600 rounded-lg">
                  <XCircle className="h-5 w-5" />
                </div>
              </div>
            </div>

            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Pesquisar por endereco de email..."
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:bg-white focus:border-primary focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="px-3 py-2 bg-slate-50 border border-slate-300 text-xs text-slate-700 focus:bg-white focus:border-primary focus:outline-none"
                >
                  <option value="all">Todos os Subscritores</option>
                  <option value="active">Apenas Ativos</option>
                  <option value="inactive">Apenas Inativos</option>
                </select>
                <button
                  type="button"
                  onClick={() => loadSubscribers()}
                  disabled={isLoadingSubscribers}
                  title="Atualizar lista"
                  className="p-2 border border-slate-300 text-slate-600 hover:text-primary hover:border-primary transition bg-white"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${isLoadingSubscribers ? 'animate-spin' : ''}`} />
                </button>
                <ExportButton onExport={handleExportCSV} label="Exportar CSV" />
                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-secondary text-white text-xs font-bold uppercase tracking-wider hover:bg-secondary/90 transition shadow-sm"
                >
                  <Plus className="h-4 w-4" />
                  Adicionar
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase tracking-wider font-bold text-[11px]">
                    <tr>
                      <th className="py-3.5 px-6">Email</th>
                      <th className="py-3.5 px-4 text-center">Estado</th>
                      <th className="py-3.5 px-4">Data de Subscricao</th>
                      <th className="py-3.5 px-6 text-right">Acoes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredSubscribers.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-12 text-center text-slate-400">
                          Nenhum subscritor encontrado.
                        </td>
                      </tr>
                    ) : (
                      filteredSubscribers.map((sub) => (
                        <tr key={sub.id} className="hover:bg-slate-50/80 transition group">
                          <td className="py-3.5 px-6 font-mono font-semibold text-slate-900 group-hover:text-primary transition">
                            {sub.email}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <button
                              type="button"
                              onClick={() => handleToggleStatus(sub)}
                              className={`inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-extrabold uppercase rounded-full transition ${
                                sub.status === 'active'
                                  ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                              }`}
                              title="Clique para alternar estado"
                            >
                              {sub.status === 'active' ? (
                                <>
                                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                                  Ativo
                                </>
                              ) : (
                                <>
                                  <XCircle className="h-3.5 w-3.5 text-slate-400" />
                                  Inativo
                                </>
                              )}
                            </button>
                          </td>
                          <td className="py-3.5 px-4 text-slate-400">
                            {new Date(sub.subscribedAt).toLocaleDateString('pt-PT')}{' '}
                            <span className="text-[10px]">
                              {new Date(sub.subscribedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </td>
                          <td className="py-3.5 px-6 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <a
                                href={`mailto:${sub.email}`}
                                className="p-1.5 text-slate-400 hover:text-primary hover:bg-slate-100 transition rounded"
                                title="Enviar email direto"
                              >
                                <Send className="h-4 w-4" />
                              </a>
                              <button
                                type="button"
                                onClick={() => {
                                  setDeletingId(sub.id)
                                  setIsDeleteModalOpen(true)
                                }}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition rounded"
                                title="Remover subscritor"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ============================================ */}
        {/* TAB: COMPOR NEWSLETTER */}
        {/* ============================================ */}
        {activeTab === 'compor' && (
          <div className="p-6 space-y-5">
            {/* Info Banner */}
            <div className="flex items-start gap-3 bg-sky-50 border border-sky-200 p-4">
              <Mail className="h-5 w-5 text-sky-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-bold text-sky-900">
                  A newsletter sera enviada para {activeCount} subscritor{activeCount !== 1 ? 'es' : ''} ativo{activeCount !== 1 ? 's' : ''}.
                </p>
                <p className="text-[11px] text-sky-700 mt-0.5">
                  Pode enviar um email de teste antes de disparar para todos. O envio e feito sequencialmente com intervalo de 1.5s entre emails.
                </p>
              </div>
            </div>

            {/* Formulario */}
            <div className="space-y-4">
              {/* Assunto */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Assunto da Newsletter *
                </label>
                <input
                  type="text"
                  value={nlSubject}
                  onChange={(e) => setNlSubject(e.target.value)}
                  placeholder="Ex: Novos produtos e servicos ARKNET - Outubro 2026"
                  className="w-full px-4 py-3 text-sm border border-slate-300 focus:border-primary focus:outline-none bg-white"
                  maxLength={200}
                />
                <p className="text-[10px] text-slate-400 mt-1">{nlSubject.length}/200 caracteres</p>
              </div>

              {/* Editor Toolbar */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Conteudo da Newsletter (HTML) *
                </label>
                <div className="flex items-center gap-1 px-2 py-1.5 bg-slate-100 border border-slate-300 border-b-0">
                  <button
                    type="button"
                    onClick={() => insertMarkup('heading')}
                    className="p-1.5 text-slate-500 hover:text-primary hover:bg-white rounded transition"
                    title="Titulo"
                  >
                    <Type className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertMarkup('bold')}
                    className="p-1.5 text-slate-500 hover:text-primary hover:bg-white rounded transition"
                    title="Negrito"
                  >
                    <Bold className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertMarkup('italic')}
                    className="p-1.5 text-slate-500 hover:text-primary hover:bg-white rounded transition"
                    title="Italico"
                  >
                    <Italic className="h-4 w-4" />
                  </button>
                  <div className="w-px h-5 bg-slate-300 mx-1" />
                  <button
                    type="button"
                    onClick={() => insertMarkup('paragraph')}
                    className="p-1.5 text-slate-500 hover:text-primary hover:bg-white rounded transition"
                    title="Paragrafo"
                  >
                    <AlignLeft className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertMarkup('list')}
                    className="p-1.5 text-slate-500 hover:text-primary hover:bg-white rounded transition"
                    title="Lista"
                  >
                    <List className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertMarkup('link')}
                    className="p-1.5 text-slate-500 hover:text-primary hover:bg-white rounded transition"
                    title="Link"
                  >
                    <Link2 className="h-4 w-4" />
                  </button>
                  <div className="w-px h-5 bg-slate-300 mx-1" />
                  <button
                    type="button"
                    onClick={() => setShowPreview(!showPreview)}
                    className={`flex items-center gap-1 px-2 py-1 text-[10px] font-bold uppercase rounded transition ${
                      showPreview ? 'bg-primary text-white' : 'text-slate-500 hover:text-primary hover:bg-white'
                    }`}
                  >
                    <Eye className="h-3.5 w-3.5" />
                    Pre-visualizar
                  </button>
                </div>

                {showPreview ? (
                  <div className="border border-slate-300 bg-white p-6 min-h-[300px] overflow-auto">
                    <div
                      className="prose prose-sm max-w-none text-slate-700"
                      dangerouslySetInnerHTML={{ __html: bodyToHtml(nlBody) || '<p style="color:#94a3b8;">Comece a escrever o conteudo acima para ver a pre-visualizacao aqui.</p>' }}
                    />
                  </div>
                ) : (
                  <textarea
                    id="nl-body-editor"
                    value={nlBody}
                    onChange={(e) => setNlBody(e.target.value)}
                    placeholder={`Escreva o conteudo da newsletter aqui...\n\nPode usar HTML basico:\n<p>Paragrafo de texto</p>\n<strong>Texto a negrito</strong>\n<ul><li>Item da lista</li></ul>\n\nOu utilize os botoes da barra acima para inserir formatacao.`}
                    className="w-full px-4 py-3 text-sm border border-slate-300 focus:border-primary focus:outline-none bg-white font-mono min-h-[300px] resize-y"
                  />
                )}
              </div>
            </div>

            {/* Acoes e Envio de Teste */}
            <div className="pt-4 border-t border-slate-200 space-y-4">
              {/* Card de Teste */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-none flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-primary" />
                    Enviar Email de Teste Imediato
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Insira o seu endereço pessoal para receber uma cópia de teste antes do disparo oficial.
                  </p>
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                  <input
                    type="email"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    placeholder="seu.email@exemplo.com"
                    className="flex-1 md:w-64 px-3 py-2 text-xs border border-slate-300 focus:border-primary focus:outline-none bg-white"
                  />
                  <button
                    type="button"
                    onClick={handleSendTest}
                    disabled={isSendingTest || !testEmail.trim() || !nlSubject.trim() || !nlBody.trim()}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold uppercase tracking-wider bg-slate-800 text-white hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition shrink-0"
                  >
                    {isSendingTest ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                    Enviar Teste
                  </button>
                </div>
              </div>

              {/* Botao Enviar para Todos */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
                <div className="text-xs text-slate-500">
                  Total de destinatários ativos: <strong className="text-slate-800 font-semibold">{activeCount}</strong>
                </div>

                <button
                  type="button"
                  onClick={() => setSendConfirmOpen(true)}
                  disabled={isSending || !nlSubject.trim() || !nlBody.trim() || activeCount === 0}
                  className="inline-flex items-center justify-center gap-2 px-6 py-2.5 text-xs font-bold uppercase tracking-wider bg-primary text-white hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm"
                >
                  {isSending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      A enviar para {activeCount} subscritores...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Enviar Newsletter Oficial ({activeCount} destinatários)
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ============================================ */}
        {/* TAB: HISTORICO */}
        {/* ============================================ */}
        {activeTab === 'historico' && (
          <div className="p-6 space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-500">Ultimas newsletters enviadas pelo painel de administracao.</p>
              <button
                type="button"
                onClick={loadCampaigns}
                disabled={isLoadingCampaigns}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase text-slate-600 bg-slate-100 hover:bg-slate-200 transition"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isLoadingCampaigns ? 'animate-spin' : ''}`} />
                Atualizar
              </button>
            </div>

            {isLoadingCampaigns ? (
              <div className="flex items-center justify-center py-16 text-slate-400">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                A carregar historico...
              </div>
            ) : campaigns.length === 0 ? (
              <div className="text-center py-16 text-slate-400">
                <Clock className="h-10 w-10 mx-auto mb-3 text-slate-300" />
                <p className="text-sm font-semibold text-slate-500">Nenhuma newsletter enviada ainda</p>
                <p className="text-xs mt-1">Comece por compor e enviar a primeira newsletter na aba &quot;Compor Newsletter&quot;.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {campaigns.map((c) => {
                  const badge = getStatusBadge(c.status)
                  const isExpanded = expandedCampaign === c.id
                  return (
                    <div key={c.id} className="border border-slate-200 bg-white overflow-hidden transition hover:border-slate-300">
                      {/* Campaign Row */}
                      <button
                        type="button"
                        onClick={() => setExpandedCampaign(isExpanded ? null : c.id)}
                        className="w-full flex items-center gap-4 p-4 text-left hover:bg-slate-50 transition"
                      >
                        <div className="p-2 bg-primary/10 text-primary rounded shrink-0">
                          <Mail className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-slate-900 truncate">{c.subject}</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            {c.sentAt ? new Date(c.sentAt).toLocaleString('pt-PT') : new Date(c.createdAt).toLocaleString('pt-PT')}
                            {c.sentBy && ` · por ${c.sentBy}`}
                          </p>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <div className="text-right">
                            <p className="text-xs font-bold text-slate-700">
                              {c.successCount}/{c.recipientCount}
                            </p>
                            <p className="text-[10px] text-slate-400">entregues</p>
                          </div>
                          <span className={`inline-flex items-center px-2.5 py-1 text-[10px] font-extrabold uppercase rounded-full ${badge.cls}`}>
                            {badge.label}
                          </span>
                        </div>
                      </button>

                      {/* Expanded Details */}
                      {isExpanded && (
                        <div className="border-t border-slate-100 p-4 bg-slate-50">
                          <div className="grid grid-cols-3 gap-4 mb-4">
                            <div className="text-center p-3 bg-white border border-slate-200">
                              <p className="text-lg font-extrabold text-slate-900">{c.recipientCount}</p>
                              <p className="text-[10px] uppercase text-slate-400 font-bold">Destinatarios</p>
                            </div>
                            <div className="text-center p-3 bg-white border border-slate-200">
                              <p className="text-lg font-extrabold text-emerald-600">{c.successCount}</p>
                              <p className="text-[10px] uppercase text-slate-400 font-bold">Entregues</p>
                            </div>
                            <div className="text-center p-3 bg-white border border-slate-200">
                              <p className="text-lg font-extrabold text-rose-600">{c.failCount}</p>
                              <p className="text-[10px] uppercase text-slate-400 font-bold">Falhados</p>
                            </div>
                          </div>
                          <div>
                            <p className="text-[10px] font-bold uppercase text-slate-500 mb-2">Pre-visualizacao do conteudo:</p>
                            <div
                              className="bg-white border border-slate-200 p-4 text-xs text-slate-600 max-h-48 overflow-auto prose prose-sm"
                              dangerouslySetInnerHTML={{ __html: c.body }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal Adicionar Subscritor Manualmente */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          />
          <div className="relative w-full max-w-md bg-white border border-slate-200 shadow-2xl overflow-hidden z-10">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-primary/10 text-primary rounded">
                  <Mail className="h-5 w-5" />
                </div>
                <h3 className="text-base font-extrabold text-slate-900">Novo Subscritor</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleAddSubscriber} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Endereco de Email *
                </label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="cliente@empresa.ao"
                  className="w-full px-4 py-2.5 text-sm border border-slate-300 focus:border-primary focus:outline-none"
                />
              </div>
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 uppercase"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 text-xs font-bold text-white bg-primary hover:bg-primary/90 uppercase shadow-sm"
                >
                  Adicionar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Remover Subscritor"
        message="Tem a certeza que deseja remover este email da lista de subscritores da newsletter?"
        confirmText="Sim, Remover"
        cancelText="Cancelar"
      />

      {/* Send Confirm Modal */}
      <ConfirmModal
        isOpen={sendConfirmOpen}
        onClose={() => setSendConfirmOpen(false)}
        onConfirm={handleSendNewsletter}
        title="Confirmar Envio de Newsletter"
        message={`Tem a certeza que deseja enviar esta newsletter para ${activeCount} subscritor${activeCount !== 1 ? 'es' : ''} ativo${activeCount !== 1 ? 's' : ''}? Esta acao nao pode ser revertida.`}
        confirmText="Sim, Enviar Agora"
        cancelText="Cancelar"
      />
    </div>
  )
}
