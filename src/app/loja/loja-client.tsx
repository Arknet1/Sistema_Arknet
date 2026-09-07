'use client'

import { useState, useEffect } from "react"
import Image from "next/image"
import {
  Search, Wifi, Globe, Cloud, Cpu, MessageSquare, Shield, Wrench, ArrowRight,
  SlidersHorizontal, Store, Printer, HardDrive, ShieldCheck, Zap, Cable, Droplets,
  Package, Layers, Monitor, Headphones, Smartphone, Tv, Camera, Server, Laptop, Usb, Boxes,
  Sparkles
} from "lucide-react"
import Link from "next/link"
import ProductCard from "@/components/product-card"
import { dataStore, StoreProduct, ProductCategory } from "@/lib/data-store"
import jmatosIcon from "@/assets/icon18.png"

const iconMap: Record<string, React.ElementType> = {
  Globe, Wifi, Cloud, Cpu, MessageSquare, Shield, Wrench,
  Store, Printer, HardDrive, ShieldCheck, Zap, Cable, Droplets, Package,
  Layers, Monitor, Headphones, Smartphone, Tv, Camera, Server, Laptop, Usb, Boxes,
}

export default function LojaClient() {
  const [products, setProducts] = useState<StoreProduct[]>([])
  const [categories, setCategories] = useState<ProductCategory[]>([])
  const [selectedCategory, setSelectedCategory] = useState('Todos')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('relevance')
  const [showMobileFilters, setShowMobileFilters] = useState(false)

  useEffect(() => {
    const sync = () => {
      const db = dataStore.getSnapshot()
      setProducts([...db.products])
      setCategories([...db.categories].sort((a, b) => a.order - b.order))
    }
    sync()
    const unsub = dataStore.subscribe(sync)
    return () => unsub()
  }, [])

  // Filtrar categorias que têm hideWhenEmpty === true e 0 produtos
  const visibleCategories = categories.filter((c) => {
    if (c.name === 'Todos') return true
    if (c.hideWhenEmpty) {
      const count = products.filter((p) => p.category.toLowerCase() === c.name.toLowerCase()).length
      return count > 0
    }
    return true
  })

  const filteredProducts = products.filter(p => {
    const matchesCategory = selectedCategory === 'Todos' || p.category.toLowerCase() === selectedCategory.toLowerCase()
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
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

      {/* Clean page header */}
      <div className="bg-slate-950 text-white">
        <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <p className="text-xs font-bold text-primary uppercase tracking-[0.25em] mb-4">Loja Online ARKNET</p>
            <div className="flex items-center gap-4 mb-2">
              <Image src={jmatosIcon} alt="ARKNET Angola — Equipamentos de TI e Redes" width={120} height={120} className="h-10 w-auto object-contain" />
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white mt-2">
              Equipamentos de TI, Redes e Telecomunicações em Angola
            </h1>
            <p className="mt-3 text-slate-400 text-sm max-w-xl leading-relaxed">
              Equipamentos e soluções tecnológicas ARKNET — telecomunicações, redes estruturadas, segurança e conectividade para a sua empresa com entrega em Luanda e em todo o país.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4 shrink-0">
            <Link
              href="/#contacto"
              className="inline-flex items-center gap-2 bg-secondary px-6 py-3 text-sm font-semibold text-white hover:bg-secondary/90 transition shadow-sm"
            >
              Pedir Cotação de Equipamentos
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

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

        {/* SECÇÃO ADICIONAL: PRODUTOS EM DESTAQUE */}
        {featuredProducts.length > 0 && selectedCategory === 'Todos' && !searchTerm && (
          <div className="mb-14 p-6 sm:p-8 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 text-white rounded-2xl border border-slate-800 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-white/10">
              <div>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-primary bg-primary/20 px-2.5 py-0.5 rounded-full mb-2">
                  <Sparkles className="h-3 w-3" /> Seleção Especial
                </span>
                <h2 className="text-2xl font-black text-white">Produtos em Destaque</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Equipamentos e soluções mais requisitadas com disponibilidade imediata.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {featuredProducts.slice(0, 8).map(p => (
                <div key={`featured-${p.id}`} className="bg-white rounded-xl overflow-hidden shadow-md text-slate-900">
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
                {selectedCategory !== 'Todos' && <span> — Categoria: <span className="font-semibold text-slate-900">{selectedCategory}</span></span>}
                {searchTerm && <span> — Pesquisa: "<span className="font-semibold text-slate-900">{searchTerm}</span>"</span>}
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
