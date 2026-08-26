'use client'

import React, { useState, useEffect, useMemo } from 'react'
import {
  Mail,
  Search,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  Users,
  Download,
  X,
  Send,
} from 'lucide-react'
import { dataStore, NewsletterSubscriber } from '@/lib/data-store'
import { useToast } from '@/lib/toast-context'
import { ConfirmModal } from '@/components/admin/confirm-modal'
import { ExportButton } from '@/components/admin/export-button'
import { exportToCSV } from '@/lib/export-utils'

export default function AdminNewsletterPage() {
  const { success, error, info } = useToast()

  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')

  // Modal Novo Subscritor
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newEmail, setNewEmail] = useState('')

  // Delete Modal
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  useEffect(() => {
    const sync = () => {
      const db = dataStore.getSnapshot()
      setSubscribers([...db.subscribers].sort((a, b) => new Date(b.subscribedAt).getTime() - new Date(a.subscribedAt).getTime()))
    }
    sync()
    const unsub = dataStore.subscribe(sync)
    return () => unsub()
  }, [])

  const filteredSubscribers = useMemo(() => {
    return subscribers.filter((sub) => {
      const matchSearch = sub.email.toLowerCase().includes(searchTerm.toLowerCase())
      const matchStatus = statusFilter === 'all' || sub.status === statusFilter
      return matchSearch && matchStatus
    })
  }, [subscribers, searchTerm, statusFilter])

  const handleAddSubscriber = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newEmail.trim()) return

    const res = dataStore.addSubscriber(newEmail.trim())
    if (res.success) {
      success(res.message, 'Subscritor Adicionado')
      setIsModalOpen(false)
      setNewEmail('')
    } else {
      error(res.message, 'Erro na Subscrição')
    }
  }

  const handleToggleStatus = (sub: NewsletterSubscriber) => {
    const nextStatus = sub.status === 'active' ? 'inactive' : 'active'
    dataStore.updateSubscriberStatus(sub.id, nextStatus)
    info(`Estado do subscritor "${sub.email}" alterado para ${nextStatus === 'active' ? 'Ativo' : 'Inativo'}.`)
  }

  const handleDeleteConfirm = () => {
    if (deletingId) {
      dataStore.deleteSubscriber(deletingId)
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
        { key: 'email', header: 'Endereço de Email' },
        {
          key: 'status',
          header: 'Estado',
          format: (st) => (st === 'active' ? 'Ativo' : 'Inativo'),
        },
        {
          key: 'subscribedAt',
          header: 'Data de Subscrição',
          format: (val) => new Date(val).toLocaleString('pt-PT'),
        },
      ]
    )
  }

  const activeCount = subscribers.filter((s) => s.status === 'active').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Mail className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-extrabold text-slate-900">Subscritores da Newsletter</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Gestão da base de emails registados através do rodapé do website para envio de novidades e comunicados.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <ExportButton onExport={handleExportCSV} label="Exportar Lista (CSV)" />
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-secondary text-white text-xs font-bold uppercase tracking-wider hover:bg-secondary/90 transition shadow-sm"
          >
            <Plus className="h-4 w-4" />
            Adicionar Email
          </button>
        </div>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase text-slate-400">Total Registados</p>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">{subscribers.length}</p>
          </div>
          <div className="p-3 bg-primary/10 text-primary rounded-lg">
            <Users className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase text-slate-400">Subscritores Ativos</p>
            <p className="text-2xl font-extrabold text-emerald-600 mt-1">{activeCount}</p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase text-slate-400">Inativos / Cancelados</p>
            <p className="text-2xl font-extrabold text-slate-500 mt-1">{subscribers.length - activeCount}</p>
          </div>
          <div className="p-3 bg-slate-100 text-slate-600 rounded-lg">
            <XCircle className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Pesquisar por endereço de email..."
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
        </div>
      </div>

      {/* Subscribers Table */}
      <div className="bg-white border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase tracking-wider font-bold text-[11px]">
              <tr>
                <th className="py-3.5 px-6">Email</th>
                <th className="py-3.5 px-4 text-center">Estado</th>
                <th className="py-3.5 px-4">Data de Subscrição</th>
                <th className="py-3.5 px-6 text-right">Ações</th>
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
                  Endereço de Email *
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
    </div>
  )
}
