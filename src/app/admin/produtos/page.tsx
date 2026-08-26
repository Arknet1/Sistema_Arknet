'use client'

import React, { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  Package,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Star,
  Sparkles,
  Layers,
  ArrowUpDown,
  X,
  ExternalLink,
} from 'lucide-react'
import { dataStore, StoreProduct, ProductCategory } from '@/lib/data-store'
import { useToast } from '@/lib/toast-context'
import { ConfirmModal } from '@/components/admin/confirm-modal'
import { ImageUpload } from '@/components/admin/image-upload'
import { formatProdutoPrice } from '@/lib/format-produto-price'

export default function AdminProdutosPage() {
  const { success, error, info } = useToast()

  const [products, setProducts] = useState<StoreProduct[]>([])
  const [categories, setCategories] = useState<ProductCategory[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Todos')
  const [stockFilter, setStockFilter] = useState<'all' | 'inStock' | 'outOfStock'>('all')
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'date'>('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  // Modal de Criar/Editar
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<StoreProduct | null>(null)
  const [formData, setFormData] = useState<{
    name: string
    description: string
    category: string
    priceType: 'fixed' | 'sob_consulta'
    priceValue: string
    image: string
    inStock: boolean
    featured: boolean
    sku: string
  }>({
    name: '',
    description: '',
    category: 'Produtos',
    priceType: 'sob_consulta',
    priceValue: '',
    image: '',
    inStock: true,
    featured: false,
    sku: '',
  })

  // Modal de Eliminar
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  // Paginação
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  useEffect(() => {
    const sync = () => {
      const db = dataStore.getSnapshot()
      setProducts([...db.products])
      setCategories([...db.categories])
    }
    sync()
    const unsub = dataStore.subscribe(sync)
    return () => unsub()
  }, [])

  // Filtragem e ordenação
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        const matchesSearch =
          p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (p.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase()))

        const matchesCat =
          selectedCategory === 'Todos' || p.category.toLowerCase() === selectedCategory.toLowerCase()

        const matchesStock =
          stockFilter === 'all'
            ? true
            : stockFilter === 'inStock'
            ? p.inStock
            : !p.inStock

        return matchesSearch && matchesCat && matchesStock
      })
      .sort((a, b) => {
        if (sortBy === 'name') {
          return sortOrder === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
        }
        if (sortBy === 'price') {
          const pA = a.price ?? 0
          const pB = b.price ?? 0
          return sortOrder === 'asc' ? pA - pB : pB - pA
        }
        return sortOrder === 'asc'
          ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      })
  }, [products, searchTerm, selectedCategory, stockFilter, sortBy, sortOrder])

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage)
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const handleOpenCreate = () => {
    setEditingProduct(null)
    setFormData({
      name: '',
      description: '',
      category: categories[1]?.name || 'Produtos',
      priceType: 'sob_consulta',
      priceValue: '',
      image: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=500&auto=format&fit=crop&q=80',
      inStock: true,
      featured: false,
      sku: `ARK-${Math.floor(1000 + Math.random() * 9000)}`,
    })
    setIsModalOpen(true)
  }

  const handleOpenEdit = (product: StoreProduct) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      description: product.description,
      category: product.category,
      priceType: product.price === null ? 'sob_consulta' : 'fixed',
      priceValue: product.price !== null ? String(product.price) : '',
      image: product.image,
      inStock: product.inStock,
      featured: !!product.featured,
      sku: product.sku || '',
    })
    setIsModalOpen(true)
  }

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) {
      error('O nome do produto é obrigatório.')
      return
    }

    const price = formData.priceType === 'sob_consulta' || !formData.priceValue.trim()
      ? null
      : parseFloat(formData.priceValue)

    if (editingProduct) {
      dataStore.updateProduct(editingProduct.id, {
        name: formData.name.trim(),
        description: formData.description.trim(),
        category: formData.category,
        price,
        image: formData.image || 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=500&auto=format&fit=crop&q=80',
        inStock: formData.inStock,
        featured: formData.featured,
        sku: formData.sku,
      })
      success(`Produto "${formData.name}" atualizado com sucesso!`, 'Produto Atualizado')
    } else {
      dataStore.addProduct({
        name: formData.name.trim(),
        description: formData.description.trim(),
        category: formData.category,
        price,
        image: formData.image || 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=500&auto=format&fit=crop&q=80',
        inStock: formData.inStock,
        featured: formData.featured,
        sku: formData.sku,
      })
      success(`Novo produto "${formData.name}" adicionado ao catálogo!`, 'Produto Criado')
    }

    setIsModalOpen(false)
  }

  const handleDeleteConfirm = () => {
    if (deletingId) {
      dataStore.deleteProduct(deletingId)
      success('Produto eliminado do catálogo com sucesso.', 'Produto Eliminado')
      setIsDeleteModalOpen(false)
      setDeletingId(null)
    }
  }

  const handleToggleStock = (product: StoreProduct) => {
    dataStore.updateProduct(product.id, { inStock: !product.inStock })
    info(`Stock de "${product.name}" alterado para ${!product.inStock ? 'Disponível' : 'Indisponível'}.`)
  }

  const handleToggleFeatured = (product: StoreProduct) => {
    dataStore.updateProduct(product.id, { featured: !product.featured })
    info(`Destaque de "${product.name}" alterado.`)
  }

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Package className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-extrabold text-slate-900">Catálogo de Produtos</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Gerencie o catálogo da loja online (`/loja`), preços em Kwanzas (Kz), stock e produtos em destaque.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-secondary text-white text-xs font-bold uppercase tracking-wider hover:bg-secondary/90 transition shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Adicionar Produto
        </button>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="bg-white border border-slate-200 p-4 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
              placeholder="Pesquisar por nome, SKU ou descrição..."
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:bg-white focus:border-primary focus:outline-none"
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 text-xs text-slate-700 focus:bg-white focus:border-primary focus:outline-none"
            >
              <option value="Todos">Todas as Categorias ({products.length})</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Stock Filter */}
          <div>
            <select
              value={stockFilter}
              onChange={(e) => {
                setStockFilter(e.target.value as any)
                setCurrentPage(1)
              }}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 text-xs text-slate-700 focus:bg-white focus:border-primary focus:outline-none"
            >
              <option value="all">Todos os Estados de Stock</option>
              <option value="inStock">Apenas Em Stock</option>
              <option value="outOfStock">Apenas Esgotados / Indisponíveis</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 text-xs text-slate-700 focus:bg-white focus:border-primary focus:outline-none"
            >
              <option value="name">Ordenar por Nome</option>
              <option value="price">Ordenar por Preço</option>
              <option value="date">Ordenar por Data</option>
            </select>
            <button
              type="button"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="p-2.5 border border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs transition"
              title="Alternar ordem ascendente / descendente"
            >
              <ArrowUpDown className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Status count indicator */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
          <span>
            Mostrando <strong>{filteredProducts.length}</strong> de {products.length} produtos
          </span>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
              Em Stock: {products.filter((p) => p.inStock).length}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
              Em Destaque: {products.filter((p) => p.featured).length}
            </span>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase tracking-wider font-bold text-[11px]">
              <tr>
                <th className="py-3.5 px-6">Produto</th>
                <th className="py-3.5 px-4">Categoria</th>
                <th className="py-3.5 px-4">Preço (Kz)</th>
                <th className="py-3.5 px-4 text-center">Stock</th>
                <th className="py-3.5 px-4 text-center">Destaque</th>
                <th className="py-3.5 px-6 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    Nenhum produto encontrado com os filtros selecionados.
                  </td>
                </tr>
              ) : (
                paginatedProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-50/80 transition group">
                    {/* Image & Product Info */}
                    <td className="py-3.5 px-6">
                      <div className="flex items-center gap-3">
                        <div className="relative h-12 w-12 bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={product.image}
                            alt={product.name}
                            className="h-full w-full object-contain p-1"
                          />
                        </div>
                        <div className="min-w-0 max-w-xs">
                          <p className="font-bold text-slate-900 group-hover:text-primary transition truncate">
                            {product.name}
                          </p>
                          <p className="text-[11px] text-slate-400 font-mono">SKU: {product.sku || 'N/D'}</p>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-4">
                      <span className="inline-block px-2.5 py-1 bg-slate-100 text-slate-700 text-[11px] font-semibold">
                        {product.category}
                      </span>
                    </td>

                    {/* Price */}
                    <td className="py-3.5 px-4 font-bold text-slate-900 font-mono">
                      {product.price !== null ? (
                        <span className="text-slate-900">{formatProdutoPrice(product.price)}</span>
                      ) : (
                        <span className="text-slate-400 italic">Sob Consulta</span>
                      )}
                    </td>

                    {/* In Stock Toggle */}
                    <td className="py-3.5 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleStock(product)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold uppercase transition ${
                          product.inStock
                            ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                        }`}
                        title="Clique para alternar stock"
                      >
                        {product.inStock ? (
                          <>
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                            Disponível
                          </>
                        ) : (
                          <>
                            <XCircle className="h-3.5 w-3.5 text-rose-600" />
                            Esgotado
                          </>
                        )}
                      </button>
                    </td>

                    {/* Featured Toggle */}
                    <td className="py-3.5 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleFeatured(product)}
                        className={`p-1.5 rounded transition ${
                          product.featured
                            ? 'text-amber-500 hover:text-amber-600 bg-amber-50'
                            : 'text-slate-300 hover:text-slate-500 bg-slate-50'
                        }`}
                        title={product.featured ? 'Produto em destaque' : 'Marcar como destaque'}
                      >
                        <Star className={`h-4 w-4 ${product.featured ? 'fill-amber-400' : ''}`} />
                      </button>
                    </td>

                    {/* Action Buttons */}
                    <td className="py-3.5 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/loja/${product.id}`}
                          target="_blank"
                          className="p-2 text-slate-400 hover:text-primary hover:bg-slate-100 transition"
                          title="Ver na loja pública"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(product)}
                          className="p-2 text-slate-600 hover:text-primary hover:bg-slate-100 transition"
                          title="Editar produto"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setDeletingId(product.id)
                            setIsDeleteModalOpen(true)
                          }}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                          title="Eliminar produto"
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

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
            <span className="text-slate-500">
              Página <strong>{currentPage}</strong> de {totalPages}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-40 transition font-semibold"
              >
                Anterior
              </button>
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-3 py-1.5 font-bold transition ${
                    currentPage === i + 1
                      ? 'bg-primary text-white'
                      : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-40 transition font-semibold"
              >
                Seguinte
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Criação / Edição */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          />

          <div className="relative w-full max-w-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden z-10 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-primary/10 text-primary rounded">
                  <Package className="h-5 w-5" />
                </div>
                <h3 className="text-base font-extrabold text-slate-900">
                  {editingProduct ? 'Editar Produto' : 'Novo Produto para a Loja'}
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

            {/* Modal Body / Form */}
            <form onSubmit={handleSaveProduct} className="p-6 overflow-y-auto space-y-5 flex-1">
              {/* Product Name */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Nome do Produto *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="ex: Roteador Wi-Fi 6 Gigabit Dual Band"
                  className="w-full px-4 py-2.5 text-sm border border-slate-300 focus:border-primary focus:outline-none"
                />
              </div>

              {/* Category & SKU */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Categoria *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
                    className="w-full px-4 py-2.5 text-sm border border-slate-300 focus:border-primary focus:outline-none bg-white"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Código SKU / Referência
                  </label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) => setFormData((prev) => ({ ...prev, sku: e.target.value }))}
                    placeholder="ex: ARK-2045"
                    className="w-full px-4 py-2.5 text-sm border border-slate-300 focus:border-primary focus:outline-none font-mono"
                  />
                </div>
              </div>

              {/* Price Mode & Value */}
              <div className="p-4 bg-slate-50 border border-slate-200 space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Preço em Kwanzas (Kz)
                </label>
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                    <input
                      type="radio"
                      name="priceType"
                      checked={formData.priceType === 'fixed'}
                      onChange={() => setFormData((prev) => ({ ...prev, priceType: 'fixed' }))}
                      className="text-primary focus:ring-primary"
                    />
                    Preço Fixo em Kz
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                    <input
                      type="radio"
                      name="priceType"
                      checked={formData.priceType === 'sob_consulta'}
                      onChange={() => setFormData((prev) => ({ ...prev, priceType: 'sob_consulta' }))}
                      className="text-primary focus:ring-primary"
                    />
                    Preço Sob Consulta (—)
                  </label>
                </div>

                {formData.priceType === 'fixed' && (
                  <div className="relative mt-2">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-xs text-slate-500">
                      Kz
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      required={formData.priceType === 'fixed'}
                      value={formData.priceValue}
                      onChange={(e) => setFormData((prev) => ({ ...prev, priceValue: e.target.value }))}
                      placeholder="85000"
                      className="w-full pl-12 pr-4 py-2 text-sm border border-slate-300 focus:border-primary focus:outline-none bg-white font-mono"
                    />
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Descrição do Produto
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Especificações técnicas, modelo e detalhes comerciais..."
                  className="w-full p-3 text-sm border border-slate-300 focus:border-primary focus:outline-none"
                />
              </div>

              {/* Image Upload Component */}
              <ImageUpload
                value={formData.image}
                onChange={(url) => setFormData((prev) => ({ ...prev, image: url }))}
                label="Foto / Imagem do Produto"
              />

              {/* Toggles: Stock and Featured */}
              <div className="grid sm:grid-cols-2 gap-4 pt-2">
                <label className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.inStock}
                    onChange={(e) => setFormData((prev) => ({ ...prev, inStock: e.target.checked }))}
                    className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-900">Disponível em Stock</p>
                    <p className="text-[11px] text-slate-500">Habilita botão de adicionar ao carrinho</p>
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
                    <p className="text-xs font-bold text-slate-900">Produto em Destaque</p>
                    <p className="text-[11px] text-slate-500">Aparece na página inicial e destaques</p>
                  </div>
                </label>
              </div>

              {/* Modal Footer */}
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
                  {editingProduct ? 'Guardar Alterações' : 'Criar Produto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Eliminar */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Eliminar Produto"
        message="Tem a certeza que deseja eliminar permanentemente este produto do catálogo da loja? Esta ação não pode ser desfeita."
        confirmText="Sim, Eliminar"
        cancelText="Cancelar"
      />
    </div>
  )
}
