'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  GraduationCap,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Star,
  Clock,
  BookOpen,
  Search,
  X,
  ExternalLink,
} from 'lucide-react'
import { dataStore, CourseItem } from '@/lib/data-store'
import { useToast } from '@/lib/toast-context'
import { ConfirmModal } from '@/components/admin/confirm-modal'
import { ImageUpload } from '@/components/admin/image-upload'

export default function AdminAcademiaPage() {
  const { success, info, error } = useToast()

  const [courses, setCourses] = useState<CourseItem[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [modalityFilter, setModalityFilter] = useState('all')

  // Modal Criar/Editar Curso
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCourse, setEditingCourse] = useState<CourseItem | null>(null)
  const [formData, setFormData] = useState<{
    title: string
    description: string
    modality: CourseItem['modality']
    duration: string
    syllabusText: string
    status: 'active' | 'inactive'
    featured: boolean
    image: string
  }>({
    title: '',
    description: '',
    modality: 'Presencial',
    duration: '30 dias (60h)',
    syllabusText: 'Módulo 1: Fundamentos\nMódulo 2: Prática e Laboratórios\nMódulo 3: Projeto Final e Certificação',
    status: 'active',
    featured: false,
    image: '',
  })

  // Delete Modal
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  useEffect(() => {
    const sync = () => {
      const db = dataStore.getSnapshot()
      setCourses([...db.courses])
    }
    sync()
    const unsub = dataStore.subscribe(sync)
    return () => unsub()
  }, [])

  const filteredCourses = courses.filter((c) => {
    const matchSearch =
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchModality = modalityFilter === 'all' || c.modality === modalityFilter
    return matchSearch && matchModality
  })

  const handleOpenCreate = () => {
    setEditingCourse(null)
    setFormData({
      title: '',
      description: '',
      modality: 'Presencial',
      duration: '30 dias (60h)',
      syllabusText: 'Módulo 1: Introdução e Teoria\nMódulo 2: Configurações e Laboratório Prático\nMódulo 3: Projeto Final Integrador',
      status: 'active',
      featured: false,
      image: '',
    })
    setIsModalOpen(true)
  }

  const handleOpenEdit = (course: CourseItem) => {
    setEditingCourse(course)
    setFormData({
      title: course.title,
      description: course.description,
      modality: course.modality,
      duration: course.duration,
      syllabusText: (course.syllabus || []).join('\n'),
      status: course.status,
      featured: !!course.featured,
      image: course.image || '',
    })
    setIsModalOpen(true)
  }

  const handleSaveCourse = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim()) {
      error('O título do curso é obrigatório.')
      return
    }

    const syllabus = formData.syllabusText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean)

    if (editingCourse) {
      dataStore.updateCourse(editingCourse.id, {
        title: formData.title.trim(),
        description: formData.description.trim(),
        modality: formData.modality,
        duration: formData.duration.trim(),
        syllabus,
        status: formData.status,
        featured: formData.featured,
        image: formData.image,
      })
      success(`Curso "${formData.title}" atualizado com sucesso!`, 'Curso Atualizado')
    } else {
      dataStore.addCourse({
        title: formData.title.trim(),
        description: formData.description.trim(),
        modality: formData.modality,
        duration: formData.duration.trim(),
        syllabus,
        status: formData.status,
        featured: formData.featured,
        image: formData.image,
      })
      success(`Novo curso "${formData.title}" criado com sucesso!`, 'Curso Criado')
    }

    setIsModalOpen(false)
  }

  const handleToggleStatus = (course: CourseItem) => {
    const next = course.status === 'active' ? 'inactive' : 'active'
    dataStore.updateCourse(course.id, { status: next })
    info(`Estado do curso "${course.title}" alterado para ${next === 'active' ? 'Ativo' : 'Inativo'}.`)
  }

  const handleDeleteConfirm = () => {
    if (deletingId) {
      dataStore.deleteCourse(deletingId)
      success('Curso eliminado com sucesso.', 'Curso Eliminado')
      setIsDeleteModalOpen(false)
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-extrabold text-slate-900">Academia & Formações</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Gestão de cursos técnicos, workshops e modalidades de formação exibidos na página (`/academia`).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-5 py-3 bg-secondary text-white text-xs font-bold uppercase tracking-wider hover:bg-secondary/90 transition shadow-sm"
          >
            <Plus className="h-4 w-4" />
            Criar Novo Curso
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
            placeholder="Pesquisar por título ou conteúdo do curso..."
            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:bg-white focus:border-primary focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={modalityFilter}
            onChange={(e) => setModalityFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-300 text-xs text-slate-700 focus:bg-white focus:border-primary focus:outline-none"
          >
            <option value="all">Todas as Modalidades</option>
            <option value="Presencial">Presencial</option>
            <option value="Online">Online</option>
            <option value="Híbrida">Híbrida</option>
            <option value="Workshop">Workshop</option>
            <option value="Corporativa">Corporativa</option>
          </select>
        </div>
      </div>

      {/* Courses Cards Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredCourses.map((course) => (
          <div
            key={course.id}
            className="bg-white border border-slate-200 p-5 shadow-xs hover:shadow-md transition flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-3">
                <span className="px-2.5 py-1 bg-primary/10 text-primary text-[10px] font-bold uppercase rounded">
                  {course.modality}
                </span>

                <button
                  type="button"
                  onClick={() => handleToggleStatus(course)}
                  className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-extrabold uppercase rounded-full ${
                    course.status === 'active'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {course.status === 'active' ? (
                    <>
                      <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                      Ativo
                    </>
                  ) : (
                    <>
                      <XCircle className="h-3 w-3 text-slate-400" />
                      Inativo
                    </>
                  )}
                </button>
              </div>

              <h3 className="font-extrabold text-slate-900 text-base leading-snug">{course.title}</h3>
              <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">{course.description}</p>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1.5 font-semibold">
                  <Clock className="h-3.5 w-3.5 text-slate-400" />
                  {course.duration}
                </span>
                {course.syllabus && course.syllabus.length > 0 && (
                  <span className="flex items-center gap-1 text-[11px] text-slate-400">
                    <BookOpen className="h-3.5 w-3.5" />
                    {course.syllabus.length} módulos
                  </span>
                )}
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
              <Link
                href="/academia"
                target="_blank"
                className="text-[11px] font-bold text-slate-500 hover:text-primary flex items-center gap-1"
              >
                <ExternalLink className="h-3 w-3" />
                Ver na Academia
              </Link>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleOpenEdit(course)}
                  className="p-1.5 text-slate-600 hover:text-primary hover:bg-slate-100 rounded transition"
                  title="Editar curso"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDeletingId(course.id)
                    setIsDeleteModalOpen(true)
                  }}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition"
                  title="Eliminar curso"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Criar/Editar Curso */}
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
                  <GraduationCap className="h-5 w-5" />
                </div>
                <h3 className="text-base font-extrabold text-slate-900">
                  {editingCourse ? 'Editar Formação' : 'Nova Formação / Curso'}
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

            <form onSubmit={handleSaveCourse} className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Título do Curso *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="ex: Cyber Segurança e Pentest Avançado"
                  className="w-full px-4 py-2.5 text-sm border border-slate-300 focus:border-primary focus:outline-none"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Modalidade *
                  </label>
                  <select
                    value={formData.modality}
                    onChange={(e) => setFormData((prev) => ({ ...prev, modality: e.target.value as any }))}
                    className="w-full px-4 py-2.5 text-sm border border-slate-300 focus:border-primary focus:outline-none bg-white"
                  >
                    <option value="Presencial">Presencial</option>
                    <option value="Online">Online</option>
                    <option value="Híbrida">Híbrida</option>
                    <option value="Workshop">Workshop</option>
                    <option value="Corporativa">Corporativa</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Duração Estimada *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.duration}
                    onChange={(e) => setFormData((prev) => ({ ...prev, duration: e.target.value }))}
                    placeholder="ex: 30 dias (60h) ou 4 semanas"
                    className="w-full px-4 py-2.5 text-sm border border-slate-300 focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Descrição do Curso
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Objetivos do curso e competências a adquirir..."
                  className="w-full p-3 text-sm border border-slate-300 focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Programa Curricular / Módulos (um por linha)
                </label>
                <textarea
                  rows={4}
                  value={formData.syllabusText}
                  onChange={(e) => setFormData((prev) => ({ ...prev, syllabusText: e.target.value }))}
                  placeholder="Módulo 1: Introdução\nMódulo 2: Laboratórios\nMódulo 3: Certificação"
                  className="w-full p-3 text-sm border border-slate-300 focus:border-primary focus:outline-none font-mono"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4 pt-2">
                <label className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.status === 'active'}
                    onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.checked ? 'active' : 'inactive' }))}
                    className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-900">Curso Ativo</p>
                    <p className="text-[11px] text-slate-500">Exibido na página pública da Academia</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => setFormData((prev) => ({ ...prev, featured: e.target.checked }))}
                    className="h-4 w-4 rounded border-slate-300 text-amber-500 focus:ring-amber-500"
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-900">Curso em Destaque</p>
                    <p className="text-[11px] text-slate-500">Realçado no topo da Academia</p>
                  </div>
                </label>
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
                  {editingCourse ? 'Guardar Alterações' : 'Criar Curso'}
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
        title="Eliminar Curso"
        message="Tem a certeza que deseja eliminar permanentemente este curso da Academia?"
        confirmText="Sim, Eliminar"
        cancelText="Cancelar"
      />
    </div>
  )
}
