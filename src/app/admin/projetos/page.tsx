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
  Star,
  Layers,
  Image as ImageIcon,
  Activity,
  MapPin,
  Tag,
  Radio,
  Calendar,
} from 'lucide-react'
import {
  dataStore,
  ProjectItem,
  PartnerItem,
  ProjectPartnerRef,
  ProjectResultHighlight,
  DailyActivityItem,
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

interface ProjectFormState {
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

const INITIAL_PROJECT_FORM: ProjectFormState = {
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

const ACTIVITY_CATEGORIES = [
  'Rádio & Imprensa',
  'Formações & Academia',
  'Eventos & Palestras',
  'Operações Técnicas',
  'Institucional',
]

interface ActivityFormState {
  title: string
  category: string
  description: string
  content: string
  image: string
  clientOrLocation: string
  date: string
  time: string
  readTime: string
  author: string
  tags: string
  status: 'concluida' | 'em_andamento'
  featured: boolean
}

const INITIAL_ACTIVITY_FORM: ActivityFormState = {
  title: '',
  category: 'Rádio & Imprensa',
  description: '',
  content: '',
  image: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=800&auto=format&fit=crop&q=80',
  clientOrLocation: 'Rádio Mais 99.1 FM, Luanda',
  date: '2026-03-08',
  time: '09:30',
  readTime: '3 min de leitura',
  author: 'Comunicação ARKNET',
  tags: 'Rádio, Entrevista, Telecomunicações',
  status: 'concluida',
  featured: false,
}

export default function AdminProjetosPage() {
  const { success, error: toastError } = useToast()

  // Tab switcher: 'projetos' | 'atividades'
  const [activeTab, setActiveTab] = useState<'projetos' | 'atividades'>('projetos')

  const [projects, setProjects] = useState<ProjectItem[]>([])
  const [dailyActivities, setDailyActivities] = useState<DailyActivityItem[]>([])
  const [availablePartners, setAvailablePartners] = useState<PartnerItem[]>([])

  // Search & Filters for Projects
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'concluido' | 'em_curso'>('all')

  // Search & Filters for Daily Activities
  const [activitySearchTerm, setActivitySearchTerm] = useState('')
  const [activityStatusFilter, setActivityStatusFilter] = useState<'all' | 'concluida' | 'em_andamento'>('all')

  // Modal Project Create / Edit
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<ProjectItem | null>(null)
  const [projectFormData, setProjectFormData] = useState<ProjectFormState>(INITIAL_PROJECT_FORM)

  // Partner selection temp state
  const [selectedPartnerId, setSelectedPartnerId] = useState('')
  const [partnerRoleInput, setPartnerRoleInput] = useState('')

  // Result metrics temp state
  const [metricLabel, setMetricLabel] = useState('')
  const [metricValue, setMetricValue] = useState('')

  // Modal Daily Activity Create / Edit
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false)
  const [editingActivity, setEditingActivity] = useState<DailyActivityItem | null>(null)
  const [activityFormData, setActivityFormData] = useState<ActivityFormState>(INITIAL_ACTIVITY_FORM)

  // Modal Delete
  const [deletingProjectId, setDeletingProjectId] = useState<string | null>(null)
  const [deletingActivityId, setDeletingActivityId] = useState<string | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [deleteType, setDeleteType] = useState<'project' | 'activity'>('project')

  useEffect(() => {
    const sync = () => {
      const db = dataStore.getSnapshot()
      const rawProjects = db.projects || []
      setProjects(
        rawProjects.map((p: any) => ({
          ...p,
          clientName: p.clientName || p.client || 'ARKNET',
          partnershipType: p.partnershipType || p.sector || 'Projeto para Cliente',
          completedAt: p.completedAt || (p.year ? String(p.year) : '2026'),
          tagline: p.tagline || p.fullDescription || '',
          description: p.description || '',
          challenge: p.challenge || '',
          solution: p.solution || '',
          status: p.status === 'em_curso' ? 'em_curso' : 'concluido',
          partners: Array.isArray(p.partners) ? p.partners : [],
          results: Array.isArray(p.results) ? p.results : [],
          gallery: Array.isArray(p.gallery) ? p.gallery : [],
        }))
      )
      const rawActivities = Array.isArray(db.dailyActivities) ? db.dailyActivities : dataStore.getDailyActivities()
      setDailyActivities(
        (rawActivities || []).map((a: any) => ({
          ...a,
          description: a.description || a.summary || '',
          content: a.content || a.description || a.summary || '',
        }))
      )
      setAvailablePartners(db.partners || [])
    }
    sync()
    const unsub = dataStore.subscribe(sync)
    // Força sincronização com o servidor ao carregar para garantir dados frescos
    dataStore.syncWithServer().then((synced) => {
      if (synced) sync()
    })
    return () => unsub()
  }, [])

  // Filtered Projects
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

  // Filtered Daily Activities
  const filteredDailyActivities = useMemo(() => {
    return dailyActivities.filter((act) => {
      const matchSearch =
        act.title.toLowerCase().includes(activitySearchTerm.toLowerCase()) ||
        act.description.toLowerCase().includes(activitySearchTerm.toLowerCase()) ||
        (act.clientOrLocation && act.clientOrLocation.toLowerCase().includes(activitySearchTerm.toLowerCase())) ||
        (act.tags && act.tags.some((t) => t.toLowerCase().includes(activitySearchTerm.toLowerCase())))

      const matchStatus = activityStatusFilter === 'all' || act.status === activityStatusFilter

      return matchSearch && matchStatus
    })
  }, [dailyActivities, activitySearchTerm, activityStatusFilter])

  // Open Project Modals
  const handleOpenCreateProject = () => {
    setEditingProject(null)
    setProjectFormData(INITIAL_PROJECT_FORM)
    setSelectedPartnerId('')
    setPartnerRoleInput('')
    setMetricLabel('')
    setMetricValue('')
    setIsProjectModalOpen(true)
  }

  const handleOpenEditProject = (p: any) => {
    setEditingProject(p)
    setProjectFormData({
      title: p.title || '',
      slug: p.slug || '',
      clientName: p.clientName || p.client || 'ARKNET',
      category: p.category || 'Internet Empresarial',
      partnershipType: p.partnershipType || p.sector || 'Projeto para Cliente',
      status: p.status === 'em_curso' ? 'em_curso' : 'concluido',
      tagline: p.tagline || p.fullDescription || '',
      description: p.description || '',
      challenge: p.challenge || '',
      solution: p.solution || '',
      image: p.image || '',
      gallery: Array.isArray(p.gallery) ? p.gallery : [],
      partners: Array.isArray(p.partners) ? p.partners : [],
      results: Array.isArray(p.results) ? p.results : [],
      featured: Boolean(p.featured),
      completedAt: p.completedAt || (p.year ? String(p.year) : '2026'),
    })
    setSelectedPartnerId('')
    setPartnerRoleInput('')
    setMetricLabel('')
    setMetricValue('')
    setIsProjectModalOpen(true)
  }

  const handleProjectTitleChange = (val: string) => {
    const slug = val
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
    setProjectFormData((prev) => ({
      ...prev,
      title: val,
      slug: !editingProject ? slug : prev.slug,
    }))
  }

  const handleAddPartner = () => {
    if (!selectedPartnerId) return
    const partner = availablePartners.find((p) => p.id === selectedPartnerId)
    if (!partner) return

    const alreadyAdded = projectFormData.partners.some((p) => p.partnerId === partner.id)
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

    setProjectFormData((prev) => ({
      ...prev,
      partners: [...prev.partners, newRef],
    }))

    setSelectedPartnerId('')
    setPartnerRoleInput('')
  }

  const handleRemovePartner = (partnerId: string) => {
    setProjectFormData((prev) => ({
      ...prev,
      partners: prev.partners.filter((p) => p.partnerId !== partnerId),
    }))
  }

  const handleAddMetric = () => {
    if (!metricLabel.trim() || !metricValue.trim()) return

    setProjectFormData((prev) => ({
      ...prev,
      results: [...prev.results, { label: metricLabel.trim(), value: metricValue.trim() }],
    }))
    setMetricLabel('')
    setMetricValue('')
  }

  const handleRemoveMetric = (index: number) => {
    setProjectFormData((prev) => ({
      ...prev,
      results: prev.results.filter((_, i) => i !== index),
    }))
  }

  const handleGalleryImageChange = (index: number, url: string) => {
    setProjectFormData((prev) => {
      const gallery = [...(prev.gallery || [])]
      gallery[index] = url
      return { ...prev, gallery: gallery.filter(Boolean) }
    })
  }

  const handleAddGallerySlot = () => {
    setProjectFormData((prev) => {
      const currentGallery = prev.gallery || []
      if (currentGallery.length >= 6) return prev
      return { ...prev, gallery: [...currentGallery, ''] }
    })
  }

  const handleRemoveGalleryImage = (index: number) => {
    setProjectFormData((prev) => {
      const nextGallery = (prev.gallery || []).filter((_, i) => i !== index)
      return { ...prev, gallery: nextGallery }
    })
  }

  const handleSaveProject = (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const fallbackTitle = (projectFormData.title || '').trim() || 'Projeto Sem Título'
      const generatedSlug = fallbackTitle
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')

      const projectStatus: 'concluido' | 'em_curso' =
        projectFormData.status === 'em_curso' ? 'em_curso' : 'concluido'

      const payload = {
        title: fallbackTitle,
        slug: (projectFormData.slug || '').trim() || generatedSlug || `projeto-${Date.now()}`,
        clientName: (projectFormData.clientName || '').trim() || 'ARKNET',
        category: projectFormData.category || 'Internet Empresarial',
        partnershipType: projectFormData.partnershipType || 'Projeto para Cliente',
        status: projectStatus,
        tagline: (projectFormData.tagline || '').trim() || '',
        description: (projectFormData.description || '').trim() || '',
        challenge: (projectFormData.challenge || '').trim() || '',
        solution: (projectFormData.solution || '').trim() || '',
        image: projectFormData.image || 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=80',
        gallery: (projectFormData.gallery || []).filter(Boolean),
        partners: projectFormData.partners || [],
        results: projectFormData.results || [],
        featured: Boolean(projectFormData.featured),
        completedAt: (projectFormData.completedAt || '').trim() || new Date().getFullYear().toString(),
      }

      if (editingProject) {
        dataStore.updateProject(editingProject.id, payload)
        success(`Projeto "${payload.title}" atualizado com sucesso!`)
      } else {
        dataStore.addProject(payload)
        success(`Projeto "${payload.title}" criado com sucesso!`)
      }

      // Força persistência imediata no servidor
      dataStore.persistNow().catch((err: any) =>
        console.warn('[AdminProjetos] Falha ao persistir projeto no servidor:', err)
      )

      setIsProjectModalOpen(false)
    } catch (err) {
      console.error('[AdminProjetos] Erro ao guardar projeto:', err)
      toastError('Ocorreu um erro ao guardar o projeto. Verifique os dados e tente novamente.')
    }
  }

  // Open Daily Activity Modals
  const handleOpenCreateActivity = () => {
    setEditingActivity(null)
    setActivityFormData(INITIAL_ACTIVITY_FORM)
    setIsActivityModalOpen(true)
  }

  const handleOpenEditActivity = (act: any) => {
    setEditingActivity(act)
    const rawTags = Array.isArray(act.tags)
      ? act.tags.join(', ')
      : typeof act.tags === 'string'
      ? act.tags
      : ''

    setActivityFormData({
      title: act.title || '',
      category: act.category || 'Rádio & Imprensa',
      description: act.description || act.summary || '',
      content: act.content || act.description || act.summary || '',
      image: act.image || '',
      clientOrLocation: act.clientOrLocation || '',
      date: act.date || '2026-03-08',
      time: act.time || '09:30',
      readTime: act.readTime || '3 min de leitura',
      author: act.author || 'Comunicação ARKNET',
      tags: rawTags,
      status: act.status || 'concluida',
      featured: Boolean(act.featured),
    })
    setIsActivityModalOpen(true)
  }

  const handleSaveActivity = (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const tagList = (activityFormData.tags || '')
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)

      const fallbackTitle = (activityFormData.title || '').trim() || 'Notícia / Atividade ARKNET'
      const fallbackDesc = (activityFormData.description || '').trim() || 'Registo de atividade operacional ARKNET.'
      const fallbackContent = (activityFormData.content || '').trim() || fallbackDesc

      const payload = {
        title: fallbackTitle,
        category: activityFormData.category || 'Operações Técnicas',
        description: fallbackDesc,
        content: fallbackContent,
        image: activityFormData.image || 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=800&auto=format&fit=crop&q=80',
        clientOrLocation: (activityFormData.clientOrLocation || '').trim() || 'Luanda, Angola',
        date: (activityFormData.date || '').trim() || new Date().toISOString().split('T')[0],
        time: (activityFormData.time || '').trim() || '12:00',
        readTime: (activityFormData.readTime || '').trim() || '3 min de leitura',
        author: (activityFormData.author || '').trim() || 'Comunicação ARKNET',
        tags: tagList.length > 0 ? tagList : ['Atividades', 'ARKNET'],
        status: (activityFormData.status === 'em_andamento' ? 'em_andamento' : 'concluida') as 'concluida' | 'em_andamento',
        featured: Boolean(activityFormData.featured),
      }

      if (editingActivity) {
        dataStore.updateDailyActivity(editingActivity.id, payload)
        success(`Notícia / Atividade "${payload.title}" atualizada com sucesso!`)
      } else {
        dataStore.addDailyActivity(payload)
        success(`Nova notícia / atividade "${payload.title}" publicada no Blog com sucesso!`)
      }

      // Força persistência imediata no servidor
      dataStore.persistNow().catch((err: any) =>
        console.warn('[AdminProjetos] Falha ao persistir atividade no servidor:', err)
      )

      setIsActivityModalOpen(false)
    } catch (err) {
      console.error('[AdminProjetos] Erro ao guardar notícia / atividade:', err)
      toastError('Ocorreu um erro ao guardar a notícia. Verifique os dados e tente novamente.')
    }
  }

  // Confirm Delete Handler
  const handleDeleteConfirm = () => {
    if (deleteType === 'project' && deletingProjectId) {
      dataStore.deleteProject(deletingProjectId)
      success('Projeto eliminado com sucesso.')
      setIsDeleteModalOpen(false)
      setDeletingProjectId(null)
    } else if (deleteType === 'activity' && deletingActivityId) {
      dataStore.deleteDailyActivity(deletingActivityId)
      success('Atividade diária eliminada com sucesso.')
      setIsDeleteModalOpen(false)
      setDeletingActivityId(null)
    }
  }

  const handleExportCSV = () => {
    if (activeTab === 'projetos') {
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
    } else {
      exportToCSV(
        filteredDailyActivities,
        'ARKNET_Atividades_Diarias_Painel',
        [
          { key: 'title', header: 'Título da Atividade' },
          { key: 'clientOrLocation', header: 'Cliente / Localização' },
          { key: 'date', header: 'Data' },
          { key: 'time', header: 'Hora' },
          { key: 'status', header: 'Estado' },
          {
            key: 'tags',
            header: 'Tags / Especialidades',
            format: (tgs) => (tgs || []).join(', '),
          },
          { key: 'featured', header: 'Destaque no Feed', format: (f) => (f ? 'Sim' : 'Não') },
        ]
      )
    }
  }

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <FolderGit2 className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-extrabold text-slate-900">
              Projetos &amp; Blog de Atividades ARKNET
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Gira os projetos de portfólio de engenharia e as publicações editoriais do blog de atividades da empresa (Rádio, Formações, Eventos, etc.).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <ExportButton onExport={handleExportCSV} label="Exportar (CSV)" />

          {activeTab === 'projetos' ? (
            <button
              type="button"
              onClick={handleOpenCreateProject}
              className="px-4 py-2 bg-primary hover:bg-primary/90 text-white font-bold text-xs uppercase tracking-wider rounded transition flex items-center gap-2 shadow-xs"
            >
              <Plus className="h-4 w-4" />
              <span>Novo Projeto</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleOpenCreateActivity}
              className="px-4 py-2 bg-secondary hover:bg-secondary/90 text-white font-bold text-xs uppercase tracking-wider rounded transition flex items-center gap-2 shadow-xs"
            >
              <Plus className="h-4 w-4" />
              <span>Nova Notícia / Atividade</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex border-b border-slate-200 bg-white px-6 pt-3 gap-6">
        <button
          type="button"
          onClick={() => setActiveTab('projetos')}
          className={`pb-3 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition ${
            activeTab === 'projetos'
              ? 'border-primary text-primary'
              : 'border-transparent text-slate-400 hover:text-slate-700'
          }`}
        >
          <Layers className="h-4 w-4" />
          <span>Portfólio de Projetos</span>
          <span className="px-2 py-0.5 text-[10px] rounded-full bg-slate-100 text-slate-700 font-mono font-bold">
            {projects.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('atividades')}
          className={`pb-3 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition ${
            activeTab === 'atividades'
              ? 'border-secondary text-secondary'
              : 'border-transparent text-slate-400 hover:text-slate-700'
          }`}
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <Activity className="h-4 w-4" />
          <span>Blog de Notícias &amp; Atividades</span>
          <span className="px-2 py-0.5 text-[10px] rounded-full bg-secondary/10 text-secondary font-mono font-bold">
            {dailyActivities.length}
          </span>
        </button>
      </div>

      {/* TAB 1: PROJETOS DE PORTFÓLIO */}
      {activeTab === 'projetos' && (
        <>
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
                                className="w-14 h-11 object-contain bg-slate-900 rounded p-0.5 border border-slate-200 shrink-0"
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
                                onClick={() => handleOpenEditProject(p)}
                                className="p-1.5 text-slate-400 hover:text-slate-900 transition"
                                title="Editar Projeto"
                              >
                                <Edit2 className="h-4 w-4" />
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setDeletingProjectId(p.id)
                                  setDeleteType('project')
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
        </>
      )}

      {/* TAB 2: BLOG DE NOTÍCIAS & ATIVIDADES */}
      {activeTab === 'atividades' && (
        <>
          {/* Info Banner */}
          <div className="bg-gradient-to-r from-secondary/10 via-primary/5 to-slate-50 border border-secondary/20 p-4 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-secondary text-white flex items-center justify-center shrink-0 shadow-sm">
                <Activity className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  Painel Editorial: Blog de Notícias &amp; Atividades da Empresa
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  Publique reportagens, idas à rádio, oficinas da academia, palestras e operações de campo. Estas notícias alimentam directamente o espaço de actividades do sítio público.
                </p>
              </div>
            </div>
            <Link
              href="/projetos#blog-atividades"
              target="_blank"
              className="px-3 py-1.5 bg-white border border-slate-200 hover:border-secondary text-slate-700 hover:text-secondary font-bold text-xs rounded transition flex items-center gap-1.5 shrink-0 shadow-2xs"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Ver Blog Público
            </Link>
          </div>

          {/* Filters Toolbar */}
          <div className="bg-white border border-slate-200 p-4 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={activitySearchTerm}
                onChange={(e) => setActivitySearchTerm(e.target.value)}
                placeholder="Pesquisar notícias por título, veículo, local ou conteúdo..."
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:bg-white focus:border-secondary focus:outline-none"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Filter className="h-4 w-4 text-slate-400" />
              <select
                value={activityStatusFilter}
                onChange={(e) => setActivityStatusFilter(e.target.value as any)}
                className="px-3 py-2 bg-slate-50 border border-slate-300 text-xs text-slate-700 focus:bg-white focus:border-secondary focus:outline-none font-medium"
              >
                <option value="all">Todas as Publicações ({dailyActivities.length})</option>
                <option value="concluida">Publicadas / Concluídas ({dailyActivities.filter((a) => a.status === 'concluida').length})</option>
                <option value="em_andamento">Em Destaque / Recentes ({dailyActivities.filter((a) => a.status === 'em_andamento').length})</option>
              </select>
            </div>
          </div>

          {/* Activities Table */}
          <div className="bg-white border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase tracking-wider font-bold text-[11px]">
                  <tr>
                    <th className="py-3.5 px-6">Notícia / Atividade</th>
                    <th className="py-3.5 px-4">Categoria / Editoria</th>
                    <th className="py-3.5 px-4">Local / Veículo / Autor</th>
                    <th className="py-3.5 px-4">Data</th>
                    <th className="py-3.5 px-4 text-center">Destaque</th>
                    <th className="py-3.5 px-6 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredDailyActivities.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        Nenhuma notícia ou atividade registada no momento.
                      </td>
                    </tr>
                  ) : (
                    filteredDailyActivities.map((act) => {
                      return (
                        <tr key={act.id} className="hover:bg-slate-50 transition group">
                          {/* Activity Name + Image */}
                          <td className="py-3.5 px-6">
                            <div className="flex items-center gap-3">
                              <img
                                src={act.image}
                                alt={act.title}
                                className="w-16 h-12 object-cover rounded border border-slate-200 shrink-0 shadow-2xs"
                              />
                              <div>
                                <p className="font-bold text-slate-900 group-hover:text-secondary transition text-xs line-clamp-1">
                                  {act.title}
                                </p>
                                <p className="text-[11px] text-slate-500 line-clamp-1 max-w-sm">
                                  {act.description}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Category Badge */}
                          <td className="py-3.5 px-4">
                            <span className="px-2.5 py-1 text-[10px] font-bold uppercase rounded border bg-slate-100 text-slate-800 border-slate-200 inline-block">
                              {act.category || 'Atividades'}
                            </span>
                          </td>

                          {/* Location / Author */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-1.5 font-medium text-slate-800">
                              <MapPin className="h-3.5 w-3.5 text-secondary shrink-0" />
                              <span className="line-clamp-1">{act.clientOrLocation || 'Luanda, Angola'}</span>
                            </div>
                            <p className="text-[10px] text-slate-400 mt-0.5">
                              Por {act.author || 'Comunicação ARKNET'}
                            </p>
                          </td>

                          {/* Date */}
                          <td className="py-3.5 px-4">
                            <div className="font-mono text-[11px] text-slate-700 font-semibold">
                              {act.date}
                            </div>
                          </td>

                          {/* Featured */}
                          <td className="py-3.5 px-4 text-center">
                            {act.featured ? (
                              <Star className="h-4 w-4 text-amber-500 fill-amber-500 mx-auto" />
                            ) : (
                              <span className="text-slate-300">-</span>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-6 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleOpenEditActivity(act)}
                                className="p-1.5 text-slate-400 hover:text-slate-900 transition"
                                title="Editar Notícia"
                              >
                                <Edit2 className="h-4 w-4" />
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setDeletingActivityId(act.id)
                                  setDeleteType('activity')
                                  setIsDeleteModalOpen(true)
                                }}
                                className="p-1.5 text-slate-400 hover:text-rose-600 transition"
                                title="Eliminar Notícia"
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
        </>
      )}

      {/* MODAL: CRIAR / EDITAR PROJETO DE PORTFÓLIO */}
      {isProjectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm"
            onClick={() => setIsProjectModalOpen(false)}
          />

          <div className="relative w-full max-w-3xl bg-white border border-slate-200 shadow-2xl overflow-hidden z-10 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <span className="text-xs font-mono font-bold text-primary">Portfólio &amp; Casos de Estudo</span>
                <h3 className="text-lg font-black text-slate-900">
                  {editingProject ? 'Editar Projeto' : 'Novo Projeto de Portfólio'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsProjectModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveProject} noValidate className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              <div className="space-y-4">
                <h4 className="font-extrabold uppercase text-slate-900 tracking-wider pb-2 border-b border-slate-100 flex items-center gap-1.5">
                  <FolderGit2 className="h-4 w-4 text-primary" />
                  <span>1. Informações Principais</span>
                </h4>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Título do Projeto
                    </label>
                    <input
                      type="text"
                      value={projectFormData.title}
                      onChange={(e) => handleProjectTitleChange(e.target.value)}
                      placeholder="Ex.: Modernização de Rede: Tribunal Supremo"
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 focus:bg-white focus:border-primary focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Cliente / Instituição
                    </label>
                    <input
                      type="text"
                      value={projectFormData.clientName}
                      onChange={(e) => setProjectFormData({ ...projectFormData, clientName: e.target.value })}
                      placeholder="Ex: Tribunal Supremo de Angola"
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 focus:bg-white focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Estado do Projeto
                    </label>
                    <select
                      value={projectFormData.status}
                      onChange={(e) => setProjectFormData({ ...projectFormData, status: e.target.value as any })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 focus:bg-white focus:border-primary focus:outline-none font-medium"
                    >
                      <option value="concluido">Concluído</option>
                      <option value="em_curso">Em Curso</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Modelo de Parceria / Atuação
                    </label>
                    <input
                      type="text"
                      value={projectFormData.partnershipType}
                      onChange={(e) => setProjectFormData({ ...projectFormData, partnershipType: e.target.value })}
                      placeholder="Ex: Engenharia &amp; Implementação"
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 focus:bg-white focus:border-primary focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Data de Conclusão / Entrega
                    </label>
                    <input
                      type="text"
                      value={projectFormData.completedAt}
                      onChange={(e) => setProjectFormData({ ...projectFormData, completedAt: e.target.value })}
                      placeholder="Ex: Janeiro 2026"
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 focus:bg-white focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Frase de Destaque (Tagline)
                  </label>
                  <input
                    type="text"
                    value={projectFormData.tagline}
                    onChange={(e) => setProjectFormData({ ...projectFormData, tagline: e.target.value })}
                    placeholder="Ex: Conectividade redundante e alta disponibilidade para infraestruturas críticas"
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 focus:bg-white focus:border-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Visão Geral / Descrição do Projeto
                  </label>
                  <textarea
                    rows={3}
                    value={projectFormData.description}
                    onChange={(e) => setProjectFormData({ ...projectFormData, description: e.target.value })}
                    placeholder="Resumo executivo do projeto implementado..."
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 focus:bg-white focus:border-primary focus:outline-none"
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      O Desafio do Cliente
                    </label>
                    <textarea
                      rows={3}
                      value={projectFormData.challenge}
                      onChange={(e) => setProjectFormData({ ...projectFormData, challenge: e.target.value })}
                      placeholder="Qual era o problema enfrentado pelo cliente antes da intervenção..."
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 focus:bg-white focus:border-primary focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      A Solução Implementada pela ARKNET
                    </label>
                    <textarea
                      rows={3}
                      value={projectFormData.solution}
                      onChange={(e) => setProjectFormData({ ...projectFormData, solution: e.target.value })}
                      placeholder="Arquitetura técnica desenvolvida e instalada..."
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 focus:bg-white focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>

                {/* Imagem Principal do Projeto (apenas a imagem principal mantida) */}
                <div>
                  <ImageUpload
                    value={projectFormData.image}
                    onChange={(url) => setProjectFormData({ ...projectFormData, image: url })}
                    label="Imagem Principal do Projeto"
                    helperText="Imagem em destaque exibida no portfólio (16:9 recomendado)."
                    aspectRatio="video"
                  />
                </div>
              </div>

              {/* Botões do Modal Projeto */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsProjectModalOpen(false)}
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

      {/* MODAL: CRIAR / EDITAR NOTÍCIA & ATIVIDADE DO BLOG */}
      {isActivityModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm"
            onClick={() => setIsActivityModalOpen(false)}
          />

          <div className="relative w-full max-w-3xl bg-white border border-slate-200 shadow-2xl overflow-hidden z-10 max-h-[92vh] flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <span className="text-xs font-mono font-bold text-secondary uppercase tracking-wider">
                  Blog de Notícias &amp; Atividades ARKNET
                </span>
                <h3 className="text-lg font-black text-slate-900">
                  {editingActivity ? 'Editar Notícia / Atividade' : 'Nova Notícia / Atividade em Destaque'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsActivityModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveActivity} noValidate className="p-6 overflow-y-auto space-y-5 flex-1 text-xs">
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">
                    Título da Notícia / Atividade
                  </label>
                  <input
                    type="text"
                    value={activityFormData.title}
                    onChange={(e) => setActivityFormData({ ...activityFormData, title: e.target.value })}
                    placeholder="Ex: ARKNET em Direto na Rádio Mais: O Futuro da Conectividade em Angola"
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 focus:bg-white focus:border-secondary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Categoria / Editoria
                  </label>
                  <select
                    value={activityFormData.category}
                    onChange={(e) => setActivityFormData({ ...activityFormData, category: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 focus:bg-white focus:border-secondary focus:outline-none font-medium"
                  >
                    {ACTIVITY_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Localização / Emissora / Veículo
                  </label>
                  <input
                    type="text"
                    value={activityFormData.clientOrLocation}
                    onChange={(e) => setActivityFormData({ ...activityFormData, clientOrLocation: e.target.value })}
                    placeholder="Ex: Rádio Mais 99.1 FM, Luanda ou Polo de Viana"
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 focus:bg-white focus:border-secondary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Autor / Equipa Responsável
                  </label>
                  <input
                    type="text"
                    value={activityFormData.author}
                    onChange={(e) => setActivityFormData({ ...activityFormData, author: e.target.value })}
                    placeholder="Ex: Comunicação ARKNET ou Direção de Engenharia"
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 focus:bg-white focus:border-secondary focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Data da Atividade / Notícia
                  </label>
                  <input
                    type="date"
                    value={activityFormData.date}
                    onChange={(e) => setActivityFormData({ ...activityFormData, date: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 focus:bg-white focus:border-secondary focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Hora (Opcional)
                  </label>
                  <input
                    type="text"
                    value={activityFormData.time}
                    onChange={(e) => setActivityFormData({ ...activityFormData, time: e.target.value })}
                    placeholder="Ex: 09:30"
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 focus:bg-white focus:border-secondary focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Tags / Palavras-chave (separadas por vírgula)
                </label>
                <input
                  type="text"
                  value={activityFormData.tags}
                  onChange={(e) => setActivityFormData({ ...activityFormData, tags: e.target.value })}
                  placeholder="Ex: Rádio, Entrevista, Inovação, Telecomunicações"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 focus:bg-white focus:border-secondary focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Resumo Curto (Exibido no cartão do blog)
                </label>
                <textarea
                  rows={2}
                  value={activityFormData.description}
                  onChange={(e) => setActivityFormData({ ...activityFormData, description: e.target.value })}
                  placeholder="Resumo de 2 linhas sobre a participação ou evento..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 focus:bg-white focus:border-secondary focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Conteúdo Completo da Notícia / Reportagem Editorial
                </label>
                <textarea
                  rows={6}
                  value={activityFormData.content}
                  onChange={(e) => setActivityFormData({ ...activityFormData, content: e.target.value })}
                  placeholder="Escreva a notícia na íntegra. Descreva os principais tópicos abordados, intervenções, declarações e conclusões..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 focus:bg-white focus:border-secondary focus:outline-none font-sans leading-relaxed"
                />
              </div>

              <div>
                <ImageUpload
                  value={activityFormData.image}
                  onChange={(url) => setActivityFormData({ ...activityFormData, image: url })}
                  label="Fotografia de Destaque da Notícia"
                  helperText="Fotografia em estúdio de rádio, sala de formação ou no evento."
                  aspectRatio="video"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="act-featured"
                  checked={activityFormData.featured}
                  onChange={(e) => setActivityFormData({ ...activityFormData, featured: e.target.checked })}
                  className="h-4 w-4 text-secondary rounded border-slate-300"
                />
                <label htmlFor="act-featured" className="font-bold text-slate-700 cursor-pointer">
                  Destacar no topo do blog como notícia principal
                </label>
              </div>

              {/* Botões do Modal */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsActivityModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 text-slate-700 font-bold text-xs uppercase hover:bg-slate-200 transition rounded"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-secondary text-white font-bold text-xs uppercase hover:bg-secondary/90 transition rounded shadow-md"
                >
                  {editingActivity ? 'Guardar Notícia' : 'Publicar no Blog'}
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
        title={deleteType === 'project' ? 'Eliminar Projeto' : 'Eliminar Atividade Diária'}
        message={
          deleteType === 'project'
            ? 'Tem a certeza que deseja eliminar este projeto do portfólio? A página correspondente deixará de estar disponível.'
            : 'Tem a certeza que deseja eliminar esta atividade operacional do feed ARKNET em Ação?'
        }
        confirmText="Sim, Eliminar"
        cancelText="Cancelar"
      />

    </div>
  )
}
