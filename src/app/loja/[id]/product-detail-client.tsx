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
  Building2,
  FileText,
  Share2,
  ChevronRight,
  Sparkles,
  HelpCircle,
  Clock,
  Plus,
  Minus,
  MessageCircle,
  ExternalLink,
  Layers,
  Cpu,
  Zap,
  Heart,
} from 'lucide-react'
import { useCart } from '@/lib/cart'
import { useWishlist } from '@/lib/wishlist-store'
import { dataStore, StoreProduct } from '@/lib/data-store'
import { formatProdutoPrice } from '@/lib/format-produto-price'
import ProductCard from '@/components/product-card'
import { useToast } from '@/lib/toast-context'

const monthlyCategories = ['Internet', 'Hosting', 'Cloud', 'Comunicações']

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
  const [activeTab, setActiveTab] = useState<'descricao' | 'especificacoes' | 'garantia' | 'entregas'>('descricao')

  useEffect(() => {
    const sync = () => {
      const p = dataStore.getProductById(id)
      const list = dataStore.getProducts()
      setProduct(p)
      setAllProducts(list)
    }
    sync()
    const unsub = dataStore.subscribe(sync)
    return () => unsub()
  }, [id])

  // Lista de imagens do produto (galeria)
  const galleryImages = useMemo(() => {
    if (!product) return []
    const list: string[] = []
    if (product.image) list.push(product.image)
    if (product.images && Array.isArray(product.images)) {
      product.images.forEach((img) => {
        if (img && !list.includes(img)) list.push(img)
      })
    }
    return list
  }, [product])

  const isInCart = product ? items.some((item) => item.product.id === product.id) : false
  const cartItem = product ? items.find((item) => item.product.id === product.id) : null
  const isMonthly = product ? monthlyCategories.includes(product.category) && product.price != null : false

  // Produtos relacionados (mesma categoria ou outros)
  const relatedProducts = useMemo(() => {
    if (!product) return []
    return allProducts
      .filter((p) => p.id !== product.id && (p.category === product.category || p.featured))
      .slice(0, 4)
  }, [product, allProducts])

  const handleAddToCart = async (goToCheckout = false) => {
    if (!product || isAdding || product.inStock === false) return
    setIsAdding(true)

    // Adicionar a quantidade escolhida
    for (let i = 0; i < quantity; i++) {
      addItem(product as any)
    }

    setIsAdding(false)
    if (goToCheckout) {
      router.push('/loja/checkout')
    } else {
      success(`"${product.name}" adicionado ao carrinho!`, 'Carrinho Atualizado')
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
        <div className="max-w-md w-full mx-auto px-6 text-center bg-white p-8 border border-slate-200 shadow-sm">
          <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
            <ShoppingCart className="h-7 w-7" />
          </div>
          <h2 className="text-xl font-black text-slate-900">Produto não encontrado</h2>
          <p className="text-xs text-slate-500 mt-2">
            O equipamento solicitado pode ter sido descontinuado ou o identificador é inválido.
          </p>
          <Link
            href="/loja"
            className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white text-xs font-bold uppercase rounded shadow-sm hover:bg-primary/90 transition"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Voltar ao Catálogo da Loja</span>
          </Link>
        </div>
      </main>
    )
  }

  const whatsappMessage = encodeURIComponent(
    `Olá ARKNET, gostaria de obter informações e cotação institucional para o equipamento: *${product.name}* (Ref: ${product.sku || product.id}).`
  )

  const activeImage = galleryImages[selectedImageIndex] || product.image

  return (
    <main className="min-h-screen pt-28 pb-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        {/* Breadcrumb Navigation */}
        <nav className="mb-6 flex flex-wrap items-center gap-2 text-xs text-slate-500">
          <Link href="/" className="hover:text-primary transition">Início</Link>
          <ChevronRight className="h-3 w-3 text-slate-400" />
          <Link href="/loja" className="hover:text-primary transition">Loja Online</Link>
          <ChevronRight className="h-3 w-3 text-slate-400" />
          <span className="text-slate-600 font-semibold">{product.category}</span>
          <ChevronRight className="h-3 w-3 text-slate-400" />
          <span className="text-slate-900 font-bold truncate max-w-[200px] sm:max-w-xs">
            {product.name}
          </span>
        </nav>

        {/* Top Product Hero Grid */}
        <div className="bg-white border border-slate-200 shadow-sm p-6 sm:p-10 mb-10">
          <div className="grid lg:grid-cols-12 gap-10 items-start">

            {/* Left: Gallery & Visual Showcase (5 cols) */}
            <div className="lg:col-span-6 space-y-4">
              
              {/* Main Image Showcase */}
              <div className="relative bg-white border border-slate-200 rounded-lg overflow-hidden group">
                <div className="h-[380px] sm:h-[440px] w-full flex items-center justify-center p-6 bg-radial from-slate-50 to-white">
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

                {/* Overlaid Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-1.5">
                  {product.featured && (
                    <span className="px-3 py-1 bg-amber-500 text-white text-[10px] font-black uppercase tracking-wider rounded shadow-xs flex items-center gap-1">
                      <Sparkles className="h-3 w-3" />
                      Destaque Empresarial
                    </span>
                  )}
                  {product.inStock !== false ? (
                    <span className="px-3 py-1 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider rounded shadow-xs flex items-center gap-1">
                      <Check className="h-3 w-3" />
                      Stock Imediato Luanda
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-rose-600 text-white text-[10px] font-black uppercase tracking-wider rounded shadow-xs">
                      Esgotado
                    </span>
                  )}
                </div>

                {/* Top Action Buttons (Favorite & Share) */}
                <div className="absolute top-4 right-4 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const added = toggleWishlist(product)
                      if (added) {
                        success(`"${product.name}" adicionado aos seus favoritos!`, 'Favoritos')
                      } else {
                        info(`"${product.name}" removido dos favoritos.`)
                      }
                    }}
                    className={`p-2 rounded-full shadow-xs border transition ${
                      isInWishlist(product.id)
                        ? 'bg-rose-600 border-rose-600 text-white'
                        : 'bg-white/90 hover:bg-white text-slate-600 hover:text-rose-600 border-slate-200'
                    }`}
                    title={isInWishlist(product.id) ? 'Remover dos favoritos' : 'Guardar nos favoritos'}
                  >
                    <Heart className={`h-4 w-4 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
                  </button>

                  <button
                    type="button"
                    onClick={handleShare}
                    className="p-2 bg-white/90 hover:bg-white text-slate-600 hover:text-primary rounded-full shadow-xs border border-slate-200 transition"
                    title="Copiar link do produto"
                  >
                    <Share2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Thumbnails list */}
              {galleryImages.length > 1 && (
                <div className="flex items-center gap-3 overflow-x-auto pb-2">
                  {galleryImages.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`relative h-20 w-20 rounded-md overflow-hidden shrink-0 border-2 transition ${
                        selectedImageIndex === idx
                          ? 'border-primary shadow-xs ring-2 ring-primary/20'
                          : 'border-slate-200 hover:border-slate-400 opacity-70 hover:opacity-100'
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={img}
                        alt={`Vista ${idx + 1}`}
                        className="h-full w-full object-contain p-1 bg-white"
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Value proposition badges */}
              <div className="grid grid-cols-3 gap-3 pt-3 border-t border-slate-100 text-center">
                <div className="p-3 bg-slate-50 border border-slate-100 rounded">
                  <ShieldCheck className="h-4 w-4 text-primary mx-auto mb-1" />
                  <p className="text-[11px] font-bold text-slate-800">Garantia 1 Ano</p>
                  <p className="text-[10px] text-slate-500">Oficial ARKNET</p>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-100 rounded">
                  <Truck className="h-4 w-4 text-emerald-600 mx-auto mb-1" />
                  <p className="text-[11px] font-bold text-slate-800">Entrega Rápida</p>
                  <p className="text-[10px] text-slate-500">Luanda &amp; Províncias</p>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-100 rounded">
                  <Building2 className="h-4 w-4 text-indigo-600 mx-auto mb-1" />
                  <p className="text-[11px] font-bold text-slate-800">Fatura Proforma</p>
                  <p className="text-[10px] text-slate-500">Com NIF &amp; IVA</p>
                </div>
              </div>
            </div>

            {/* Right: Product Details & Buying Actions (6 cols) */}
            <div className="lg:col-span-6 space-y-6">
              
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2.5 py-1 bg-primary/10 text-primary font-extrabold text-[10px] uppercase tracking-wider rounded">
                    {product.category}
                  </span>
                  {product.sku && (
                    <span className="text-[11px] font-mono text-slate-400">
                      SKU: <strong className="text-slate-600">{product.sku}</strong>
                    </span>
                  )}
                </div>

                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
                  {product.name}
                </h1>
              </div>

              {/* Price Box */}
              <div className="p-5 bg-slate-50 border border-slate-200 rounded-lg flex flex-col sm:flex-row sm:items-baseline justify-between gap-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Preço de Tabela Institucional:
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl sm:text-4xl font-black text-slate-900 font-mono tracking-tight">
                      {formatProdutoPrice(product.price)}
                    </span>
                    {isMonthly && (
                      <span className="text-sm font-semibold text-slate-500 font-sans">/ mês</span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    ✓ IVA 14% incluído • Venda direta com fatura certificada
                  </p>
                </div>

                <div className="text-right sm:self-center">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full">
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                    Equipamento Novo
                  </span>
                </div>
              </div>

              {/* Short Summary Description */}
              <p className="text-sm text-slate-600 leading-relaxed">
                {product.description}
              </p>

              {/* Quantity Selector & Cart CTA */}
              <div className="pt-4 border-t border-slate-200 space-y-4">
                
                {product.inStock !== false && product.price != null && (
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Quantidade:
                    </span>
                    <div className="flex items-center border border-slate-300 rounded overflow-hidden bg-white shadow-xs">
                      <button
                        type="button"
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        disabled={quantity <= 1}
                        className="px-3 py-2 text-slate-600 hover:bg-slate-100 disabled:opacity-30 transition"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="px-4 py-2 text-xs font-mono font-black text-slate-900 min-w-[36px] text-center">
                        {quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => setQuantity((q) => q + 1)}
                        className="px-3 py-2 text-slate-600 hover:bg-slate-100 transition"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Primary Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  {product.price != null && product.inStock !== false ? (
                    <>
                      <button
                        type="button"
                        onClick={() => handleAddToCart(false)}
                        disabled={isAdding}
                        className="flex-1 px-6 py-3.5 bg-primary hover:bg-primary/90 text-white font-bold text-xs uppercase tracking-wider rounded shadow-md transition flex items-center justify-center gap-2"
                      >
                        <ShoppingCart className="h-4 w-4" />
                        <span>{isInCart ? 'Adicionar Mais ao Carrinho' : 'Adicionar ao Carrinho'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleAddToCart(true)}
                        className="flex-1 px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider rounded shadow-md transition flex items-center justify-center gap-2"
                      >
                        <Zap className="h-4 w-4" />
                        <span>Comprar Já / Checkout</span>
                      </button>
                    </>
                  ) : (
                    <Link
                      href="/#contacto"
                      className="flex-1 px-6 py-3.5 bg-primary text-white font-bold text-xs uppercase tracking-wider rounded shadow-md text-center hover:bg-primary/90 transition flex items-center justify-center gap-2"
                    >
                      <Phone className="h-4 w-4" />
                      <span>Solicitar Cotação de Disponibilidade</span>
                    </Link>
                  )}
                </div>

                {/* Secondary Actions (WhatsApp & Proforma) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                  <a
                    href={`https://wa.me/244935208449?text=${whatsappMessage}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-900 rounded text-xs font-bold uppercase flex items-center justify-center gap-2 transition"
                  >
                    <MessageCircle className="h-4 w-4 text-emerald-600" />
                    <span>Dúvidas? Falar no WhatsApp</span>
                  </a>

                  <Link
                    href={`/loja/checkout`}
                    className="p-3 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 rounded text-xs font-bold uppercase flex items-center justify-center gap-2 transition"
                  >
                    <FileText className="h-4 w-4 text-slate-600" />
                    <span>Emitir Proforma Online</span>
                  </Link>
                </div>

                {/* Cart Feedback Strip */}
                {isInCart && cartItem && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded flex items-center justify-between text-xs text-emerald-900">
                    <span className="font-medium">
                      ✓ Já tem <strong>{cartItem.quantity} unidade(s)</strong> deste produto no carrinho.
                    </span>
                    <button
                      type="button"
                      onClick={() => removeItem(product.id)}
                      className="text-rose-600 hover:underline font-bold text-[11px] flex items-center gap-1"
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

        {/* Lower Content Tabs: Descrição, Ficha Técnica, Garantia, Envios */}
        <div className="bg-white border border-slate-200 shadow-sm mb-12 overflow-hidden">
          
          {/* Tab Headers */}
          <div className="flex border-b border-slate-200 bg-slate-50 overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveTab('descricao')}
              className={`px-6 py-4 text-xs font-bold uppercase tracking-wider border-b-2 transition whitespace-nowrap ${
                activeTab === 'descricao'
                  ? 'border-primary text-primary bg-white'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              Visão Geral &amp; Detalhes
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('especificacoes')}
              className={`px-6 py-4 text-xs font-bold uppercase tracking-wider border-b-2 transition whitespace-nowrap ${
                activeTab === 'especificacoes'
                  ? 'border-primary text-primary bg-white'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              Ficha Técnica &amp; Especificações
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('garantia')}
              className={`px-6 py-4 text-xs font-bold uppercase tracking-wider border-b-2 transition whitespace-nowrap ${
                activeTab === 'garantia'
                  ? 'border-primary text-primary bg-white'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              Garantia &amp; Suporte Técnico
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('entregas')}
              className={`px-6 py-4 text-xs font-bold uppercase tracking-wider border-b-2 transition whitespace-nowrap ${
                activeTab === 'entregas'
                  ? 'border-primary text-primary bg-white'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              Envios &amp; Pagamentos em Angola
            </button>
          </div>

          {/* Tab 1: Descrição */}
          {activeTab === 'descricao' && (
            <div className="p-8 text-slate-700 text-sm leading-relaxed space-y-6">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 mb-3">
                  Sobre o Equipamento
                </h3>
                <p className="whitespace-pre-wrap">{product.description}</p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded">
                  <h4 className="font-bold text-xs uppercase text-slate-900 mb-1 flex items-center gap-1.5">
                    <Cpu className="h-4 w-4 text-primary" />
                    Aplicações Recomendadas
                  </h4>
                  <p className="text-xs text-slate-600">
                    Projetado para infraestruturas corporativas, data centers, pequenas e médias empresas que exigem alta disponibilidade e fiabilidade de rede.
                  </p>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded">
                  <h4 className="font-bold text-xs uppercase text-slate-900 mb-1 flex items-center gap-1.5">
                    <Zap className="h-4 w-4 text-amber-600" />
                    Integração com Soluções ARKNET
                  </h4>
                  <p className="text-xs text-slate-600">
                    Compatível com as nossas soluções de Links Dedicados, Cibersegurança Gerida, Telefonia VoIP e infraestrutura Cloud.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Ficha Técnica */}
          {activeTab === 'especificacoes' && (
            <div className="p-8">
              <h3 className="text-base font-extrabold text-slate-900 mb-4">
                Especificações Técnicas de Hardware
              </h3>

              <div className="border border-slate-200 rounded overflow-hidden">
                <table className="w-full text-xs text-left">
                  <tbody className="divide-y divide-slate-200">
                    <tr className="bg-slate-50">
                      <td className="p-3.5 font-bold text-slate-700 w-1/3">Equipamento / Modelo</td>
                      <td className="p-3.5 text-slate-900 font-semibold">{product.name}</td>
                    </tr>
                    <tr>
                      <td className="p-3.5 font-bold text-slate-700">Categoria de Produto</td>
                      <td className="p-3.5 text-slate-900">{product.category}</td>
                    </tr>
                    <tr className="bg-slate-50">
                      <td className="p-3.5 font-bold text-slate-700">Código de Referência (SKU)</td>
                      <td className="p-3.5 text-slate-900 font-mono">{product.sku || `ARK-PROD-${product.id}`}</td>
                    </tr>
                    <tr>
                      <td className="p-3.5 font-bold text-slate-700">Disponibilidade de Stock</td>
                      <td className="p-3.5 text-slate-900">
                        {product.inStock !== false ? 'Em Stock na Sede ARKNET (Luanda)' : 'Sob Encomenda (7-15 dias)'}
                      </td>
                    </tr>
                    <tr className="bg-slate-50">
                      <td className="p-3.5 font-bold text-slate-700">Normas &amp; Homologação</td>
                      <td className="p-3.5 text-slate-900">Homologado para redes empresariais em Angola (INACOM / ISO / CE)</td>
                    </tr>
                    <tr>
                      <td className="p-3.5 font-bold text-slate-700">Alimentação &amp; Tensão</td>
                      <td className="p-3.5 text-slate-900">100-240V AC / Suporte a PoE (Power over Ethernet) conforme o modelo</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab 3: Garantia */}
          {activeTab === 'garantia' && (
            <div className="p-8 text-slate-700 text-xs leading-relaxed space-y-4">
              <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded text-emerald-950">
                <ShieldCheck className="h-8 w-8 text-emerald-600 shrink-0" />
                <div>
                  <h4 className="font-black text-sm uppercase">12 Meses de Garantia Direta ARKNET</h4>
                  <p className="text-xs text-emerald-800 mt-0.5">
                    Todos os equipamentos adquiridos na nossa loja contam com cobertura integral contra defeitos de fabrico.
                  </p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 border border-slate-200 rounded bg-white">
                  <h5 className="font-extrabold text-slate-900 text-xs uppercase mb-1">Substituição Rápida de Peças</h5>
                  <p className="text-slate-600">
                    Dispomos de stock local em Luanda para minimizar o tempo de inatividade da sua empresa (SLA reduzido).
                  </p>
                </div>

                <div className="p-4 border border-slate-200 rounded bg-white">
                  <h5 className="font-extrabold text-slate-900 text-xs uppercase mb-1">Assistência Técnica Especializada</h5>
                  <p className="text-slate-600">
                    A nossa equipa de engenharia de redes e telecomunicações está habilitada para prestar suporte na configuração e implementação.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: Envios */}
          {activeTab === 'entregas' && (
            <div className="p-8 text-slate-700 text-xs leading-relaxed space-y-4">
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded">
                  <h4 className="font-bold text-xs uppercase text-slate-900 mb-1 flex items-center gap-1.5">
                    <Truck className="h-4 w-4 text-emerald-600" />
                    Entrega em Luanda
                  </h4>
                  <p className="text-slate-600">
                    Entrega gratuita para encomendas institucionais ou levantamento direto na nossa sede no Kilamba.
                  </p>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded">
                  <h4 className="font-bold text-xs uppercase text-slate-900 mb-1 flex items-center gap-1.5">
                    <Layers className="h-4 w-4 text-primary" />
                    Envio para Províncias
                  </h4>
                  <p className="text-slate-600">
                    Expedição segura para Benguela, Huambo, Cabinda, Huíla e todas as províncias via transportadora parceira.
                  </p>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded">
                  <h4 className="font-bold text-xs uppercase text-slate-900 mb-1 flex items-center gap-1.5">
                    <FileText className="h-4 w-4 text-indigo-600" />
                    Formas de Pagamento
                  </h4>
                  <p className="text-slate-600">
                    Transferência Bancária (IBAN), Referência Multicaixa, Proforma 30 Dias para clientes corporativos aprovados.
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Related Products Carousel / Grid */}
        {relatedProducts.length > 0 && (
          <div className="mt-12">
            <div className="flex items-center justify-between mb-6">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                  Equipamentos Semelhantes
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

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {relatedProducts.map((relProduct) => (
                <ProductCard key={relProduct.id} product={relProduct as any} />
              ))}
            </div>
          </div>
        )}

      </div>
    </main>
  )
}
