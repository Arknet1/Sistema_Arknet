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
  PackagePlus,
  CheckCircle2,
  Box,
  Headphones,
  RotateCcw,
  Printer,
  Download,
  X,
  ChevronDown,
} from 'lucide-react'
import { useCart } from '@/lib/cart'
import { useWishlist } from '@/lib/wishlist-store'
import { dataStore, StoreProduct } from '@/lib/data-store'
import { formatProdutoPrice } from '@/lib/format-produto-price'
import ProductCard from '@/components/product-card'
import { useToast } from '@/lib/toast-context'
import ReserveProductModal from '@/components/reserve-product-modal'

const monthlyCategories = ['Internet', 'Hosting', 'Cloud', 'Comunicações']

// Gerador Inteligente de Ficha Técnica Detalhada por Categoria
function getCategorySpecs(product: StoreProduct) {
  const cat = (product.category || '').toLowerCase()
  const name = (product.name || '').toLowerCase()

  const commonSpecs = [
    { label: 'Modelo / Referência', value: product.name },
    { label: 'Código SKU ARKNET', value: product.sku || `ARK-${product.id.toUpperCase()}` },
    { label: 'Categoria Comercial', value: product.category },
    { label: 'Condição do Equipamento', value: '100% Novo em Caixa Selada' },
    {
      label: 'Disponibilidade de Stock',
      value: product.inStock !== false ? 'Disponível para Entrega Imediata (Sede Luanda)' : 'Em Trânsito / Reposição Prevista para Angola',
    },
    { label: 'Homologação e Normas', value: 'Conformidade INACOM / CE / FCC / ISO 9001' },
    { label: 'Garantia Oficial', value: '12 a 24 Meses com Assistência Técnica ARKNET' },
  ]

  if (cat.includes('smartphone') || name.includes('iphone') || name.includes('android')) {
    return [
      ...commonSpecs,
      { label: 'Processador / Chipset', value: name.includes('iphone') ? 'Apple A18 Pro / Neural Engine 16-Core' : 'Octa-Core de Alto Desempenho 4nm' },
      { label: 'Ecrã & Resolução', value: name.includes('iphone') ? 'Super Retina XDR OLED 120Hz ProMotion' : 'AMOLED FHD+ 120Hz com Proteção Gorilla Glass' },
      { label: 'Sistema de Câmaras', value: 'Sensor Principal de 48 MP + Ultra Grande Angular + Teleobjetiva' },
      { label: 'Conectividade Móvel', value: '5G Dual SIM (Nano-SIM + eSIM) / Wi-Fi 7 / Bluetooth 5.4' },
      { label: 'Segurança & Biometria', value: name.includes('iphone') ? 'Face ID com Sensor TrueDepth' : 'Leitor de Impressão Digital Sob o Ecrã' },
      { label: 'Carregamento & Bateria', value: 'Carregamento Rápido USB-C / Carregamento Sem Fios MagSafe' },
    ]
  }

  if (cat.includes('rede') || name.includes('roteador') || name.includes('switch') || name.includes('wi-fi') || name.includes('repetidor') || name.includes('tp-link')) {
    return [
      ...commonSpecs,
      { label: 'Interface de Rede', value: 'Portas Gigabit Ethernet RJ45 10/100/1000 Mbps + Slots SFP' },
      { label: 'Normas Sem Fios', value: 'IEEE 802.11ax/ac/n/g/b (Wi-Fi 6 Dual Band 2.4/5GHz)' },
      { label: 'Velocidade Wireless', value: 'Até 3000 Mbps agregados com tecnologia MU-MIMO e Beamforming' },
      { label: 'Alimentação & PoE', value: 'Suporte a PoE 802.3af/at (Power over Ethernet) ou Transformador 12V/24V' },
      { label: 'Protocolos e Segurança', value: 'WPA3-Enterprise, VLAN 802.1Q, QoS, VPN WireGuard/IPSec, Firewall Integrado' },
      { label: 'Gestão de Rede', value: 'Interface Web, Telnet, SSH, SNMP v2/v3 e Cloud Management' },
    ]
  }

  if (cat.includes('cabo') || cat.includes('conectividade') || name.includes('cabo') || name.includes('conector') || name.includes('alicate')) {
    return [
      ...commonSpecs,
      { label: 'Especificação do Cabo', value: 'Cat6 / Cat6A UTP/FTP 4 Pares Trançados' },
      { label: 'Condutor Interno', value: '100% Cobre Puro Eletrolítico 23AWG / 24AWG' },
      { label: 'Revestimento Exterior', value: 'Capa LSZH (Baixa Emissão de Fumo e Sem Halogéneos) Anti-chama' },
      { label: 'Largura de Banda', value: 'Frequência de teste até 250 MHz / 500 MHz (Gigabit & 10G)' },
      { label: 'Certificação de Teste', value: 'Pass Fluke DTX/DSX Channel & Permanent Link Test' },
    ]
  }

  if (cat.includes('energia') || name.includes('ups') || name.includes('filtro') || name.includes('extensão') || name.includes('pilha')) {
    return [
      ...commonSpecs,
      { label: 'Tensão de Entrada/Saída', value: '220V - 240V AC 50/60 Hz' },
      { label: 'Proteção Elétrica', value: 'Filtro contra Picos, Sobretensões, Curto-circuitos e Ruído de Linha' },
      { label: 'Tomadas de Ligação', value: 'Tomadas Schuko padrão europeu / angolano com proteção infantil' },
      { label: 'Material da Carcaça', value: 'Polímero ABS Ignífugo resistente a altas temperaturas' },
    ]
  }

  if (cat.includes('computador') || cat.includes('portáteis') || name.includes('notebook') || name.includes('computador') || name.includes('ram')) {
    return [
      ...commonSpecs,
      { label: 'Processador / Arquitetura', value: 'Intel Core / AMD Ryzen Multi-Core de Alta Eficiência' },
      { label: 'Memória e Barramento', value: 'DDR4 / DDR5 High Speed com suporte a expansão' },
      { label: 'Armazenamento', value: 'SSD NVMe M.2 PCIe Gen4 de Ultra Velocidade' },
      { label: 'Conexões & Portas', value: 'USB-C Thunderbolt, USB 3.2, HDMI 2.1, Jack 3.5mm e Leitor SD' },
      { label: 'Sistema Operativo', value: 'Windows 11 Pro Corporativo / Suporte a Linux' },
    ]
  }

  return [
    ...commonSpecs,
    { label: 'Ambiente de Aplicação', value: 'Empresarial, Corporativo e Residencial de Alto Desempenho' },
    { label: 'Alimentação', value: '100-240V AC / Bivolt Automático ou USB' },
    { label: 'Compatibilidade', value: 'Universal com sistemas informáticos e redes existentes em Angola' },
  ]
}

// O que vem na caixa por categoria
function getPackageContents(product: StoreProduct): string[] {
  const cat = (product.category || '').toLowerCase()
  const name = (product.name || '').toLowerCase()

  if (cat.includes('smartphone') || name.includes('iphone')) {
    return [
      `1x ${product.name}`,
      '1x Cabo USB-C de Carregamento Rápido em Tecido Trançado',
      '1x Chave Extratora de Bandeja SIM',
      '1x Guia de Iniciação Rápida e Documentação Oficial',
      '1x Certificado de Garantia ARKNET Angola',
    ]
  }

  if (cat.includes('rede') || name.includes('roteador') || name.includes('switch') || name.includes('wi-fi')) {
    return [
      `1x ${product.name}`,
      '1x Adaptador de Alimentação AC / Fonte de Energia',
      '1x Cabo de Rede Ethernet RJ45 Cat6 de Alta Velocidade',
      '1x Kit de Parafusos / Suportes para Fixação em Rack ou Parede',
      '1x Manual de Configuração Rápida em Português',
      '1x Certificado de Conformidade e Garantia Técnica',
    ]
  }

  return [
    `1x ${product.name}`,
    '1x Acessórios Oficiais e Cabos de Ligação',
    '1x Manual de Instruções do Utilizador',
    '1x Certificado de Garantia ARKNET Angola',
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

  // FAQ Accordion state
  const [openFaq, setOpenFaq] = useState<number | null>(0)

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
  const isOutOfStock = product ? product.inStock === false || (product.quantity ?? 0) === 0 : false

  // Produtos relacionados da mesma categoria
  const relatedProducts = useMemo(() => {
    if (!product) return []
    return allProducts
      .filter((p) => p.id !== product.id && (p.category.toLowerCase() === product.category.toLowerCase() || p.featured))
      .slice(0, 4)
  }, [product, allProducts])

  const handleAddToCart = async (goToCheckout = false) => {
    if (!product || isAdding || isOutOfStock) return
    setIsAdding(true)

    for (let i = 0; i < quantity; i++) {
      addItem(product as any)
    }

    setIsAdding(false)
    if (goToCheckout) {
      router.push('/loja/checkout')
    } else {
      success(`"${product.name}" (${quantity} un.) adicionado ao carrinho!`, 'Carrinho Atualizado')
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
    `Olá ARKNET! 👋 Gostaria de obter cotação e especificações para o equipamento: *"${product.name}"* (Ref: ${product.sku || product.id}). Podem informar disponibilidade e condições comerciais?`
  )

  const activeImage = galleryImages[selectedImageIndex] || product.image
  const technicalSpecs = getCategorySpecs(product)
  const packageContents = getPackageContents(product)

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
                      ★ Destaque ARKNET
                    </span>
                  )}
                  {!isOutOfStock ? (
                    <span className="px-3 py-1 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider rounded-lg shadow-sm flex items-center gap-1">
                      <Check className="h-3 w-3" />
                      Stock Imediato Luanda
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
                    className="p-2.5 bg-white/90 hover:bg-white text-slate-600 hover:text-primary rounded-full shadow-xs border border-slate-200 transition"
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
                      className={`relative h-20 w-20 rounded-xl overflow-hidden shrink-0 border-2 transition ${
                        selectedImageIndex === idx
                          ? 'border-primary shadow-xs ring-2 ring-primary/20'
                          : 'border-slate-200 hover:border-slate-400 opacity-70 hover:opacity-100'
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={img}
                        alt={`Ângulo ${idx + 1}`}
                        className="h-full w-full object-contain p-1"
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Selos de Confiança ARKNET (Trust Badges) */}
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

            {/* Right: Product Details, Price & Actions (6 cols) */}
            <div className="lg:col-span-6 space-y-6">
              
              <div>
                <span className="inline-block text-xs font-black uppercase tracking-wider text-primary bg-primary/10 px-3 py-1 rounded-full mb-2">
                  {product.category}
                </span>

                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-snug">
                  {product.name}
                </h1>

                <p className="text-xs font-mono text-slate-400 mt-1">
                  SKU: <strong className="text-slate-700">{product.sku || `ARK-${product.id.toUpperCase()}`}</strong>
                </p>
              </div>

              {/* Price Box */}
              <div className="p-4 sm:p-5 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row sm:items-baseline justify-between gap-3">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                    Preço de Venda em Angola:
                  </span>
                  <p className="text-2xl sm:text-3xl font-black text-slate-900 tabular-nums">
                    {formatProdutoPrice(product.price)}
                  </p>
                  <span className="text-[11px] text-slate-500">
                    {product.price ? 'Impostos aplicáveis e faturação comercial incluídos.' : 'Preço sob consulta conforme quantidade pretendida.'}
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
                        Disponível em Loja
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

              {/* Description Snippet */}
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {product.description}
              </p>

              {/* Quantity & CTA Buttons */}
              <div className="pt-4 border-t border-slate-200 space-y-4">
                
                {!isOutOfStock && product.price != null && (
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Quantidade:
                    </span>
                    <div className="flex items-center border border-slate-300 rounded-xl overflow-hidden bg-white shadow-xs">
                      <button
                        type="button"
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        disabled={quantity <= 1}
                        className="px-3.5 py-2 text-slate-600 hover:bg-slate-100 disabled:opacity-30 transition"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="px-4 py-2 text-xs font-mono font-black text-slate-900 min-w-[36px] text-center">
                        {quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => setQuantity((q) => q + 1)}
                        className="px-3.5 py-2 text-slate-600 hover:bg-slate-100 transition"
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
                      {product.price != null ? (
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
                      <span>Fazer Reserva do Produto (Garantir Prioridade)</span>
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
                        Este produto está em processo de reposição com chegada prevista ao nosso armazém em Luanda. Efetue a sua reserva sem custos para garantir a prioridade na entrega assim que o lote der entrada.
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
                    <span>Dúvidas? Falar no WhatsApp</span>
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
              Ficha Técnica Completa
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
                <h3 className="text-lg font-black text-slate-900">
                  Especificações Técnicas de Hardware &amp; Normas
                </h3>
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
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white"
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
                <div className="flex justify-between">
                  <span>Quantidade:</span>
                  <span className="font-mono font-bold">{quantity} un.</span>
                </div>
                <div className="flex justify-between">
                  <span>Preço Unitário:</span>
                  <span className="font-mono font-bold text-primary">{formatProdutoPrice(product.price)}</span>
                </div>
                {product.price && (
                  <div className="flex justify-between border-t border-slate-200 pt-2 font-black text-sm text-slate-900">
                    <span>Subtotal Estimado:</span>
                    <span className="text-primary">{formatProdutoPrice(product.price * quantity)}</span>
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
                    `Olá ARKNET! 👋 Solicito emissão da Proforma oficial para o equipamento *"${product.name}"* (${quantity} un.). Empresa: ${proformaClientName || 'A indicar'} | NIF: ${proformaClientNif || 'A indicar'}.`
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
