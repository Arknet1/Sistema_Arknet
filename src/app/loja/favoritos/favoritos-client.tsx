'use client'

import React from 'react'
import Link from 'next/link'
import {
  Heart,
  ShoppingCart,
  Trash2,
  ArrowLeft,
  ChevronRight,
  Sparkles,
  ShoppingBag,
  ExternalLink,
  Check,
} from 'lucide-react'
import { useWishlist } from '@/lib/wishlist-store'
import { useCart } from '@/lib/cart'
import { formatProdutoPrice } from '@/lib/format-produto-price'
import ProductCard from '@/components/product-card'
import { useToast } from '@/lib/toast-context'

export default function FavoritosClient() {
  const { items, count, removeFromWishlist, clearWishlist } = useWishlist()
  const { addItem } = useCart()
  const { success, info } = useToast()

  const handleAddAllToCart = () => {
    if (items.length === 0) return
    items.forEach((product) => {
      if (product.inStock !== false) {
        addItem(product as any)
      }
    })
    success('Todos os produtos disponíveis foram adicionados ao seu carrinho!', 'Carrinho Atualizado')
  }

  return (
    <main className="min-h-screen pt-28 pb-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 text-xs text-slate-500">
          <Link href="/" className="hover:text-primary transition">Início</Link>
          <ChevronRight className="h-3 w-3 text-slate-400" />
          <Link href="/loja" className="hover:text-primary transition">Loja Online</Link>
          <ChevronRight className="h-3 w-3 text-slate-400" />
          <span className="text-slate-900 font-bold">Os Meus Favoritos ({count})</span>
        </nav>

        {/* Header Bar */}
        <div className="bg-white border border-slate-200 p-6 sm:p-8 rounded-xl shadow-xs mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-rose-50 text-rose-600 rounded-xl border border-rose-100">
                <Heart className="h-6 w-6 fill-current" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
                  Lista de Desejos &amp; Favoritos
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                  Artigos e equipamentos guardados para consulta rápida ou compra futura.
                </p>
              </div>
            </div>
          </div>

          {items.length > 0 && (
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={clearWishlist}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold uppercase rounded transition"
              >
                Limpar Lista
              </button>

              <button
                type="button"
                onClick={handleAddAllToCart}
                className="px-5 py-2.5 bg-primary hover:bg-primary/90 text-white text-xs font-bold uppercase rounded shadow-xs transition flex items-center gap-2"
              >
                <ShoppingCart className="h-4 w-4" />
                <span>Adicionar Todos ao Carrinho</span>
              </button>
            </div>
          )}
        </div>

        {/* Content Body */}
        {items.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-12 text-center shadow-xs max-w-lg mx-auto">
            <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-rose-100">
              <Heart className="h-8 w-8" />
            </div>
            <h2 className="text-xl font-black text-slate-900">A sua lista de favoritos está vazia</h2>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Explore o nosso catálogo de equipamentos de rede, servidores e telecomunicações e clique no ícone ❤️ para guardar os seus artigos preferidos.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <Link
                href="/loja"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white text-xs font-bold uppercase rounded shadow-sm hover:bg-primary/90 transition"
              >
                <ShoppingBag className="h-4 w-4" />
                <span>Explorar a Loja Online</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {items.map((prod) => (
              <ProductCard key={prod.id} product={prod as any} />
            ))}
          </div>
        )}

      </div>
    </main>
  )
}
