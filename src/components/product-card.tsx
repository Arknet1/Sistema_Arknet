'use client'

import { useState } from "react"
import Link from "next/link"
import { ShoppingCart, Trash2 } from "lucide-react"
import { Product } from "@/lib/cart"
import { useCart } from "@/lib/cart"
import { formatProdutoPrice } from "@/lib/format-produto-price"

type ProductCardProps = {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const { items, addItem, removeItem } = useCart()
  const [isAdding, setIsAdding] = useState(false)

  const isInCart = items.some(item => item.product.id === product.id)

  const handleAddToCart = async () => {
    if (product.inStock === false || isAdding) return
    setIsAdding(true)
    await new Promise(resolve => setTimeout(resolve, 300))
    addItem(product)
    setIsAdding(false)
  }

  return (
    <div className="group bg-white border border-slate-200 hover:shadow-md transition-shadow duration-200 overflow-hidden flex flex-col h-full min-w-0">

      {/* Image — aspect ratio scales with column width */}
      <Link
        href={`/loja/${product.id}`}
        className="block relative overflow-hidden bg-slate-100 w-full shrink-0 aspect-5/4 min-h-30 sm:min-h-40 sm:aspect-4/3"
      >
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <ShoppingCart className="h-8 w-8 sm:h-10 sm:w-10 text-slate-300" />
          </div>
        )}

        {product.inStock === false && (
          <span className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 bg-slate-800 text-white text-[10px] sm:text-xs font-semibold px-2 py-0.5 sm:px-2.5 sm:py-1">
            Esgotado
          </span>
        )}
      </Link>

      {/* Content */}
      <div className="p-3 sm:p-4 flex flex-col flex-1 min-h-0">
        {product.category && (
          <p className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-wide font-medium mb-1 line-clamp-1">
            {product.category}
          </p>
        )}

        <Link href={`/loja/${product.id}`} className="flex-1 min-h-0">
          <h3 className="text-[13px] sm:text-sm font-semibold text-slate-900 group-hover:text-primary transition-colors line-clamp-2 leading-snug">
            {product.name}
          </h3>
        </Link>

        <p className="mt-1.5 sm:mt-2 text-[11px] sm:text-xs text-slate-500 line-clamp-2 sm:line-clamp-3 leading-relaxed">
          {product.description}
        </p>

        <div className="mt-auto pt-2.5 sm:pt-3 border-t border-slate-100 flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-2">
          <p className="text-base sm:text-lg font-extrabold text-slate-900 tabular-nums leading-none">
            {formatProdutoPrice(product.price)}
          </p>

          {isInCart ? (
            <button
              onClick={() => removeItem(product.id)}
              className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 transition shrink-0 self-end sm:self-auto"
              title="Remover do carrinho"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={handleAddToCart}
              disabled={product.inStock === false || isAdding}
              className="w-full sm:w-auto justify-center sm:justify-start inline-flex items-center gap-1.5 bg-slate-900 text-white px-3 py-2 sm:py-2 text-[11px] sm:text-xs font-semibold hover:bg-primary transition-colors disabled:opacity-40 disabled:cursor-not-allowed min-h-9 sm:min-h-0"
            >
              {isAdding ? (
                <div className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <ShoppingCart className="h-3.5 w-3.5 shrink-0" />
              )}
              <span className="truncate">
                {product.inStock === false ? 'Esgotado' : isAdding ? '…' : 'Adicionar'}
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
