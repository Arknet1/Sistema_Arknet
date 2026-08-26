'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { FaWhatsapp } from 'react-icons/fa6'
import {
  Inbox as LucideInbox,
  Search as SearchIcon,
  Filter as FilterIcon,
  Phone,
  Mail,
  MessageSquare as MsgIcon,
  Clock,
  Trash2 as TrashIcon,
  Eye,
  CheckCircle2,
  X as CloseIcon,
  ExternalLink,
  PhoneCall,
  Send,
  Check,
} from 'lucide-react'
import { dataStore, ServiceLead, LeadStatus } from '@/lib/data-store'
import { useToast } from '@/lib/toast-context'
import { ConfirmModal } from '@/components/admin/confirm-modal'
import { ExportButton } from '@/components/admin/export-button'
import { exportToCSV } from '@/lib/export-utils'

export default function AdminLeadsPage() {
  const { success, info } = useToast()

  const [leads, setLeads] = useState<ServiceLead[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | LeadStatus>('all')
  const [serviceFilter, setServiceFilter] = useState('all')

  // Detalhes / Modal
  const [selectedLead, setSelectedLead] = useState<ServiceLead | null>(null)
  const [leadNotes, setLeadNotes] = useState('')

  // Delete Modal
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  useEffect(() => {
    const sync = () => {
      const db = dataStore.getSnapshot()
      setLeads([...db.leads].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()))
    }
    sync()
    const unsub = dataStore.subscribe(sync)
    return () => unsub()
  }, [])

  const allServices = useMemo(() => {
    const set = new Set(leads.map((l) => l.service))
    return Array.from(set)
  }, [leads])

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const matchSearch =
        lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.phone.includes(searchTerm) ||
        lead.message.toLowerCase().includes(searchTerm.toLowerCase())

      const matchStatus = statusFilter === 'all' || lead.status === statusFilter
      const matchService = serviceFilter === 'all' || lead.service === serviceFilter
      return matchSearch && matchStatus && matchService
    })
  }, [leads, searchTerm, statusFilter, serviceFilter])

  const handleOpenDetail = (lead: ServiceLead) => {
    setSelectedLead(lead)
    setLeadNotes(lead.notes || '')
  }

  const handleUpdateStatus = (leadId: string, newStatus: LeadStatus) => {
    dataStore.updateLeadStatus(leadId, newStatus, leadNotes)
    if (selectedLead && selectedLead.id === leadId) {
      setSelectedLead((prev) => (prev ? { ...prev, status: newStatus } : null))
    }
    success(`Estado do lead alterado para "${newStatus}".`)
  }

  const handleSaveNotes = () => {
    if (selectedLead) {
      dataStore.updateLeadStatus(selectedLead.id, selectedLead.status, leadNotes)
      setSelectedLead((prev) => (prev ? { ...prev, notes: leadNotes } : null))
      success('Notas internas do lead guardadas!')
    }
  }

  const handleDeleteConfirm = () => {
    if (deletingId) {
      dataStore.deleteLead(deletingId)
      success('Lead eliminado com sucesso.')
      setIsDeleteModalOpen(false)
      if (selectedLead?.id === deletingId) setSelectedLead(null)
      setDeletingId(null)
    }
  }

  const handleExportCSV = () => {
    exportToCSV(
      filteredLeads,
      'ARKNET_Leads_Comerciais',
      [
        { key: 'name', header: 'Nome do Cliente / Empresa' },
        { key: 'email', header: 'Email' },
        { key: 'phone', header: 'Telefone' },
        { key: 'service', header: 'Serviço Solicitado' },
        { key: 'message', header: 'Mensagem / Descrição da Necessidade' },
        { key: 'status', header: 'Estado do Lead' },
        { key: 'notes', header: 'Notas Internas' },
        {
          key: 'createdAt',
          header: 'Data de Receção',
          format: (val) => new Date(val).toLocaleString('pt-PT'),
        },
      ]
    )
  }

  const getStatusBadge = (status: LeadStatus) => {
    switch (status) {
      case 'novo':
        return (
          <span className="px-2.5 py-1 text-[10px] font-extrabold uppercase bg-rose-100 text-secondary rounded-full">
            Novo Pedido
          </span>
        )
      case 'contactado':
        return (
          <span className="px-2.5 py-1 text-[10px] font-extrabold uppercase bg-amber-100 text-amber-800 rounded-full">
            Contactado
          </span>
        )
      case 'convertido':
        return (
          <span className="px-2.5 py-1 text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800 rounded-full">
            Convertido
          </span>
        )
      case 'arquivado':
        return (
          <span className="px-2.5 py-1 text-[10px] font-extrabold uppercase bg-slate-100 text-slate-600 rounded-full">
            Arquivado
          </span>
        )
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <LucideInbox className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-extrabold text-slate-900">Pedidos de Serviço (Leads)</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Contactos comerciais recebidos pelo formulário "Solicitar Serviço" do website.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <ExportButton onExport={handleExportCSV} label="Exportar Leads (CSV)" />
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white border border-slate-200 p-4 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Pesquisar por nome, telefone, email ou texto..."
            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:bg-white focus:border-primary focus:outline-none"
          />
        </div>

        <div>
          <select
            value={serviceFilter}
            onChange={(e) => setServiceFilter(e.target.value)}
            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 text-xs text-slate-700 focus:bg-white focus:border-primary focus:outline-none"
          >
            <option value="all">Todos os Serviços Solicitados ({leads.length})</option>
            {allServices.map((srv) => (
              <option key={srv} value={srv}>
                {srv}
              </option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 text-xs text-slate-700 focus:bg-white focus:border-primary focus:outline-none"
          >
            <option value="all">Todos os Estados</option>
            <option value="novo">Novos ({leads.filter((l) => l.status === 'novo').length})</option>
            <option value="contactado">Contactados ({leads.filter((l) => l.status === 'contactado').length})</option>
            <option value="convertido">Convertidos ({leads.filter((l) => l.status === 'convertido').length})</option>
            <option value="arquivado">Arquivados ({leads.filter((l) => l.status === 'arquivado').length})</option>
          </select>
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-white border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase tracking-wider font-bold text-[11px]">
              <tr>
                <th className="py-3.5 px-6">Cliente / Empresa</th>
                <th className="py-3.5 px-4">Serviço</th>
                <th className="py-3.5 px-4">Contacto</th>
                <th className="py-3.5 px-4">Estado</th>
                <th className="py-3.5 px-4">Data</th>
                <th className="py-3.5 px-6 text-right">Ações Rápidas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    Nenhum lead encontrado com os filtros indicados.
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-slate-50/80 transition group">
                    <td className="py-3.5 px-6">
                      <p className="font-bold text-slate-900 group-hover:text-primary transition">{lead.name}</p>
                      <p className="text-[11px] text-slate-500 line-clamp-1 max-w-xs">{lead.message}</p>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-primary">{lead.service}</span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex flex-col text-[11px] font-mono">
                        <a href={`tel:${lead.phone}`} className="text-slate-800 hover:text-primary">
                          {lead.phone || '—'}
                        </a>
                        <a href={`mailto:${lead.email}`} className="text-slate-400 hover:text-primary">
                          {lead.email}
                        </a>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">{getStatusBadge(lead.status)}</td>

                    <td className="py-3.5 px-4 text-slate-400">
                      {new Date(lead.createdAt).toLocaleDateString('pt-PT')}
                      <span className="block text-[10px]">
                        {new Date(lead.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </td>

                    <td className="py-3.5 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {lead.phone && (
                          <a
                            href={`https://wa.me/${lead.phone.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-emerald-600 hover:bg-emerald-50 rounded transition"
                            title="Contactar via WhatsApp"
                          >
                            <MsgIcon className="h-4 w-4" />
                          </a>
                        )}
                        <a
                          href={`mailto:${lead.email}?subject=ARKNET — Resposta ao Pedido de ${lead.service}`}
                          className="p-2 text-slate-600 hover:text-primary hover:bg-slate-100 rounded transition"
                          title="Enviar Email"
                        >
                          <Send className="h-4 w-4" />
                        </a>
                        <button
                          type="button"
                          onClick={() => handleOpenDetail(lead)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-primary hover:text-white font-bold rounded text-slate-700 transition"
                        >
                          Tratar
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setDeletingId(lead.id)
                            setIsDeleteModalOpen(true)
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition"
                          title="Eliminar lead"
                        >
                          <TrashIcon className="h-4 w-4" />
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

      {/* Modal de Detalhes do Lead */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm"
            onClick={() => setSelectedLead(null)}
          />

          <div className="relative w-full max-w-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden z-10 max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <div>
                <span className="text-xs font-mono font-bold text-primary">Pedido de Cotação / Serviço</span>
                <h3 className="text-lg font-extrabold text-slate-900">{selectedLead.service}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedLead(null)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <CloseIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              {/* Client Contacts */}
              <div className="p-4 bg-slate-50 border border-slate-200 grid sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Contacto</p>
                  <p className="font-bold text-slate-900 text-sm">{selectedLead.name}</p>
                  <p className="font-mono text-slate-600 mt-1">{selectedLead.email}</p>
                  <p className="font-mono text-slate-600">{selectedLead.phone || 'Sem telefone indicado'}</p>
                </div>
                <div className="flex flex-col justify-between">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Origem & Data</p>
                    <p className="text-slate-600">{selectedLead.source || 'Website ARKNET'}</p>
                    <p className="text-slate-400 mt-1">{new Date(selectedLead.createdAt).toLocaleString('pt-PT')}</p>
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    {selectedLead.phone && (
                      <a
                        href={`https://wa.me/${selectedLead.phone.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded transition flex items-center gap-1"
                      >
                        <MsgIcon className="h-3.5 w-3.5" />
                        WhatsApp
                      </a>
                    )}
                    <a
                      href={`mailto:${selectedLead.email}?subject=ARKNET — Resposta ao Pedido de ${selectedLead.service}`}
                      className="px-3 py-1.5 bg-primary hover:bg-primary/90 text-white font-bold text-xs rounded transition flex items-center gap-1"
                    >
                      <Send className="h-3.5 w-3.5" />
                      Email
                    </a>
                  </div>
                </div>
              </div>

              {/* Status Workflow Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Estado do Lead Comercial
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(['novo', 'contactado', 'convertido', 'arquivado'] as LeadStatus[]).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => handleUpdateStatus(selectedLead.id, st)}
                      className={`py-2 px-3 text-xs font-bold uppercase rounded border transition ${
                        selectedLead.status === st
                          ? 'bg-primary text-white border-primary shadow-sm'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Mensagem / Especificações do Cliente
                </label>
                <div className="p-4 bg-slate-100 border border-slate-200 text-slate-800 text-xs leading-relaxed whitespace-pre-wrap">
                  {selectedLead.message}
                </div>
              </div>

              {/* Internal Notes */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Notas Internas de Acompanhamento
                </label>
                <textarea
                  rows={3}
                  value={leadNotes}
                  onChange={(e) => setLeadNotes(e.target.value)}
                  placeholder="Ex: Proposta enviada dia 15; cliente solicitou visita técnica no local..."
                  className="w-full p-3 border border-slate-300 focus:border-primary focus:outline-none"
                />
                <div className="flex justify-end mt-2">
                  <button
                    type="button"
                    onClick={handleSaveNotes}
                    className="px-4 py-2 bg-slate-900 text-white font-bold text-xs uppercase hover:bg-primary transition"
                  >
                    Guardar Notas
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Eliminar Lead"
        message="Tem a certeza que deseja eliminar permanentemente este registo de lead comercial?"
        confirmText="Sim, Eliminar"
        cancelText="Cancelar"
      />
    </div>
  )
}
