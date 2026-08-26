'use client'

import React, { useState, useEffect } from 'react'
import {
  MessageSquareQuote,
  Plus,
  Edit2,
  Trash2,
  Star,
  CheckCircle2,
  XCircle,
  ArrowUp,
  ArrowDown,
  X,
  Building,
} from 'lucide-react'
import { dataStore, TestimonialItem } from '@/lib/data-store'
import { useToast } from '@/lib/toast-context'
import { ConfirmModal } from '@/components/admin/confirm-modal'

export default function AdminTestemunhosPage() {
  const { success, info, error } = useToast()

  const [testimonials, setTestimonials] = useState<TestimonialItem[]>([])

  // Modal Criar/Editar
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<TestimonialItem | null>(null)
  const [formData, setFormData] = useState<{
    clientName: string
    company: string
    role: string
    testimonial: string
    rating: number
    active: boolean
  }>({
    clientName: '',
    company: '',
    role: 'Diretor de TI',
    testimonial: '',
    rating: 5,
    active: true,
  })

  // Delete Modal
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  useEffect(() => {
    const sync = () => {
      const db = dataStore.getSnapshot()
      setTestimonials([...db.testimonials].sort((a, b) => a.order - b.order))
    }
    sync()
    const unsub = dataStore.subscribe(sync)
    return () => unsub()
  }, [])

  const handleOpenCreate = () => {
    setEditingItem(null)
    setFormData({
      clientName: '',
      company: '',
      role: 'Diretor de TI',
      testimonial: '',
      rating: 5,
      active: true,
    })
    setIsModalOpen(true)
  }

  const handleOpenEdit = (t: TestimonialItem) => {
    setEditingItem(t)
    setFormData({
      clientName: t.clientName,
      company: t.company,
      role: t.role || '',
      testimonial: t.testimonial,
      rating: t.rating || 5,
      active: t.active,
    })
    setIsModalOpen(true)
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.clientName.trim() || !formData.testimonial.trim()) {
      error('Nome do cliente e citação são obrigatórios.')
      return
    }

    if (editingItem) {
      dataStore.updateTestimonial(editingItem.id, {
        clientName: formData.clientName.trim(),
        company: formData.company.trim() || formData.clientName.trim(),
        role: formData.role.trim(),
        testimonial: formData.testimonial.trim(),
        rating: formData.rating,
        active: formData.active,
      })
      success(`Testemunho de "${formData.clientName}" atualizado com sucesso!`)
    } else {
      const nextOrder = testimonials.length > 0 ? Math.max(...testimonials.map((t) => t.order)) + 1 : 1
      dataStore.addTestimonial({
        clientName: formData.clientName.trim(),
        company: formData.company.trim() || formData.clientName.trim(),
        role: formData.role.trim(),
        testimonial: formData.testimonial.trim(),
        rating: formData.rating,
        order: nextOrder,
        active: formData.active,
      })
      success(`Testemunho de "${formData.clientName}" adicionado com sucesso!`)
    }

    setIsModalOpen(false)
  }

  const handleMoveOrder = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= testimonials.length) return

    const current = testimonials[index]
    const target = testimonials[targetIndex]

    const tempOrder = current.order
    dataStore.updateTestimonial(current.id, { order: target.order })
    dataStore.updateTestimonial(target.id, { order: tempOrder })
    info('Ordem dos testemunhos atualizada.')
  }

  const handleToggleActive = (t: TestimonialItem) => {
    dataStore.updateTestimonial(t.id, { active: !t.active })
    info(`Testemunho de "${t.clientName}" ${!t.active ? 'ativado' : 'desativado'}.`)
  }

  const handleDeleteConfirm = () => {
    if (deletingId) {
      dataStore.deleteTestimonial(deletingId)
      success('Testemunho eliminado com sucesso.')
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
            <MessageSquareQuote className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-extrabold text-slate-900">Testemunhos de Clientes</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Gestão dos depoimentos e avaliações de clientes exibidos na página inicial da ARKNET.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-5 py-3 bg-secondary text-white text-xs font-bold uppercase tracking-wider hover:bg-secondary/90 transition shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Adicionar Testemunho
        </button>
      </div>

      {/* Grid of Testimonials */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {testimonials.map((t, idx) => (
          <div
            key={t.id}
            className="bg-white border border-slate-200 p-6 shadow-xs hover:shadow-md transition flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-1">
                  {Array.from({ length: t.rating || 5 }).map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => handleToggleActive(t)}
                  className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-extrabold uppercase rounded-full ${
                    t.active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {t.active ? 'Publicado' : 'Oculto'}
                </button>
              </div>

              <p className="text-xs text-slate-700 italic leading-relaxed mb-4">
                &ldquo;{t.testimonial}&rdquo;
              </p>

              <div className="pt-3 border-t border-slate-100">
                <p className="font-bold text-slate-900 text-xs">{t.clientName}</p>
                <p className="text-[11px] text-slate-500">{t.company} — {t.role}</p>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-1 text-slate-400">
                <button
                  type="button"
                  onClick={() => handleMoveOrder(idx, 'up')}
                  disabled={idx === 0}
                  className="p-1 hover:text-primary disabled:opacity-20 transition"
                  title="Subir posição"
                >
                  <ArrowUp className="h-3.5 w-3.5" />
                </button>
                <span className="text-[10px] font-mono font-bold">#{idx + 1}</span>
                <button
                  type="button"
                  onClick={() => handleMoveOrder(idx, 'down')}
                  disabled={idx === testimonials.length - 1}
                  className="p-1 hover:text-primary disabled:opacity-20 transition"
                  title="Descer posição"
                >
                  <ArrowDown className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleOpenEdit(t)}
                  className="p-1.5 text-slate-600 hover:text-primary hover:bg-slate-100 rounded transition"
                  title="Editar"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDeletingId(t.id)
                    setIsDeleteModalOpen(true)
                  }}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition"
                  title="Eliminar"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Criar/Editar */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          />

          <div className="relative w-full max-w-lg bg-white border border-slate-200 shadow-2xl overflow-hidden z-10">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-primary/10 text-primary rounded">
                  <MessageSquareQuote className="h-5 w-5" />
                </div>
                <h3 className="text-base font-extrabold text-slate-900">
                  {editingItem ? 'Editar Testemunho' : 'Novo Testemunho'}
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

            <form onSubmit={handleSave} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Nome do Cliente / Representante *
                </label>
                <input
                  type="text"
                  required
                  value={formData.clientName}
                  onChange={(e) => setFormData((prev) => ({ ...prev, clientName: e.target.value }))}
                  placeholder="ex: Eng. António Silva"
                  className="w-full px-4 py-2.5 text-sm border border-slate-300 focus:border-primary focus:outline-none"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Empresa / Instituição
                  </label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData((prev) => ({ ...prev, company: e.target.value }))}
                    placeholder="ex: Banco Angolano de Investimento"
                    className="w-full px-4 py-2.5 text-sm border border-slate-300 focus:border-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Setor ou Cargo
                  </label>
                  <input
                    type="text"
                    value={formData.role}
                    onChange={(e) => setFormData((prev) => ({ ...prev, role: e.target.value }))}
                    placeholder="ex: Diretor de TI"
                    className="w-full px-4 py-2.5 text-sm border border-slate-300 focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Texto do Testemunho / Citação *
                </label>
                <textarea
                  rows={4}
                  required
                  value={formData.testimonial}
                  onChange={(e) => setFormData((prev) => ({ ...prev, testimonial: e.target.value }))}
                  placeholder="A experiência com a equipa ARKNET foi excecional..."
                  className="w-full p-3 text-sm border border-slate-300 focus:border-primary focus:outline-none"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Avaliação (Estrelas)
                  </label>
                  <select
                    value={formData.rating}
                    onChange={(e) => setFormData((prev) => ({ ...prev, rating: parseInt(e.target.value, 10) }))}
                    className="w-full px-4 py-2.5 text-sm border border-slate-300 focus:border-primary focus:outline-none bg-white font-bold"
                  >
                    <option value={5}>⭐⭐⭐⭐⭐ (5 Estrelas)</option>
                    <option value={4}>⭐⭐⭐⭐ (4 Estrelas)</option>
                    <option value={3}>⭐⭐⭐ (3 Estrelas)</option>
                  </select>
                </div>

                <label className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 cursor-pointer mt-5 sm:mt-0">
                  <input
                    type="checkbox"
                    checked={formData.active}
                    onChange={(e) => setFormData((prev) => ({ ...prev, active: e.target.checked }))}
                    className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-900">Visível no Website</p>
                    <p className="text-[10px] text-slate-500">Exibido na secção de testemunhos</p>
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
                  {editingItem ? 'Guardar' : 'Adicionar'}
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
        title="Eliminar Testemunho"
        message="Tem a certeza que deseja remover permanentemente este testemunho?"
        confirmText="Sim, Eliminar"
        cancelText="Cancelar"
      />
    </div>
  )
}
