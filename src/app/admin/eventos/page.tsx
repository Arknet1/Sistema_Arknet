'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Calendar,
  Plus,
  Edit2,
  Trash2,
  MapPin,
  Clock,
  Users,
  Search,
  ExternalLink,
  X,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react'
import { dataStore, EventItem, EventStatus } from '@/lib/data-store'
import { useToast } from '@/lib/toast-context'
import { ConfirmModal } from '@/components/admin/confirm-modal'
import { ImageUpload } from '@/components/admin/image-upload'

export default function AdminEventosPage() {
  const { success, info, error } = useToast()

  const [events, setEvents] = useState<EventItem[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | EventStatus>('all')

  // Modal Criar/Editar
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null)
  const [formData, setFormData] = useState<{
    title: string
    description: string
    date: string
    time: string
    location: string
    format: EventItem['format']
    image: string
    status: EventStatus
    capacity: string
    link: string
  }>({
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    time: '09:00 - 17:00',
    location: 'Luanda, Angola',
    format: 'Presencial',
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&auto=format&fit=crop&q=80',
    status: 'agendado',
    capacity: '100',
    link: '#inscricao-evento',
  })

  // Delete Modal
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  useEffect(() => {
    const sync = () => {
      const db = dataStore.getSnapshot()
      setEvents([...db.events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()))
    }
    sync()
    const unsub = dataStore.subscribe(sync)
    return () => unsub()
  }, [])

  const filteredEvents = events.filter((evt) => {
    const matchSearch =
      evt.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      evt.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      evt.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchStatus = statusFilter === 'all' || evt.status === statusFilter
    return matchSearch && matchStatus
  })

  const handleOpenCreate = () => {
    setEditingEvent(null)
    setFormData({
      title: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      time: '09:00 - 17:00',
      location: 'Luanda, Angola',
      format: 'Presencial',
      image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&auto=format&fit=crop&q=80',
      status: 'agendado',
      capacity: '100',
      link: '#inscricao-evento',
    })
    setIsModalOpen(true)
  }

  const handleOpenEdit = (evt: EventItem) => {
    setEditingEvent(evt)
    setFormData({
      title: evt.title,
      description: evt.description,
      date: evt.date,
      time: evt.time || '',
      location: evt.location,
      format: evt.format,
      image: evt.image || '',
      status: evt.status,
      capacity: evt.capacity ? String(evt.capacity) : '',
      link: evt.link || '',
    })
    setIsModalOpen(true)
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim()) {
      error('O título do evento é obrigatório.')
      return
    }

    const cap = formData.capacity ? parseInt(formData.capacity, 10) : undefined

    if (editingEvent) {
      dataStore.updateEvent(editingEvent.id, {
        title: formData.title.trim(),
        description: formData.description.trim(),
        date: formData.date,
        time: formData.time.trim(),
        location: formData.location.trim(),
        format: formData.format,
        image: formData.image,
        status: formData.status,
        capacity: cap,
        link: formData.link,
      })
      success(`Evento "${formData.title}" atualizado com sucesso!`, 'Evento Atualizado')
    } else {
      dataStore.addEvent({
        title: formData.title.trim(),
        description: formData.description.trim(),
        date: formData.date,
        time: formData.time.trim(),
        location: formData.location.trim(),
        format: formData.format,
        image: formData.image,
        status: formData.status,
        capacity: cap,
        link: formData.link,
      })
      success(`Novo evento "${formData.title}" agendado!`, 'Evento Criado')
    }

    setIsModalOpen(false)
  }

  const handleDeleteConfirm = () => {
    if (deletingId) {
      dataStore.deleteEvent(deletingId)
      success('Evento eliminado com sucesso.', 'Evento Eliminado')
      setIsDeleteModalOpen(false)
      setDeletingId(null)
    }
  }

  const getStatusBadge = (status: EventStatus) => {
    switch (status) {
      case 'agendado':
        return <span className="px-2.5 py-1 text-[10px] font-bold uppercase bg-blue-50 text-primary rounded-full">Agendado</span>
      case 'decorrer':
        return <span className="px-2.5 py-1 text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 rounded-full animate-pulse">A Decorrer</span>
      case 'passado':
        return <span className="px-2.5 py-1 text-[10px] font-bold uppercase bg-slate-100 text-slate-600 rounded-full">Passado</span>
      case 'cancelado':
        return <span className="px-2.5 py-1 text-[10px] font-bold uppercase bg-rose-100 text-rose-700 rounded-full">Cancelado</span>
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Calendar className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-extrabold text-slate-900">Eventos & Workshops</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Gestão de conferências, feiras e workshops exibidos na secção de eventos (`/eventos`).
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-5 py-3 bg-secondary text-white text-xs font-bold uppercase tracking-wider hover:bg-secondary/90 transition shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Agendar Evento
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Pesquisar evento por título, local ou tema..."
            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:bg-white focus:border-primary focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 bg-slate-50 border border-slate-300 text-xs text-slate-700 focus:bg-white focus:border-primary focus:outline-none"
          >
            <option value="all">Todos os Estados ({events.length})</option>
            <option value="agendado">Agendados</option>
            <option value="decorrer">A Decorrer</option>
            <option value="passado">Passados</option>
            <option value="cancelado">Cancelados</option>
          </select>
        </div>
      </div>

      {/* Events List */}
      <div className="grid sm:grid-cols-2 gap-6">
        {filteredEvents.map((evt) => (
          <div
            key={evt.id}
            className="bg-white border border-slate-200 shadow-xs hover:shadow-md transition flex flex-col overflow-hidden group"
          >
            {evt.image && (
              <div className="relative h-44 w-full bg-slate-900 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={evt.image}
                  alt={evt.title}
                  className="h-full w-full object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute top-3 right-3">{getStatusBadge(evt.status)}</div>
                <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md px-3 py-1 text-white text-[11px] font-bold uppercase tracking-wider">
                  {evt.format}
                </div>
              </div>
            )}

            <div className="p-6 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-4 text-xs font-semibold text-primary mb-2">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {new Date(evt.date).toLocaleDateString('pt-PT', { day: '2-digit', month: 'long', year: 'numeric' })}
                  </span>
                  {evt.time && (
                    <span className="flex items-center gap-1 text-slate-500">
                      <Clock className="h-3.5 w-3.5" />
                      {evt.time}
                    </span>
                  )}
                </div>

                <h3 className="text-base font-extrabold text-slate-900 group-hover:text-primary transition leading-snug">
                  {evt.title}
                </h3>
                <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">{evt.description}</p>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-1 truncate max-w-[200px]">
                    <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    {evt.location}
                  </span>
                  {evt.capacity && (
                    <span className="flex items-center gap-1 font-mono text-[11px]">
                      <Users className="h-3.5 w-3.5 text-slate-400" />
                      Lotação: {evt.capacity}
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                <Link
                  href="/eventos"
                  target="_blank"
                  className="text-xs font-bold text-slate-500 hover:text-primary flex items-center gap-1"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Ver no Site
                </Link>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(evt)}
                    className="p-2 text-slate-600 hover:text-primary hover:bg-slate-100 rounded transition"
                    title="Editar evento"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setDeletingId(evt.id)
                      setIsDeleteModalOpen(true)
                    }}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition"
                    title="Eliminar evento"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Criar/Editar Evento */}
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
                  <Calendar className="h-5 w-5" />
                </div>
                <h3 className="text-base font-extrabold text-slate-900">
                  {editingEvent ? 'Editar Evento' : 'Agendar Novo Evento'}
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

            <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Título do Evento *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="ex: ARKNET Tech Summit 2026"
                  className="w-full px-4 py-2.5 text-sm border border-slate-300 focus:border-primary focus:outline-none"
                />
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Data do Evento *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
                    className="w-full px-4 py-2.5 text-sm border border-slate-300 focus:border-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Horário
                  </label>
                  <input
                    type="text"
                    value={formData.time}
                    onChange={(e) => setFormData((prev) => ({ ...prev, time: e.target.value }))}
                    placeholder="09:00 - 17:00"
                    className="w-full px-4 py-2.5 text-sm border border-slate-300 focus:border-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Formato *
                  </label>
                  <select
                    value={formData.format}
                    onChange={(e) => setFormData((prev) => ({ ...prev, format: e.target.value as any }))}
                    className="w-full px-4 py-2.5 text-sm border border-slate-300 focus:border-primary focus:outline-none bg-white"
                  >
                    <option value="Presencial">Presencial</option>
                    <option value="Online">Online</option>
                    <option value="Híbrido">Híbrido</option>
                  </select>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Local / Endereço *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.location}
                    onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
                    placeholder="Hotel Epic Sana, Luanda"
                    className="w-full px-4 py-2.5 text-sm border border-slate-300 focus:border-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Estado do Evento
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value as any }))}
                    className="w-full px-4 py-2.5 text-sm border border-slate-300 focus:border-primary focus:outline-none bg-white"
                  >
                    <option value="agendado">Agendado (Futuro)</option>
                    <option value="decorrer">A Decorrer Agora</option>
                    <option value="passado">Passado / Realizado</option>
                    <option value="cancelado">Cancelado</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Descrição e Programa do Evento
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Informações sobre os palestrantes, tópicos abordados e público-alvo..."
                  className="w-full p-3 text-sm border border-slate-300 focus:border-primary focus:outline-none"
                />
              </div>

              <ImageUpload
                value={formData.image}
                onChange={(url) => setFormData((prev) => ({ ...prev, image: url }))}
                label="Imagem / Cartaz de Capa do Evento"
              />

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
                  {editingEvent ? 'Guardar Alterações' : 'Criar Evento'}
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
        title="Eliminar Evento"
        message="Tem a certeza que deseja eliminar permanentemente este evento?"
        confirmText="Sim, Eliminar"
        cancelText="Cancelar"
      />
    </div>
  )
}
