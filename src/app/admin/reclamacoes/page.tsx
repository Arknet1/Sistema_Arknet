'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
  LifeBuoy,
  AlertCircle,
  FileText,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  Download,
  RefreshCw,
  Eye,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Copy,
  Check,
  Package,
  Truck,
  CreditCard,
  Users,
  Wrench,
  HelpCircle,
  Layers,
  ArrowUpDown,
  X,
  MessageSquareWarning,
} from 'lucide-react'
import {
  TicketItem,
  TicketStats,
  TicketType,
  TicketCategory,
  TicketStatus,
  TicketPriority,
  TICKET_TYPE_CONFIG,
  TICKET_CATEGORY_CONFIG,
  TICKET_STATUS_CONFIG,
  TICKET_PRIORITY_CONFIG,
} from '@/lib/tickets/types'

export default function AdminReclamacoesPage() {
  const [tickets, setTickets] = useState<TicketItem[]>([])
  const [stats, setStats] = useState<TicketStats>({
    total: 0,
    novos: 0,
    emAnalise: 0,
    respondidos: 0,
    resolvidos: 0,
    arquivados: 0,
    reclamacoes: 0,
    informacoes: 0,
    avgResponseTimeHours: 24,
  })

  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [copiedProtocol, setCopiedProtocol] = useState<string | null>(null)

  // Filters state
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState<string>('ALL')
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL')
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL')
  const [selectedPriority, setSelectedPriority] = useState<string>('ALL')
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')

  // Pagination state
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalRecords, setTotalRecords] = useState(0)
  const limit = 15

  const fetchTickets = useCallback(
    async (showRefreshIndicator = false) => {
      if (showRefreshIndicator) setIsRefreshing(true)
      else setIsLoading(true)

      try {
        const queryParams = new URLSearchParams()
        queryParams.set('page', String(page))
        queryParams.set('limit', String(limit))

        if (searchTerm.trim()) queryParams.set('q', searchTerm.trim())
        if (selectedType !== 'ALL') queryParams.set('type', selectedType)
        if (selectedStatus !== 'ALL') queryParams.set('status', selectedStatus)
        if (selectedCategory !== 'ALL') queryParams.set('category', selectedCategory)
        if (selectedPriority !== 'ALL') queryParams.set('priority', selectedPriority)
        if (startDate) queryParams.set('startDate', startDate)
        if (endDate) queryParams.set('endDate', endDate)

        const res = await fetch(`/api/admin/tickets?${queryParams.toString()}`)
        if (res.ok) {
          const data = await res.json()
          if (data.success) {
            setTickets(data.tickets || [])
            setTotalRecords(data.total || 0)
            setTotalPages(data.totalPages || 1)
            if (data.stats) setStats(data.stats)
          }
        }
      } catch (err) {
        console.error('Erro ao carregar tickets:', err)
      } finally {
        setIsLoading(false)
        setIsRefreshing(false)
      }
    },
    [page, limit, searchTerm, selectedType, selectedStatus, selectedCategory, selectedPriority, startDate, endDate]
  )

  useEffect(() => {
    fetchTickets()
  }, [fetchTickets])

  // Debounced search on enter or trigger
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    fetchTickets()
  }

  const handleClearFilters = () => {
    setSearchTerm('')
    setSelectedType('ALL')
    setSelectedStatus('ALL')
    setSelectedCategory('ALL')
    setSelectedPriority('ALL')
    setStartDate('')
    setEndDate('')
    setPage(1)
  }

  const handleCopyProtocol = (protocol: string, e: React.MouseEvent) => {
    e.stopPropagation()
    navigator.clipboard.writeText(protocol)
    setCopiedProtocol(protocol)
    setTimeout(() => setCopiedProtocol(null), 2500)
  }

  const handleExportCsv = () => {
    const queryParams = new URLSearchParams()
    if (searchTerm.trim()) queryParams.set('q', searchTerm.trim())
    if (selectedType !== 'ALL') queryParams.set('type', selectedType)
    if (selectedStatus !== 'ALL') queryParams.set('status', selectedStatus)
    if (selectedCategory !== 'ALL') queryParams.set('category', selectedCategory)
    if (selectedPriority !== 'ALL') queryParams.set('priority', selectedPriority)
    if (startDate) queryParams.set('startDate', startDate)
    if (endDate) queryParams.set('endDate', endDate)

    window.open(`/api/admin/tickets/export?${queryParams.toString()}`, '_blank')
  }

  return (
    <div className="space-y-6 pb-16">
      {/* Header & Main Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary uppercase tracking-wider flex items-center gap-1">
              <LifeBuoy className="w-3.5 h-3.5" />
              Suporte & Qualidade
            </span>
            <span className="text-xs text-slate-500 font-medium">Gestão de Reclamações e Pedidos de Informação</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Reclamações & Informações
          </h1>
          <p className="text-sm text-slate-600 mt-1 max-w-2xl">
            Acompanhamento em tempo real de pedidos submetidos por clientes e visitantes, atribuição de prioridades, notas internas e envio de respostas oficiais.
          </p>
        </div>

        {/* Top Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => fetchTickets(true)}
            disabled={isRefreshing}
            className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 shadow-xs disabled:opacity-50 cursor-pointer"
            title="Atualizar lista"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-primary' : ''}`} />
            Atualizar
          </button>

          <button
            onClick={handleExportCsv}
            className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
            title="Exportar dados filtrados em formato CSV"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            Exportar CSV
          </button>

          <Link
            href="/reclamacoes"
            target="_blank"
            className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Formulário Público
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Novos Tickets */}
        <div
          onClick={() => {
            setSelectedStatus('NOVO')
            setPage(1)
          }}
          className={`bg-white p-5 rounded-2xl border cursor-pointer transition shadow-xs flex flex-col justify-between ${
            selectedStatus === 'NOVO'
              ? 'border-amber-500 ring-2 ring-amber-400/20 bg-amber-50/20'
              : 'border-slate-200 hover:border-amber-300'
          }`}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">Novos Pedidos</p>
              <h3 className="text-3xl font-black text-slate-900 mt-1">{stats.novos}</h3>
              <p className="text-xs text-amber-700 font-semibold mt-0.5">Aguardam triagem</p>
            </div>
            <div className="p-3 bg-amber-100 text-amber-700 rounded-xl shrink-0">
              <AlertCircle className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Requerem primeira resposta</span>
            <span className="font-bold text-amber-600">Filtrar →</span>
          </div>
        </div>

        {/* Em Análise */}
        <div
          onClick={() => {
            setSelectedStatus('EM_ANALISE')
            setPage(1)
          }}
          className={`bg-white p-5 rounded-2xl border cursor-pointer transition shadow-xs flex flex-col justify-between ${
            selectedStatus === 'EM_ANALISE'
              ? 'border-blue-500 ring-2 ring-blue-400/20 bg-blue-50/20'
              : 'border-slate-200 hover:border-blue-300'
          }`}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">Em Análise</p>
              <h3 className="text-3xl font-black text-slate-900 mt-1">{stats.emAnalise}</h3>
              <p className="text-xs text-blue-700 font-semibold mt-0.5">Sob investigação técnica</p>
            </div>
            <div className="p-3 bg-blue-100 text-blue-700 rounded-xl shrink-0">
              <Clock className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Processos abertos</span>
            <span className="font-bold text-primary">Filtrar →</span>
          </div>
        </div>

        {/* Resolvidos */}
        <div
          onClick={() => {
            setSelectedStatus('RESOLVIDO')
            setPage(1)
          }}
          className={`bg-white p-5 rounded-2xl border cursor-pointer transition shadow-xs flex flex-col justify-between ${
            selectedStatus === 'RESOLVIDO'
              ? 'border-emerald-500 ring-2 ring-emerald-400/20 bg-emerald-50/20'
              : 'border-slate-200 hover:border-emerald-300'
          }`}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">Casos Resolvidos</p>
              <h3 className="text-3xl font-black text-slate-900 mt-1">{stats.resolvidos}</h3>
              <p className="text-xs text-emerald-700 font-semibold mt-0.5">Concluídos com sucesso</p>
            </div>
            <div className="p-3 bg-emerald-100 text-emerald-700 rounded-xl shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Total solucionado</span>
            <span className="font-bold text-emerald-600">Filtrar →</span>
          </div>
        </div>

        {/* Tempo Médio de Resposta */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">Tempo Médio SLA</p>
              <h3 className="text-3xl font-black text-slate-900 mt-1">
                ~{stats.avgResponseTimeHours}h
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Objetivo: &lt; 48 horas</p>
            </div>
            <div className="p-3 bg-indigo-100 text-indigo-700 rounded-xl shrink-0">
              <Layers className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
            <span>{stats.reclamacoes} recl. | {stats.informacoes} info</span>
            <span className="text-emerald-600 font-bold">Dentro do SLA</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Pesquisar por protocolo (ARK-...), nome, e-mail, assunto ou nº de encomenda..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('')
                  setPage(1)
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold uppercase tracking-wider transition cursor-pointer shrink-0"
          >
            Filtrar
          </button>
        </form>

        {/* Dropdown Filters Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-2.5 pt-2 border-t border-slate-100 text-xs">
          {/* Tipo */}
          <div>
            <label className="block text-[10px] font-extrabold uppercase text-slate-400 mb-1">Tipo</label>
            <select
              value={selectedType}
              onChange={(e) => {
                setSelectedType(e.target.value)
                setPage(1)
              }}
              className="w-full p-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 font-bold focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="ALL">Todos os Tipos</option>
              <option value="RECLAMACAO">Reclamação</option>
              <option value="INFORMACAO">Pedido de Informação</option>
            </select>
          </div>

          {/* Estado */}
          <div>
            <label className="block text-[10px] font-extrabold uppercase text-slate-400 mb-1">Estado</label>
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value)
                setPage(1)
              }}
              className="w-full p-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 font-bold focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="ALL">Todos os Estados</option>
              <option value="NOVO">Novo / Pendente</option>
              <option value="EM_ANALISE">Em Análise</option>
              <option value="RESPONDIDO">Respondido</option>
              <option value="RESOLVIDO">Resolvido</option>
              <option value="ARQUIVADO">Arquivado</option>
            </select>
          </div>

          {/* Categoria */}
          <div>
            <label className="block text-[10px] font-extrabold uppercase text-slate-400 mb-1">Categoria</label>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value)
                setPage(1)
              }}
              className="w-full p-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 font-bold focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="ALL">Todas as Categorias</option>
              <option value="PRODUTO">Produto / Equipamento</option>
              <option value="ENTREGA">Prazos & Envio</option>
              <option value="PAGAMENTO">Faturação & Pagamento</option>
              <option value="ATENDIMENTO">Atendimento Comercial</option>
              <option value="SERVICO_TECNICO">Suporte & Técnico</option>
              <option value="OUTRO">Outro Assunto</option>
            </select>
          </div>

          {/* Prioridade */}
          <div>
            <label className="block text-[10px] font-extrabold uppercase text-slate-400 mb-1">Prioridade</label>
            <select
              value={selectedPriority}
              onChange={(e) => {
                setSelectedPriority(e.target.value)
                setPage(1)
              }}
              className="w-full p-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 font-bold focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="ALL">Todas as Prioridades</option>
              <option value="ALTA">Alta</option>
              <option value="NORMAL">Normal</option>
              <option value="BAIXA">Baixa</option>
            </select>
          </div>

          {/* Clear Button */}
          <div className="flex items-end col-span-2 sm:col-span-4 lg:col-span-1">
            <button
              type="button"
              onClick={handleClearFilters}
              className="w-full p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 font-bold transition text-center cursor-pointer"
            >
              Limpar Filtros
            </button>
          </div>
        </div>
      </div>

      {/* Main Tickets Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900 text-xs sm:text-sm">
              Lista de Tickets Registados
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-slate-200 text-slate-700">
              {totalRecords}
            </span>
          </div>

          <span className="text-xs text-slate-500">
            Página {page} de {totalPages}
          </span>
        </div>

        {isLoading ? (
          <div className="py-16 flex flex-col items-center justify-center text-slate-400 text-xs">
            <RefreshCw className="w-6 h-6 animate-spin text-primary mb-2" />
            <span>A carregar tickets...</span>
          </div>
        ) : tickets.length === 0 ? (
          <div className="py-16 text-center text-slate-500 text-xs space-y-2">
            <LifeBuoy className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="font-bold text-slate-700 text-sm">Nenhum ticket encontrado</p>
            <p className="text-slate-400">
              Não existem pedidos com os filtros atuais ou ainda não foram submetidas solicitações.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] font-black uppercase tracking-wider text-slate-400 bg-slate-50">
                  <th className="py-3 px-4">Protocolo</th>
                  <th className="py-3 px-3">Data</th>
                  <th className="py-3 px-3">Tipo / Categoria</th>
                  <th className="py-3 px-4">Contacto</th>
                  <th className="py-3 px-4">Assunto</th>
                  <th className="py-3 px-3 text-center">Prioridade</th>
                  <th className="py-3 px-3 text-center">Estado</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                {tickets.map((t) => {
                  const typeCfg = TICKET_TYPE_CONFIG[t.type]
                  const catCfg = (TICKET_CATEGORY_CONFIG as any)[t.category]
                  const statusCfg = TICKET_STATUS_CONFIG[t.status]
                  const priorityCfg = TICKET_PRIORITY_CONFIG[t.priority]
                  const createdDate = new Date(t.createdAt).toLocaleDateString('pt-AO', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })
                  const isNew = t.status === 'NOVO'

                  return (
                    <tr
                      key={t.id}
                      className={`hover:bg-slate-50 transition group ${
                        isNew ? 'bg-amber-50/20 font-medium' : ''
                      }`}
                    >
                      {/* Protocol */}
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Link
                            href={`/admin/reclamacoes/${t.id}`}
                            className="hover:text-primary transition hover:underline"
                          >
                            {t.protocol}
                          </Link>
                          <button
                            type="button"
                            onClick={(e) => handleCopyProtocol(t.protocol, e)}
                            className="text-slate-400 hover:text-slate-700 p-0.5 rounded transition"
                            title="Copiar Protocolo"
                          >
                            {copiedProtocol === t.protocol ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-3 text-slate-500 whitespace-nowrap text-xs font-mono">
                        {createdDate}
                      </td>

                      {/* Type & Category */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <div className="flex flex-col gap-1 items-start">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${typeCfg.badgeColor}`}
                          >
                            {typeCfg.label}
                          </span>
                          <span className="text-[11px] text-slate-600 font-medium">
                            {catCfg?.label || t.category}
                          </span>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="py-3.5 px-4">
                        <div className="min-w-[160px]">
                          <p className="font-bold text-slate-900 line-clamp-1">{t.name}</p>
                          <p className="text-slate-500 text-[11px] truncate">{t.email}</p>
                          {t.phone && (
                            <p className="text-slate-400 text-[10px] font-mono">{t.phone}</p>
                          )}
                        </div>
                      </td>

                      {/* Subject */}
                      <td className="py-3.5 px-4">
                        <div className="min-w-[180px] max-w-xs">
                          <p className="font-bold text-slate-800 line-clamp-1">{t.subject}</p>
                          {t.orderNumber && (
                            <span className="text-[10px] font-mono text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                              Enc.: {t.orderNumber}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Priority */}
                      <td className="py-3.5 px-3 text-center whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase ${priorityCfg.badgeColor}`}
                        >
                          {priorityCfg.label}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-3 text-center whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${statusCfg.bgSoft} ${statusCfg.textColor} ${statusCfg.borderColor}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dotColor}`} />
                          {statusCfg.label}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <Link
                          href={`/admin/reclamacoes/${t.id}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-primary hover:text-white text-slate-700 text-xs font-bold transition shadow-2xs"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Ver / Responder</span>
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        <div className="p-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs bg-slate-50/50">
          <span className="text-slate-500">
            Apresentando {tickets.length} de {totalRecords} registos no total
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || isLoading}
              className="p-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 disabled:opacity-30 disabled:hover:bg-white transition cursor-pointer"
              title="Página Anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-mono font-bold text-slate-800 px-2">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || isLoading}
              className="p-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 disabled:opacity-30 disabled:hover:bg-white transition cursor-pointer"
              title="Página Seguinte"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
