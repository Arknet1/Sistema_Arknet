'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowRight, ShoppingBag } from 'lucide-react'
import ProductCard from '@/components/product-card'
import { dataStore, StoreProduct } from '@/lib/data-store'

export default function FeaturedProducts() {
  const [products, setProducts] = useState<StoreProduct[]>([])

  useEffect(() => {
    const sync = () => {
      const db = dataStore.getSnapshot()
      // Filtrar apenas produtos marcados explicitamente como em destaque
      const featured = db.products.filter((p) => Boolean(p.featured))
      setProducts(featured.slice(0, 10))
    }
    sync()
    const unsub = dataStore.subscribe(sync)
    return () => unsub()
  }, [])

  if (products.length === 0) return null

  // Garantir itens suficientes para a rotação contínua (Marquee)
  const repeatCount = Math.max(2, Math.ceil(12 / products.length))
  const doubledProducts = Array.from({ length: repeatCount }).flatMap(() => products)

  return (
    <section className="py-24 bg-slate-50 border-t border-b border-slate-200/80 overflow-hidden">
      <div className="mx-auto max-w-7xl px-6">

        {/* Cabeçalho Editorial Limpo e Direto */}
        <div className="mb-14 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 leading-[1.1]">
              Produtos em Destaque
            </h2>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <p className="hidden md:block text-sm text-slate-500 max-w-xs text-right leading-relaxed">
              Equipamentos de redes, telecomunicações e infraestrutura prontos a entregar em Angola.
            </p>

            <Link
              href="/loja"
              className="inline-flex items-center gap-2 bg-slate-900 hover:bg-primary text-white text-xs font-bold uppercase tracking-wider px-6 py-3.5 rounded-lg shadow-sm transition-colors group"
            >
              <ShoppingBag className="h-4 w-4" />
              <span>Ver Loja</span>
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Carrossel Marquee Infinito */}
        <div className="relative overflow-hidden -mx-6 px-6">
          {/* Sombras/Sfumato de transição nas pontas */}
          <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-24 z-10 bg-gradient-to-r from-slate-50 to-transparent pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-24 z-10 bg-gradient-to-l from-slate-50 to-transparent pointer-events-none" />

          {/* Trilho de rotação contínua */}
          <div className="flex animate-marquee-slow hover:[animation-play-state:paused] py-3">
            {doubledProducts.map((product, idx) => (
              <div
                key={`${product.id}-${idx}`}
                className="w-[280px] sm:w-[320px] shrink-0 mx-3 flex flex-col"
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
