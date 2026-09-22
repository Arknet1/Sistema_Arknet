'use client'

import { useState, useEffect, useRef } from "react"
import {
  Search, Wifi, Globe, Cloud, Cpu, MessageSquare, Shield, Wrench,
  SlidersHorizontal, Store, Printer, HardDrive, ShieldCheck, Zap, Cable, Droplets,
  Package, Layers, Monitor, Headphones, Smartphone, Tv, Camera, Server, Laptop, Usb, Boxes,
  Sparkles, ChevronLeft, ChevronRight
} from "lucide-react"
import Link from "next/link"
import ProductCard from "@/components/product-card"
import HeroCarousel, { type HeroSlide } from "@/components/hero-carousel"
import { dataStore, StoreProduct, ProductCategory } from "@/lib/data-store"

const iconMap: Record<string, React.ElementType> = {
  Globe, Wifi, Cloud, Cpu, MessageSquare, Shield, Wrench,
  Store, Printer, HardDrive, ShieldCheck, Zap, Cable, Droplets, Package,
  Layers, Monitor, Headphones, Smartphone, Tv, Camera, Server, Laptop, Usb, Boxes,
}

export default function LojaClient() {
  // O catálogo pode vir do localStorage no browser; começa vazio para o SSR e o cliente hidratarem igual.
  const [products, setProducts] = useState<StoreProduct[]>([])
  const [categories, setCategories] = useState<ProductCategory[]>([])
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>(() => dataStore.getSettings().carouselSlides)
  const [selectedCategory, setSelectedCategory] = useState('Todos')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('relevance')
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const carouselRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    dataStore.fetchProductsFromServer().catch((e) => console.warn('Erro ao carregar produtos na loja:', e))

    const sync = () => {
      const allProducts = dataStore.getProducts()
      const allCategories = dataStore.getCategories()
      const settings = dataStore.getSettings()
      setProducts([...allProducts])
      setCategories([...allCategories].sort((a, b) => a.order - b.order))
      setHeroSlides(settings.carouselSlides || [])
    }
    sync()
    const unsub = dataStore.subscribe(sync)
    return () => unsub()
  }, [])

  const scrollCarousel = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const scrollAmount = direction === 'left' ? -340 : 340
      carouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' })
    }
  }

  const isCategoryMatch = (productCat: string, selectedCat: string) => {
    if (!selectedCat || selectedCat === 'Todos') return true
    const pCat = (productCat || '').toLowerCase().trim()
    const sCat = selectedCat.toLowerCase().trim()
    if (pCat === sCat) return true
    if (sCat === 'redes e internet' && (pCat.includes('rede') || pCat.includes('internet'))) return true
    if (sCat === 'computadores e portáteis' && (pCat.includes('computador') || pCat.includes('portátil') || pCat.includes('notebook') || pCat.includes('ram'))) return true
    if (sCat === 'periféricos de computador' && (pCat.includes('periférico') || pCat.includes('mouse') || pCat.includes('teclado') || pCat.includes('rato'))) return true
    if (sCat === 'áudio' && (pCat.includes('áudio') || pCat.includes('som') || pCat.includes('coluna') || pCat.includes('headphone') || pCat.includes('auricular'))) return true
    if (sCat === 'impressoras e consumíveis' && (pCat.includes('impressora') || pCat.includes('toner') || pCat.includes('tinteiro') || pCat.includes('térmica'))) return true
    if (sCat === 'automação comercial' && (pCat.includes('pos') || pCat.includes('gaveta') || pCat.includes('biométrico') || pCat.includes('relógio') || pCat.includes('controlo'))) return true
    if (sCat === 'energia e proteção' && (pCat.includes('energia') || pCat.includes('ups') || pCat.includes('filtro') || pCat.includes('extensão') || pCat.includes('pilha'))) return true
    if (sCat === 'cabos e conectividade' && (pCat.includes('cabo') || pCat.includes('conector') || pCat.includes('rj45') || pCat.includes('adaptador') || pCat.includes('hdmi') || pCat.includes('splitter'))) return true
    return pCat.includes(sCat) || sCat.includes(pCat)
  }

  // Filtrar categorias que têm hideWhenEmpty === true e 0 produtos
  const visibleCategories = categories.filter((c) => {
    if (c.name === 'Todos') return true
    if (c.hideWhenEmpty) {
      const count = products.filter((p) => isCategoryMatch(p.category, c.name)).length
      return count > 0
    }
    return true
  })

  const filteredProducts = products.filter(p => {
    const matchesCategory = isCategoryMatch(p.category, selectedCategory)
    const matchesSearch = !searchTerm ||
                          p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.description.toLowerCase().includes(searchTerm.toLowerCase())

    return matchesCategory && matchesSearch
  })

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price-asc') {
      const pa = a.price ?? Number.POSITIVE_INFINITY
      const pb = b.price ?? Number.POSITIVE_INFINITY
      return pa - pb
    }
    if (sortBy === 'price-desc') {
      const pa = a.price ?? Number.NEGATIVE_INFINITY
      const pb = b.price ?? Number.NEGATIVE_INFINITY
      return pb - pa
    }
    return 0
  })

  // Produtos marcados em destaque (ou seleção dos principais produtos)
  const explicitFeatured = products.filter(p => Boolean(p.featured))
  const featuredProducts = explicitFeatured.length > 0 ? explicitFeatured : products.slice(0, 8)

  const hasActiveFilters = selectedCategory !== 'Todos' || searchTerm !== ''

  const clearAllFilters = () => {
    setSelectedCategory('Todos')
    setSearchTerm('')
    setSortBy('relevance')
  }

  return (
    <main className="min-h-screen bg-background pt-20">

      <HeroCarousel slides={heroSlides} />

      {/* Category tabs */}
      <div className="bg-white border-b border-slate-200 sticky top-20 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-0 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {visibleCategories.map((cat) => {
              const Icon = iconMap[cat.icon] || Globe
              const isActive = selectedCategory.toLowerCase() === cat.name.toLowerCase()

              return (
                <button
                  key={cat.id || cat.name}
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`flex items-center gap-2 px-4 py-3.5 text-sm font-medium whitespace-nowrap transition-all border-b-2 ${
                    isActive
                      ? 'border-primary text-primary font-bold'
                      : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {cat.name}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* Search & Sorting Toolbar */}
        <div className="mb-8 flex flex-col md:flex-row items-stretch bg-white border border-slate-200 shadow-xs">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="h-12 px-4 bg-slate-50 border-b md:border-b-0 md:border-r border-slate-200 text-sm outline-none text-slate-700 min-w-[150px] hidden sm:block"
          >
            <option value="Todos">Todas Categorias</option>
            {visibleCategories.filter(c => c.name !== 'Todos').map(cat => (
              <option key={cat.id || cat.name} value={cat.name}>{cat.name}</option>
            ))}
          </select>

          <div className="flex-1 flex items-center px-4">
            <Search className="h-4 w-4 text-slate-400 shrink-0 mr-3" />
            <input
              type="text"
              placeholder="Buscar produtos por nome ou características..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-12 outline-none text-sm text-slate-900 placeholder:text-slate-400"
            />
          </div>

          {/* Ordenação */}
          <div className="hidden md:flex items-center border-l border-slate-200 shrink-0">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="h-12 px-4 bg-white text-sm outline-none text-slate-600 cursor-pointer font-medium"
            >
              <option value="relevance">Relevância</option>
              <option value="price-asc">Menor Preço</option>
              <option value="price-desc">Maior Preço</option>
            </select>
          </div>
        </div>

        {/* Painel de Filtros Mobile Expansível */}
        {showMobileFilters && (
          <div className="md:hidden mb-6 p-4 bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <p className="text-xs font-bold text-slate-900 uppercase">Filtros Avançados</p>
              <button onClick={() => setShowMobileFilters(false)} className="text-xs text-slate-500 font-bold">Fechar ×</button>
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-700 mb-1.5">Categoria</p>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full h-10 px-3 bg-slate-50 border border-slate-200 text-xs outline-none"
              >
                <option value="Todos">Todas Categorias</option>
                {visibleCategories.filter(c => c.name !== 'Todos').map(cat => (
                  <option key={cat.id || cat.name} value={cat.name}>{cat.name}</option>
                ))}
              </select>
            </div>

            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="w-full py-2 bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200 transition"
              >
                Limpar Todos os Filtros
              </button>
            )}
          </div>
        )}

        {/* CARROSSEL DE PRODUTOS EM DESTAQUE (DESIGN LIMPO SEM FUNDO ESCURO) */}
        {featuredProducts.length > 0 && selectedCategory === 'Todos' && !searchTerm && (
          <div className="mb-14 p-6 sm:p-8 bg-white rounded-2xl border border-slate-200/90 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
              <div>
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2.5 py-0.5 rounded-full mb-2">
                  <Sparkles className="h-3 w-3" /> Seleção Especial
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                  Produtos em Destaque
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Equipamentos selecionados com entrega imediata ou prioridade de reserva em Angola.
                </p>
              </div>

              {/* Controlos do Carrossel */}
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={() => scrollCarousel('left')}
                  className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white hover:border-slate-300 text-slate-700 shadow-2xs hover:shadow-xs transition cursor-pointer"
                  title="Anterior"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => scrollCarousel('right')}
                  className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white hover:border-slate-300 text-slate-700 shadow-2xs hover:shadow-xs transition cursor-pointer"
                  title="Seguinte"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Trilho de Cards Deslizante */}
            <div
              ref={carouselRef}
              className="flex gap-5 overflow-x-auto pb-3 pt-1 scroll-smooth snap-x snap-mandatory [scrollbar-width:thin] [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-200 [&::-webkit-scrollbar-thumb]:rounded-full"
            >
              {featuredProducts.map((p) => (
                <div
                  key={`featured-${p.id}`}
                  className="w-[260px] sm:w-[280px] lg:w-[290px] shrink-0 snap-start flex flex-col"
                >
                  <ProductCard product={p as any} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* LAYOUT PRINCIPAL DO CATÁLOGO COMPLETO */}
        <div className="flex gap-8">
          {/* Sidebar Desktop */}
          <aside className="w-60 shrink-0 hidden md:block">
            <div className="bg-white border border-slate-200 sticky top-36">
              <div className="px-4 py-3 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Categorias</p>
              </div>
              <ul className="max-h-[40vh] overflow-y-auto">
                {visibleCategories.map((cat) => {
                  const Icon = iconMap[cat.icon] || Globe
                  const isActive = selectedCategory.toLowerCase() === cat.name.toLowerCase()

                  return (
                    <li key={cat.id || cat.name}>
                      <button
                        onClick={() => setSelectedCategory(cat.name)}
                        className={`w-full text-left px-4 py-2.5 flex items-center gap-2.5 text-xs transition ${
                          isActive
                            ? 'bg-primary/10 text-primary font-bold'
                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                      >
                        <Icon className="h-3.5 w-3.5 shrink-0" />
                        <span className="flex-1 truncate">{cat.name}</span>
                      </button>
                    </li>
                  )
                })}
              </ul>

              <div className="p-4 border-t border-slate-100">
                <p className="text-xs text-slate-500 leading-relaxed mb-3">
                  Precisa de uma cotação à medida?
                </p>
                <Link
                  href="/#contacto"
                  className="block text-center bg-slate-900 text-white py-2.5 text-xs font-semibold hover:bg-primary transition"
                >
                  Pedir Cotação
                </Link>
              </div>
            </div>
          </aside>

          {/* Grid de Todos os Produtos */}
          <div className="flex-1">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-slate-500 font-medium">
                Catálogo Geral de Equipamentos
                {selectedCategory !== 'Todos' && <span>, Categoria: <span className="font-semibold text-slate-900">{selectedCategory}</span></span>}
                {searchTerm && <span>, Pesquisa: "<span className="font-semibold text-slate-900">{searchTerm}</span>"</span>}
              </p>

              <div className="flex items-center gap-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="md:hidden px-3 py-1.5 border border-slate-200 bg-white text-xs outline-none text-slate-600 font-medium"
                >
                  <option value="relevance">Relevância</option>
                  <option value="price-asc">Menor Preço</option>
                  <option value="price-desc">Maior Preço</option>
                </select>
                <button
                  onClick={() => setShowMobileFilters(!showMobileFilters)}
                  className="md:hidden flex items-center gap-1.5 border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-600 font-medium"
                >
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                  Filtros
                </button>
              </div>
            </div>

            {/* Tags de Filtros Ativos */}
            {hasActiveFilters && (
              <div className="mb-4 flex flex-wrap items-center gap-2 bg-slate-100 p-2.5 rounded-xs border border-slate-200 text-xs">
                <span className="text-slate-500 font-semibold">Filtros ativos:</span>
                {selectedCategory !== 'Todos' && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-white border border-slate-200 text-slate-800 rounded-xs">
                    Cat: {selectedCategory}
                    <button onClick={() => setSelectedCategory('Todos')} className="text-slate-400 hover:text-slate-800 font-bold ml-1">×</button>
                  </span>
                )}
                {searchTerm && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-white border border-slate-200 text-slate-800 rounded-xs">
                    Busca: "{searchTerm}"
                    <button onClick={() => setSearchTerm('')} className="text-slate-400 hover:text-slate-800 font-bold ml-1">×</button>
                  </span>
                )}
                <button
                  onClick={clearAllFilters}
                  className="text-primary font-bold hover:underline ml-auto text-xs"
                >
                  Limpar tudo
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {sortedProducts.map(p => (
                <ProductCard key={p.id} product={p as any} />
              ))}
            </div>

            {sortedProducts.length === 0 && (
              <div className="py-20 text-center bg-white border border-slate-200">
                <p className="text-slate-900 font-semibold text-lg">Nenhum produto encontrado.</p>
                <p className="text-slate-500 text-sm mt-2">Tente ajustar a categoria ou os termos de busca.</p>
                <button
                  onClick={clearAllFilters}
                  className="mt-6 bg-primary text-white px-6 py-2.5 text-sm font-medium hover:bg-primary/90 transition shadow-sm"
                >
                  Limpar filtros
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
