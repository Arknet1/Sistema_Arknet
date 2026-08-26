'use client'

import React, { useState, useEffect } from 'react'
import {
  Tags,
  Plus,
  Edit2,
  Trash2,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  Package,
  X,
  Check,
} from 'lucide-react'
import { dataStore, ProductCategory, StoreProduct } from '@/lib/data-store'
import { useToast } from '@/lib/toast-context'
import { ConfirmModal } from '@/components/admin/confirm-modal'

const AVAILABLE_ICONS = [
  'Package',
  'Smartphone',
  'Laptop',
  'Mouse',
  'HardDrive',
  'Wifi',
  'Wrench',
  'Cable',
  'Usb',
  'Zap',
  'Cpu',
  'Headphones',
  'Monitor',
  'Printer',
  'FileText',
  'Boxes',
  'Shield',
  'Store',
  'Globe',
]

export default function AdminCategoriasPage() {
  const { success, error, info } = useToast()

  const [categories, setCategories] = useState<ProductCategory[]>([])
  const [products, setProducts] = useState<StoreProduct[]>([])

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<ProductCategory | null>(null)
  const [formData, setFormData] = useState<{
    name: string
    icon: string
    description: string
    hideWhenEmpty: boolean
  }>({
    name: '',
    icon: 'Package',
    description: '',
    hideWhenEmpty: false,
  })

  // Delete Modal
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  useEffect(() => {
    const sync = () => {
      const db = dataStore.getSnapshot()
      setCategories([...db.categories].sort((a, b) => a.order - b.order))
      setProducts([...db.products])
    }
    sync()
    const unsub = dataStore.subscribe(sync)
    return () => unsub()
  }, [])

  const getProductCountForCat = (catName: string) => {
    if (catName === 'Todos') return products.length
    return products.filter((p) => p.category.toLowerCase() === catName.toLowerCase()).length
  }

  const handleOpenCreate = () => {
    setEditingCategory(null)
    setFormData({
      name: '',
      icon: 'Package',
      description: '',
      hideWhenEmpty: false,
    })
    setIsModalOpen(true)
  }

  const handleOpenEdit = (cat: ProductCategory) => {
    setEditingCategory(cat)
    setFormData({
      name: cat.name,
      icon: cat.icon || 'Package',
      description: cat.description || '',
      hideWhenEmpty: !!cat.hideWhenEmpty,
    })
    setIsModalOpen(true)
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) {
      error('O nome da categoria é obrigatório.')
      return
    }

    if (editingCategory) {
      dataStore.updateCategory(editingCategory.id, {
        name: formData.name.trim(),
        icon: formData.icon,
        description: formData.description.trim(),
        hideWhenEmpty: formData.hideWhenEmpty,
      })
      success(`Categoria "${formData.name}" atualizada com sucesso!`, 'Categoria Atualizada')
    } else {
      const nextOrder = categories.length > 0 ? Math.max(...categories.map((c) => c.order)) + 1 : 1
      dataStore.addCategory({
        name: formData.name.trim(),
        icon: formData.icon,
        description: formData.description.trim(),
        order: nextOrder,
        hideWhenEmpty: formData.hideWhenEmpty,
      })
      success(`Nova categoria "${formData.name}" criada!`, 'Categoria Criada')
    }

    setIsModalOpen(false)
  }

  const handleDeleteConfirm = () => {
    if (deletingId) {
      dataStore.deleteCategory(deletingId)
      success('Categoria eliminada com sucesso.', 'Categoria Eliminada')
      setIsDeleteModalOpen(false)
      setDeletingId(null)
    }
  }

  const handleMoveOrder = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= categories.length) return

    const currentCat = categories[index]
    const targetCat = categories[targetIndex]

    const tempOrder = currentCat.order
    dataStore.updateCategory(currentCat.id, { order: targetCat.order })
    dataStore.updateCategory(targetCat.id, { order: tempOrder })
    info('Ordem de exibição das categorias atualizada.')
  }

  const handleToggleHideEmpty = (cat: ProductCategory) => {
    dataStore.updateCategory(cat.id, { hideWhenEmpty: !cat.hideWhenEmpty })
    info(`Visibilidade de "${cat.name}" quando vazia atualizada.`)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Tags className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-extrabold text-slate-900">Categorias da Loja</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Organize a árvore de navegação e filtros de produtos na loja pública (`/loja`).
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-secondary text-white text-xs font-bold uppercase tracking-wider hover:bg-secondary/90 transition shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Nova Categoria
        </button>
      </div>

      {/* Categories List Table */}
      <div className="bg-white border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between text-xs text-slate-500">
          <span>Total de <strong>{categories.length}</strong> categorias configuradas</span>
          <span>Dica: Use as setas para definir a ordem na barra lateral da loja</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase tracking-wider font-bold text-[11px]">
              <tr>
                <th className="py-3.5 px-4 text-center w-16">Ordem</th>
                <th className="py-3.5 px-6">Nome da Categoria</th>
                <th className="py-3.5 px-4">Ícone</th>
                <th className="py-3.5 px-4 text-center">Produtos Associados</th>
                <th className="py-3.5 px-4 text-center">Ocultar se Vazia</th>
                <th className="py-3.5 px-6 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {categories.map((cat, idx) => {
                const count = getProductCountForCat(cat.name)
                return (
                  <tr key={cat.id} className="hover:bg-slate-50/80 transition group">
                    {/* Order Move */}
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleMoveOrder(idx, 'up')}
                          disabled={idx === 0}
                          className="p-1 text-slate-400 hover:text-primary disabled:opacity-20 transition"
                          title="Subir na lista"
                        >
                          <ArrowUp className="h-3.5 w-3.5" />
                        </button>
                        <span className="font-bold text-slate-800 font-mono text-[11px] w-4">{idx + 1}</span>
                        <button
                          type="button"
                          onClick={() => handleMoveOrder(idx, 'down')}
                          disabled={idx === categories.length - 1}
                          className="p-1 text-slate-400 hover:text-primary disabled:opacity-20 transition"
                          title="Descer na lista"
                        >
                          <ArrowDown className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>

                    {/* Category Name */}
                    <td className="py-3.5 px-6 font-bold text-slate-900 group-hover:text-primary transition">
                      {cat.name}
                      {cat.description && (
                        <p className="text-[11px] text-slate-400 font-normal mt-0.5">{cat.description}</p>
                      )}
                    </td>

                    {/* Icon tag */}
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 font-mono text-[10px] text-slate-700">
                        {cat.icon || 'Package'}
                      </span>
                    </td>

                    {/* Associated Products Count */}
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold ${
                          count > 0 ? 'bg-blue-50 text-primary' : 'bg-slate-100 text-slate-400'
                        }`}
                      >
                        <Package className="h-3.5 w-3.5" />
                        {count} produtos
                      </span>
                    </td>

                    {/* Hide When Empty Toggle */}
                    <td className="py-3.5 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleHideEmpty(cat)}
                        className={`inline-flex items-center gap-1 px-2 py-1 text-[10px] font-bold uppercase transition ${
                          cat.hideWhenEmpty
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                        title="Alternar se deve ocultar quando 0 produtos"
                      >
                        {cat.hideWhenEmpty ? (
                          <>
                            <EyeOff className="h-3.5 w-3.5 text-amber-600" />
                            Ocultar
                          </>
                        ) : (
                          <>
                            <Eye className="h-3.5 w-3.5 text-slate-500" />
                            Sempre Visível
                          </>
                        )}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(cat)}
                          className="p-2 text-slate-600 hover:text-primary hover:bg-slate-100 transition"
                          title="Editar categoria"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        {cat.name !== 'Todos' && (
                          <button
                            type="button"
                            onClick={() => {
                              setDeletingId(cat.id)
                              setIsDeleteModalOpen(true)
                            }}
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                            title="Eliminar categoria"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
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

          <div className="relative w-full max-w-lg bg-white border border-slate-200 shadow-2xl overflow-hidden z-10">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-primary/10 text-primary rounded">
                  <Tags className="h-5 w-5" />
                </div>
                <h3 className="text-base font-extrabold text-slate-900">
                  {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
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

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Nome da Categoria *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="ex: Equipamentos de Fibra Óptica"
                  className="w-full px-4 py-2.5 text-sm border border-slate-300 focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Ícone Representativo
                </label>
                <select
                  value={formData.icon}
                  onChange={(e) => setFormData((prev) => ({ ...prev, icon: e.target.value }))}
                  className="w-full px-4 py-2.5 text-sm border border-slate-300 focus:border-primary focus:outline-none bg-white font-mono text-xs"
                >
                  {AVAILABLE_ICONS.map((iconName) => (
                    <option key={iconName} value={iconName}>
                      {iconName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Breve Descrição (Opcional)
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Descrição exibida ao filtrar por esta categoria..."
                  className="w-full p-3 text-sm border border-slate-300 focus:border-primary focus:outline-none"
                />
              </div>

              <label className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.hideWhenEmpty}
                  onChange={(e) => setFormData((prev) => ({ ...prev, hideWhenEmpty: e.target.checked }))}
                  className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
                />
                <div>
                  <p className="text-xs font-bold text-slate-900">Ocultar categoria se tiver 0 produtos</p>
                  <p className="text-[11px] text-slate-500">Não exibe a categoria no menu lateral da loja quando vazia</p>
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
                  {editingCategory ? 'Guardar' : 'Criar Categoria'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Confirmação */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Eliminar Categoria"
        message="Tem a certeza que deseja eliminar esta categoria? Os produtos associados não serão apagados, mas ficarão na categoria geral."
        confirmText="Sim, Eliminar"
        cancelText="Cancelar"
      />
    </div>
  )
}
