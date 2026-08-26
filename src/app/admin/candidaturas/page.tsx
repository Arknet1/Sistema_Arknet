'use client'

import React, { useState, useEffect, useMemo } from 'react'
import {
  UserCheck,
  Search,
  Filter,
  Mail,
  Phone,
  FileText,
  Trash2,
  Eye,
  CheckCircle2,
  Clock,
  Briefcase,
  X,
  Send,
} from 'lucide-react'
import { dataStore, JobApplication, ApplicationStatus } from '@/lib/data-store'
import { useToast } from '@/lib/toast-context'
import { ConfirmModal } from '@/components/admin/confirm-modal'
import { ExportButton } from '@/components/admin/export-button'
import { exportToCSV } from '@/lib/export-utils'

export default function AdminCandidaturasPage() {
  const { success, info } = useToast()

  const [applications, setApplications] = useState<JobApplication[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | ApplicationStatus>('all')

  // Detalhe Modal
  const [selectedApp, setSelectedApp] = useState<JobApplication | null>(null)
  const [appNotes, setAppNotes] = useState('')

  // Delete Modal
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  useEffect(() => {
    const sync = () => {
      const db = dataStore.getSnapshot()
      setApplications([...db.applications].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()))
    }
    sync()
    const unsub = dataStore.subscribe(sync)
    return () => unsub()
  }, [])

  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      const matchSearch =
        app.candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.candidateEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (app.candidatePhone && app.candidatePhone.includes(searchTerm))

      const matchStatus = statusFilter === 'all' || app.status === statusFilter
      return matchSearch && matchStatus
    })
  }, [applications, searchTerm, statusFilter])

  const handleOpenDetail = (app: JobApplication) => {
    setSelectedApp(app)
    setAppNotes(app.notes || '')
  }

  const handleUpdateStatus = (appId: string, newStatus: ApplicationStatus) => {
    dataStore.updateApplicationStatus(appId, newStatus, appNotes)
    if (selectedApp && selectedApp.id === appId) {
      setSelectedApp((prev) => (prev ? { ...prev, status: newStatus } : null))
    }
    success(`Estado da candidatura de ${selectedApp?.candidateName || appId} alterado para "${newStatus.replace('_', ' ')}".`)
  }

  const handleSaveNotes = () => {
    if (selectedApp) {
      dataStore.updateApplicationStatus(selectedApp.id, selectedApp.status, appNotes)
      setSelectedApp((prev) => (prev ? { ...prev, notes: appNotes } : null))
      success('Notas internas guardadas com sucesso!')
    }
  }

  const handleDeleteConfirm = () => {
    if (deletingId) {
      dataStore.deleteApplication(deletingId)
      success('Candidatura eliminada com sucesso.')
      setIsDeleteModalOpen(false)
      if (selectedApp?.id === deletingId) setSelectedApp(null)
      setDeletingId(null)
    }
  }

  const handleExportCSV = () => {
    exportToCSV(
      filteredApplications,
      'ARKNET_Candidaturas_Emprego',
      [
        { key: 'candidateName', header: 'Nome do Candidato' },
        { key: 'candidateEmail', header: 'Email' },
        { key: 'candidatePhone', header: 'Telefone' },
        { key: 'jobTitle', header: 'Vaga Pretendida' },
        { key: 'message', header: 'Carta de Apresentação / Mensagem' },
        { key: 'cvFileName', header: 'Ficheiro CV' },
        { key: 'status', header: 'Estado do Processo' },
        { key: 'notes', header: 'Notas do Recrutador' },
        {
          key: 'createdAt',
          header: 'Data de Submissão',
          format: (val) => new Date(val).toLocaleString('pt-PT'),
        },
      ]
    )
  }

  const getStatusBadge = (status: ApplicationStatus) => {
    switch (status) {
      case 'recebida':
        return <span className="px-2.5 py-1 text-[10px] font-bold uppercase bg-blue-50 text-primary rounded-full">Recebida</span>
      case 'em_analise':
        return <span className="px-2.5 py-1 text-[10px] font-bold uppercase bg-amber-100 text-amber-800 rounded-full">Em Análise</span>
      case 'entrevista':
        return <span className="px-2.5 py-1 text-[10px] font-bold uppercase bg-indigo-100 text-indigo-800 rounded-full">Entrevista</span>
      case 'aceite':
        return <span className="px-2.5 py-1 text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 rounded-full">Aceite</span>
      case 'rejeitada':
        return <span className="px-2.5 py-1 text-[10px] font-bold uppercase bg-slate-100 text-slate-600 rounded-full">Rejeitada</span>
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <UserCheck className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-extrabold text-slate-900">Candidaturas Recebidas</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Gestão de currículos e candidaturas submetidas para vagas abertas ou candidaturas espontâneas.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <ExportButton onExport={handleExportCSV} label="Exportar Candidaturas (CSV)" />
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
            placeholder="Pesquisar por candidato, vaga ou email..."
            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:bg-white focus:border-primary focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 bg-slate-50 border border-slate-300 text-xs text-slate-700 focus:bg-white focus:border-primary focus:outline-none"
          >
            <option value="all">Todos os Estados ({applications.length})</option>
            <option value="recebida">Recebidas</option>
            <option value="em_analise">Em Análise</option>
            <option value="entrevista">Entrevista Agendada</option>
            <option value="aceite">Aceites</option>
            <option value="rejeitada">Rejeitadas</option>
          </select>
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-white border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase tracking-wider font-bold text-[11px]">
              <tr>
                <th className="py-3.5 px-6">Candidato</th>
                <th className="py-3.5 px-4">Vaga Pretendida</th>
                <th className="py-3.5 px-4">CV Anexo</th>
                <th className="py-3.5 px-4">Estado</th>
                <th className="py-3.5 px-4">Data</th>
                <th className="py-3.5 px-6 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredApplications.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    Nenhuma candidatura registada com os filtros atuais.
                  </td>
                </tr>
              ) : (
                filteredApplications.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/80 transition group">
                    <td className="py-3.5 px-6">
                      <p className="font-bold text-slate-900 group-hover:text-primary transition">{app.candidateName}</p>
                      <div className="flex items-center gap-3 text-[11px] text-slate-500 font-mono mt-0.5">
                        <a href={`mailto:${app.candidateEmail}`} className="hover:text-primary">{app.candidateEmail}</a>
                        {app.candidatePhone && <span>• {app.candidatePhone}</span>}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-slate-900">{app.jobTitle}</td>

                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 text-slate-700 rounded font-mono text-[11px]">
                        <FileText className="h-3.5 w-3.5 text-primary" />
                        {app.cvFileName || 'CV_Anexo.pdf'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">{getStatusBadge(app.status)}</td>

                    <td className="py-3.5 px-4 text-slate-400">
                      {new Date(app.createdAt).toLocaleDateString('pt-PT')}
                    </td>

                    <td className="py-3.5 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenDetail(app)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-primary hover:text-white font-bold rounded text-slate-700 transition"
                        >
                          Avaliar
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setDeletingId(app.id)
                            setIsDeleteModalOpen(true)
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition"
                          title="Eliminar candidatura"
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

      {/* Modal Detalhes da Candidatura */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm"
            onClick={() => setSelectedApp(null)}
          />

          <div className="relative w-full max-w-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden z-10 max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <div>
                <span className="text-xs font-mono font-bold text-primary">Candidatura a Vaga</span>
                <h3 className="text-lg font-extrabold text-slate-900">{selectedApp.jobTitle}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedApp(null)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              {/* Candidate Card */}
              <div className="p-4 bg-slate-50 border border-slate-200 grid sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Candidato</p>
                  <p className="font-bold text-slate-900 text-sm">{selectedApp.candidateName}</p>
                  <p className="font-mono text-slate-600 mt-1">{selectedApp.candidateEmail}</p>
                  <p className="font-mono text-slate-600">{selectedApp.candidatePhone}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Documento Anexado</p>
                  <div className="p-2.5 bg-white border border-slate-200 flex items-center gap-2 mt-1">
                    <FileText className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-bold text-slate-800">{selectedApp.cvFileName || 'Curriculo_Vitae.pdf'}</p>
                      <p className="text-[10px] text-slate-400">PDF • Documento verificado</p>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-2">
                    Recebido em: {new Date(selectedApp.createdAt).toLocaleString('pt-PT')}
                  </p>
                </div>
              </div>

              {/* Status Workflow Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Estado do Processo de Recrutamento
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {(['recebida', 'em_analise', 'entrevista', 'aceite', 'rejeitada'] as ApplicationStatus[]).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => handleUpdateStatus(selectedApp.id, st)}
                      className={`py-2 px-2 text-xs font-bold uppercase rounded border transition ${
                        selectedApp.status === st
                          ? 'bg-primary text-white border-primary shadow-sm'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {st.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Presentation Note */}
              {selectedApp.message && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Mensagem de Apresentação do Candidato
                  </label>
                  <div className="p-4 bg-slate-100 border border-slate-200 text-slate-800 text-xs leading-relaxed whitespace-pre-wrap">
                    {selectedApp.message}
                  </div>
                </div>
              )}

              {/* Internal Notes */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Notas de Avaliação e Entrevista (Equipa de RH)
                </label>
                <textarea
                  rows={3}
                  value={appNotes}
                  onChange={(e) => setAppNotes(e.target.value)}
                  placeholder="Ex: Bom conhecimento técnico em redes; agendada entrevista com Diretor de TI..."
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

      {/* Delete Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Eliminar Candidatura"
        message="Tem a certeza que deseja eliminar o registo desta candidatura?"
        confirmText="Sim, Eliminar"
        cancelText="Cancelar"
      />
    </div>
  )
}
