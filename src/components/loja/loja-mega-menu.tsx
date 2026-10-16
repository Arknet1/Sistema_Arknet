'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronRight,
  ArrowRight,
  Sparkles,
  ShoppingBag,
  Package,
  Layers,
  X,
} from 'lucide-react'
import { ProductCategory, StoreProduct } from '@/lib/data-store'
import { getCategoryIcon } from './category-icons'
import { isCategoryMatch } from '@/lib/loja-category-utils'
import { formatProdutoPrice } from '@/lib/format-produto-price'

interface LojaMegaMenuProps {
  isOpen: boolean
  onClose: () => void
  categories: ProductCategory[]
  products: StoreProduct[]
}

export default function LojaMegaMenu({
  isOpen,
  onClose,
  categories,
  products,
}: LojaMegaMenuProps) {
  const [activeCategory, setActiveCategory] = useState<string>('')
  const menuRef = useRef<HTMLDivElement>(null)

  // Filtrar categorias (remover 'Todos' se presente, para listar categorias específicas)
  const displayCategories = categories.filter((c) => c.name !== 'Todos')

  // Definir primeira categoria como ativa inicialmente
  useEffect(() => {
    if (displayCategories.length > 0 && !activeCategory) {
      setActiveCategory(displayCategories[0].name)
    }
  }, [displayCategories, activeCategory])

  // Fechar com a tecla Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
    }
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  // Produtos correspondentes à categoria ativa no painel direito
  const categoryProducts = products
    .filter((p) => isCategoryMatch(p.category, activeCategory))
    .slice(0, 4)

  const activeCategoryObj = displayCategories.find((c) => c.name === activeCategory)
  const totalInCategory = products.filter((p) => isCategoryMatch(p.category, activeCategory)).length

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop Transparente / Blur para capturar cliques fora */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
            className="fixed inset-0 top-[118px] sm:top-[128px] bg-slate-900/20 backdrop-blur-xs z-30"
            aria-hidden="true"
          />

          {/* Painel do Mega Menu */}
          <motion.div
            ref={menuRef}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="absolute left-0 right-0 top-full bg-white border-b border-slate-200/90 shadow-2xl z-40 overflow-hidden"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                  <Layers className="h-4 w-4 text-primary" />
                  <span>Catálogo de Equipamentos J.Matos Tecnologia</span>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                  title="Fechar menu"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[360px]">
                {/* COLUNA ESQUERDA: Lista de Categorias (4 colunas) */}
                <div className="lg:col-span-4 border-r border-slate-100 pr-4 space-y-1 overflow-y-auto max-h-[420px] [scrollbar-width:thin]">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 pb-1">
                    Selecione uma Categoria
                  </p>

                  <Link
                    href="/loja"
                    onClick={onClose}
                    className="flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:text-primary hover:bg-primary/5 transition group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-lg bg-slate-100 group-hover:bg-primary/10 group-hover:text-primary text-slate-600 transition">
                        <ShoppingBag className="h-3.5 w-3.5" />
                      </div>
                      <span>Todos os Produtos</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-semibold px-2 py-0.5 rounded-full bg-slate-100">
                      {products.length}
                    </span>
                  </Link>

                  {displayCategories.map((cat) => {
                    const Icon = getCategoryIcon(cat.icon)
                    const isSelected = activeCategory === cat.name
                    const count = products.filter((p) => isCategoryMatch(p.category, cat.name)).length

                    return (
                      <div
                        key={cat.id || cat.name}
                        onMouseEnter={() => setActiveCategory(cat.name)}
                        className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-primary/10 text-primary font-bold shadow-2xs'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                        }`}
                      >
                        <Link
                          href={`/loja?categoria=${encodeURIComponent(cat.name)}`}
                          onClick={onClose}
                          className="flex items-center gap-2.5 flex-1 min-w-0"
                        >
                          <div
                            className={`p-1.5 rounded-lg transition ${
                              isSelected
                                ? 'bg-primary text-white shadow-2xs'
                                : 'bg-slate-100 text-slate-500'
                            }`}
                          >
                            <Icon className="h-3.5 w-3.5" />
                          </div>
                          <span className="truncate">{cat.name}</span>
                        </Link>

                        <div className="flex items-center gap-1.5 shrink-0 ml-2">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              isSelected
                                ? 'bg-primary/20 text-primary'
                                : 'bg-slate-100 text-slate-400'
                            }`}
                          >
                            {count}
                          </span>
                          <ChevronRight
                            className={`h-3.5 w-3.5 transition-transform ${
                              isSelected ? 'text-primary translate-x-0.5' : 'text-slate-300'
                            }`}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* COLUNA DIREITA: Showcase Dinâmico de Produtos da Categoria (8 colunas) */}
                <div className="lg:col-span-8 flex flex-col justify-between pl-2">
                  <div>
                    {/* Cabeçalho da Categoria Selecionada */}
                    <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
                      <div>
                        <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                          <span>{activeCategory || 'Destaques'}</span>
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-normal">
                            {totalInCategory} equipamentos disponíveis
                          </span>
                        </h4>
                        {activeCategoryObj?.description && (
                          <p className="text-xs text-slate-500 mt-0.5">
                            {activeCategoryObj.description}
                          </p>
                        )}
                      </div>

                      <Link
                        href={`/loja?categoria=${encodeURIComponent(activeCategory)}`}
                        onClick={onClose}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primary/80 transition"
                      >
                        Ver todos
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>

                    {/* Grade de Produtos Destacados da Categoria */}
                    {categoryProducts.length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                        {categoryProducts.map((p) => {
                          const priceDisplay = formatProdutoPrice(p.price)
                          const hasStock = p.inStock !== false

                          return (
                            <Link
                              key={p.id}
                              href={`/loja/${p.id}`}
                              onClick={onClose}
                              className="group flex flex-col p-3 rounded-2xl bg-white border border-slate-200/80 hover:border-primary/40 hover:shadow-md transition-all"
                            >
                              {/* Imagem do Produto */}
                              <div className="relative h-28 w-full rounded-xl bg-slate-50 overflow-hidden flex items-center justify-center p-2 mb-2 group-hover:bg-slate-100/80 transition">
                                {p.image ? (
                                  <Image
                                    src={p.image}
                                    alt={p.name}
                                    fill
                                    sizes="(max-width: 768px) 140px, 180px"
                                    className="object-contain p-1 group-hover:scale-105 transition-transform duration-300"
                                  />
                                ) : (
                                  <Package className="h-8 w-8 text-slate-300" />
                                )}

                                {!hasStock && (
                                  <span className="absolute top-1 right-1 text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-slate-900 text-white">
                                    Sob Consulta
                                  </span>
                                )}
                              </div>

                              {/* Título & Marca */}
                              <div className="flex-1 min-w-0">
                                {p.brand && (
                                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block truncate">
                                    {p.brand}
                                  </span>
                                )}
                                <h5 className="text-xs font-bold text-slate-800 group-hover:text-primary transition line-clamp-2 leading-snug">
                                  {p.name}
                                </h5>
                              </div>

                              {/* Preço */}
                              <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between">
                                <span className="text-xs font-extrabold text-slate-900">
                                  {priceDisplay}
                                </span>
                                <span className="p-1 rounded-full bg-slate-100 text-slate-500 group-hover:bg-primary group-hover:text-white transition">
                                  <ChevronRight className="h-3 w-3" />
                                </span>
                              </div>
                            </Link>
                          )
                        })}
                      </div>
                    ) : (
                      <div className="py-12 text-center bg-slate-50/60 rounded-2xl border border-dashed border-slate-200">
                        <Package className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                        <p className="text-xs font-bold text-slate-600">
                          Nenhum equipamento em exibição imediata nesta categoria
                        </p>
                        <p className="text-[11px] text-slate-400 mt-1">
                          Consulte os nossos consultores técnicos para orçamentos à medida.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Banner Rodapé do Mega Menu */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/80 px-4 py-2.5 rounded-xl">
                    <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
                      <Sparkles className="h-4 w-4 text-secondary shrink-0" />
                      <span>Equipamentos com garantia oficial e suporte técnico em Angola</span>
                    </div>

                    <a
                      href="https://wa.me/244935208449?text=Loja%20J.Matos%20Tecnologia:%20Ol%C3%A1!%20Gostaria%20de%20solicitar%20uma%20cota%C3%A7%C3%A3o%20especial%20de%20equipamentos"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-bold text-emerald-700 hover:text-emerald-800 transition flex items-center gap-1.5 shrink-0"
                    >
                      Solicitar Cotação em Lote →
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
