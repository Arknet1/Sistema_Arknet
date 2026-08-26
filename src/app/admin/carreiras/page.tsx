'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Briefcase,
  Plus,
  Edit2,
  Trash2,
  MapPin,
  Clock,
  UserCheck,
  Search,
  ExternalLink,
  X,
  CheckCircle2,
  PauseCircle,
  XCircle,
} from 'lucide-react'
import { dataStore, JobPosition } from '@/lib/data-store'
import { useToast } from '@/lib/toast-context'
import { ConfirmModal } from '@/components/admin/confirm-modal'

export default function AdminCarreirasPage() {
  const { success, info, error } = useToast()

  const [jobs, setJobs] = useState<JobPosition[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'aberta' | 'fechada' | 'pausada'>('all')

  // Modal Criar/Editar Vaga
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingJob, setEditingJob] = useState<JobPosition | null>(null)
  const [formData, setFormData] = useState<{
    title: string
    department: string
    location: string
    type: JobPosition['type']
    description: string
    requirementsText: string
    benefitsText: string
    status: JobPosition['status']
  }>({
    title: '',
    department: 'Engenharia & TI',
    location: 'Luanda, Angola',
    type: 'Full-time',
    description: '',
    requirementsText: 'Licenciatura na área ou experiência comprovada\nConhecimentos sólidos de redes e infraestruturas\nEspírito de equipa e responsabilidade',
    benefitsText: 'Salário competitivo\nPlano de saúde familiar\nFormações contínuas e certificações',
    status: 'aberta',
  })

  // Delete Modal
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  useEffect(() => {
    const sync = () => {
      const db = dataStore.getSnapshot()
      setJobs([...db.jobs])
    }
    sync()
    const unsub = dataStore.subscribe(sync)
    return () => unsub()
  }, [])

  const filteredJobs = jobs.filter((job) => {
    const matchSearch =
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.department.toLowerCase().includes(searchTerm.toLowerCase())
    const matchStatus = statusFilter === 'all' || job.status === statusFilter
    return matchSearch && matchStatus
  })

  const handleOpenCreate = () => {
    setEditingJob(null)
    setFormData({
      title: '',
      department: 'Engenharia & TI',
      location: 'Luanda, Angola',
      type: 'Full-time',
      description: '',
      requirementsText: 'Licenciatura na área ou experiência equivalente\nCertificações técnicas reconhecidas\nCapacidade de comunicação e proatividade',
      benefitsText: 'Salário competitivo\nPlano de saúde\nFormações na Academia ARKNET',
      status: 'aberta',
    })
    setIsModalOpen(true)
  }

  const handleOpenEdit = (job: JobPosition) => {
    setEditingJob(job)
    setFormData({
      title: job.title,
      department: job.department,
      location: job.location,
      type: job.type,
      description: job.description,
      requirementsText: (job.requirements || []).join('\n'),
      benefitsText: (job.benefits || []).join('\n'),
      status: job.status,
    })
    setIsModalOpen(true)
  }

  const handleSaveJob = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim()) {
      error('O título da vaga é obrigatório.')
      return
    }

    const requirements = formData.requirementsText
      .split('\n')
      .map((r) => r.trim())
      .filter(Boolean)

    const benefits = formData.benefitsText
      .split('\n')
      .map((b) => b.trim())
      .filter(Boolean)

    if (editingJob) {
      dataStore.updateJob(editingJob.id, {
        title: formData.title.trim(),
        department: formData.department.trim(),
        location: formData.location.trim(),
        type: formData.type,
        description: formData.description.trim(),
        requirements,
        benefits,
        status: formData.status,
      })
      success(`Vaga "${formData.title}" atualizada com sucesso!`, 'Vaga Atualizada')
    } else {
      dataStore.addJob({
        title: formData.title.trim(),
        department: formData.department.trim(),
        location: formData.location.trim(),
        type: formData.type,
        description: formData.description.trim(),
        requirements,
        benefits,
        status: formData.status,
      })
      success(`Nova oportunidade de emprego "${formData.title}" aberta!`, 'Vaga Criada')
    }

    setIsModalOpen(false)
  }

  const handleToggleStatus = (job: JobPosition, newStatus: JobPosition['status']) => {
    dataStore.updateJob(job.id, { status: newStatus })
    info(`Estado da vaga "${job.title}" alterado para ${newStatus}.`)
  }

  const handleDeleteConfirm = () => {
    if (deletingId) {
      dataStore.deleteJob(deletingId)
      success('Vaga eliminada com sucesso.', 'Vaga Eliminada')
      setIsDeleteModalOpen(false)
      setDeletingId(null)
    }
  }

  const getStatusBadge = (status: JobPosition['status']) => {
    switch (status) {
      case 'aberta':
        return <span className="px-2.5 py-1 text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 rounded-full">Vaga Aberta</span>
      case 'fechada':
        return <span className="px-2.5 py-1 text-[10px] font-bold uppercase bg-slate-100 text-slate-600 rounded-full">Fechada</span>
      case 'pausada':
        return <span className="px-2.5 py-1 text-[10px] font-bold uppercase bg-amber-100 text-amber-800 rounded-full">Pausada</span>
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Briefcase className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-extrabold text-slate-900">Vagas de Emprego & Carreiras</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Publique e administre as ofertas de emprego disponíveis no website (`/carreiras`).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/candidaturas"
            className="inline-flex items-center gap-2 px-4 py-2.5 border border-slate-300 bg-white text-slate-700 text-xs font-bold uppercase hover:bg-slate-50 transition"
          >
            <UserCheck className="h-4 w-4 text-primary" />
            Ver Candidaturas
          </Link>
          <button
            type="button"
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-secondary text-white text-xs font-bold uppercase tracking-wider hover:bg-secondary/90 transition shadow-sm"
          >
            <Plus className="h-4 w-4" />
            Nova Vaga
          </button>
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
            placeholder="Pesquisar por título de vaga ou departamento..."
            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:bg-white focus:border-primary focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 bg-slate-50 border border-slate-300 text-xs text-slate-700 focus:bg-white focus:border-primary focus:outline-none"
          >
            <option value="all">Todos os Estados ({jobs.length})</option>
            <option value="aberta">Apenas Abertas ({jobs.filter((j) => j.status === 'aberta').length})</option>
            <option value="fechada">Fechadas ({jobs.filter((j) => j.status === 'fechada').length})</option>
            <option value="pausada">Pausadas ({jobs.filter((j) => j.status === 'pausada').length})</option>
          </select>
        </div>
      </div>

      {/* Jobs Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredJobs.map((job) => (
          <div
            key={job.id}
            className="bg-white border border-slate-200 p-6 shadow-xs hover:shadow-md transition flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-3">
                <span className="px-2.5 py-1 bg-slate-100 text-slate-700 text-[10px] font-bold uppercase rounded">
                  {job.department}
                </span>
                {getStatusBadge(job.status)}
              </div>

              <h3 className="font-extrabold text-slate-900 text-base leading-snug">{job.title}</h3>

              <div className="flex items-center gap-3 text-xs text-slate-500 mt-2">
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-slate-400" />
                  {job.location}
                </span>
                <span>•</span>
                <span className="font-semibold text-primary">{job.type}</span>
              </div>

              <p className="text-xs text-slate-600 mt-3 line-clamp-2 leading-relaxed">{job.description}</p>

              {job.requirements && job.requirements.length > 0 && (
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Requisitos:</p>
                  <ul className="text-xs text-slate-600 space-y-1">
                    {job.requirements.slice(0, 2).map((req, i) => (
                      <li key={i} className="truncate flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleToggleStatus(job, job.status === 'aberta' ? 'fechada' : 'aberta')}
                  className="text-[11px] font-bold text-slate-600 hover:text-primary transition"
                >
                  {job.status === 'aberta' ? 'Fechar Vaga' : 'Reabrir Vaga'}
                </button>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleOpenEdit(job)}
                  className="p-1.5 text-slate-600 hover:text-primary hover:bg-slate-100 rounded transition"
                  title="Editar vaga"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDeletingId(job.id)
                    setIsDeleteModalOpen(true)
                  }}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition"
                  title="Eliminar vaga"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Criar/Editar Vaga */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          />

          <div className="relative w-full max-w-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden z-10 max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-primary/10 text-primary rounded">
                  <Briefcase className="h-5 w-5" />
                </div>
                <h3 className="text-base font-extrabold text-slate-900">
                  {editingJob ? 'Editar Vaga de Emprego' : 'Publicar Nova Oportunidade'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveJob} className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Título da Função / Cargo *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="ex: Engenheiro de Redes & Telecomunicações Sénior"
                  className="w-full px-4 py-2.5 text-sm border border-slate-300 focus:border-primary focus:outline-none"
                />
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Departamento *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.department}
                    onChange={(e) => setFormData((prev) => ({ ...prev, department: e.target.value }))}
                    placeholder="Engenharia / TI / Comercial"
                    className="w-full px-4 py-2.5 text-sm border border-slate-300 focus:border-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Tipo de Contrato *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData((prev) => ({ ...prev, type: e.target.value as any }))}
                    className="w-full px-4 py-2.5 text-sm border border-slate-300 focus:border-primary focus:outline-none bg-white"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Estágio">Estágio</option>
                    <option value="Remoto">Remoto</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Estado da Vaga
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value as any }))}
                    className="w-full px-4 py-2.5 text-sm border border-slate-300 focus:border-primary focus:outline-none bg-white"
                  >
                    <option value="aberta">Aberta (Aceita candidaturas)</option>
                    <option value="pausada">Pausada</option>
                    <option value="fechada">Fechada (Preenchida)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Localização *
                </label>
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
                  placeholder="Luanda, Angola"
                  className="w-full px-4 py-2.5 text-sm border border-slate-300 focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Descrição da Função e Responsabilidades
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Resumo da vaga e principais responsabilidades do colaborador..."
                  className="w-full p-3 text-sm border border-slate-300 focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Requisitos e Competências (um por linha)
                </label>
                <textarea
                  rows={3}
                  value={formData.requirementsText}
                  onChange={(e) => setFormData((prev) => ({ ...prev, requirementsText: e.target.value }))}
                  className="w-full p-3 text-sm border border-slate-300 focus:border-primary focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Benefícios e Oferta (um por linha)
                </label>
                <textarea
                  rows={3}
                  value={formData.benefitsText}
                  onChange={(e) => setFormData((prev) => ({ ...prev, benefitsText: e.target.value }))}
                  className="w-full p-3 text-sm border border-slate-300 focus:border-primary focus:outline-none font-mono"
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
                  {editingJob ? 'Guardar Alterações' : 'Publicar Vaga'}
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
        title="Eliminar Vaga"
        message="Tem a certeza que deseja eliminar esta vaga de emprego?"
        confirmText="Sim, Eliminar"
        cancelText="Cancelar"
      />
    </div>
  )
}
