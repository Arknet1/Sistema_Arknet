'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { ArrowRight, ShoppingBag, ChevronLeft, ChevronRight } from 'lucide-react'
import ProductCard from '@/components/product-card'
import { dataStore, StoreProduct } from '@/lib/data-store'

export default function FeaturedProducts() {
  const [products, setProducts] = useState<StoreProduct[]>(() => {
    const all = dataStore.getProducts()
    const featured = all.filter((p) => Boolean(p.featured))
    return featured.length > 0 ? featured.slice(0, 10) : all.slice(0, 8)
  })
  const trackRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const sync = () => {
      const all = dataStore.getProducts()
      const featured = all.filter((p) => Boolean(p.featured))
      setProducts(featured.length > 0 ? featured.slice(0, 10) : all.slice(0, 8))
    }
    sync()
    const unsub = dataStore.subscribe(sync)
    return () => unsub()
  }, [])

  if (products.length === 0) return null

  const scroll = (direction: 'left' | 'right') => {
    if (trackRef.current) {
      const scrollAmount = direction === 'left' ? -320 : 320
      trackRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' })
    }
  }

  return (
    <section className="py-16 sm:py-24 bg-white border-t border-slate-200/80 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">

        {/* Cabeçalho Editorial Limpo e Direto */}
        <div className="mb-8 sm:mb-12 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2.5 py-1 rounded-full inline-block mb-2">
              Destaques Selecionados
            </span>
            <h2 className="text-[clamp(1.75rem,4vw,2.75rem)] font-extrabold text-slate-900 leading-[1.1]">
              Produtos em Destaque
            </h2>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            {/* Setas de navegação com touch target mínimo 44x44px */}
            <div className="flex items-center gap-1.5 mr-2">
              <button
                type="button"
                onClick={() => scroll('left')}
                className="min-w-[44px] min-h-[44px] rounded-lg border border-slate-200 bg-slate-50 hover:bg-white text-slate-700 flex items-center justify-center transition shadow-2xs"
                title="Produto anterior"
                aria-label="Produto anterior"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => scroll('right')}
                className="min-w-[44px] min-h-[44px] rounded-lg border border-slate-200 bg-slate-50 hover:bg-white text-slate-700 flex items-center justify-center transition shadow-2xs"
                title="Próximo produto"
                aria-label="Próximo produto"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            <Link
              href="/loja"
              className="min-h-[44px] inline-flex items-center gap-2 bg-slate-900 hover:bg-primary text-white text-xs font-bold uppercase tracking-wider px-5 py-3 rounded-lg shadow-sm transition-colors group"
            >
              <ShoppingBag className="h-4 w-4" />
              <span>Ver Loja</span>
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Carrossel Deslizante com Scroll-Snap e Swipe Tátil Nativo */}
        <div className="relative">
          <div
            ref={trackRef}
            className="flex gap-4 sm:gap-6 overflow-x-auto pb-4 pt-1 scroll-smooth snap-x snap-mandatory [scrollbar-width:thin] [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-200 [&::-webkit-scrollbar-thumb]:rounded-full"
            tabIndex={0}
            role="region"
            aria-label="Carrossel de produtos em destaque"
          >
            {products.map((product) => (
              <div
                key={product.id}
                className="w-[260px] sm:w-[280px] lg:w-[310px] shrink-0 snap-start flex flex-col"
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  )
}
