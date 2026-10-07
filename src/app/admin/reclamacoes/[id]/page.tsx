'use client'

import React, { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  LifeBuoy,
  AlertCircle,
  FileText,
  CheckCircle2,
  Clock,
  Send,
  Loader2,
  User,
  Mail,
  Phone,
  MessageSquare,
  Lock,
  ExternalLink,
  Trash2,
  ShieldCheck,
  Copy,
  Check,
  Building2,
  ShoppingCart,
  Calendar,
  Sparkles,
  ChevronRight,
  ShieldAlert,
  Archive,
} from 'lucide-react'
import { FaWhatsapp } from 'react-icons/fa'
import { useToast } from '@/lib/toast-context'
import {
  TicketItem,
  TicketStatus,
  TicketPriority,
  TicketReplyChannel,
  TICKET_TYPE_CONFIG,
  TICKET_CATEGORY_CONFIG,
  TICKET_STATUS_CONFIG,
  TICKET_PRIORITY_CONFIG,
} from '@/lib/tickets/types'

interface PageProps {
  params: Promise<{ id: string }>
}

export default function AdminTicketDetailPage({ params }: PageProps) {
  const { id } = use(params)
  const router = useRouter()
  const { success, error, info } = useToast()

  const [ticket, setTicket] = useState<TicketItem | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasCopiedProtocol, setHasCopiedProtocol] = useState(false)

  // Reply form state
  const [replyContent, setReplyContent] = useState('')
  const [replyChannel, setReplyChannel] = useState<TicketReplyChannel>('EMAIL')
  const [sendWhatsAppCopy, setSendWhatsAppCopy] = useState(true)
  const [isSendingReply, setIsSendingReply] = useState(false)

  // Note form state
  const [noteContent, setNoteContent] = useState('')
  const [isAddingNote, setIsAddingNote] = useState(false)

  // Status/Priority update loading
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)

  // Modals state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isAnonymizeModalOpen, setIsAnonymizeModalOpen] = useState(false)

  const fetchTicket = async () => {
    try {
      const res = await fetch(`/api/admin/tickets/${id}`)
      if (!res.ok) {
        if (res.status === 404) {
          error('Ticket não encontrado.')
          router.push('/admin/reclamacoes')
          return
        }
        throw new Error('Erro ao carregar ticket.')
      }
      const data = await res.json()
      if (data.success && data.ticket) {
        setTicket(data.ticket)
      }
    } catch (err: any) {
      error(err.message || 'Erro ao carregar detalhes do ticket.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchTicket()
  }, [id])

  const handleCopyProtocol = () => {
    if (!ticket?.protocol) return
    navigator.clipboard.writeText(ticket.protocol)
    setHasCopiedProtocol(true)
    setTimeout(() => setHasCopiedProtocol(false), 3000)
  }

  const handleStatusChange = async (newStatus: TicketStatus) => {
    setIsUpdatingStatus(true)
    try {
      const res = await fetch(`/api/admin/tickets/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      const data = await res.json()
      if (data.success && data.ticket) {
        setTicket((prev) => (prev ? { ...prev, status: newStatus, resolvedAt: data.ticket.resolvedAt } : null))
        success(`Estado do ticket alterado para "${TICKET_STATUS_CONFIG[newStatus].label}".`)
      } else {
        throw new Error(data.message)
      }
    } catch (err: any) {
      error(err.message || 'Erro ao atualizar estado.')
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  const handlePriorityChange = async (newPriority: TicketPriority) => {
    setIsUpdatingStatus(true)
    try {
      const res = await fetch(`/api/admin/tickets/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priority: newPriority }),
      })
      const data = await res.json()
      if (data.success && data.ticket) {
        setTicket((prev) => (prev ? { ...prev, priority: newPriority } : null))
        success(`Prioridade alterada para "${TICKET_PRIORITY_CONFIG[newPriority].label}".`)
      } else {
        throw new Error(data.message)
      }
    } catch (err: any) {
      error(err.message || 'Erro ao atualizar prioridade.')
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!replyContent.trim() || replyContent.trim().length < 5) {
      error('A resposta deve conter no mínimo 5 caracteres.')
      return
    }

    setIsSendingReply(true)
    try {
      const res = await fetch(`/api/admin/tickets/${id}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: replyContent.trim(),
          channel: replyChannel,
          sendWhatsAppCopy: sendWhatsAppCopy && !!ticket?.phone,
        }),
      })

      const data = await res.json()
      if (data.success && data.reply) {
        setTicket((prev) =>
          prev
            ? {
                ...prev,
                status: 'RESPONDIDO',
                replies: [...(prev.replies || []), data.reply],
              }
            : null
        )
        setReplyContent('')
        success('Resposta enviada com sucesso ao cliente!')
      } else {
        throw new Error(data.message)
      }
    } catch (err: any) {
      error(err.message || 'Falha ao enviar resposta.')
    } finally {
      setIsSendingReply(false)
    }
  }

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!noteContent.trim() || noteContent.trim().length < 3) {
      error('A nota deve conter pelo menos 3 caracteres.')
      return
    }

    setIsAddingNote(true)
    try {
      const res = await fetch(`/api/admin/tickets/${id}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: noteContent.trim() }),
      })

      const data = await res.json()
      if (data.success && data.note) {
        setTicket((prev) =>
          prev
            ? {
                ...prev,
                notes: [data.note, ...(prev.notes || [])],
              }
            : null
        )
        setNoteContent('')
        success('Nota interna registada com sucesso!')
      } else {
        throw new Error(data.message)
      }
    } catch (err: any) {
      error(err.message || 'Erro ao adicionar nota.')
    } finally {
      setIsAddingNote(false)
    }
  }

  const handleAnonymize = async () => {
    try {
      const res = await fetch(`/api/admin/tickets/${id}?anonymize=true`, {
        method: 'DELETE',
      })
      const data = await res.json()
      if (data.success) {
        success('Dados pessoais do ticket foram anonimizados.')
        setIsAnonymizeModalOpen(false)
        fetchTicket()
      } else {
        throw new Error(data.message)
      }
    } catch (err: any) {
      error(err.message || 'Erro ao anonimizar.')
    }
  }

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/admin/tickets/${id}`, {
        method: 'DELETE',
      })
      const data = await res.json()
      if (data.success) {
        success('Ticket eliminado definitivamente.')
        router.push('/admin/reclamacoes')
      } else {
        throw new Error(data.message)
      }
    } catch (err: any) {
      error(err.message || 'Erro ao eliminar ticket.')
    }
  }

  const insertSnippet = (snippetText: string) => {
    setReplyContent((prev) => (prev ? `${prev}\n\n${snippetText}` : snippetText))
  }

  if (isLoading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center text-slate-400 space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="text-xs font-bold uppercase tracking-wider">A carregar detalhes do ticket...</span>
      </div>
    )
  }

  if (!ticket) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-sm font-bold text-slate-700">Ticket não encontrado.</p>
        <Link href="/admin/reclamacoes" className="text-xs text-primary font-bold hover:underline">
          Voltar à Lista de Reclamações
        </Link>
      </div>
    )
  }

  const typeCfg = TICKET_TYPE_CONFIG[ticket.type]
  const catCfg = (TICKET_CATEGORY_CONFIG as any)[ticket.category]
  const statusCfg = TICKET_STATUS_CONFIG[ticket.status]
  const priorityCfg = TICKET_PRIORITY_CONFIG[ticket.priority]

  const cleanPhoneForWhatsApp = ticket.phone ? ticket.phone.replace(/\D/g, '') : null
  const formattedWhatsAppUrl = cleanPhoneForWhatsApp
    ? `https://wa.me/${cleanPhoneForWhatsApp.startsWith('244') ? cleanPhoneForWhatsApp : `244${cleanPhoneForWhatsApp}`}`
    : null

  return (
    <div className="space-y-6 pb-20 max-w-7xl mx-auto">
      {/* Breadcrumb & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-2 text-xs">
          <Link
            href="/admin/reclamacoes"
            className="text-slate-500 hover:text-primary font-bold flex items-center gap-1 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Reclamações & Informações
          </Link>
          <span className="text-slate-300">/</span>
          <span className="font-mono font-bold text-slate-800">{ticket.protocol}</span>
        </div>

        {/* Quick status badge */}
        <div className="flex items-center gap-2">
          <span className={`px-2.5 py-1 rounded-full text-xs font-extrabold uppercase ${typeCfg.badgeColor}`}>
            {typeCfg.label}
          </span>
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${statusCfg.bgSoft} ${statusCfg.textColor} ${statusCfg.borderColor}`}
          >
            <span className={`w-2 h-2 rounded-full ${statusCfg.dotColor}`} />
            {statusCfg.label}
          </span>
        </div>
      </div>

      {/* Main Header Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight font-mono">
              {ticket.protocol}
            </h1>
            <button
              onClick={handleCopyProtocol}
              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition text-xs font-bold flex items-center gap-1 cursor-pointer"
              title="Copiar Protocolo"
            >
              {hasCopiedProtocol ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-600 text-[11px]">Copiado</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span className="text-[11px]">Copiar</span>
                </>
              )}
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-slate-500">
            <span>
              <strong>Categoria:</strong> {catCfg?.label || ticket.category}
            </span>
            <span>•</span>
            <span>
              <strong>Submetido em:</strong> {new Date(ticket.createdAt).toLocaleString('pt-AO')}
            </span>
            {ticket.resolvedAt && (
              <>
                <span>•</span>
                <span className="text-emerald-700 font-bold">
                  Resolvido em: {new Date(ticket.resolvedAt).toLocaleString('pt-AO')}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Status & Priority Selectors */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto bg-slate-50 p-3 rounded-xl border border-slate-200">
          {/* Status Dropdown */}
          <div className="flex-1 sm:flex-initial">
            <label className="block text-[10px] font-extrabold uppercase text-slate-400 mb-1">
              Alterar Estado
            </label>
            <select
              value={ticket.status}
              disabled={isUpdatingStatus}
              onChange={(e) => handleStatusChange(e.target.value as TicketStatus)}
              className="w-full sm:w-auto text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="NOVO">Novo / Pendente</option>
              <option value="EM_ANALISE">Em Análise</option>
              <option value="RESPONDIDO">Respondido</option>
              <option value="RESOLVIDO">Resolvido</option>
              <option value="ARQUIVADO">Arquivado</option>
            </select>
          </div>

          {/* Priority Dropdown */}
          <div className="flex-1 sm:flex-initial">
            <label className="block text-[10px] font-extrabold uppercase text-slate-400 mb-1">
              Prioridade
            </label>
            <select
              value={ticket.priority}
              disabled={isUpdatingStatus}
              onChange={(e) => handlePriorityChange(e.target.value as TicketPriority)}
              className="w-full sm:w-auto text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="ALTA">Alta</option>
              <option value="NORMAL">Normal</option>
              <option value="BAIXA">Baixa</option>
            </select>
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Ticket Content, Contact, Order & Timeline (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* 1. Original Submission Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                Mensagem Original Submetida
              </span>
              <span className="text-xs font-mono text-slate-400">
                {new Date(ticket.createdAt).toLocaleTimeString('pt-AO', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>

            <div>
              <h3 className="text-base font-black text-slate-900 mb-2">
                {ticket.subject}
              </h3>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
                {ticket.message}
              </div>
            </div>
          </div>

          {/* 2. Customer Contact & Details Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <User className="w-4 h-4 text-primary" />
              Dados do Contacto
            </h3>

            <div className="grid sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Nome do Utente</span>
                <span className="text-slate-900 font-bold text-sm mt-0.5 block">{ticket.name}</span>
                {ticket.customerRef?.company && (
                  <span className="text-slate-500 text-[11px] block mt-0.5">
                    Empresa: {ticket.customerRef.company}
                  </span>
                )}
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Correio Eletrónico</span>
                <a
                  href={`mailto:${ticket.email}`}
                  className="text-primary font-bold text-sm mt-0.5 block hover:underline truncate"
                >
                  {ticket.email}
                </a>
              </div>

              {ticket.phone && (
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Telefone</span>
                  <div className="flex items-center justify-between mt-0.5">
                    <a href={`tel:${ticket.phone}`} className="text-slate-900 font-mono font-bold hover:underline">
                      {ticket.phone}
                    </a>
                    {formattedWhatsAppUrl && (
                      <a
                        href={formattedWhatsAppUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-md hover:bg-green-100 transition"
                      >
                        <FaWhatsapp className="w-3.5 h-3.5 text-green-600" />
                        WhatsApp
                      </a>
                    )}
                  </div>
                </div>
              )}

              {ticket.orderNumber && (
                <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-200">
                  <span className="text-blue-600 text-[10px] uppercase font-bold block">Nº de Encomenda</span>
                  <div className="flex items-center justify-between mt-0.5">
                    <span className="text-slate-900 font-mono font-black">{ticket.orderNumber}</span>
                    <Link
                      href="/admin/pedidos"
                      className="text-[11px] font-bold text-primary hover:underline inline-flex items-center gap-0.5"
                    >
                      Ver Pedidos <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 3. Timeline / History of Actions */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-primary" />
              Histórico & Linha Cronológica
            </h3>

            <div className="space-y-4 pt-2">
              {/* Event: Ticket Created */}
              <div className="flex items-start gap-3 text-xs">
                <div className="p-2 rounded-full bg-slate-100 text-slate-600 shrink-0 mt-0.5">
                  <LifeBuoy className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-slate-900">
                    Ticket de {typeCfg.label} Submetido
                  </p>
                  <p className="text-slate-500 text-[11px]">
                    Submetido via portal público por {ticket.name} ({ticket.email})
                  </p>
                  <span className="text-[10px] font-mono text-slate-400">
                    {new Date(ticket.createdAt).toLocaleString('pt-AO')}
                  </span>
                </div>
              </div>

              {/* Event: Replies sent */}
              {(ticket.replies || []).map((reply) => (
                <div key={reply.id} className="flex items-start gap-3 text-xs border-t border-slate-100 pt-3">
                  <div className="p-2 rounded-full bg-primary/10 text-primary shrink-0 mt-0.5">
                    <Send className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-slate-900">
                        Resposta Enviada ao Cliente ({reply.channel})
                      </p>
                      <span className="text-[10px] font-mono text-slate-400">
                        {new Date(reply.sentAt).toLocaleString('pt-AO')}
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-blue-50/50 border border-blue-100 text-slate-800 text-xs whitespace-pre-wrap">
                      {reply.content}
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Enviado por: {reply.adminName || 'Equipa ARKNET'}
                    </p>
                  </div>
                </div>
              ))}

              {/* Event: Internal Notes */}
              {(ticket.notes || []).map((note) => (
                <div key={note.id} className="flex items-start gap-3 text-xs border-t border-slate-100 pt-3">
                  <div className="p-2 rounded-full bg-amber-100 text-amber-800 shrink-0 mt-0.5">
                    <Lock className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-amber-900">
                        Nota Interna Privada
                      </p>
                      <span className="text-[10px] font-mono text-slate-400">
                        {new Date(note.createdAt).toLocaleString('pt-AO')}
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200 text-slate-800 text-xs whitespace-pre-wrap">
                      {note.content}
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Autor: {note.adminName || 'Administrador'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Action Center (Replies, Internal Notes & Danger Zone) (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* 1. Send Reply Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                <Send className="w-4 h-4 text-primary" />
                Responder ao Cliente
              </h3>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                E-mail {ticket.phone ? '& WhatsApp' : ''}
              </span>
            </div>

            {/* Snippet helpers */}
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                Modelos de Resposta Rápida:
              </label>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() =>
                    insertSnippet(
                      `Estimado(a) ${ticket.name},\n\nAgradecemos o seu contacto. Informamos que a sua solicitação foi devidamente analisada pela nossa equipa técnica.`
                    )
                  }
                  className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold rounded-lg transition"
                >
                  + Saudação Padrão
                </button>
                <button
                  type="button"
                  onClick={() =>
                    insertSnippet(
                      'O seu equipamento encontra-se disponível para levantamento nas nossas instalações em Luanda mediante apresentação do documento de identificação.'
                    )
                  }
                  className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold rounded-lg transition"
                >
                  + Levantamento Produto
                </button>
                <button
                  type="button"
                  onClick={() =>
                    insertSnippet(
                      'Confirmamos a receção do seu comprovativo de pagamento. A fatura oficial foi emitida e o envio já se encontra em trânsito com a nossa transportadora.'
                    )
                  }
                  className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold rounded-lg transition"
                >
                  + Pagamento Confirmado
                </button>
              </div>
            </div>

            <form onSubmit={handleSendReply} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Conteúdo da Resposta *
                </label>
                <textarea
                  required
                  rows={6}
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Escreva a resposta formal que será enviada diretamente ao cliente..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                />
              </div>

              {/* Channels checkboxes */}
              <div className="space-y-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                  <input
                    type="checkbox"
                    checked={true}
                    disabled
                    className="h-4 w-4 rounded text-primary"
                  />
                  <span>Enviar por E-mail para: <strong className="text-primary">{ticket.email}</strong></span>
                </label>

                {ticket.phone && (
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-green-900">
                    <input
                      type="checkbox"
                      checked={sendWhatsAppCopy}
                      onChange={(e) => setSendWhatsAppCopy(e.target.checked)}
                      className="h-4 w-4 rounded text-green-600"
                    />
                    <span>Enviar notificação via WhatsApp para: <strong>{ticket.phone}</strong></span>
                  </label>
                )}
              </div>

              <button
                type="submit"
                disabled={isSendingReply}
                className="w-full py-3 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold uppercase tracking-wider transition flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer"
              >
                {isSendingReply ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    A Enviar Resposta...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Enviar Resposta Oficial
                  </>
                )}
              </button>
            </form>
          </div>

          {/* 2. Internal Notes Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 flex items-center gap-1.5 border-b border-slate-100 pb-3">
              <Lock className="w-4 h-4 text-amber-600" />
              Adicionar Nota Interna (Só Administradores)
            </h3>

            <form onSubmit={handleAddNote} className="space-y-3">
              <textarea
                required
                rows={3}
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="Registe notas de acompanhamento, chamadas realizadas ou observações técnicas..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition"
              />

              <button
                type="submit"
                disabled={isAddingNote}
                className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold uppercase tracking-wider transition flex items-center justify-center gap-1.5 shadow-xs disabled:opacity-50 cursor-pointer"
              >
                {isAddingNote ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    A Registar Nota...
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5" />
                    Registar Nota Interna
                  </>
                )}
              </button>
            </form>
          </div>

          {/* 3. Quick Action Buttons */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
              Ações Rápidas de Gestão
            </h3>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleStatusChange('RESOLVIDO')}
                disabled={ticket.status === 'RESOLVIDO' || isUpdatingStatus}
                className="p-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold transition flex items-center justify-center gap-1.5 disabled:opacity-40 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Marcar Resolvido
              </button>

              <button
                onClick={() => handleStatusChange('ARQUIVADO')}
                disabled={ticket.status === 'ARQUIVADO' || isUpdatingStatus}
                className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition flex items-center justify-center gap-1.5 disabled:opacity-40 cursor-pointer"
              >
                <Archive className="w-4 h-4 text-slate-600" />
                Arquivar Caso
              </button>
            </div>
          </div>

          {/* 4. Privacy & Danger Zone */}
          <div className="bg-white p-6 rounded-2xl border border-rose-200 shadow-xs space-y-3">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-rose-700 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              Privacidade & Eliminação (RGPD / LGPD)
            </h3>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Permite anonimizar os dados pessoais do titular do pedido ou eliminar o processo definitivamente.
            </p>

            <div className="flex flex-col gap-2 pt-2">
              <button
                onClick={() => setIsAnonymizeModalOpen(true)}
                className="w-full py-2 px-3 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                Anonimizar Dados Pessoais
              </button>

              <button
                onClick={() => setIsDeleteModalOpen(true)}
                className="w-full py-2 px-3 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Eliminar Ticket
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* ANONYMIZE MODAL */}
      {isAnonymizeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-black text-slate-900">Confirmar Anonimização</h3>
              <p className="text-xs text-slate-600">
                Esta ação substituirá o nome, e-mail, telefone e mensagem por dados genéricos anónimos, mantendo apenas a métrica estatística do ticket.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setIsAnonymizeModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Cancelar
              </button>
              <button
                onClick={handleAnonymize}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold"
              >
                Sim, Anonimizar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-rose-200">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-black text-slate-900">Eliminar Ticket Definitivamente</h3>
              <p className="text-xs text-slate-600">
                Tem a certeza que deseja eliminar o ticket <strong>{ticket.protocol}</strong> e todo o seu histórico de notas e respostas? Esta ação é irreversível.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold"
              >
                Eliminar Definitivamente
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
