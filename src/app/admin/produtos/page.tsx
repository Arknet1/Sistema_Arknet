'use client'

import React, { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import {
  Package,
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle2,
  Star,
  Layers,
  ArrowUpDown,
  X,
  ExternalLink,
  Truck,
  Loader2,
  Palette,
  Cpu,
  HardDrive,
  Wifi,
  Sparkles,
  PlusCircle,
  Tag,
  ImageIcon,
  Check,
  AlertCircle,
  AlertTriangle,
  TrendingDown,
  Boxes,
  Warehouse,
  Zap,
  RefreshCw,
  Copy,
} from 'lucide-react'
import {
  dataStore,
  StoreProduct,
  ProductCategory,
  ProductOption,
  ProductVariant,
  ProductVariantOptionSelection,
} from '@/lib/data-store'
import { useToast } from '@/lib/toast-context'
import { ConfirmModal } from '@/components/admin/confirm-modal'
import { ImageUpload } from '@/components/admin/image-upload'
import { formatProdutoPrice } from '@/lib/format-produto-price'

const PRESET_OPTIONS = [
  { name: 'Cor', icon: Palette, defaultValues: ['Preto', 'Branco', 'Azul', 'Cinza', 'Prata'] },
  { name: 'RAM', icon: Cpu, defaultValues: ['8GB', '16GB', '32GB', '64GB'] },
  { name: 'Armazenamento', icon: HardDrive, defaultValues: ['256GB SSD', '512GB SSD', '1TB SSD', '2TB SSD'] },
  { name: 'Conectividade', icon: Wifi, defaultValues: ['Wi-Fi 6', '4G LTE / SIM', 'Fibra Gigabit', 'Ethernet RJ45'] },
  { name: 'Versão', icon: Tag, defaultValues: ['Standard', 'Pro', 'Enterprise'] },
]

const COLOR_HEX_MAP: Record<string, string> = {
  preto: '#111827',
  black: '#111827',
  branco: '#FFFFFF',
  white: '#FFFFFF',
  azul: '#1E40AF',
  'azul marinho': '#1E3A8A',
  blue: '#1E40AF',
  cinza: '#6B7280',
  cinzento: '#6B7280',
  'cinzento sideral': '#374151',
  'space gray': '#374151',
  prata: '#D1D5DB',
  silver: '#D1D5DB',
  dourado: '#F59E0B',
  gold: '#F59E0B',
  verde: '#15803D',
  'verde tropa': '#3F6212',
  green: '#15803D',
  rosa: '#EC4899',
  pink: '#EC4899',
  vermelho: '#DC2626',
  red: '#DC2626',
  laranja: '#EA580C',
  orange: '#EA580C',
  amarelo: '#EAB308',
  yellow: '#EAB308',
  roxo: '#7E22CE',
  purple: '#7E22CE',
}

function guessColorHex(colorName: string): string {
  const clean = colorName.trim().toLowerCase()
  if (COLOR_HEX_MAP[clean]) return COLOR_HEX_MAP[clean]
  for (const [key, hex] of Object.entries(COLOR_HEX_MAP)) {
    if (clean.includes(key)) return hex
  }
  return '#94A3B8'
}

export default function AdminProdutosPage() {
  const { success, error, info } = useToast()

  const [products, setProducts] = useState<StoreProduct[]>(() => dataStore.getProducts())
  const [categories, setCategories] = useState<ProductCategory[]>(() => dataStore.getCategories())
  const [reservations, setReservations] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Todos')
  const [stockFilter, setStockFilter] = useState<'all' | 'inStock' | 'lowStock' | 'outOfStock' | 'hasVariants'>('all')
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'date' | 'stock'>('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  // Modal de Entrada Rápida / Reposição de Stock
  const [isRestockModalOpen, setIsRestockModalOpen] = useState(false)
  const [restockProduct, setRestockProduct] = useState<StoreProduct | null>(null)
  const [restockAmount, setRestockAmount] = useState(10)
  const [restockNote, setRestockNote] = useState('')
  const [isExecutingRestock, setIsExecutingRestock] = useState(false)

  // Modal de Criar/Editar
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'geral' | 'variantes' | 'galeria'>('geral')
  const [editingProduct, setEditingProduct] = useState<StoreProduct | null>(null)
  const [isSavingProduct, setIsSavingProduct] = useState(false)

  // Form State
  const [formData, setFormData] = useState<{
    name: string
    brand: string
    description: string
    category: string
    priceType: 'fixed' | 'sob_consulta'
    priceValue: string
    image: string
    images: string[]
    inStock: boolean
    quantity: number
    minStockAlert: number
    featured: boolean
    sku: string
    hasVariants: boolean
    options: ProductOption[]
    variants: ProductVariant[]
  }>({
    name: '',
    brand: '',
    description: '',
    category: 'Produtos',
    priceType: 'sob_consulta',
    priceValue: '',
    image: '',
    images: [],
    inStock: true,
    quantity: 10,
    minStockAlert: 5,
    featured: false,
    sku: '',
    hasVariants: false,
    options: [],
    variants: [],
  })

  // Inputs temporários para adicionar opções
  const [newOptionName, setNewOptionName] = useState('')
  const [newOptionValuesInput, setNewOptionValuesInput] = useState<Record<number, string>>({})

  // Modal de Eliminar
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  // Paginação
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  useEffect(() => {
    dataStore.fetchProductsFromServer().catch((e) => console.warn('Erro ao carregar produtos:', e))

    const sync = () => {
      const allProducts = dataStore.getProducts()
      const allCategories = dataStore.getCategories()
      const db = dataStore.getSnapshot()
      setProducts([...allProducts])
      setCategories([...allCategories])
      setReservations(db.reservations || [])
    }
    sync()
    const unsub = dataStore.subscribe(sync)
    return () => unsub()
  }, [])

  // Métricas de Inventário em Tempo Real
  const inventoryMetrics = useMemo(() => {
    let totalUnits = 0
    let inStockCount = 0
    let lowStockCount = 0
    let outOfStockCount = 0
    let totalValueKz = 0

    for (const p of products) {
      const rawQty = p.quantity
      const parsedQty = typeof rawQty === 'number' ? rawQty : (typeof rawQty === 'string' ? parseInt(rawQty, 10) : NaN)
      const qty = !isNaN(parsedQty) ? Math.max(0, parsedQty) : (p.inStock ? 10 : 0)
      const rawMin = p.minStockAlert
      const parsedMin = typeof rawMin === 'number' ? rawMin : (typeof rawMin === 'string' ? parseInt(rawMin, 10) : NaN)
      const minAlert = !isNaN(parsedMin) ? Math.max(1, parsedMin) : 5
      totalUnits += qty

      if (qty <= 0 || !p.inStock) {
        outOfStockCount++
      } else if (qty <= minAlert) {
        lowStockCount++
      } else {
        inStockCount++
      }

      if (typeof p.price === 'number' && p.price > 0) {
        totalValueKz += p.price * qty
      }
    }

    return {
      totalUnits,
      inStockCount,
      lowStockCount,
      outOfStockCount,
      totalValueKz,
    }
  }, [products])

  // Filtragem e ordenação
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        const query = searchTerm.toLowerCase()
        const matchesName = p.name.toLowerCase().includes(query)
        const matchesDesc = p.description.toLowerCase().includes(query)
        const matchesSku = p.sku && p.sku.toLowerCase().includes(query)
        const matchesBrand = p.brand && p.brand.toLowerCase().includes(query)
        const matchesVariantSku = p.variants?.some((v) => v.sku.toLowerCase().includes(query))
        const matchesVariantOpt = p.variants?.some((v) =>
          v.options?.some((o) => o.value.toLowerCase().includes(query))
        )

        const matchesSearch =
          matchesName || matchesDesc || matchesSku || matchesBrand || matchesVariantSku || matchesVariantOpt

        const matchesCat =
          selectedCategory === 'Todos' || p.category.toLowerCase() === selectedCategory.toLowerCase()

        let matchesStock = true
        const rawQty = p.quantity
        const parsedQty = typeof rawQty === 'number' ? rawQty : (typeof rawQty === 'string' ? parseInt(rawQty, 10) : NaN)
        const qty = !isNaN(parsedQty) ? Math.max(0, parsedQty) : (p.inStock ? 10 : 0)
        const rawMin = p.minStockAlert
        const parsedMin = typeof rawMin === 'number' ? rawMin : (typeof rawMin === 'string' ? parseInt(rawMin, 10) : NaN)
        const minAlert = !isNaN(parsedMin) ? Math.max(1, parsedMin) : 5

        if (stockFilter === 'inStock') matchesStock = p.inStock && qty > minAlert
        if (stockFilter === 'lowStock') matchesStock = p.inStock && qty > 0 && qty <= minAlert
        if (stockFilter === 'outOfStock') matchesStock = !p.inStock || qty <= 0
        if (stockFilter === 'hasVariants') matchesStock = (p.variants?.length ?? 0) > 0

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
        if (sortBy === 'stock') {
          const sA = a.quantity ?? (a.inStock ? 10 : 0)
          const sB = b.quantity ?? (b.inStock ? 10 : 0)
          return sortOrder === 'asc' ? sA - sB : sB - sA
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

  const handleOpenRestock = (product: StoreProduct) => {
    setRestockProduct(product)
    setRestockAmount(10)
    setRestockNote('')
    setIsRestockModalOpen(true)
  }

  const handleExecuteRestock = async () => {
    if (!restockProduct) return
    setIsExecutingRestock(true)
    try {
      const currentQty = restockProduct.quantity ?? (restockProduct.inStock ? 10 : 0)
      const addedQty = Math.max(1, Number(restockAmount) || 10)
      const newQty = currentQty + addedQty
      await dataStore.updateProductAsync(restockProduct.id, {
        quantity: newQty,
        inStock: true,
      })
      success(
        `Stock de "${restockProduct.name}" aumentado em +${addedQty} un. (Novo stock: ${newQty} un.)`,
        'Entrada de Stock Concluída'
      )
      setIsRestockModalOpen(false)
      setRestockProduct(null)
    } catch (err) {
      error('Erro ao registrar entrada de stock.')
    } finally {
      setIsExecutingRestock(false)
    }
  }

  const handleOpenCreate = () => {
    setEditingProduct(null)
    setActiveTab('geral')
    setFormData({
      name: '',
      brand: '',
      description: '',
      category: categories[1]?.name || 'Produtos',
      priceType: 'sob_consulta',
      priceValue: '',
      image: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=500&auto=format&fit=crop&q=80',
      images: [],
      inStock: true,
      quantity: 10,
      minStockAlert: 5,
      featured: false,
      sku: `ARK-${Math.floor(1000 + Math.random() * 9000)}`,
      hasVariants: false,
      options: [],
      variants: [],
    })
    setNewOptionName('')
    setNewOptionValuesInput({})
    setIsModalOpen(true)
  }

  const handleOpenEdit = (product: StoreProduct) => {
    setEditingProduct(product)
    setActiveTab('geral')
    const hasVars = (product.variants?.length ?? 0) > 0 || (product.options?.length ?? 0) > 0

    setFormData({
      name: product.name,
      brand: product.brand || '',
      description: product.description,
      category: product.category,
      priceType: product.price === null ? 'sob_consulta' : 'fixed',
      priceValue: product.price !== null ? String(product.price) : '',
      image: product.image,
      images: Array.isArray(product.images) ? product.images : [],
      inStock: product.inStock,
      quantity: product.quantity ?? (product.inStock ? 10 : 0),
      minStockAlert: product.minStockAlert ?? 5,
      featured: !!product.featured,
      sku: product.sku || '',
      hasVariants: hasVars,
      options: product.options ? JSON.parse(JSON.stringify(product.options)) : [],
      variants: product.variants ? JSON.parse(JSON.stringify(product.variants)) : [],
    })
    setNewOptionName('')
    setNewOptionValuesInput({})
    setIsModalOpen(true)
  }

  // --- LÓGICA DE GESTÃO DE VARIANTES E OPÇÕES ---

  const handleAddOption = (optionName: string) => {
    const trimmed = optionName.trim()
    if (!trimmed) return
    if (formData.options.some((o) => o.name.toLowerCase() === trimmed.toLowerCase())) {
      error(`A opção "${trimmed}" já existe.`)
      return
    }

    const preset = PRESET_OPTIONS.find((p) => p.name.toLowerCase() === trimmed.toLowerCase())
    const initialValues = preset
      ? preset.defaultValues.slice(0, 3).map((val) => ({
          id: `val-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
          value: val,
          hex: trimmed.toLowerCase().includes('cor') ? guessColorHex(val) : null,
        }))
      : []

    const newOpt: ProductOption = {
      id: `opt-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      name: trimmed,
      order: formData.options.length,
      values: initialValues,
    }

    setFormData((prev) => ({
      ...prev,
      hasVariants: true,
      options: [...prev.options, newOpt],
    }))
    setNewOptionName('')
  }

  const handleRemoveOption = (optIndex: number) => {
    setFormData((prev) => {
      const nextOptions = prev.options.filter((_, i) => i !== optIndex)
      return {
        ...prev,
        options: nextOptions,
        hasVariants: nextOptions.length > 0 || prev.variants.length > 0,
      }
    })
  }

  const handleAddOptionValue = (optIndex: number) => {
    const rawVal = newOptionValuesInput[optIndex]?.trim()
    if (!rawVal) return

    setFormData((prev) => {
      const currentOpt = prev.options[optIndex]
      if (!currentOpt) return prev
      if (currentOpt.values.some((v) => v.value.toLowerCase() === rawVal.toLowerCase())) {
        return prev
      }

      const isColor = currentOpt.name.toLowerCase().includes('cor')
      const newVal = {
        id: `val-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
        value: rawVal,
        hex: isColor ? guessColorHex(rawVal) : null,
      }

      const nextOptions = [...prev.options]
      nextOptions[optIndex] = {
        ...currentOpt,
        values: [...currentOpt.values, newVal],
      }
      return { ...prev, options: nextOptions }
    })

    setNewOptionValuesInput((prev) => ({ ...prev, [optIndex]: '' }))
  }

  const handleRemoveOptionValue = (optIndex: number, valId: string) => {
    setFormData((prev) => {
      const currentOpt = prev.options[optIndex]
      if (!currentOpt) return prev
      const nextOptions = [...prev.options]
      nextOptions[optIndex] = {
        ...currentOpt,
        values: currentOpt.values.filter((v) => v.id !== valId),
      }
      return { ...prev, options: nextOptions }
    })
  }

  const handleUpdateColorHex = (optIndex: number, valId: string, hex: string) => {
    setFormData((prev) => {
      const nextOptions = [...prev.options]
      const currentOpt = nextOptions[optIndex]
      if (!currentOpt) return prev
      nextOptions[optIndex] = {
        ...currentOpt,
        values: currentOpt.values.map((v) => (v.id === valId ? { ...v, hex } : v)),
      }
      return { ...prev, options: nextOptions }
    })
  }

  // Gerar Produto Cartesiano de Variantes
  const handleGenerateCombinations = () => {
    if (formData.options.length === 0) {
      error('Adicione pelo menos uma opção com valores (ex: Cor, RAM).')
      return
    }

    const validOptions = formData.options.filter((o) => o.values.length > 0)
    if (validOptions.length === 0) {
      error('Cada opção deve ter pelo menos um valor adicionado.')
      return
    }

    // Cartesian product
    function cartesian(arrays: any[][]): any[][] {
      return arrays.reduce((acc, curr) => acc.flatMap((d) => curr.map((e) => [...d, e])), [[]])
    }

    const valueArrays = validOptions.map((opt) =>
      opt.values.map((val) => ({
        optionId: opt.id,
        optionName: opt.name,
        optionValueId: val.id,
        value: val.value,
        hex: val.hex || null,
      }))
    )

    const combinations = cartesian(valueArrays)
    const baseSku = formData.sku || `ARK-${Math.floor(1000 + Math.random() * 9000)}`
    const basePrice = formData.priceType === 'fixed' && formData.priceValue ? parseFloat(formData.priceValue) : null

    const generatedVariants: ProductVariant[] = combinations.map((combo: ProductVariantOptionSelection[], index: number) => {
      const skuSuffix = combo.map((c) => c.value.toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 4)).join('-')
      const existing = formData.variants.find((v) => {
        if (v.options?.length !== combo.length) return false
        return combo.every((c) => v.options.some((vo) => vo.optionName === c.optionName && vo.value === c.value))
      })

      if (existing) return existing

      return {
        id: `var-${Date.now()}-${index + 1}-${Math.random().toString(36).substring(2, 5)}`,
        sku: `${baseSku}-${skuSuffix || index + 1}`,
        price: basePrice,
        stock: 10,
        images: formData.image ? [formData.image] : [],
        active: true,
        order: index,
        options: combo,
      }
    })

    setFormData((prev) => ({
      ...prev,
      hasVariants: true,
      variants: generatedVariants,
    }))

    success(`${generatedVariants.length} combinações de variantes geradas com sucesso!`, 'Variantes Geradas')
  }

  const handleAddManualVariant = () => {
    const baseSku = formData.sku || `ARK-${Math.floor(1000 + Math.random() * 9000)}`
    const basePrice = formData.priceType === 'fixed' && formData.priceValue ? parseFloat(formData.priceValue) : null
    const newV: ProductVariant = {
      id: `var-${Date.now()}-${formData.variants.length + 1}`,
      sku: `${baseSku}-V${formData.variants.length + 1}`,
      price: basePrice,
      stock: 5,
      images: formData.image ? [formData.image] : [],
      active: true,
      order: formData.variants.length,
      options: [],
    }

    setFormData((prev) => ({
      ...prev,
      hasVariants: true,
      variants: [...prev.variants, newV],
    }))
  }

  const handleUpdateVariant = (index: number, updates: Partial<ProductVariant>) => {
    setFormData((prev) => {
      const nextVars = [...prev.variants]
      nextVars[index] = { ...nextVars[index], ...updates }
      return { ...prev, variants: nextVars }
    })
  }

  const handleRemoveVariant = (index: number) => {
    setFormData((prev) => {
      const nextVars = prev.variants.filter((_, i) => i !== index)
      return { ...prev, variants: nextVars }
    })
  }

  // --- GRAVAÇÃO FINAL DO PRODUTO ---

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSavingProduct) return
    if (!formData.name.trim()) {
      error('O nome do produto é obrigatório.')
      return
    }

    const price =
      formData.priceType === 'sob_consulta' || !formData.priceValue.trim()
        ? null
        : parseFloat(formData.priceValue)

    if (price !== null && !Number.isFinite(price)) {
      error('Indique um preço válido em Kwanzas.')
      return
    }

    // Se tiver variantes ativas, o stock total do pai é a soma dos stocks das variantes
    let totalStock = formData.quantity
    if (formData.hasVariants && formData.variants.length > 0) {
      totalStock = formData.variants.reduce((sum, v) => sum + (v.stock || 0), 0)
    }

    const isAvailable = totalStock > 0 && formData.inStock
    setIsSavingProduct(true)

    try {
      const productData = {
        name: formData.name.trim(),
        brand: formData.brand.trim() || undefined,
        description: formData.description.trim(),
        category: formData.category,
        price,
        image: formData.image || 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=500&auto=format&fit=crop&q=80',
        images: formData.images.length > 0 ? formData.images : (formData.image ? [formData.image] : []),
        inStock: isAvailable,
        quantity: totalStock,
        minStockAlert: formData.minStockAlert ?? 5,
        featured: formData.featured,
        sku: formData.sku,
        options: formData.hasVariants ? formData.options : [],
        variants: formData.hasVariants ? formData.variants : [],
      }

      if (editingProduct) {
        await dataStore.updateProductAsync(editingProduct.id, productData)
      } else {
        await dataStore.addProductAsync(productData)
      }

      success(
        editingProduct
          ? `Produto "${formData.name}" atualizado com sucesso.`
          : `Produto "${formData.name}" criado com sucesso.`,
        editingProduct ? 'Produto Atualizado' : 'Produto Criado'
      )
      setIsModalOpen(false)
    } catch (saveError) {
      console.error('[Admin Produtos] Erro ao guardar produto:', saveError)
      error('Não foi possível guardar o produto. Verifique a ligação e tente novamente.')
    } finally {
      setIsSavingProduct(false)
    }
  }

  const handleDeleteConfirm = async () => {
    if (deletingId) {
      await dataStore.deleteProductAsync(deletingId)
      success('Produto eliminado do catálogo com sucesso.', 'Produto Eliminado')
      setIsDeleteModalOpen(false)
      setDeletingId(null)
    }
  }

  const handleToggleStock = (product: StoreProduct) => {
    const nextInStock = !product.inStock
    const nextQty = nextInStock ? (product.quantity && product.quantity > 0 ? product.quantity : 10) : 0
    dataStore.updateProduct(product.id, { inStock: nextInStock, quantity: nextQty })
    info(`Stock de "${product.name}" alterado para ${nextInStock ? 'Disponível' : 'Indisponível'} (${nextQty} un.).`)
  }

  const handleUpdateQuantity = (product: StoreProduct, delta: number) => {
    const rawQty = product.quantity
    const parsedQty = typeof rawQty === 'number' ? rawQty : (typeof rawQty === 'string' ? parseInt(rawQty, 10) : NaN)
    const currentQty = !isNaN(parsedQty) ? parsedQty : (product.inStock ? 10 : 0)
    const nextQty = Math.max(0, Number(currentQty) + Number(delta))
    const nextInStock = nextQty > 0
    dataStore.updateProduct(product.id, {
      quantity: nextQty,
      inStock: nextInStock,
    })
    info(`Quantidade de "${product.name}" alterada para ${nextQty} un.`)
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
            <h1 className="text-2xl font-extrabold text-slate-900">Catálogo de Produtos & Gestão de Inventário</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Controlo de inventário com alertas de rutura, reposição rápida, variantes completas e preços em Kwanzas.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleOpenCreate}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-secondary text-white text-xs font-bold uppercase tracking-wider hover:bg-secondary/90 transition shadow-sm cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Adicionar Produto
          </button>
        </div>
      </div>

      {/* INVENTORY METRICS CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* Total Unidades */}
        <div className="bg-white border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total em Stock</span>
            <Boxes className="h-4 w-4 text-slate-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 font-mono">{inventoryMetrics.totalUnits}</span>
            <span className="text-xs text-slate-500">unidades</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">{products.length} referências ativas</p>
        </div>

        {/* Stock Saudável */}
        <div
          onClick={() => {
            setStockFilter('inStock')
            setCurrentPage(1)
          }}
          className={`bg-white border p-4 shadow-xs cursor-pointer transition ${
            stockFilter === 'inStock' ? 'border-emerald-500 bg-emerald-50/30 ring-1 ring-emerald-500' : 'border-slate-200 hover:border-emerald-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Em Stock Saudável</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-700 font-mono">{inventoryMetrics.inStockCount}</span>
            <span className="text-xs text-emerald-600">produtos</span>
          </div>
          <p className="text-[10px] text-emerald-600/80 mt-1">Acima do limiar mínimo</p>
        </div>

        {/* Stock Baixo / Alerta */}
        <div
          onClick={() => {
            setStockFilter('lowStock')
            setCurrentPage(1)
          }}
          className={`bg-white border p-4 shadow-xs cursor-pointer transition ${
            stockFilter === 'lowStock' ? 'border-amber-500 bg-amber-50/40 ring-1 ring-amber-500' : 'border-slate-200 hover:border-amber-300'
          } ${inventoryMetrics.lowStockCount > 0 ? 'border-amber-300 bg-amber-50/20' : ''}`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">Alerta Stock Baixo</span>
            <AlertTriangle className="h-4 w-4 text-amber-600 animate-pulse" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-700 font-mono">{inventoryMetrics.lowStockCount}</span>
            <span className="text-xs text-amber-600">produtos</span>
          </div>
          <p className="text-[10px] text-amber-600/80 mt-1">Necessitam de reposição</p>
        </div>

        {/* Esgotados / Ruptura */}
        <div
          onClick={() => {
            setStockFilter('outOfStock')
            setCurrentPage(1)
          }}
          className={`bg-white border p-4 shadow-xs cursor-pointer transition ${
            stockFilter === 'outOfStock' ? 'border-rose-500 bg-rose-50/40 ring-1 ring-rose-500' : 'border-slate-200 hover:border-rose-300'
          } ${inventoryMetrics.outOfStockCount > 0 ? 'border-rose-300 bg-rose-50/20' : ''}`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wider">Esgotados / Rutura</span>
            <TrendingDown className="h-4 w-4 text-rose-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-rose-700 font-mono">{inventoryMetrics.outOfStockCount}</span>
            <span className="text-xs text-rose-600">produtos</span>
          </div>
          <p className="text-[10px] text-rose-600/80 mt-1">Vendas imediatas suspensas</p>
        </div>

        {/* Valor em Armazém */}
        <div className="col-span-2 sm:col-span-1 bg-white border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Valor em Stock</span>
            <Warehouse className="h-4 w-4 text-slate-400" />
          </div>
          <div className="mt-2">
            <span className="text-lg font-black text-slate-900 font-mono truncate block">
              {formatProdutoPrice(inventoryMetrics.totalValueKz)}
            </span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Estimativa de inventário</p>
        </div>
      </div>

      {/* ALERT BANNER IF CRITICAL STOCK */}
      {(inventoryMetrics.lowStockCount > 0 || inventoryMetrics.outOfStockCount > 0) && (
        <div className="bg-amber-50 border border-amber-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-amber-900 rounded-xs">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500 text-white rounded">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-amber-950">
                Atenção ao Inventário: {inventoryMetrics.lowStockCount + inventoryMetrics.outOfStockCount} produto(s) requerem a sua atenção
              </p>
              <p className="text-[11px] text-amber-800">
                {inventoryMetrics.lowStockCount} produto(s) abaixo do limite de alerta e {inventoryMetrics.outOfStockCount} esgotado(s).
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                setStockFilter('lowStock')
                setCurrentPage(1)
              }}
              className="px-3 py-1.5 bg-amber-600 text-white text-xs font-bold hover:bg-amber-700 transition"
            >
              Ver Stock Baixo
            </button>
            <button
              type="button"
              onClick={() => {
                setStockFilter('outOfStock')
                setCurrentPage(1)
              }}
              className="px-3 py-1.5 bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition"
            >
              Ver Esgotados
            </button>
          </div>
        </div>
      )}

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
              placeholder="Pesquisar por nome, marca, SKU ou opção..."
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

          {/* Stock & Variant Filter */}
          <div>
            <select
              value={stockFilter}
              onChange={(e) => {
                setStockFilter(e.target.value as any)
                setCurrentPage(1)
              }}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 text-xs text-slate-700 focus:bg-white focus:border-primary focus:outline-none font-semibold"
            >
              <option value="all">Todos os Estados de Stock ({products.length})</option>
              <option value="inStock">🟢 Em Stock Saudável ({inventoryMetrics.inStockCount})</option>
              <option value="lowStock">⚠️ Stock Baixo / Alerta ({inventoryMetrics.lowStockCount})</option>
              <option value="outOfStock">⛔ Esgotados / Rutura ({inventoryMetrics.outOfStockCount})</option>
              <option value="hasVariants">📦 Apenas Com Variantes</option>
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
              <option value="stock">Ordenar por Quantidade Stock</option>
              <option value="date">Ordenar por Data de Criação</option>
            </select>
            <button
              type="button"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="p-2.5 border border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs transition cursor-pointer"
              title="Alternar ordem ascendente / descendente"
            >
              <ArrowUpDown className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Quick Filter Badges Row */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100 text-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Filtro Rápido:</span>
          <button
            type="button"
            onClick={() => {
              setStockFilter('all')
              setCurrentPage(1)
            }}
            className={`px-2.5 py-1 text-xs font-semibold rounded-full transition cursor-pointer ${
              stockFilter === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Todos ({products.length})
          </button>
          <button
            type="button"
            onClick={() => {
              setStockFilter('inStock')
              setCurrentPage(1)
            }}
            className={`px-2.5 py-1 text-xs font-semibold rounded-full transition cursor-pointer ${
              stockFilter === 'inStock' ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
            }`}
          >
            🟢 Saudável ({inventoryMetrics.inStockCount})
          </button>
          <button
            type="button"
            onClick={() => {
              setStockFilter('lowStock')
              setCurrentPage(1)
            }}
            className={`px-2.5 py-1 text-xs font-semibold rounded-full transition cursor-pointer ${
              stockFilter === 'lowStock' ? 'bg-amber-600 text-white' : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
            }`}
          >
            ⚠️ Stock Baixo ({inventoryMetrics.lowStockCount})
          </button>
          <button
            type="button"
            onClick={() => {
              setStockFilter('outOfStock')
              setCurrentPage(1)
            }}
            className={`px-2.5 py-1 text-xs font-semibold rounded-full transition cursor-pointer ${
              stockFilter === 'outOfStock' ? 'bg-rose-600 text-white' : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
            }`}
          >
            ⛔ Esgotados ({inventoryMetrics.outOfStockCount})
          </button>
          <button
            type="button"
            onClick={() => {
              setStockFilter('hasVariants')
              setCurrentPage(1)
            }}
            className={`px-2.5 py-1 text-xs font-semibold rounded-full transition cursor-pointer ${
              stockFilter === 'hasVariants' ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
            }`}
          >
            📦 Variantes
          </button>
        </div>
      </div>

      {/* Product Table */}
      <div className="bg-white border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-extrabold uppercase tracking-wider text-slate-700">
              <tr>
                <th className="py-3.5 px-6">Produto</th>
                <th className="py-3.5 px-4">Categoria / Marca</th>
                <th className="py-3.5 px-4">Variantes & Opções</th>
                <th className="py-3.5 px-4">Preço (Kz)</th>
                <th className="py-3.5 px-4 text-center">Estado do Stock</th>
                <th className="py-3.5 px-4 text-center">Destaque</th>
                <th className="py-3.5 px-6 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Nenhum produto encontrado com os filtros selecionados.
                  </td>
                </tr>
              ) : (
                paginatedProducts.map((product) => {
                  const hasVars = (product.variants?.length ?? 0) > 0
                  const colorOptions = product.options?.find((o) => o.name.toLowerCase().includes('cor'))?.values || []
                  const rawQty = product.quantity
                  const parsedQty = typeof rawQty === 'number' ? rawQty : (typeof rawQty === 'string' ? parseInt(rawQty, 10) : NaN)
                  const currentQty = !isNaN(parsedQty) ? parsedQty : (product.inStock ? 10 : 0)
                  const rawMin = product.minStockAlert
                  const parsedMin = typeof rawMin === 'number' ? rawMin : (typeof rawMin === 'string' ? parseInt(rawMin, 10) : NaN)
                  const minAlert = !isNaN(parsedMin) ? Math.max(1, parsedMin) : 5
                  const isOutOfStock = currentQty <= 0 || !product.inStock
                  const isLowStock = !isOutOfStock && currentQty <= minAlert

                  return (
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
                            <p className="text-[11px] text-slate-400 font-mono">
                              SKU: {product.sku || 'N/D'}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Category & Brand */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <span className="inline-block px-2.5 py-0.5 bg-slate-100 text-slate-700 text-[11px] font-semibold">
                            {product.category}
                          </span>
                          {product.brand && (
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                              {product.brand}
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Variants & Options Badge */}
                      <td className="py-3.5 px-4">
                        {hasVars ? (
                          <div className="space-y-1">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-700 text-[11px] font-bold rounded border border-blue-200">
                              <Layers className="h-3 w-3" />
                              {product.variants!.length} variantes
                            </span>

                            {/* Mini swatches preview */}
                            {colorOptions.length > 0 && (
                              <div className="flex items-center gap-1 pt-0.5">
                                {colorOptions.slice(0, 4).map((c, i) => (
                                  <span
                                    key={i}
                                    className="w-3 h-3 rounded-full border border-slate-300 shadow-xs shrink-0"
                                    style={{ backgroundColor: c.hex || guessColorHex(c.value) }}
                                    title={c.value}
                                  />
                                ))}
                                {colorOptions.length > 4 && (
                                  <span className="text-[10px] text-slate-400 font-bold">
                                    +{colorOptions.length - 4}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px] italic">Produto Único</span>
                        )}
                      </td>

                      {/* Price */}
                      <td className="py-3.5 px-4 font-bold text-slate-900 font-mono">
                        {product.price !== null ? (
                          <div>
                            {hasVars && <span className="text-[10px] text-slate-400 block font-normal">A partir de</span>}
                            <span className="text-slate-900">{formatProdutoPrice(product.price)}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Sob Consulta</span>
                        )}
                      </td>

                      {/* In Stock & Quantity Control with Inventory Alerts */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex flex-col items-center gap-1.5">
                          {/* Status Badge */}
                          {isOutOfStock ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-rose-100 text-rose-800 text-[10px] font-bold uppercase rounded border border-rose-200">
                              <TrendingDown className="h-3 w-3 text-rose-600" />
                              Esgotado
                            </span>
                          ) : isLowStock ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold uppercase rounded border border-amber-300 animate-pulse">
                              <AlertTriangle className="h-3 w-3 text-amber-600" />
                              Stock Baixo (≤{minAlert})
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase rounded border border-emerald-200">
                              <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                              Disponível
                            </span>
                          )}

                          {/* Stepper +/- */}
                          <div className="inline-flex items-center bg-slate-100 border border-slate-200 rounded px-1.5 py-0.5 text-xs font-mono">
                            <button
                              type="button"
                              onClick={() => handleUpdateQuantity(product, -1)}
                              className="px-1 text-slate-500 hover:text-rose-600 font-bold cursor-pointer"
                              title="Diminuir 1 unidade"
                            >
                              -
                            </button>
                            <span className={`px-1.5 font-bold ${isOutOfStock ? 'text-rose-700' : isLowStock ? 'text-amber-700' : 'text-slate-900'}`}>
                              {currentQty} un.
                            </span>
                            <button
                              type="button"
                              onClick={() => handleUpdateQuantity(product, 1)}
                              className="px-1 text-slate-500 hover:text-emerald-600 font-bold cursor-pointer"
                              title="Aumentar 1 unidade"
                            >
                              +
                            </button>
                          </div>

                          {/* Quick Restock Action Button */}
                          <button
                            type="button"
                            onClick={() => handleOpenRestock(product)}
                            className="text-[10px] font-bold text-primary hover:underline flex items-center gap-0.5 cursor-pointer"
                            title="Entrada rápida de stock em armazém"
                          >
                            <Zap className="h-3 w-3" />
                            Repor Stock
                          </button>

                          {/* Reservas associadas */}
                          {reservations.filter((r) => r.productId === product.id).length > 0 && (
                            <Link
                              href="/admin/reservas"
                              className="text-[10px] font-bold text-amber-700 hover:underline bg-amber-50/80 px-1.5 py-0.5 rounded border border-amber-200"
                            >
                              {reservations.filter((r) => r.productId === product.id).length} reserva(s)
                            </Link>
                          )}
                        </div>
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
                            title="Editar produto e variantes"
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
                  )
                })
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

      {/* Modal de Criação / Edição com Suporte Completo a Variantes */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          />

          <div className="relative w-full max-w-4xl bg-white border border-slate-200 shadow-2xl overflow-hidden z-10 max-h-[92vh] flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-primary/10 text-primary rounded">
                  <Package className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    {editingProduct ? `Editar: ${editingProduct.name}` : 'Novo Produto para a Loja'}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Configure os dados gerais e as opções de variantes (Cores, RAM, SSD, etc.)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-2 px-6 border-b border-slate-200 bg-slate-100/50 text-xs font-bold shrink-0">
              <button
                type="button"
                onClick={() => setActiveTab('geral')}
                className={`py-3 px-4 border-b-2 transition flex items-center gap-2 cursor-pointer ${
                  activeTab === 'geral'
                    ? 'border-primary text-primary bg-white font-extrabold'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                <Package className="h-4 w-4" />
                Informações Principais
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('variantes')}
                className={`py-3 px-4 border-b-2 transition flex items-center gap-2 cursor-pointer ${
                  activeTab === 'variantes'
                    ? 'border-primary text-primary bg-white font-extrabold'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                <Layers className="h-4 w-4" />
                Variantes & Opções
                {formData.variants.length > 0 && (
                  <span className="px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded-full text-[10px] font-mono">
                    {formData.variants.length}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('galeria')}
                className={`py-3 px-4 border-b-2 transition flex items-center gap-2 cursor-pointer ${
                  activeTab === 'galeria'
                    ? 'border-primary text-primary bg-white font-extrabold'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                <ImageIcon className="h-4 w-4" />
                Galeria Geral
                {formData.images.length > 0 && (
                  <span className="px-1.5 py-0.5 bg-slate-200 text-slate-800 rounded-full text-[10px] font-mono">
                    {formData.images.length}
                  </span>
                )}
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleSaveProduct} className="p-6 overflow-y-auto space-y-5 flex-1">
              {/* TAB 1: INFORMAÇÕES GERAIS */}
              {activeTab === 'geral' && (
                <div className="space-y-4">
                  {/* Name & Brand */}
                  <div className="grid sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                        Nome do Produto *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                        placeholder="ex: Portátil HP 15, Impressora Epson L3250, Mochila Escolar..."
                        className="w-full px-4 py-2.5 text-sm border border-slate-300 focus:border-primary focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                        Marca / Fabricante
                      </label>
                      <input
                        type="text"
                        value={formData.brand}
                        onChange={(e) => setFormData((prev) => ({ ...prev, brand: e.target.value }))}
                        placeholder="ex: HP, Epson, TP-Link, Apple..."
                        className="w-full px-4 py-2.5 text-sm border border-slate-300 focus:border-primary focus:outline-none"
                      />
                    </div>
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
                        Código SKU Pai / Referência
                      </label>
                      <input
                        type="text"
                        value={formData.sku}
                        onChange={(e) => setFormData((prev) => ({ ...prev, sku: e.target.value }))}
                        placeholder="ex: ARK-HP15"
                        className="w-full px-4 py-2.5 text-sm border border-slate-300 focus:border-primary focus:outline-none font-mono"
                      />
                    </div>
                  </div>

                  {/* Price Mode & Base Value */}
                  <div className="p-4 bg-slate-50 border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                        Preço Base em Kwanzas (Kz)
                      </label>
                      {formData.hasVariants && (
                        <span className="text-[11px] text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 font-semibold">
                          Usado como preço inicial / a partir de
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-6">
                      <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                        <input
                          type="radio"
                          name="priceType"
                          checked={formData.priceType === 'fixed'}
                          onChange={() => setFormData((prev) => ({ ...prev, priceType: 'fixed' }))}
                          className="text-primary focus:ring-primary"
                        />
                        Preço Fixo / Base
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                        <input
                          type="radio"
                          name="priceType"
                          checked={formData.priceType === 'sob_consulta'}
                          onChange={() => setFormData((prev) => ({ ...prev, priceType: 'sob_consulta' }))}
                          className="text-primary focus:ring-primary"
                        />
                        Preço Sob Consulta
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
                      Descrição Detalhada do Produto
                    </label>
                    <textarea
                      rows={3}
                      value={formData.description}
                      onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                      placeholder="Descreva o produto, vantagens e especificações gerais..."
                      className="w-full p-3 text-sm border border-slate-300 focus:border-primary focus:outline-none"
                    />
                  </div>

                  {/* Primary Image Upload */}
                  <ImageUpload
                    value={formData.image}
                    onChange={(url) => setFormData((prev) => ({ ...prev, image: url }))}
                    label="Foto Principal do Produto"
                  />

                  {/* Stock, Alertas & Configurações de Inventário */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <div className="flex items-center gap-2">
                        <Boxes className="h-4 w-4 text-primary" />
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                          Gestão de Stock & Alertas de Inventário
                        </h4>
                      </div>
                      <span className="text-[11px] text-slate-600 font-mono font-bold">
                        Status: {formData.quantity > formData.minStockAlert ? '🟢 Saudável' : formData.quantity > 0 ? '🟡 Stock Baixo' : '🔴 Esgotado'}
                      </span>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      {/* Stock Base */}
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                          Stock Físico em Armazém (Unidades) *
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={formData.quantity}
                          onChange={(e) => setFormData((prev) => ({ ...prev, quantity: Math.max(0, parseInt(e.target.value) || 0) }))}
                          className="w-full px-3 py-2 text-sm border border-slate-300 focus:border-primary focus:outline-none bg-white font-mono"
                        />
                      </div>

                      {/* Alerta de Stock Mínimo */}
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                          Alerta de Stock Mínimo (Aviso quando ≤)
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="1"
                            max="100"
                            value={formData.minStockAlert}
                            onChange={(e) => setFormData((prev) => ({ ...prev, minStockAlert: Math.max(1, parseInt(e.target.value) || 1) }))}
                            className="w-20 px-3 py-2 text-sm border border-slate-300 focus:border-primary focus:outline-none bg-white font-mono"
                          />
                          <div className="flex items-center gap-1">
                            {[3, 5, 10, 20].map((val) => (
                              <button
                                key={val}
                                type="button"
                                onClick={() => setFormData((prev) => ({ ...prev, minStockAlert: val }))}
                                className={`px-2 py-1 text-[10px] font-bold border transition rounded ${
                                  formData.minStockAlert === val
                                    ? 'bg-amber-500 text-white border-amber-600'
                                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                                }`}
                              >
                                {val} un.
                              </button>
                            ))}
                          </div>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-1">
                          Avisos visuais no painel quando o stock atingir este limite.
                        </p>
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4 pt-1">
                      <label className="flex items-center gap-3 p-3 bg-white border border-slate-200 cursor-pointer rounded">
                        <input
                          type="checkbox"
                          checked={formData.inStock}
                          onChange={(e) => setFormData((prev) => ({ ...prev, inStock: e.target.checked }))}
                          className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
                        />
                        <div>
                          <p className="text-xs font-bold text-slate-900">Disponível para Venda Imediata</p>
                          <p className="text-[11px] text-slate-500">Permite compra e checkout direto</p>
                        </div>
                      </label>

                      <label className="flex items-center gap-3 p-3 bg-white border border-slate-200 cursor-pointer rounded">
                        <input
                          type="checkbox"
                          checked={formData.featured}
                          onChange={(e) => setFormData((prev) => ({ ...prev, featured: e.target.checked }))}
                          className="h-4 w-4 rounded border-slate-300 text-amber-500 focus:ring-amber-500"
                        />
                        <div>
                          <p className="text-xs font-bold text-slate-900">Produto em Destaque na Loja</p>
                          <p className="text-[11px] text-slate-500">Exibido na montra principal</p>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: VARIANTES & ATRIBUTOS */}
              {activeTab === 'variantes' && (
                <div className="space-y-6">
                  {/* Option Presets & Adder */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900">
                          1. Atributos do Produto (Opções)
                        </h4>
                        <p className="text-[11px] text-slate-500">
                          Escolha as opções disponíveis para este produto (ex: Cor, RAM, Armazenamento).
                        </p>
                      </div>

                      {/* Quick Presets */}
                      <div className="flex flex-wrap items-center gap-1.5">
                        {PRESET_OPTIONS.map((p) => {
                          const Icon = p.icon
                          const exists = formData.options.some(
                            (o) => o.name.toLowerCase() === p.name.toLowerCase()
                          )
                          return (
                            <button
                              key={p.name}
                              type="button"
                              disabled={exists}
                              onClick={() => handleAddOption(p.name)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-slate-300 text-slate-700 text-[11px] font-bold rounded hover:border-primary hover:text-primary transition disabled:opacity-40 cursor-pointer"
                            >
                              <Icon className="h-3 w-3 text-primary" />
                              +{p.name}
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    {/* Custom Option Adder Input */}
                    <div className="flex items-center gap-2 pt-2 border-t border-slate-200">
                      <input
                        type="text"
                        value={newOptionName}
                        onChange={(e) => setNewOptionName(e.target.value)}
                        placeholder="Adicionar outro atributo personalizado (ex: Tipo de Conector, Voltagem)..."
                        className="flex-1 px-3 py-2 text-xs border border-slate-300 bg-white focus:border-primary focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleAddOption(newOptionName)}
                        className="px-4 py-2 bg-slate-800 text-white text-xs font-bold uppercase tracking-wider hover:bg-slate-900 transition cursor-pointer"
                      >
                        + Adicionar
                      </button>
                    </div>
                  </div>

                  {/* Options List & Value Tag Manager */}
                  {formData.options.length > 0 ? (
                    <div className="space-y-4">
                      {formData.options.map((opt, optIdx) => {
                        const isColor = opt.name.toLowerCase().includes('cor')

                        return (
                          <div
                            key={opt.id || optIdx}
                            className="p-4 bg-white border border-slate-200 rounded shadow-xs space-y-3"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="font-extrabold text-sm text-slate-900">{opt.name}</span>
                                <span className="text-[11px] text-slate-400">
                                  ({opt.values.length} valores configurados)
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRemoveOption(optIdx)}
                                className="text-slate-400 hover:text-rose-600 text-xs font-semibold p-1"
                                title="Remover este atributo"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>

                            {/* Tags list */}
                            <div className="flex flex-wrap items-center gap-2">
                              {opt.values.map((val) => (
                                <div
                                  key={val.id}
                                  className="inline-flex items-center gap-2 px-2.5 py-1 bg-slate-100 border border-slate-200 rounded text-xs text-slate-800 font-semibold"
                                >
                                  {isColor && (
                                    <div className="flex items-center gap-1">
                                      <input
                                        type="color"
                                        value={val.hex || guessColorHex(val.value)}
                                        onChange={(e) => handleUpdateColorHex(optIdx, val.id, e.target.value)}
                                        className="w-4 h-4 rounded-full border border-slate-300 cursor-pointer p-0"
                                        title="Alterar código de cor hex"
                                      />
                                    </div>
                                  )}
                                  <span>{val.value}</span>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveOptionValue(optIdx, val.id)}
                                    className="text-slate-400 hover:text-rose-600 ml-1"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </div>
                              ))}

                              {/* Value Tag Adder */}
                              <div className="inline-flex items-center gap-1">
                                <input
                                  type="text"
                                  value={newOptionValuesInput[optIdx] || ''}
                                  onChange={(e) =>
                                    setNewOptionValuesInput((prev) => ({
                                      ...prev,
                                      [optIdx]: e.target.value,
                                    }))
                                  }
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      e.preventDefault()
                                      handleAddOptionValue(optIdx)
                                    }
                                  }}
                                  placeholder={`+ Valor (ex: ${isColor ? 'Vermelho' : '32GB'})...`}
                                  className="px-2 py-1 text-xs border border-slate-300 bg-white focus:border-primary focus:outline-none w-36"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleAddOptionValue(optIdx)}
                                  className="px-2 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded cursor-pointer"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          </div>
                        )
                      })}

                      {/* Generator Action Banner */}
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <p className="text-xs font-extrabold text-blue-950 flex items-center gap-1.5">
                            <Sparkles className="h-4 w-4 text-blue-600" />
                            Gerador de Combinações de Variantes
                          </p>
                          <p className="text-[11px] text-blue-700">
                            Cria automaticamente a matriz completa de SKUs, preços e stocks para todas as combinações de atributos.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={handleGenerateCombinations}
                          className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase rounded shadow-xs cursor-pointer transition shrink-0"
                        >
                          <Sparkles className="h-3.5 w-3.5" />
                          Gerar Combinações
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-slate-50 border border-dashed border-slate-300 rounded">
                      <Layers className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                      <p className="text-xs font-bold text-slate-700">Nenhum atributo adicionado ainda.</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Clique nos botões acima (+Cor, +RAM, +Armazenamento) para começar a definir as variações do produto.
                      </p>
                    </div>
                  )}

                  {/* VARIANTS TABLE / MATRIX */}
                  {formData.variants.length > 0 && (
                    <div className="space-y-3 pt-4 border-t border-slate-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900">
                            2. Tabela de Variantes Concretas ({formData.variants.length})
                          </h4>
                          <p className="text-[11px] text-slate-500">
                            Defina preços, stock e imagens individuais para cada versão específica.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={handleAddManualVariant}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded border border-slate-300 cursor-pointer"
                        >
                          <PlusCircle className="h-3.5 w-3.5" />
                          + Variante Manual
                        </button>
                      </div>

                      <div className="border border-slate-200 rounded overflow-hidden">
                        <div className="overflow-x-auto max-h-96">
                          <table className="w-full text-left text-xs">
                            <thead className="bg-slate-100 text-[10px] font-extrabold uppercase tracking-wider text-slate-700 sticky top-0 z-10 border-b border-slate-200">
                              <tr>
                                <th className="py-2.5 px-3">Opção / Variante</th>
                                <th className="py-2.5 px-3">SKU</th>
                                <th className="py-2.5 px-3">Preço (Kz)</th>
                                <th className="py-2.5 px-3 text-center">Stock</th>
                                <th className="py-2.5 px-3 text-center">Foto</th>
                                <th className="py-2.5 px-3 text-center">Ativo</th>
                                <th className="py-2.5 px-2 text-right">Ação</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                              {formData.variants.map((v, vIdx) => {
                                const label = v.options?.map((o) => o.value).join(' / ') || `Variante #${vIdx + 1}`
                                const colorOpt = v.options?.find((o) => o.optionName.toLowerCase().includes('cor'))

                                return (
                                  <tr key={v.id || vIdx} className="hover:bg-slate-50">
                                    {/* Variant Label */}
                                    <td className="py-2.5 px-3 font-semibold text-slate-900">
                                      <div className="flex items-center gap-1.5">
                                        {colorOpt && (
                                          <span
                                            className="w-3 h-3 rounded-full border border-slate-300 shadow-xs shrink-0"
                                            style={{
                                              backgroundColor: colorOpt.hex || guessColorHex(colorOpt.value),
                                            }}
                                            title={colorOpt.value}
                                          />
                                        )}
                                        <span className="truncate max-w-[180px]">{label}</span>
                                      </div>
                                    </td>

                                    {/* SKU Input */}
                                    <td className="py-2.5 px-3">
                                      <input
                                        type="text"
                                        value={v.sku}
                                        onChange={(e) => handleUpdateVariant(vIdx, { sku: e.target.value })}
                                        className="w-28 px-2 py-1 text-xs border border-slate-300 font-mono bg-white focus:border-primary focus:outline-none"
                                      />
                                    </td>

                                    {/* Price Input */}
                                    <td className="py-2.5 px-3">
                                      <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={v.price !== null && v.price !== undefined ? v.price : ''}
                                        onChange={(e) =>
                                          handleUpdateVariant(vIdx, {
                                            price: e.target.value ? parseFloat(e.target.value) : null,
                                          })
                                        }
                                        placeholder="Usa base"
                                        className="w-24 px-2 py-1 text-xs border border-slate-300 font-mono bg-white focus:border-primary focus:outline-none"
                                      />
                                    </td>

                                    {/* Stock Input */}
                                    <td className="py-2.5 px-3 text-center">
                                      <input
                                        type="number"
                                        min="0"
                                        value={v.stock}
                                        onChange={(e) =>
                                          handleUpdateVariant(vIdx, {
                                            stock: Math.max(0, parseInt(e.target.value) || 0),
                                          })
                                        }
                                        className="w-16 px-1.5 py-1 text-xs border border-slate-300 font-mono text-center bg-white focus:border-primary focus:outline-none"
                                      />
                                    </td>

                                    {/* Image Selector */}
                                    <td className="py-2.5 px-3 text-center">
                                      <div className="flex items-center justify-center gap-1">
                                        {v.images && v.images[0] ? (
                                          <img
                                            src={v.images[0]}
                                            alt=""
                                            className="w-6 h-6 object-contain rounded border border-slate-200"
                                          />
                                        ) : (
                                          <ImageIcon className="h-4 w-4 text-slate-300" />
                                        )}
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const url = prompt(
                                              'Insira a URL da imagem específica desta variante:',
                                              v.images?.[0] || formData.image || ''
                                            )
                                            if (url !== null) {
                                              handleUpdateVariant(vIdx, {
                                                images: url ? [url] : [],
                                              })
                                            }
                                          }}
                                          className="text-[10px] text-blue-600 hover:underline font-bold"
                                        >
                                          Editar
                                        </button>
                                      </div>
                                    </td>

                                    {/* Active Checkbox */}
                                    <td className="py-2.5 px-3 text-center">
                                      <input
                                        type="checkbox"
                                        checked={v.active}
                                        onChange={(e) => handleUpdateVariant(vIdx, { active: e.target.checked })}
                                        className="h-4 w-4 text-primary rounded border-slate-300"
                                      />
                                    </td>

                                    {/* Remove Variant */}
                                    <td className="py-2.5 px-2 text-right">
                                      <button
                                        type="button"
                                        onClick={() => handleRemoveVariant(vIdx)}
                                        className="p-1 text-slate-400 hover:text-rose-600"
                                        title="Remover variante"
                                      >
                                        <Trash2 className="h-3.5 w-3.5" />
                                      </button>
                                    </td>
                                  </tr>
                                )
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: GALERIA DE FOTOS GERAIS */}
              {activeTab === 'galeria' && (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 mb-1">
                      Galeria de Fotografias Adicionais
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Adicione fotos de vários ângulos, embalagem ou detalhes técnicos.
                    </p>
                  </div>

                  {/* Grid de fotos da galeria */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {formData.images.map((imgUrl, i) => (
                      <div key={i} className="relative group border border-slate-200 rounded p-2 bg-slate-50">
                        <img src={imgUrl} alt="" className="w-full h-24 object-contain rounded mb-1" />
                        <button
                          type="button"
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              images: prev.images.filter((_, idx) => idx !== i),
                            }))
                          }
                          className="absolute top-1 right-1 bg-rose-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition shadow-xs"
                          title="Remover imagem"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Adicionar nova imagem à galeria */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded space-y-3">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                      Adicionar Nova Fotografia à Galeria
                    </label>
                    <ImageUpload
                      value=""
                      onChange={(url) => {
                        if (url) {
                          setFormData((prev) => ({
                            ...prev,
                            images: [...prev.images, url],
                          }))
                        }
                      }}
                      label="Upload ou URL da Nova Foto"
                    />
                  </div>
                </div>
              )}

              {/* Modal Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  {activeTab !== 'geral' && (
                    <button
                      type="button"
                      onClick={() => setActiveTab('geral')}
                      className="px-3 py-2 text-xs font-bold text-slate-600 hover:text-slate-900"
                    >
                      ← Voltar a Geral
                    </button>
                  )}
                  {activeTab === 'geral' && (
                    <button
                      type="button"
                      onClick={() => setActiveTab('variantes')}
                      className="px-3 py-2 text-xs font-bold text-primary hover:underline flex items-center gap-1"
                    >
                      Configurar Variantes & Opções →
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    disabled={isSavingProduct}
                    className="px-4 py-2.5 text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 uppercase"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingProduct}
                    className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-primary hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed uppercase shadow-sm cursor-pointer"
                  >
                    {isSavingProduct && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    {isSavingProduct
                      ? 'A guardar...'
                      : editingProduct
                      ? 'Guardar Alterações'
                      : 'Criar Produto com Variantes'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Entrada / Reposição Rápida de Stock */}
      {isRestockModalOpen && restockProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm"
            onClick={() => !isExecutingRestock && setIsRestockModalOpen(false)}
          />

          <div className="relative w-full max-w-md bg-white border border-slate-200 shadow-2xl overflow-hidden z-10 rounded">
            {/* Header */}
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-primary/10 text-primary rounded">
                  <Zap className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">Entrada Rápida de Stock</h3>
                  <p className="text-[11px] text-slate-500 truncate max-w-[240px]">{restockProduct.name}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsRestockModalOpen(false)}
                disabled={isExecutingRestock}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              <div className="bg-slate-50 border border-slate-200 p-3 rounded flex items-center justify-between text-xs">
                <span className="text-slate-600">Stock Atual em Armazém:</span>
                <span className="font-mono font-black text-slate-900">
                  {restockProduct.quantity ?? (restockProduct.inStock ? 10 : 0)} un.
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Quantidade a Adicionar (Entrada):
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    value={restockAmount}
                    onChange={(e) => setRestockAmount(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full px-3 py-2 text-sm border border-slate-300 focus:border-primary focus:outline-none font-mono text-center font-bold"
                  />
                </div>

                {/* Preset Pills */}
                <div className="flex items-center gap-1.5 mt-2">
                  {[5, 10, 25, 50, 100].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setRestockAmount(val)}
                      className={`flex-1 py-1 text-xs font-bold border transition rounded cursor-pointer ${
                        restockAmount === val
                          ? 'bg-primary text-white border-primary'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      +{val}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded text-xs text-emerald-900 flex items-center justify-between">
                <span>Novo Stock Previsto:</span>
                <span className="font-mono font-black text-sm text-emerald-700">
                  {(restockProduct.quantity ?? (restockProduct.inStock ? 10 : 0)) + (Number(restockAmount) || 0)} un.
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Nota / Observação (Opcional):
                </label>
                <input
                  type="text"
                  value={restockNote}
                  onChange={(e) => setRestockNote(e.target.value)}
                  placeholder="ex: Guia de remessa #4928, Fornecedor HP..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 focus:border-primary focus:outline-none"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsRestockModalOpen(false)}
                disabled={isExecutingRestock}
                className="px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 uppercase cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleExecuteRestock}
                disabled={isExecutingRestock}
                className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 uppercase shadow-sm cursor-pointer disabled:opacity-60"
              >
                {isExecutingRestock ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    A atualizar...
                  </>
                ) : (
                  <>
                    <Check className="h-3.5 w-3.5" />
                    Confirmar Entrada
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Eliminar */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Eliminar Produto"
        message="Tem a certeza que deseja eliminar permanentemente este produto e todas as suas variantes do catálogo da loja? Esta ação não pode ser desfeita."
        confirmText="Sim, Eliminar"
        cancelText="Cancelar"
      />
    </div>
  )
}
