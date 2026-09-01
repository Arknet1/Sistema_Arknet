'use client'

import React, { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import {
  FolderGit2,
  Plus,
  Edit2,
  Trash2,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  Clock,
  Building2,
  Handshake,
  Sparkles,
  ExternalLink,
  X,
  PlusCircle,
  MinusCircle,
  Star,
  Layers,
  Image as ImageIcon,
} from 'lucide-react'
import {
  dataStore,
  ProjectItem,
  PartnerItem,
  ProjectPartnerRef,
  ProjectResultHighlight,
} from '@/lib/data-store'
import { useToast } from '@/lib/toast-context'
import { ConfirmModal } from '@/components/admin/confirm-modal'
import { ImageUpload } from '@/components/admin/image-upload'
import { ExportButton } from '@/components/admin/export-button'
import { exportToCSV } from '@/lib/export-utils'

const CATEGORIES = [
  'Internet Empresarial',
  'Cibersegurança',
  'Computação em Nuvem',
  'CFTV e Segurança',
  'Cabeamento Estruturado',
  'Consultoria & TI',
]

const PARTNERSHIP_TYPES = [
  'Projeto para Cliente',
  'Colaboração Técnica',
  'Patrocínio',
  'Evento Conjunto',
  'Fornecimento de Equipamento',
]

interface FormState {
  title: string
  slug: string
  clientName: string
  category: string
  partnershipType: string
  status: 'concluido' | 'em_curso'
  tagline: string
  description: string
  challenge: string
  solution: string
  image: string
  gallery: string[]
  partners: ProjectPartnerRef[]
  results: ProjectResultHighlight[]
  featured: boolean
  completedAt: string
}

const INITIAL_FORM: FormState = {
  title: '',
  slug: '',
  clientName: '',
  category: 'Internet Empresarial',
  partnershipType: 'Projeto para Cliente',
  status: 'concluido',
  tagline: '',
  description: '',
  challenge: '',
  solution: '',
  image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=80',
  gallery: [],
  partners: [],
  results: [],
  featured: false,
  completedAt: '2026',
}

export default function AdminProjetosPage() {
  const { success, error: toastError, info } = useToast()

  const [projects, setProjects] = useState<ProjectItem[]>([])
  const [availablePartners, setAvailablePartners] = useState<PartnerItem[]>([])

  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'concluido' | 'em_curso'>('all')

  // Modal Criar / Editar
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<ProjectItem | null>(null)
  const [formData, setFormData] = useState<FormState>(INITIAL_FORM)

  // Partner selection temp state
  const [selectedPartnerId, setSelectedPartnerId] = useState('')
  const [partnerRoleInput, setPartnerRoleInput] = useState('')

  // Result metrics temp state
  const [metricLabel, setMetricLabel] = useState('')
  const [metricValue, setMetricValue] = useState('')

  // Gallery temp url
  const [galleryInput, setGalleryInput] = useState('')

  // Modal Delete
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  useEffect(() => {
    const sync = () => {
      const db = dataStore.getSnapshot()
      setProjects(db.projects || [])
      setAvailablePartners(db.partners || [])
    }
    sync()
    const unsub = dataStore.subscribe(sync)
    return () => unsub()
  }, [])

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const matchSearch =
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase())

      const matchCategory =
        categoryFilter === 'all' || p.category.toLowerCase() === categoryFilter.toLowerCase()

      const matchStatus = statusFilter === 'all' || p.status === statusFilter

      return matchSearch && matchCategory && matchStatus
    })
  }, [projects, searchTerm, categoryFilter, statusFilter])

  // Abrir Modal de Criação
  const handleOpenCreate = () => {
    setEditingProject(null)
    setFormData(INITIAL_FORM)
    setSelectedPartnerId('')
    setPartnerRoleInput('')
    setMetricLabel('')
    setMetricValue('')
    setGalleryInput('')
    setIsModalOpen(true)
  }

  // Abrir Modal de Edição
  const handleOpenEdit = (p: ProjectItem) => {
    setEditingProject(p)
    setFormData({
      title: p.title,
      slug: p.slug,
      clientName: p.clientName,
      category: p.category,
      partnershipType: p.partnershipType || 'Projeto para Cliente',
      status: p.status,
      tagline: p.tagline || '',
      description: p.description || '',
      challenge: p.challenge || '',
      solution: p.solution || '',
      image: p.image || '',
      gallery: p.gallery || [],
      partners: p.partners || [],
      results: p.results || [],
      featured: Boolean(p.featured),
      completedAt: p.completedAt || '',
    })
    setSelectedPartnerId('')
    setPartnerRoleInput('')
    setMetricLabel('')
    setMetricValue('')
    setGalleryInput('')
    setIsModalOpen(true)
  }

  // Gerar Slug Automático
  const handleTitleChange = (val: string) => {
    const slug = val
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
    setFormData((prev) => ({
      ...prev,
      title: val,
      slug: !editingProject ? slug : prev.slug,
    }))
  }

  // Adicionar Parceiro ao Projeto
  const handleAddPartner = () => {
    if (!selectedPartnerId) return
    const partner = availablePartners.find((p) => p.id === selectedPartnerId)
    if (!partner) return

    const alreadyAdded = formData.partners.some((p) => p.partnerId === partner.id)
    if (alreadyAdded) {
      toastError('Este parceiro já foi associado ao projeto.')
      return
    }

    const newRef: ProjectPartnerRef = {
      partnerId: partner.id,
      partnerName: partner.name,
      partnerLogo: partner.logo,
      partnerWebsite: partner.website,
      role: partnerRoleInput.trim() || 'Parceiro Estratégico',
    }

    setFormData((prev) => ({
      ...prev,
      partners: [...prev.partners, newRef],
    }))

    setSelectedPartnerId('')
    setPartnerRoleInput('')
  }

  // Remover Parceiro
  const handleRemovePartner = (partnerId: string) => {
    setFormData((prev) => ({
      ...prev,
      partners: prev.partners.filter((p) => p.partnerId !== partnerId),
    }))
  }

  // Adicionar Métrica / Destaque
  const handleAddMetric = () => {
    if (!metricLabel.trim() || !metricValue.trim()) return

    setFormData((prev) => ({
      ...prev,
      results: [...prev.results, { label: metricLabel.trim(), value: metricValue.trim() }],
    }))
    setMetricLabel('')
    setMetricValue('')
  }

  // Remover Métrica
  const handleRemoveMetric = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      results: prev.results.filter((_, i) => i !== index),
    }))
  }

  // Adicionar Imagem à Galeria
  const handleAddGalleryImage = () => {
    if (!galleryInput.trim()) return
    setFormData((prev) => ({
      ...prev,
      gallery: [...prev.gallery, galleryInput.trim()],
    }))
    setGalleryInput('')
  }

  // Remover Imagem da Galeria
  const handleRemoveGalleryImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      gallery: prev.gallery.filter((_, i) => i !== index),
    }))
  }

  // Salvar Projeto
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title.trim()) {
      toastError('O título do projeto é obrigatório.')
      return
    }
    if (!formData.clientName.trim()) {
      toastError('O nome do cliente/instituição é obrigatório.')
      return
    }

    const payload = {
      title: formData.title.trim(),
      slug: formData.slug.trim() || formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      clientName: formData.clientName.trim(),
      category: formData.category,
      partnershipType: formData.partnershipType,
      status: formData.status,
      tagline: formData.tagline.trim(),
      description: formData.description.trim(),
      challenge: formData.challenge.trim(),
      solution: formData.solution.trim(),
      image: formData.image || 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=80',
      gallery: formData.gallery,
      partners: formData.partners,
      results: formData.results,
      featured: formData.featured,
      completedAt: formData.completedAt.trim(),
    }

    if (editingProject) {
      dataStore.updateProject(editingProject.id, payload)
      success(`Projeto "${formData.title}" atualizado com sucesso!`)
    } else {
      dataStore.addProject(payload)
      success(`Projeto "${formData.title}" criado com sucesso!`)
    }

    setIsModalOpen(false)
  }

  // Confirmar Eliminação
  const handleDeleteConfirm = () => {
    if (deletingId) {
      dataStore.deleteProject(deletingId)
      success('Projeto eliminado com sucesso.')
      setIsDeleteModalOpen(false)
      setDeletingId(null)
    }
  }

  const handleExportCSV = () => {
    exportToCSV(
      filteredProjects,
      'ARKNET_Projetos_Portfolio',
      [
        { key: 'title', header: 'Título do Projeto' },
        { key: 'clientName', header: 'Cliente / Instituição' },
        { key: 'category', header: 'Área / Categoria' },
        { key: 'status', header: 'Estado' },
        {
          key: 'partners',
          header: 'Empresas Parceiras',
          format: (pts) => (pts || []).map((p: any) => `${p.partnerName} (${p.role})`).join(' | '),
        },
        { key: 'completedAt', header: 'Ano / Conclusão' },
        { key: 'featured', header: 'Destaque', format: (f) => (f ? 'Sim' : 'Não') },
      ]
    )
  }

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <FolderGit2 className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-extrabold text-slate-900">
              Projetos &amp; Casos de Estudo
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Gira os projetos tecnológicos, parcerias envolvidas e casos de sucesso apresentados no portfólio público.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <ExportButton onExport={handleExportCSV} label="Exportar (CSV)" />

          <button
            type="button"
            onClick={handleOpenCreate}
            className="px-4 py-2 bg-primary hover:bg-primary/90 text-white font-bold text-xs uppercase tracking-wider rounded transition flex items-center gap-2 shadow-xs"
          >
            <Plus className="h-4 w-4" />
            <span>Novo Projeto</span>
          </button>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-white border border-slate-200 p-4 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Pesquisar por projeto, cliente, categoria..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:bg-white focus:border-primary focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-slate-400" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-300 text-xs text-slate-700 focus:bg-white focus:border-primary focus:outline-none font-medium"
            >
              <option value="all">Todas as Áreas ({projects.length})</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-2 bg-slate-50 border border-slate-300 text-xs text-slate-700 focus:bg-white focus:border-primary focus:outline-none font-medium"
            >
              <option value="all">Todos os Estados</option>
              <option value="concluido">Concluídos ({projects.filter((p) => p.status === 'concluido').length})</option>
              <option value="em_curso">Em Curso ({projects.filter((p) => p.status === 'em_curso').length})</option>
            </select>
          </div>
        </div>
      </div>

      {/* Projects Table */}
      <div className="bg-white border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase tracking-wider font-bold text-[11px]">
              <tr>
                <th className="py-3.5 px-6">Projeto</th>
                <th className="py-3.5 px-4">Cliente</th>
                <th className="py-3.5 px-4">Área / Categoria</th>
                <th className="py-3.5 px-4">Estado</th>
                <th className="py-3.5 px-4">Parceiros</th>
                <th className="py-3.5 px-4 text-center">Destaque</th>
                <th className="py-3.5 px-6 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProjects.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Nenhum projeto registado com os critérios selecionados.
                  </td>
                </tr>
              ) : (
                filteredProjects.map((p) => {
                  const isCompleted = p.status === 'concluido'

                  return (
                    <tr key={p.id} className="hover:bg-slate-50 transition group">
                      
                      {/* Project Name + Image */}
                      <td className="py-3.5 px-6">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.image}
                            alt={p.title}
                            className="w-12 h-10 object-cover rounded border border-slate-200 shrink-0"
                          />
                          <div>
                            <p className="font-bold text-slate-900 group-hover:text-primary transition">
                              {p.title}
                            </p>
                            <p className="text-[10px] text-slate-400 font-mono">
                              /projetos/{p.slug}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Client */}
                      <td className="py-3.5 px-4 font-semibold text-slate-800">
                        {p.clientName}
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 text-[10px] font-bold uppercase bg-slate-100 text-slate-700 rounded border border-slate-200">
                          {p.category}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-full inline-flex items-center gap-1 ${
                            isCompleted
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-amber-100 text-amber-800 border border-amber-300'
                          }`}
                        >
                          {isCompleted ? <CheckCircle2 className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                          <span>{isCompleted ? 'Concluído' : 'Em Curso'}</span>
                        </span>
                      </td>

                      {/* Partners */}
                      <td className="py-3.5 px-4">
                        {p.partners && p.partners.length > 0 ? (
                          <div className="flex items-center gap-1 text-slate-600">
                            <Handshake className="h-3.5 w-3.5 text-primary shrink-0" />
                            <span className="font-bold">{p.partners.length}</span>
                            <span className="text-[10px] text-slate-400">
                              ({p.partners.map((pt) => pt.partnerName).join(', ')})
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">Direto</span>
                        )}
                      </td>

                      {/* Featured */}
                      <td className="py-3.5 px-4 text-center">
                        {p.featured ? (
                          <Star className="h-4 w-4 text-amber-500 fill-amber-500 mx-auto" />
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/projetos/${p.slug}`}
                            target="_blank"
                            className="p-1.5 text-slate-400 hover:text-primary transition"
                            title="Ver página pública"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Link>

                          <button
                            type="button"
                            onClick={() => handleOpenEdit(p)}
                            className="p-1.5 text-slate-400 hover:text-slate-900 transition"
                            title="Editar Projeto"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setDeletingId(p.id)
                              setIsDeleteModalOpen(true)
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 transition"
                            title="Eliminar Projeto"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>

                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Criação / Edição */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          />

          <div className="relative w-full max-w-3xl bg-white border border-slate-200 shadow-2xl overflow-hidden z-10 max-h-[90vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <span className="text-xs font-mono font-bold text-primary">Gestão de Portfólio</span>
                <h3 className="text-lg font-black text-slate-900">
                  {editingProject ? 'Editar Projeto' : 'Novo Projeto'}
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

            {/* Modal Form */}
            <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              
              {/* Secção 1: Dados Gerais */}
              <div className="space-y-4">
                <h4 className="font-extrabold uppercase text-slate-900 tracking-wider pb-2 border-b border-slate-100 flex items-center gap-1.5">
                  <FolderGit2 className="h-4 w-4 text-primary" />
                  <span>1. Identificação do Projeto</span>
                </h4>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Título do Projeto *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => handleTitleChange(e.target.value)}
                      placeholder="Ex: Modernização de Rede — Tribunal Supremo"
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 focus:bg-white focus:border-primary focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Cliente / Instituição *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.clientName}
                      onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                      placeholder="Ex: Tribunal Supremo de Angola"
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 focus:bg-white focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Área / Categoria
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 focus:bg-white focus:border-primary focus:outline-none font-medium"
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Tipo de Parceria
                    </label>
                    <select
                      value={formData.partnershipType}
                      onChange={(e) => setFormData({ ...formData, partnershipType: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 focus:bg-white focus:border-primary focus:outline-none font-medium"
                    >
                      {PARTNERSHIP_TYPES.map((pt) => (
                        <option key={pt} value={pt}>{pt}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Estado do Projeto
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 focus:bg-white focus:border-primary focus:outline-none font-medium"
                    >
                      <option value="concluido">✅ Concluído</option>
                      <option value="em_curso">⏳ Em Execução</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Ano / Conclusão
                    </label>
                    <input
                      type="text"
                      value={formData.completedAt}
                      onChange={(e) => setFormData({ ...formData, completedAt: e.target.value })}
                      placeholder="Ex: 2025 ou Em Curso"
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 focus:bg-white focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="h-4 w-4 text-primary rounded border-slate-300"
                  />
                  <label htmlFor="featured" className="font-bold text-slate-700 cursor-pointer">
                    Destacar este projeto na homepage e no topo da listagem
                  </label>
                </div>
              </div>

              {/* Secção 2: Textos & Narrativa */}
              <div className="space-y-4">
                <h4 className="font-extrabold uppercase text-slate-900 tracking-wider pb-2 border-b border-slate-100 flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span>2. Detalhes &amp; Narrativa do Projeto</span>
                </h4>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Frase de Resumo (Tagline)
                  </label>
                  <input
                    type="text"
                    value={formData.tagline}
                    onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                    placeholder="Ex: Implementação de rede Cat6A e interligação de salas de audiência."
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 focus:bg-white focus:border-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Descrição Geral do Projeto
                  </label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Descrição completa do trabalho realizado..."
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 focus:bg-white focus:border-primary focus:outline-none"
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1 text-rose-700">
                      O Desafio do Cliente
                    </label>
                    <textarea
                      rows={3}
                      value={formData.challenge}
                      onChange={(e) => setFormData({ ...formData, challenge: e.target.value })}
                      placeholder="Qual era o problema enfrentado pelo cliente..."
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 focus:bg-white focus:border-primary focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1 text-emerald-700">
                      A Solução Implementada
                    </label>
                    <textarea
                      rows={3}
                      value={formData.solution}
                      onChange={(e) => setFormData({ ...formData, solution: e.target.value })}
                      placeholder="Como a ARKNET e parceiros resolveram o problema..."
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 focus:bg-white focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Secção 3: Imagem de Destaque */}
              <div className="space-y-4">
                <h4 className="font-extrabold uppercase text-slate-900 tracking-wider pb-2 border-b border-slate-100 flex items-center gap-1.5">
                  <ImageIcon className="h-4 w-4 text-primary" />
                  <span>3. Imagem Principal</span>
                </h4>

                <ImageUpload
                  value={formData.image}
                  onChange={(url) => setFormData({ ...formData, image: url })}
                  label="Fotografia de Destaque do Projeto"
                  helperText="Recomendado: 800x600px ou formato 16:9"
                  aspectRatio="video"
                />
              </div>

              {/* Secção 4: Empresas Parceiras Envolvidas (N:N) */}
              <div className="space-y-4">
                <h4 className="font-extrabold uppercase text-slate-900 tracking-wider pb-2 border-b border-slate-100 flex items-center gap-1.5">
                  <Handshake className="h-4 w-4 text-primary" />
                  <span>4. Empresas Parceiras Envolvidas</span>
                </h4>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded space-y-3">
                  <div className="grid sm:grid-cols-12 gap-3 items-end">
                    <div className="sm:col-span-6">
                      <label className="block font-bold text-slate-700 mb-1">
                        Selecionar Parceiro
                      </label>
                      <select
                        value={selectedPartnerId}
                        onChange={(e) => setSelectedPartnerId(e.target.value)}
                        className="w-full p-2 bg-white border border-slate-300 text-xs text-slate-800"
                      >
                        <option value="">-- Escolha da lista de parceiros cadastrados --</option>
                        {availablePartners.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} ({p.category || 'Parceiro'})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="sm:col-span-4">
                      <label className="block font-bold text-slate-700 mb-1">
                        Papel / Função no Projeto
                      </label>
                      <input
                        type="text"
                        value={partnerRoleInput}
                        onChange={(e) => setPartnerRoleInput(e.target.value)}
                        placeholder="Ex: Fornecimento de Hardware"
                        className="w-full p-2 bg-white border border-slate-300 text-xs text-slate-800"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <button
                        type="button"
                        onClick={handleAddPartner}
                        className="w-full py-2 bg-slate-900 hover:bg-primary text-white font-bold text-xs uppercase rounded transition"
                      >
                        Associar
                      </button>
                    </div>
                  </div>

                  {/* Lista de Parceiros Associados */}
                  {formData.partners.length > 0 && (
                    <div className="space-y-2 pt-2">
                      <p className="text-[11px] font-bold uppercase text-slate-600">
                        Parceiros Associados a este Projeto:
                      </p>
                      <div className="space-y-1.5">
                        {formData.partners.map((partner) => (
                          <div
                            key={partner.partnerId}
                            className="p-2 bg-white border border-slate-200 rounded flex items-center justify-between"
                          >
                            <div>
                              <span className="font-bold text-slate-900">{partner.partnerName}</span>
                              <span className="text-slate-500 text-[11px] ml-2 font-medium">
                                • {partner.role}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemovePartner(partner.partnerId)}
                              className="text-rose-500 hover:text-rose-700 p-1"
                              title="Remover parceiro do projeto"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Secção 5: Métricas / Resultados de Destaque */}
              <div className="space-y-4">
                <h4 className="font-extrabold uppercase text-slate-900 tracking-wider pb-2 border-b border-slate-100 flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span>5. Resultados &amp; Conquistas (Métricas)</span>
                </h4>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded space-y-3">
                  <div className="grid sm:grid-cols-12 gap-3 items-end">
                    <div className="sm:col-span-6">
                      <label className="block font-bold text-slate-700 mb-1">
                        Descrição da Métrica
                      </label>
                      <input
                        type="text"
                        value={metricLabel}
                        onChange={(e) => setMetricLabel(e.target.value)}
                        placeholder="Ex: Postos Conectados"
                        className="w-full p-2 bg-white border border-slate-300 text-xs text-slate-800"
                      />
                    </div>

                    <div className="sm:col-span-4">
                      <label className="block font-bold text-slate-700 mb-1">
                        Valor
                      </label>
                      <input
                        type="text"
                        value={metricValue}
                        onChange={(e) => setMetricValue(e.target.value)}
                        placeholder="Ex: +350 ou 99.99%"
                        className="w-full p-2 bg-white border border-slate-300 text-xs text-slate-800 font-mono font-bold"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <button
                        type="button"
                        onClick={handleAddMetric}
                        className="w-full py-2 bg-slate-900 hover:bg-primary text-white font-bold text-xs uppercase rounded transition"
                      >
                        Adicionar
                      </button>
                    </div>
                  </div>

                  {/* Lista de Métricas */}
                  {formData.results.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {formData.results.map((m, idx) => (
                        <div
                          key={idx}
                          className="px-3 py-1 bg-white border border-slate-300 rounded-full flex items-center gap-2 text-xs"
                        >
                          <span className="font-mono font-bold text-primary">{m.value}</span>
                          <span className="text-slate-700">{m.label}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveMetric(idx)}
                            className="text-slate-400 hover:text-rose-600"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Botões do Modal */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 text-slate-700 font-bold text-xs uppercase hover:bg-slate-200 transition rounded"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-primary text-white font-bold text-xs uppercase hover:bg-primary/90 transition rounded shadow-md"
                >
                  {editingProject ? 'Guardar Alterações' : 'Criar Projeto'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* Modal de Eliminação */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Eliminar Projeto"
        message="Tem a certeza que deseja eliminar este projeto do portfólio? A página correspondente deixará de estar disponível."
        confirmText="Sim, Eliminar"
        cancelText="Cancelar"
      />

    </div>
  )
}
