'use client'

import { useState } from "react"
import Image from "next/image"
import { Search, Wifi, Globe, Cloud, Cpu, MessageSquare, Shield, Wrench, ArrowRight, SlidersHorizontal, Store, Printer, HardDrive, ShieldCheck, Zap, Cable, Droplets, Package, Layers, Monitor, Headphones, Smartphone, Tv, Camera, Server, Laptop, Usb, Boxes } from "lucide-react"
import Link from "next/link"
import ProductCard from "@/components/product-card"
import { mockProducts, mockCategories } from "@/lib/mock-data"
import jmatosIcon from "@/assets/jmatos.png"

const iconMap: Record<string, React.ElementType> = {
  Globe, Wifi, Cloud, Cpu, MessageSquare, Shield, Wrench,
  Store, Printer, HardDrive, ShieldCheck, Zap, Cable, Droplets, Package,
  Layers, Monitor, Headphones, Smartphone, Tv, Camera, Server, Laptop, Usb, Boxes,
}

export default function LojaPage() {
  const [selectedCategory, setSelectedCategory] = useState('Todos')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('relevance')

  const filteredProducts = mockProducts.filter(p => {
    const matchesCategory = selectedCategory === 'Todos' || p.category === selectedCategory
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

  const featuredProducts = mockProducts.filter(p => p.inStock).slice(0, 4)
  const showFeatured = selectedCategory === 'Todos' && !searchTerm

  return (
    <main className="min-h-screen bg-background pt-20">

      {/* Clean page header */}
      <div className="bg-slate-950 text-white">
        <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <p className="text-xs font-bold text-primary uppercase tracking-[0.25em] mb-4">— Loja Online</p>
            <div className="flex items-center gap-4 mb-2">
              <Image src={jmatosIcon} alt="JMatos" width={120} height={120} className="object-contain" />
            </div>
            <p className="mt-3 text-slate-400 text-sm max-w-md leading-relaxed">
              Produtos e serviços JMatos — tecnologia, segurança e equipamentos para o seu negócio.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4 shrink-0">
            <Link
              href="/#contacto"
              className="inline-flex items-center gap-2 bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary/90 transition"
            >
              Pedir Cotação
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Category tabs */}
      <div className="bg-white border-b border-slate-200 sticky top-20 z-30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-0 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {mockCategories.map((cat) => {
              const Icon = iconMap[cat.icon] || Globe
              const isActive = selectedCategory === cat.name
              return (
                <button
                  key={cat.name}
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`flex items-center gap-2 px-4 py-3.5 text-sm font-medium whitespace-nowrap transition-all border-b-2 ${
                    isActive
                      ? 'border-primary text-primary'
                      : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {cat.name}
                  <span className={`text-xs font-bold tabular-nums ${isActive ? 'text-primary' : 'text-slate-400'}`}>
                    {cat.name === 'Todos' ? mockProducts.length : mockProducts.filter(p => p.category === cat.name).length}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* Search bar */}
        <div className="mb-8 flex items-stretch bg-white border border-slate-200">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="h-12 px-4 bg-slate-50 border-r border-slate-200 text-sm outline-none text-slate-700 min-w-[150px] hidden sm:block"
          >
            <option value="Todos">Todas Categorias</option>
            {mockCategories.slice(1).map(cat => (
              <option key={cat.name} value={cat.name}>{cat.name}</option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Buscar produtos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 h-12 px-5 outline-none text-sm text-slate-900 placeholder:text-slate-400"
          />
          <button className="bg-primary h-12 px-6 text-white hover:bg-primary/90 transition flex items-center gap-2 text-sm font-medium shrink-0">
            <Search className="h-4 w-4" />
            <span className="hidden sm:inline">Buscar</span>
          </button>
          <div className="hidden md:flex items-center border-l border-slate-200">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="h-12 px-5 bg-white text-sm outline-none text-slate-600 cursor-pointer"
            >
              <option value="relevance">Relevância</option>
              <option value="price-asc">Menor Preço</option>
              <option value="price-desc">Maior Preço</option>
            </select>
          </div>
        </div>

        {/* Featured */}
        {showFeatured && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-slate-900">Produtos em Destaque</h2>
              <span className="text-xs text-slate-400">{featuredProducts.length} produtos</span>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {featuredProducts.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
            <div className="mt-6 border-t border-slate-100" />
          </div>
        )}

        <div className="flex gap-8">
          {/* Sidebar */}
          <aside className="w-56 shrink-0 hidden md:block">
            <div className="bg-white border border-slate-200 sticky top-36">
              <div className="px-4 py-3 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Categorias</p>
              </div>
              <ul>
                {mockCategories.map((cat) => {
                  const Icon = iconMap[cat.icon] || Globe
                  const isActive = selectedCategory === cat.name
                  return (
                    <li key={cat.name}>
                      <button
                        onClick={() => setSelectedCategory(cat.name)}
                        className={`w-full text-left px-4 py-2.5 flex items-center gap-2.5 text-sm transition ${
                          isActive
                            ? 'bg-primary/5 text-primary font-semibold'
                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                      >
                        <Icon className="h-3.5 w-3.5 shrink-0" />
                        <span className="flex-1">{cat.name}</span>
                        <span className="text-xs tabular-nums text-slate-400">
                          {cat.name === 'Todos' ? mockProducts.length : mockProducts.filter(p => p.category === cat.name).length}
                        </span>
                      </button>
                    </li>
                  )
                })}
              </ul>

              <div className="p-4 border-t border-slate-100">
                <p className="text-xs text-slate-500 leading-relaxed mb-3">
                  Precisa de uma solução à medida?
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

          {/* Products grid */}
          <div className="flex-1">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-slate-500">
                <span className="font-semibold text-slate-900">{sortedProducts.length}</span> produtos
                {selectedCategory !== 'Todos' && <span> em <span className="font-semibold text-slate-900">{selectedCategory}</span></span>}
                {searchTerm && <span> para "<span className="font-semibold text-slate-900">{searchTerm}</span>"</span>}
              </p>
              <div className="flex items-center gap-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="md:hidden px-3 py-1.5 border border-slate-200 bg-white text-xs outline-none text-slate-600"
                >
                  <option value="relevance">Relevância</option>
                  <option value="price-asc">Menor Preço</option>
                  <option value="price-desc">Maior Preço</option>
                </select>
                <button
                  onClick={() => setSelectedCategory('Todos')}
                  className="md:hidden flex items-center gap-1.5 border border-slate-200 px-3 py-1.5 text-xs text-slate-600"
                >
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                  Filtros
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {sortedProducts.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>

            {sortedProducts.length === 0 && (
              <div className="py-20 text-center">
                <p className="text-slate-900 font-semibold text-lg">Nenhum produto encontrado.</p>
                <p className="text-slate-500 text-sm mt-2">Tente outros termos ou escolha outra categoria.</p>
                <button
                  onClick={() => { setSearchTerm(''); setSelectedCategory('Todos') }}
                  className="mt-6 bg-slate-900 text-white px-6 py-2.5 text-sm font-medium hover:bg-primary transition"
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
