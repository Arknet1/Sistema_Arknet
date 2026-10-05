'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  ShoppingCart,
  Trash2,
  Check,
  Phone,
  ShieldCheck,
  Truck,
  FileText,
  Share2,
  ChevronRight,
  Sparkles,
  Minus,
  Plus,
  MessageCircle,
  ExternalLink,
  Layers,
  Cpu,
  Zap,
  Heart,
  PackagePlus,
  CheckCircle2,
  Box,
  Headphones,
  X,
  ChevronDown,
} from 'lucide-react'
import { useCart } from '@/lib/cart'
import { useWishlist } from '@/lib/wishlist-store'
import { dataStore, StoreProduct, ProductVariant } from '@/lib/data-store'
import { formatProdutoPrice } from '@/lib/format-produto-price'
import ProductCard from '@/components/product-card'
import { useToast } from '@/lib/toast-context'
import ReserveProductModal from '@/components/reserve-product-modal'
import { guessColorHex, isColorOption } from '@/lib/color-utils'

// Gerador Inteligente de Ficha Técnica Detalhada por Categoria
function getCategorySpecs(product: StoreProduct, selectedVariant?: ProductVariant) {
  const cat = (product.category || '').toLowerCase()
  const name = (product.name || '').toLowerCase()

  const commonSpecs = [
    { label: 'Modelo / Referência', value: product.name },
    { label: 'Código SKU ARKNET', value: selectedVariant?.sku || product.sku || `ARK-${product.id.toUpperCase()}` },
    { label: 'Categoria Comercial', value: product.category },
    ...(product.brand ? [{ label: 'Marca / Fabricante', value: product.brand }] : []),
    { label: 'Condição do Equipamento', value: '100% Novo em Caixa Selada com Selo de Autenticidade' },
    {
      label: 'Disponibilidade de Stock',
      value:
        selectedVariant
          ? selectedVariant.stock > 0
            ? 'Disponível para Entrega Imediata (Sede Luanda)'
            : 'Esgotado nesta configuração / Reposição em Trânsito'
          : product.inStock !== false
          ? 'Disponível para Entrega Imediata (Sede Luanda)'
          : 'Em Trânsito / Reposição Prevista para Angola',
    },
    { label: 'Homologação e Normas', value: 'Conformidade INACOM / CE / FCC / ISO 9001' },
    { label: 'Garantia Oficial', value: '12 a 24 Meses com Assistência Técnica ARKNET' },
  ]

  // Adicionar opções selecionadas da variante na ficha técnica
  if (selectedVariant && selectedVariant.options) {
    selectedVariant.options.forEach((opt) => {
      commonSpecs.push({
        label: `Configuração: ${opt.optionName}`,
        value: opt.value,
      })
    })
  }

  // Adicionar especificações customizadas da variante se existirem
  if (selectedVariant && selectedVariant.specs) {
    Object.entries(selectedVariant.specs).forEach(([k, v]) => {
      if (v) commonSpecs.push({ label: k, value: String(v) })
    })
  }

  if (cat.includes('smartphone') || name.includes('iphone') || name.includes('android')) {
    return [
      ...commonSpecs,
      { label: 'Processador / Chipset', value: name.includes('iphone') ? 'Apple A18 Pro / Neural Engine 16-Core' : 'Octa-Core de Alto Desempenho 4nm' },
      { label: 'Ecrã & Resolução', value: name.includes('iphone') ? 'Super Retina XDR OLED 120Hz ProMotion' : 'AMOLED FHD+ 120Hz com Proteção Gorilla Glass' },
      { label: 'Sistema de Câmaras', value: 'Sensor Principal de 48 MP + Ultra Grande Angular + Teleobjetiva' },
      { label: 'Conectividade Móvel', value: '5G Dual SIM (Nano-SIM + eSIM) / Wi-Fi 7 / Bluetooth 5.4' },
      { label: 'Segurança & Biometria', value: name.includes('iphone') ? 'Face ID com Sensor TrueDepth' : 'Leitor de Impressão Digital Sob o Ecrã' },
    ]
  }

  if (cat.includes('rede') || name.includes('roteador') || name.includes('switch') || name.includes('wi-fi') || name.includes('router') || name.includes('tp-link')) {
    return [
      ...commonSpecs,
      { label: 'Interface de Rede', value: 'Portas Gigabit Ethernet RJ45 10/100/1000 Mbps + Slots SFP' },
      { label: 'Normas Sem Fios', value: 'IEEE 802.11ax/ac/n/g/b (Wi-Fi 6 Dual Band 2.4/5GHz)' },
      { label: 'Velocidade Wireless', value: 'Até 3000 Mbps agregados com tecnologia MU-MIMO e Beamforming' },
      { label: 'Segurança & Firewall', value: 'WPA3-Enterprise, VLAN 802.1Q, QoS, VPN WireGuard/IPSec' },
    ]
  }

  if (cat.includes('computador') || cat.includes('portáteis') || name.includes('notebook') || name.includes('portátil') || name.includes('hp')) {
    return [
      ...commonSpecs,
      { label: 'Processador / Arquitetura', value: 'Intel Core / AMD Ryzen Multi-Core de Alta Eficiência' },
      { label: 'Memória RAM', value: selectedVariant?.options?.find(o => o.optionName.toLowerCase().includes('ram'))?.value || 'DDR4 / DDR5 High Speed' },
      { label: 'Armazenamento', value: selectedVariant?.options?.find(o => o.optionName.toLowerCase().includes('armazenamento') || o.optionName.toLowerCase().includes('ssd'))?.value || 'SSD NVMe M.2 PCIe Gen4' },
      { label: 'Sistema Operativo', value: 'Windows 11 Pro Corporativo Pré-instalado' },
    ]
  }

  return [
    ...commonSpecs,
    { label: 'Ambiente de Aplicação', value: 'Empresarial, Corporativo e Residencial de Alto Desempenho' },
    { label: 'Alimentação & Voltagem', value: '100-240V AC / Bivolt Automático ou USB' },
    { label: 'Compatibilidade', value: 'Universal com sistemas informáticos e redes existentes em Angola' },
  ]
}

function getPackageContents(product: StoreProduct, selectedVariant?: ProductVariant): string[] {
  const cat = (product.category || '').toLowerCase()
  const name = (product.name || '').toLowerCase()
  const variantLabel = selectedVariant?.options?.map(o => o.value).join(', ')

  if (cat.includes('smartphone') || name.includes('iphone')) {
    return [
      `1x ${product.name} ${variantLabel ? `(${variantLabel})` : ''}`,
      '1x Cabo USB-C de Carregamento Rápido em Tecido Trançado',
      '1x Chave Extratora de Bandeja SIM',
      '1x Guia de Iniciação Rápida e Documentação Oficial',
      '1x Certificado de Garantia ARKNET Angola',
    ]
  }

  if (cat.includes('rede') || name.includes('roteador') || name.includes('switch') || name.includes('router')) {
    return [
      `1x ${product.name} ${variantLabel ? `(${variantLabel})` : ''}`,
      '1x Adaptador de Alimentação AC / Fonte de Energia 220V',
      '1x Cabo de Rede Ethernet RJ45 Cat6 de Alta Velocidade',
      '1x Manual de Configuração Rápida em Português',
      '1x Certificado de Conformidade e Garantia Técnica',
    ]
  }

  return [
    `1x ${product.name} ${variantLabel ? `(${variantLabel})` : ''}`,
    '1x Acessórios Oficiais e Cabos de Ligação',
    '1x Manual de Instruções do Utilizador',
    '1x Certificado de Garantia Oficial ARKNET Angola',
  ]
}

export default function ProductDetailPageClient({ id }: { id: string }) {
  const router = useRouter()
  const { items, addItem, removeItem } = useCart()
  const { isInWishlist, toggleWishlist } = useWishlist()
  const { success, info } = useToast()

  const [product, setProduct] = useState<StoreProduct | undefined>(undefined)
  const [allProducts, setAllProducts] = useState<StoreProduct[]>([])
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [isAdding, setIsAdding] = useState(false)
  const [activeTab, setActiveTab] = useState<'descricao' | 'especificacoes' | 'embalagem' | 'garantia' | 'entregas'>('descricao')
  const [isReserveModalOpen, setIsReserveModalOpen] = useState(false)
  const [isProformaModalOpen, setIsProformaModalOpen] = useState(false)
  const [proformaClientName, setProformaClientName] = useState('')
  const [proformaClientNif, setProformaClientNif] = useState('')

  // Selected Option Values: { "Cor": "Azul", "RAM": "16GB", ... }
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({})

  // FAQ Accordion state
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  useEffect(() => {
    const sync = () => {
      const p = dataStore.getProductById(id)
      const list = dataStore.getProducts()
      setProduct(p)
      setAllProducts(list)

      // Initialize selectedOptions with first variant or available options
      if (p && p.variants && p.variants.length > 0) {
        const defaultVar = p.variants.find((v) => v.active && v.stock > 0) || p.variants[0]
        if (defaultVar && defaultVar.options) {
          const initialOpts: Record<string, string> = {}
          defaultVar.options.forEach((opt) => {
            if (opt.optionName && opt.value) {
              initialOpts[opt.optionName] = opt.value
            }
          })
          setSelectedOptions(initialOpts)
        }
      } else if (p && p.options && p.options.length > 0) {
        const initialOpts: Record<string, string> = {}
        p.options.forEach((opt) => {
          if (opt.values && opt.values[0]) {
            initialOpts[opt.name] = opt.values[0].value
          }
        })
        setSelectedOptions(initialOpts)
      }
    }

    sync()
    const unsub = dataStore.subscribe(sync)
    return () => unsub()
  }, [id])

  // Identificar variante atualmente selecionada com base em selectedOptions
  const currentVariant = useMemo<ProductVariant | undefined>(() => {
    if (!product || !product.variants || product.variants.length === 0) return undefined

    const entries = Object.entries(selectedOptions)
    if (entries.length === 0) return product.variants[0]

    // Procurar variante exata
    const exactMatch = product.variants.find((v) => {
      if (!v.options || v.options.length === 0) return false
      return entries.every(([optName, optVal]) =>
        v.options.some(
          (vo) => vo.optionName.toLowerCase() === optName.toLowerCase() && vo.value.toLowerCase() === optVal.toLowerCase()
        )
      )
    })

    return exactMatch || product.variants[0]
  }, [product, selectedOptions])

  // Alternar opção selecionada
  const handleSelectOption = (optionName: string, value: string) => {
    const nextSelected = { ...selectedOptions, [optionName]: value }
    setSelectedOptions(nextSelected)
    setSelectedImageIndex(0) // Resetar para foto principal da nova variante
  }

  // Lista de imagens do produto (galeria da variante selecionada ou do produto pai)
  const galleryImages = useMemo(() => {
    if (!product) return []
    const list: string[] = []

    // Se a variante selecionada tem fotos próprias, prioriza-as!
    if (currentVariant && currentVariant.images && currentVariant.images.length > 0) {
      currentVariant.images.forEach((img) => {
        if (img && !list.includes(img)) list.push(img)
      })
    }

    if (product.image && !list.includes(product.image)) list.push(product.image)
    if (product.images && Array.isArray(product.images)) {
      product.images.forEach((img) => {
        if (img && !list.includes(img)) list.push(img)
      })
    }
    return list
  }, [product, currentVariant])

  // Preço, SKU e Stock da configuração atual
  const effectivePrice = currentVariant && currentVariant.price !== null ? currentVariant.price : product?.price ?? null
  const effectiveSku = currentVariant?.sku || product?.sku || `ARK-${product?.id.toUpperCase()}`
  const effectiveStock = currentVariant ? currentVariant.stock : (product?.quantity ?? (product?.inStock ? 10 : 0))
  const isOutOfStock = currentVariant
    ? currentVariant.stock <= 0 || !currentVariant.active
    : (product ? product.inStock === false || (product.quantity ?? 0) === 0 : false)

  // Opções disponíveis para seleção: de product.options ou sintetizadas das variantes
  const displayOptions = useMemo(() => {
    if (!product) return []
    if (product.options && product.options.length > 0) {
      return product.options.map((opt) => ({
        ...opt,
        values: opt.values.map((v: any) => {
          const valStr = typeof v === 'string' ? v : v.value
          const hex = (typeof v === 'object' && v.hex) ? v.hex : guessColorHex(valStr)
          return {
            id: (typeof v === 'object' && v.id) || `optval-${opt.name}-${valStr}`,
            value: valStr,
            hex,
          }
        }),
      }))
    }
    // Sintetizar a partir de variants se product.options estiver vazio
    if (product.variants && product.variants.length > 0) {
      const optMap = new Map<string, Set<string>>()
      product.variants.forEach((v) => {
        v.options?.forEach((vo) => {
          if (vo.optionName && vo.value) {
            if (!optMap.has(vo.optionName)) {
              optMap.set(vo.optionName, new Set())
            }
            optMap.get(vo.optionName)!.add(vo.value)
          }
        })
      })

      return Array.from(optMap.entries()).map(([name, valSet]) => ({
        id: `opt-${name}`,
        name,
        values: Array.from(valSet).map((val) => ({
          id: `optval-${name}-${val}`,
          value: val,
          hex: guessColorHex(val),
        })),
      }))
    }
    return []
  }, [product])

  const variantLabel = useMemo(() => {
    if (!currentVariant || !currentVariant.options || currentVariant.options.length === 0) {
      const opts = Object.values(selectedOptions)
      return opts.length > 0 ? opts.join(' / ') : undefined
    }
    return currentVariant.options.map((o) => o.value).join(' / ')
  }, [currentVariant, selectedOptions])

  const cartItemId = product ? (currentVariant?.id ? `${product.id}_${currentVariant.id}` : product.id) : ''
  const isInCart = Boolean(product && items.some((item) => item.id === cartItemId || (!item.id && item.product.id === cartItemId)))
  const cartItem = product ? items.find((item) => item.id === cartItemId || (!item.id && item.product.id === cartItemId)) : null

  // Produtos relacionados
  const relatedProducts = useMemo(() => {
    if (!product) return []
    return allProducts
      .filter((p) => p.id !== product.id && (p.category.toLowerCase() === product.category.toLowerCase() || p.featured))
      .slice(0, 4)
  }, [product, allProducts])

  const handleAddToCart = async (goToCheckout = false) => {
    if (!product || isAdding || isOutOfStock) return
    setIsAdding(true)

    addItem(product as any, {
      variant: currentVariant,
      variantLabel,
      variantSku: effectiveSku,
      selectedOptions,
      price: effectivePrice,
      quantity,
    })

    setIsAdding(false)
    if (goToCheckout) {
      router.push('/loja/checkout')
    } else {
      success(
        `"${product.name}" ${variantLabel ? `(${variantLabel})` : ''} (${quantity} un.) adicionado ao carrinho!`,
        'Carrinho Atualizado'
      )
    }
  }

  const handleShare = () => {
    if (typeof window !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href)
      info('Link do produto copiado para a área de transferência!', 'Link Copiado')
    }
  }

  if (!product) {
    return (
      <main className="min-h-screen pt-32 pb-20 bg-slate-50 flex items-center justify-center">
        <div className="max-w-md w-full mx-auto px-6 text-center bg-white p-8 border border-slate-200 rounded-2xl shadow-sm">
          <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
            <ShoppingCart className="h-7 w-7" />
          </div>
          <h2 className="text-xl font-black text-slate-900">Produto não encontrado</h2>
          <p className="text-xs text-slate-500 mt-2">
            O equipamento solicitado pode ter sido descontinuado ou o identificador é inválido.
          </p>
          <Link
            href="/loja"
            className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white text-xs font-bold uppercase rounded-xl shadow-sm hover:bg-primary/90 transition"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Voltar ao Catálogo da Loja</span>
          </Link>
        </div>
      </main>
    )
  }

  const whatsappMessage = encodeURIComponent(
    `Olá ARKNET! Gostaria de encomendar o seguinte equipamento:\n\n*${product.name}*\n${
      variantLabel ? `*Configuração:* ${variantLabel}\n` : ''
    }*SKU:* ${effectiveSku}\n*Valor:* ${formatProdutoPrice(effectivePrice)}\n*Quantidade:* ${quantity} un.\n\nPodem confirmar a disponibilidade em Luanda e os dados de pagamento?`
  )

  const activeImage = galleryImages[selectedImageIndex] || product.image
  const technicalSpecs = getCategorySpecs(product, currentVariant)
  const packageContents = getPackageContents(product, currentVariant)

  return (
    <main className="min-h-screen pt-28 pb-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        {/* Breadcrumb Navigation */}
        <nav className="mb-6 flex flex-wrap items-center gap-2 text-xs text-slate-500 font-medium">
          <Link href="/" className="hover:text-primary transition">Início</Link>
          <ChevronRight className="h-3 w-3 text-slate-400" />
          <Link href="/loja" className="hover:text-primary transition">Loja Online</Link>
          <ChevronRight className="h-3 w-3 text-slate-400" />
          <span className="text-slate-700 font-semibold">{product.category}</span>
          <ChevronRight className="h-3 w-3 text-slate-400" />
          <span className="text-slate-900 font-bold truncate max-w-[200px] sm:max-w-xs">
            {product.name}
          </span>
        </nav>

        {/* TOP PRODUCT SHOWCASE CARD */}
        <div className="bg-white border border-slate-200 rounded-3xl shadow-sm p-6 sm:p-10 mb-10 overflow-hidden">
          <div className="grid lg:grid-cols-12 gap-10 items-start">

            {/* Left: Gallery & Image Showcase (6 cols) */}
            <div className="lg:col-span-6 space-y-4">
              
              <div className="relative bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden group">
                <div className="h-[360px] sm:h-[440px] w-full flex items-center justify-center p-8 bg-gradient-to-b from-white to-slate-50">
                  {activeImage ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={activeImage}
                      alt={product.name}
                      className="max-h-full max-w-full object-contain transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-slate-300">
                      <ShoppingCart className="h-16 w-16 mb-2" />
                      <span className="text-xs font-semibold">Sem imagem disponível</span>
                    </div>
                  )}
                </div>

                {/* Badges Flutuantes */}
                <div className="absolute top-4 left-4 flex flex-col gap-1.5">
                  {product.featured && (
                    <span className="px-3 py-1 bg-amber-500 text-white text-[10px] font-black uppercase tracking-wider rounded-lg shadow-sm flex items-center gap-1">
                      <Sparkles className="h-3 w-3" />
                      Destaque ARKNET
                    </span>
                  )}
                  {!isOutOfStock ? (
                    <span className="px-3 py-1 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider rounded-lg shadow-sm flex items-center gap-1">
                      <Check className="h-3 w-3" />
                      Disponível em Stock
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-amber-600 text-white text-[10px] font-black uppercase tracking-wider rounded-lg shadow-sm flex items-center gap-1">
                      <Truck className="h-3 w-3" />
                      Em Trânsito / Reserva Aberta
                    </span>
                  )}
                </div>

                {/* Favorite & Share Buttons */}
                <div className="absolute top-4 right-4 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const added = toggleWishlist(product)
                      if (added) {
                        success(`"${product.name}" adicionado aos favoritos!`, 'Favoritos')
                      } else {
                        info(`"${product.name}" removido dos favoritos.`)
                      }
                    }}
                    className={`p-2.5 rounded-full shadow-xs border transition ${
                      isInWishlist(product.id)
                        ? 'bg-rose-600 border-rose-600 text-white'
                        : 'bg-white/90 hover:bg-white text-slate-600 hover:text-rose-600 border-slate-200'
                    }`}
                    title="Guardar nos Favoritos"
                  >
                    <Heart className={`h-4 w-4 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
                  </button>

                  <button
                    type="button"
                    onClick={handleShare}
                    className="p-2.5 bg-white/90 hover:bg-white text-slate-600 hover:text-primary rounded-full shadow-xs border border-slate-200 transition cursor-pointer"
                    title="Copiar link do produto"
                  >
                    <Share2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Thumbnails Gallery */}
              {galleryImages.length > 1 && (
                <div className="flex items-center gap-3 overflow-x-auto pb-2">
                  {galleryImages.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`relative h-20 w-20 rounded-xl overflow-hidden shrink-0 border-2 transition cursor-pointer ${
                        selectedImageIndex === idx
                          ? 'border-primary shadow-xs ring-2 ring-primary/20'
                          : 'border-slate-200 hover:border-slate-400 opacity-70 hover:opacity-100'
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={img}
                        alt={`Vista ${idx + 1}`}
                        className="h-full w-full object-contain p-1"
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Trust Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
                  <ShieldCheck className="h-5 w-5 text-emerald-600 mx-auto mb-1" />
                  <p className="text-[10px] font-bold text-slate-800 uppercase">100% Original</p>
                  <p className="text-[9px] text-slate-500">Garantia Oficial</p>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
                  <Truck className="h-5 w-5 text-primary mx-auto mb-1" />
                  <p className="text-[10px] font-bold text-slate-800 uppercase">Envio Nacional</p>
                  <p className="text-[9px] text-slate-500">Luanda &amp; Províncias</p>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
                  <FileText className="h-5 w-5 text-indigo-600 mx-auto mb-1" />
                  <p className="text-[10px] font-bold text-slate-800 uppercase">Fatura Proforma</p>
                  <p className="text-[9px] text-slate-500">Com NIF Empresarial</p>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
                  <Headphones className="h-5 w-5 text-amber-600 mx-auto mb-1" />
                  <p className="text-[10px] font-bold text-slate-800 uppercase">Suporte Técnico</p>
                  <p className="text-[9px] text-slate-500">Engenharia ARKNET</p>
                </div>
              </div>

            </div>

            {/* Right: Product Details, Variant Selectors, Price & Actions (6 cols) */}
            <div className="lg:col-span-6 space-y-6">
              
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="inline-block text-xs font-black uppercase tracking-wider text-primary bg-primary/10 px-3 py-1 rounded-full">
                    {product.category}
                  </span>
                  {product.brand && (
                    <span className="inline-block text-xs font-black uppercase tracking-wider text-slate-700 bg-slate-100 px-3 py-1 rounded-full">
                      {product.brand}
                    </span>
                  )}
                </div>

                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-snug">
                  {product.name}
                </h1>

                <p className="text-xs font-mono text-slate-400 mt-1">
                  SKU: <strong className="text-slate-700">{effectiveSku}</strong>
                </p>
              </div>

              {/* Price Box */}
              <div className="p-4 sm:p-5 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row sm:items-baseline justify-between gap-3">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                    Preço de Venda em Angola:
                  </span>
                  <p className="text-2xl sm:text-3xl font-black text-slate-900 tabular-nums">
                    {formatProdutoPrice(effectivePrice)}
                  </p>
                  <span className="text-[11px] text-slate-500">
                    {effectivePrice ? 'Impostos e faturação comercial incluídos.' : 'Preço sob consulta conforme configuração pretendida.'}
                  </span>
                </div>

                <div className="sm:text-right shrink-0">
                  <span className={`inline-flex items-center gap-1 text-xs font-black px-3 py-1 rounded-lg ${
                    !isOutOfStock
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {!isOutOfStock ? (
                      <>
                        <Check className="h-3.5 w-3.5" />
                        Disponível em Stock
                      </>
                    ) : (
                      <>
                        <Truck className="h-3.5 w-3.5" />
                        Em Trânsito
                      </>
                    )}
                  </span>
                </div>
              </div>

              {/* INTERACTIVE VARIANT SELECTORS (CORES, RAM, ARMAZENAMENTO, ETC.) */}
              {displayOptions && displayOptions.length > 0 && (
                <div className="p-5 bg-white border border-slate-200 rounded-2xl space-y-5 shadow-xs">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                      <Layers className="h-4 w-4 text-primary" />
                      Escolha a sua Configuração
                    </h3>
                    {variantLabel && (
                      <span className="text-xs font-bold text-primary bg-primary/5 px-2.5 py-0.5 rounded border border-primary/20">
                        {variantLabel}
                      </span>
                    )}
                  </div>

                  {displayOptions.map((option) => {
                    const isColor = isColorOption(option.name)
                    const currentSelectedVal = selectedOptions[option.name]

                    return (
                      <div key={option.id || option.name} className="space-y-2.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                            {option.name}: <span className="text-primary font-black ml-1">{currentSelectedVal || 'Selecione'}</span>
                          </span>
                        </div>

                        {/* Cores com Bolinhas Hex e Nomes */}
                        {isColor ? (
                          <div className="flex flex-wrap items-center gap-2.5">
                            {option.values.map((val: any) => {
                              const isSelected = currentSelectedVal?.toLowerCase() === val.value.toLowerCase()
                              const hex = val.hex || guessColorHex(val.value)
                              const isLight = hex.toUpperCase() === '#FFFFFF' || hex.toUpperCase() === '#FFF' || hex.toUpperCase() === '#F8FAFC' || hex.toUpperCase() === '#E2E8F0'

                              return (
                                <button
                                  key={val.id || val.value}
                                  type="button"
                                  onClick={() => handleSelectOption(option.name, val.value)}
                                  className={`group flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                                    isSelected
                                      ? 'border-primary ring-2 ring-primary/20 bg-primary/5 text-primary shadow-xs'
                                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50'
                                  }`}
                                  title={`Selecionar cor: ${val.value}`}
                                >
                                  <span
                                    className="w-4 h-4 rounded-full border border-slate-300 shadow-xs shrink-0 flex items-center justify-center"
                                    style={{ backgroundColor: hex }}
                                  >
                                    {isSelected && (
                                      <Check className={`h-2.5 w-2.5 ${isLight ? 'text-slate-900' : 'text-white'}`} />
                                    )}
                                  </span>
                                  <span>{val.value}</span>
                                </button>
                              )
                            })}
                          </div>
                        ) : (
                          /* Outros Atributos (RAM, SSD, Versão) com Chips Modernos */
                          <div className="flex flex-wrap items-center gap-2">
                            {option.values.map((val: any) => {
                              const isSelected = currentSelectedVal?.toLowerCase() === val.value.toLowerCase()

                              return (
                                <button
                                  key={val.id || val.value}
                                  type="button"
                                  onClick={() => handleSelectOption(option.name, val.value)}
                                  className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                                    isSelected
                                      ? 'border-slate-900 bg-slate-900 text-white shadow-md'
                                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50'
                                  }`}
                                >
                                  {val.value}
                                </button>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Description Snippet */}
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {product.description}
              </p>

              {/* Quantity & CTA Buttons */}
              <div className="pt-4 border-t border-slate-200 space-y-4">
                
                {!isOutOfStock && effectivePrice != null && (
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Quantidade:
                    </span>
                    <div className="flex items-center border border-slate-300 rounded-xl overflow-hidden bg-white shadow-xs">
                      <button
                        type="button"
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        disabled={quantity <= 1}
                        className="px-3.5 py-2 text-slate-600 hover:bg-slate-100 disabled:opacity-30 transition cursor-pointer"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="px-4 py-2 text-xs font-mono font-black text-slate-900 min-w-[36px] text-center">
                        {quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => setQuantity((q) => q + 1)}
                        className="px-3.5 py-2 text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Primary CTA Action */}
                <div className="flex flex-col sm:flex-row gap-3">
                  {!isOutOfStock ? (
                    <>
                      {effectivePrice != null ? (
                        <>
                          <button
                            type="button"
                            onClick={() => handleAddToCart(false)}
                            disabled={isAdding}
                            className="flex-1 px-6 py-4 bg-slate-900 hover:bg-primary text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
                          >
                            <ShoppingCart className="h-4 w-4" />
                            <span>{isInCart ? 'Adicionar Mais ao Carrinho' : 'Adicionar ao Carrinho'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleAddToCart(true)}
                            className="flex-1 px-6 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
                          >
                            <Zap className="h-4 w-4" />
                            <span>Comprar Já / Checkout</span>
                          </button>
                        </>
                      ) : (
                        <Link
                          href="/#contacto"
                          className="flex-1 px-6 py-4 bg-primary text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg text-center hover:bg-primary/90 transition flex items-center justify-center gap-2"
                        >
                          <Phone className="h-4 w-4" />
                          <span>Solicitar Cotação de Disponibilidade</span>
                        </Link>
                      )}
                    </>
                  ) : (
                    /* Botão de Reserva para Produtos em Trânsito */
                    <button
                      type="button"
                      onClick={() => setIsReserveModalOpen(true)}
                      className="flex-1 px-6 py-4 bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <PackagePlus className="h-4 w-4" />
                      <span>Fazer Reserva Desta Configuração (Prioridade)</span>
                    </button>
                  )}
                </div>

                {/* Banner Informativo para Produtos em Trânsito */}
                {isOutOfStock && (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-950 flex items-start gap-3">
                    <Truck className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">Equipamento em Trânsito para Angola</p>
                      <p className="text-slate-600 text-[11px] mt-0.5 leading-relaxed">
                        Esta configuração está em processo de reposição com chegada prevista ao nosso armazém em Luanda. Efetue a sua reserva sem custos para garantir a prioridade na entrega assim que o lote der entrada.
                      </p>
                    </div>
                  </div>
                )}

                {/* Secondary Actions (WhatsApp & Proforma) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <a
                    href={`https://wa.me/244935208449?text=${whatsappMessage}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-950 rounded-xl text-xs font-bold uppercase flex items-center justify-center gap-2 transition"
                  >
                    <MessageCircle className="h-4 w-4 text-emerald-600" />
                    <span>Encomendar via WhatsApp</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => setIsProformaModalOpen(true)}
                    className="p-3 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 rounded-xl text-xs font-bold uppercase flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    <FileText className="h-4 w-4 text-slate-600" />
                    <span>Gerar Cotação Proforma</span>
                  </button>
                </div>

                {/* Feedback de Carrinho */}
                {isInCart && cartItem && (
                  <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-950">
                    <span className="font-medium">
                      ✓ Configuração <strong>{variantLabel || product.name}</strong> ({cartItem.quantity} un.) no carrinho.
                    </span>
                    <button
                      type="button"
                      onClick={() => removeItem(cartItemId)}
                      className="text-rose-600 hover:underline font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Remover</span>
                    </button>
                  </div>
                )}

              </div>

            </div>

          </div>
        </div>

        {/* TABS DE CONTEÚDO COMPLETO: VISÃO GERAL, ESPECIFICAÇÕES, EMBALAGEM, GARANTIA, ENVIOS */}
        <div className="bg-white border border-slate-200 rounded-3xl shadow-sm mb-12 overflow-hidden">
          
          {/* Tab Headers */}
          <div className="flex border-b border-slate-200 bg-slate-50 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            
            <button
              type="button"
              onClick={() => setActiveTab('descricao')}
              className={`px-6 py-4 text-xs font-black uppercase tracking-wider border-b-2 transition whitespace-nowrap cursor-pointer ${
                activeTab === 'descricao'
                  ? 'border-primary text-primary bg-white font-extrabold'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              Visão Geral
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('especificacoes')}
              className={`px-6 py-4 text-xs font-black uppercase tracking-wider border-b-2 transition whitespace-nowrap cursor-pointer ${
                activeTab === 'especificacoes'
                  ? 'border-primary text-primary bg-white font-extrabold'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              Ficha Técnica Completa ({technicalSpecs.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('embalagem')}
              className={`px-6 py-4 text-xs font-black uppercase tracking-wider border-b-2 transition whitespace-nowrap cursor-pointer ${
                activeTab === 'embalagem'
                  ? 'border-primary text-primary bg-white font-extrabold'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              O que vem na Caixa
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('garantia')}
              className={`px-6 py-4 text-xs font-black uppercase tracking-wider border-b-2 transition whitespace-nowrap cursor-pointer ${
                activeTab === 'garantia'
                  ? 'border-primary text-primary bg-white font-extrabold'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              Garantia &amp; Assistência
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('entregas')}
              className={`px-6 py-4 text-xs font-black uppercase tracking-wider border-b-2 transition whitespace-nowrap cursor-pointer ${
                activeTab === 'entregas'
                  ? 'border-primary text-primary bg-white font-extrabold'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              Envios &amp; Pagamento em Angola
            </button>

          </div>

          {/* Tab 1: Visão Geral */}
          {activeTab === 'descricao' && (
            <div className="p-6 sm:p-10 text-slate-700 text-sm leading-relaxed space-y-6">
              <div>
                <h3 className="text-lg font-black text-slate-900 mb-3">
                  Descrição Executiva do Equipamento
                </h3>
                <p className="whitespace-pre-wrap leading-relaxed text-slate-600">
                  {product.description}
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                  <h4 className="font-extrabold text-xs uppercase text-slate-900 mb-1.5 flex items-center gap-1.5">
                    <Cpu className="h-4 w-4 text-primary" />
                    Cenários &amp; Aplicações Recomendadas
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Ideal para ambientes corporativos, infraestruturas de telecomunicações, escritórios modernos e entidades que exigem fiabilidade e funcionamento contínuo.
                  </p>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                  <h4 className="font-extrabold text-xs uppercase text-slate-900 mb-1.5 flex items-center gap-1.5">
                    <Zap className="h-4 w-4 text-amber-600" />
                    Integração com o Ecossistema ARKNET
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Totalmente compatível com as nossas soluções de Redes Estruturadas, Links Dedicados, Cibersegurança Gerida e Centrais Telefónicas VoIP.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Ficha Técnica Completa */}
          {activeTab === 'especificacoes' && (
            <div className="p-6 sm:p-10 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black text-slate-900">
                    Especificações Técnicas de Hardware &amp; Normas
                  </h3>
                  {variantLabel && (
                    <p className="text-xs text-slate-500 mt-0.5">
                      Parâmetros ajustados para a configuração: <strong>{variantLabel}</strong>
                    </p>
                  )}
                </div>
                <span className="text-xs font-mono text-slate-400">
                  {technicalSpecs.length} parâmetros técnicos
                </span>
              </div>

              <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
                <table className="w-full text-xs text-left">
                  <tbody className="divide-y divide-slate-200">
                    {technicalSpecs.map((spec, i) => (
                      <tr key={i} className={i % 2 === 0 ? 'bg-slate-50/60' : 'bg-white'}>
                        <td className="p-4 font-bold text-slate-700 w-1/3 sm:w-1/4">
                          {spec.label}
                        </td>
                        <td className="p-4 text-slate-900 font-medium">
                          {spec.value}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab 3: Conteúdo da Embalagem */}
          {activeTab === 'embalagem' && (
            <div className="p-6 sm:p-10 space-y-6">
              <div>
                <h3 className="text-lg font-black text-slate-900 mb-2 flex items-center gap-2">
                  <Box className="h-5 w-5 text-primary" />
                  Itens Incluídos na Caixa (Package Contents)
                </h3>
                <p className="text-xs text-slate-500">
                  Todos os componentes originais fornecidos de fábrica com selo de autenticidade.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-3 pt-2">
                {packageContents.map((item, i) => (
                  <div key={i} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                    <span className="text-xs font-bold text-slate-800">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 4: Garantia & Assistência */}
          {activeTab === 'garantia' && (
            <div className="p-6 sm:p-10 text-slate-700 text-xs leading-relaxed space-y-6">
              <div className="flex items-center gap-4 p-5 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-950">
                <ShieldCheck className="h-10 w-10 text-emerald-600 shrink-0" />
                <div>
                  <h4 className="font-black text-sm uppercase">Garantia Oficial ARKNET em Angola</h4>
                  <p className="text-xs text-emerald-800 mt-1">
                    Todos os equipamentos comercializados contam com garantia oficial contra defeitos de fabrico e suporte local a partir da nossa sede em Luanda.
                  </p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-5 border border-slate-200 rounded-2xl bg-slate-50">
                  <h5 className="font-black text-slate-900 text-xs uppercase mb-1">Substituição Rápida &amp; SLA Local</h5>
                  <p className="text-slate-600">
                    Dispomos de stock sobressalente em Luanda para assegurar reposições céleres sem necessidade de esperar por envios internacionais demorados.
                  </p>
                </div>

                <div className="p-5 border border-slate-200 rounded-2xl bg-slate-50">
                  <h5 className="font-black text-slate-900 text-xs uppercase mb-1">Apoio na Instalação &amp; Configuração</h5>
                  <p className="text-slate-600">
                    A nossa equipa de engenheiros certificados pode prestar apoio no comissionamento, montagem em bastidor e parametrização do equipamento.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Tab 5: Envios & Pagamento */}
          {activeTab === 'entregas' && (
            <div className="p-6 sm:p-10 text-slate-700 text-xs leading-relaxed space-y-6">
              <div className="grid sm:grid-cols-3 gap-4">
                
                <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                  <h4 className="font-black text-xs uppercase text-slate-900 flex items-center gap-1.5">
                    <Truck className="h-4 w-4 text-emerald-600" />
                    Entrega em Luanda
                  </h4>
                  <p className="text-slate-600">
                    Entrega rápida em 24h a 48h na província de Luanda (Talatona, Viana, Cazenga, Kilamba, etc.) ou levantamento direto nas nossas instalações.
                  </p>
                </div>

                <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                  <h4 className="font-black text-xs uppercase text-slate-900 flex items-center gap-1.5">
                    <Layers className="h-4 w-4 text-primary" />
                    Envios para Províncias
                  </h4>
                  <p className="text-slate-600">
                    Despacho seguro para Benguela, Huambo, Cabinda, Huíla, Cuanza Sul e restantes províncias de Angola através de transportadoras credenciadas.
                  </p>
                </div>

                <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                  <h4 className="font-black text-xs uppercase text-slate-900 flex items-center gap-1.5">
                    <FileText className="h-4 w-4 text-indigo-600" />
                    Métodos de Pagamento
                  </h4>
                  <p className="text-slate-600">
                    Transferência Bancária (BAI, BFA, BIC, BMA), Referência Multicaixa Express e Faturas Proforma a 30 dias para contas corporativas.
                  </p>
                </div>

              </div>
            </div>
          )}

        </div>

        {/* SECÇÃO: PERGUNTAS FREQUENTES TÉCNICAS (FAQ) */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 mb-12 shadow-sm space-y-6">
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-primary">Esclarecimentos Rápidos</span>
            <h3 className="text-xl font-black text-slate-900 mt-1">
              Perguntas Frequentes sobre o Equipamento
            </h3>
          </div>

          <div className="space-y-3">
            {[
              {
                q: 'Como posso solicitar fatura proforma em nome da minha empresa?',
                a: 'Pode clicar no botão "Gerar Cotação Proforma" acima ou falar diretamente no WhatsApp da ARKNET indicando o NIF e a razão social da empresa para emitirmos de imediato.',
              },
              {
                q: 'O que acontece quando faço uma reserva de um produto em trânsito?',
                a: 'A sua reserva é registada com número único e garantia de prioridade. Assim que o lote de equipamentos der entrada na sede da ARKNET em Luanda, a nossa equipa entrará em contacto direto consigo antes de disponibilizar para venda pública.',
              },
              {
                q: 'A ARKNET presta assistência técnica e instalação?',
                a: 'Sim. Dispomos de engenheiros no terreno habilitados para efetuar a instalação, montagem em bastidor, conectorização e configuração completa dos equipamentos.',
              },
              {
                q: 'Quais os prazos de entrega para fora de Luanda?',
                a: 'Para as províncias (Benguela, Huambo, Huíla, Cabinda, etc.), o envio demora em média 2 a 4 dias úteis através de transporte expresso assegurado.',
              },
            ].map((faq, i) => (
              <div key={i} className="border border-slate-200 rounded-2xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full p-4 text-left font-bold text-xs sm:text-sm text-slate-900 flex items-center justify-between gap-4 bg-slate-50/70 hover:bg-slate-100/80 transition cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`h-4 w-4 text-slate-500 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === i && (
                  <div className="p-4 text-xs text-slate-600 bg-white leading-relaxed border-t border-slate-100">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* RELATED PRODUCTS SHOWCASE */}
        {relatedProducts.length > 0 && (
          <div className="mt-12">
            <div className="flex items-center justify-between mb-6">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                  Equipamentos Complementares
                </span>
                <h3 className="text-xl font-black text-slate-900">
                  Produtos Relacionados &amp; Recomendados
                </h3>
              </div>

              <Link
                href="/loja"
                className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline uppercase"
              >
                <span>Ver Todo o Catálogo</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {relatedProducts.map((relProduct) => (
                <ProductCard key={relProduct.id} product={relProduct as any} />
              ))}
            </div>
          </div>
        )}

      </div>

      {/* MODAL DE RESERVA DE PRODUTO */}
      <ReserveProductModal
        product={product}
        isOpen={isReserveModalOpen}
        onClose={() => setIsReserveModalOpen(false)}
      />

      {/* MODAL DE COTAÇÃO PROFORMA RÁPIDA */}
      {isProformaModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary">Cotação Institucional</span>
                <h3 className="text-lg font-black">Emissão de Proforma Online</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsProformaModalOpen(false)}
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-700">
              
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                <div className="flex justify-between font-bold text-slate-900">
                  <span>Equipamento:</span>
                  <span className="text-right max-w-[220px] truncate">{product.name}</span>
                </div>
                {variantLabel && (
                  <div className="flex justify-between text-slate-600">
                    <span>Configuração:</span>
                    <span className="font-semibold text-primary">{variantLabel}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-500 font-mono">
                  <span>Ref. SKU:</span>
                  <span>{effectiveSku}</span>
                </div>
                <div className="flex justify-between">
                  <span>Quantidade:</span>
                  <span className="font-mono font-bold">{quantity} un.</span>
                </div>
                <div className="flex justify-between">
                  <span>Preço Unitário:</span>
                  <span className="font-mono font-bold text-primary">{formatProdutoPrice(effectivePrice)}</span>
                </div>
                {effectivePrice && (
                  <div className="flex justify-between border-t border-slate-200 pt-2 font-black text-sm text-slate-900">
                    <span>Subtotal Estimado:</span>
                    <span className="text-primary">{formatProdutoPrice(effectivePrice * quantity)}</span>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Nome da Empresa / Cliente:
                  </label>
                  <input
                    type="text"
                    value={proformaClientName}
                    onChange={(e) => setProformaClientName(e.target.value)}
                    placeholder="Ex: Sonangol E.P. / Banco BAI"
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:border-primary focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    NIF (Número de Identificação Fiscal):
                  </label>
                  <input
                    type="text"
                    value={proformaClientNif}
                    onChange={(e) => setProformaClientNif(e.target.value)}
                    placeholder="Ex: 5001234567"
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:border-primary focus:bg-white"
                  />
                </div>
              </div>

              <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl text-[11px] text-blue-950">
                <p className="font-bold">Dados Bancários ARKNET:</p>
                <p className="text-slate-600 mt-0.5 font-mono">
                  BAI: AO06.0040.0000.1234.5678.9012.3<br />
                  BFA: AO06.0006.0000.9876.5432.1098.7
                </p>
              </div>

              <div className="pt-2 flex gap-3">
                <a
                  href={`https://wa.me/244935208449?text=${encodeURIComponent(
                    `Olá ARKNET! Solicito emissão da Proforma oficial para o equipamento *"${product.name}"* ${variantLabel ? `(Configuração: ${variantLabel})` : ''} (${quantity} un.) - Ref: ${effectiveSku}. Empresa: ${proformaClientName || 'A indicar'} | NIF: ${proformaClientNif || 'A indicar'}.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold uppercase rounded-xl text-center flex items-center justify-center gap-2 shadow-md transition"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>Pedir Proforma Oficial no WhatsApp</span>
                </a>
              </div>

            </div>

          </div>
        </div>
      )}

    </main>
  )
}
