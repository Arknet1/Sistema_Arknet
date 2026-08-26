'use client'

import React, { useState, useEffect } from 'react'
import {
  Handshake,
  Plus,
  Edit2,
  Trash2,
  ArrowUp,
  ArrowDown,
  ExternalLink,
  X,
  CheckCircle2,
  XCircle,
} from 'lucide-react'
import { dataStore, PartnerItem } from '@/lib/data-store'
import { useToast } from '@/lib/toast-context'
import { ConfirmModal } from '@/components/admin/confirm-modal'
import { ImageUpload } from '@/components/admin/image-upload'

export default function AdminParceirosPage() {
  const { success, info, error } = useToast()

  const [partners, setPartners] = useState<PartnerItem[]>([])

  // Modal Criar/Editar
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingPartner, setEditingPartner] = useState<PartnerItem | null>(null)
  const [formData, setFormData] = useState<{
    name: string
    logo: string
    category: string
    website: string
    active: boolean
  }>({
    name: '',
    logo: 'https://picsum.photos/seed/partner/200/100',
    category: 'Telecomunicações',
    website: 'https://arknet.co.ao',
    active: true,
  })

  // Delete Modal
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  useEffect(() => {
    const sync = () => {
      const db = dataStore.getSnapshot()
      setPartners([...db.partners].sort((a, b) => a.order - b.order))
    }
    sync()
    const unsub = dataStore.subscribe(sync)
    return () => unsub()
  }, [])

  const handleOpenCreate = () => {
    setEditingPartner(null)
    setFormData({
      name: '',
      logo: 'https://picsum.photos/seed/partner/200/100',
      category: 'Telecomunicações',
      website: 'https://arknet.co.ao',
      active: true,
    })
    setIsModalOpen(true)
  }

  const handleOpenEdit = (p: PartnerItem) => {
    setEditingPartner(p)
    setFormData({
      name: p.name,
      logo: p.logo,
      category: p.category || 'Telecomunicações',
      website: p.website || '',
      active: p.active,
    })
    setIsModalOpen(true)
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) {
      error('O nome do parceiro é obrigatório.')
      return
    }

    if (editingPartner) {
      dataStore.updatePartner(editingPartner.id, {
        name: formData.name.trim(),
        logo: formData.logo,
        category: formData.category.trim(),
        website: formData.website.trim(),
        active: formData.active,
      })
      success(`Parceiro "${formData.name}" atualizado com sucesso!`)
    } else {
      const nextOrder = partners.length > 0 ? Math.max(...partners.map((p) => p.order)) + 1 : 1
      dataStore.addPartner({
        name: formData.name.trim(),
        logo: formData.logo,
        category: formData.category.trim(),
        website: formData.website.trim(),
        order: nextOrder,
        active: formData.active,
      })
      success(`Novo parceiro "${formData.name}" adicionado!`)
    }

    setIsModalOpen(false)
  }

  const handleMoveOrder = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= partners.length) return

    const current = partners[index]
    const target = partners[targetIndex]

    const tempOrder = current.order
    dataStore.updatePartner(current.id, { order: target.order })
    dataStore.updatePartner(target.id, { order: tempOrder })
    info('Ordem dos parceiros no carrossel atualizada.')
  }

  const handleToggleActive = (p: PartnerItem) => {
    dataStore.updatePartner(p.id, { active: !p.active })
    info(`Parceiro "${p.name}" ${!p.active ? 'ativado' : 'desativado'}.`)
  }

  const handleDeleteConfirm = () => {
    if (deletingId) {
      dataStore.deletePartner(deletingId)
      success('Parceiro eliminado com sucesso.')
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
            <Handshake className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-extrabold text-slate-900">Parceiros & Marcas</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Gestão dos logótipos e marcas que aparecem no carrossel de parceiros do website público.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-5 py-3 bg-secondary text-white text-xs font-bold uppercase tracking-wider hover:bg-secondary/90 transition shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Adicionar Parceiro
        </button>
      </div>

      {/* Partners Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
        {partners.map((p, idx) => (
          <div
            key={p.id}
            className="bg-white border border-slate-200 p-5 shadow-xs hover:shadow-md transition flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-[10px] font-bold text-slate-400 font-mono">#{idx + 1}</span>
                <button
                  type="button"
                  onClick={() => handleToggleActive(p)}
                  className={`inline-flex items-center gap-1 px-2 py-0.5 text-[9px] font-extrabold uppercase rounded-full ${
                    p.active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {p.active ? 'Ativo' : 'Inativo'}
                </button>
              </div>

              {/* Logo Preview */}
              <div className="h-20 w-full bg-slate-50 border border-slate-100 p-3 flex items-center justify-center overflow-hidden mb-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.logo}
                  alt={p.name}
                  className="max-h-full max-w-full object-contain grayscale group-hover:grayscale-0 transition duration-300"
                />
              </div>

              <h3 className="font-extrabold text-slate-900 text-xs truncate group-hover:text-primary transition">
                {p.name}
              </h3>
              <p className="text-[11px] text-slate-500 truncate mt-0.5">{p.category}</p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-1 text-slate-400">
                <button
                  type="button"
                  onClick={() => handleMoveOrder(idx, 'up')}
                  disabled={idx === 0}
                  className="p-1 hover:text-primary disabled:opacity-20 transition"
                  title="Mover para esquerda/início"
                >
                  <ArrowUp className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleMoveOrder(idx, 'down')}
                  disabled={idx === partners.length - 1}
                  className="p-1 hover:text-primary disabled:opacity-20 transition"
                  title="Mover para direita/fim"
                >
                  <ArrowDown className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleOpenEdit(p)}
                  className="p-1.5 text-slate-600 hover:text-primary hover:bg-slate-100 rounded transition"
                  title="Editar"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDeletingId(p.id)
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
                  <Handshake className="h-5 w-5" />
                </div>
                <h3 className="text-base font-extrabold text-slate-900">
                  {editingPartner ? 'Editar Parceiro' : 'Novo Parceiro / Marca'}
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
                  Nome da Empresa / Parceiro *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="ex: Cisco Systems"
                  className="w-full px-4 py-2.5 text-sm border border-slate-300 focus:border-primary focus:outline-none"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Categoria do Parceiro
                  </label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
                    placeholder="ex: Telecomunicações / Hardware"
                    className="w-full px-4 py-2.5 text-sm border border-slate-300 focus:border-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Website Oficial (Opcional)
                  </label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData((prev) => ({ ...prev, website: e.target.value }))}
                    placeholder="https://empresa.com"
                    className="w-full px-4 py-2.5 text-sm border border-slate-300 focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <ImageUpload
                value={formData.logo}
                onChange={(url) => setFormData((prev) => ({ ...prev, logo: url }))}
                label="Logótipo do Parceiro"
              />

              <label className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.active}
                  onChange={(e) => setFormData((prev) => ({ ...prev, active: e.target.checked }))}
                  className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
                />
                <div>
                  <p className="text-xs font-bold text-slate-900">Ativo no Carrossel</p>
                  <p className="text-[10px] text-slate-500">Exibido na animação da página inicial</p>
                </div>
              </label>

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
                  {editingPartner ? 'Guardar' : 'Criar'}
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
        title="Eliminar Parceiro"
        message="Tem a certeza que deseja eliminar este parceiro da lista?"
        confirmText="Sim, Eliminar"
        cancelText="Cancelar"
      />
    </div>
  )
}
