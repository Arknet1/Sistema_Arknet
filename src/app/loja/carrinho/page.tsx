'use client'

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Plus, Minus, Trash2, ArrowLeft, ShoppingCart } from "lucide-react"
import { useCart } from "@/lib/cart"
import { formatLinhaPreco, formatProdutoPrice } from "@/lib/format-produto-price"

export default function CarrinhoPage() {
  const router = useRouter()
  const { items, total, itemCount, updateQuantity, removeItem, clearCart } = useCart()

  if (itemCount === 0) {
    return (
      <main className="min-h-screen pt-32 pb-20 bg-background">
        <div className="max-w-lg mx-auto px-6 text-center">
          <div className="mb-6 inline-flex h-20 w-20 items-center justify-center bg-slate-100 mx-auto">
            <ShoppingCart className="h-9 w-9 text-slate-400" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">O carrinho está vazio</h1>
          <p className="mt-3 text-slate-500 text-sm">Adicione produtos da nossa loja para continuar.</p>
          <Link
            href="/loja"
            className="mt-8 inline-flex items-center gap-2 bg-slate-900 text-white px-8 py-3 text-sm font-semibold hover:bg-primary transition"
          >
            <ArrowLeft className="h-4 w-4" />
            Ver Produtos
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen pt-24 pb-20 bg-background">
      <div className="max-w-7xl mx-auto px-6">

        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <Link href="/loja" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-primary transition mb-3">
              <ArrowLeft className="h-4 w-4" />
              Continuar a comprar
            </Link>
            <h1 className="text-3xl font-extrabold text-slate-900">Carrinho</h1>
            <p className="mt-1 text-sm text-slate-500">{itemCount} {itemCount === 1 ? 'item' : 'itens'}</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">

          {/* Items */}
          <div className="lg:col-span-8 space-y-3">
            {items.map((item) => (
              <div key={item.product.id} className="bg-white border border-slate-200 p-5 flex items-center gap-5">
                <div className="h-20 w-20 bg-slate-50 shrink-0 overflow-hidden">
                  {item.product.image ? (
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center">
                      <ShoppingCart className="h-6 w-6 text-slate-300" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <Link href={`/loja/${item.product.id}`} className="text-sm font-semibold text-slate-900 hover:text-primary transition line-clamp-1">
                    {item.product.name}
                  </Link>
                  {item.product.category && (
                    <p className="text-xs text-slate-400 mt-0.5">{item.product.category}</p>
                  )}
                  <p className="text-base font-bold text-slate-900 mt-1.5">
                    {formatLinhaPreco(item.product.price, item.quantity)}
                  </p>
                </div>

                {/* Quantity */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                    className="h-7 w-7 flex items-center justify-center border border-slate-200 hover:border-slate-400 transition text-slate-600"
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className="w-7 text-center text-sm font-semibold">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                    className="h-7 w-7 flex items-center justify-center border border-slate-200 hover:border-slate-400 transition text-slate-600"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>

                <button
                  onClick={() => removeItem(item.product.id)}
                  className="text-slate-300 hover:text-red-500 transition shrink-0"
                  title="Remover"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="lg:col-span-4">
            <div className="bg-white border border-slate-200 p-7 sticky top-24">
              <h2 className="text-base font-bold text-slate-900 mb-5">Resumo do Pedido</h2>

              <ul className="space-y-3">
                {items.map((item) => (
                  <li key={item.product.id} className="flex justify-between text-sm">
                    <span className="text-slate-500 truncate pr-4">{item.product.name} ×{item.quantity}</span>
                    <span className="font-semibold text-slate-900 shrink-0">
                      {formatLinhaPreco(item.product.price, item.quantity)}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-5 pt-5 border-t border-slate-200 flex justify-between items-center">
                <span className="font-semibold text-slate-900">Total</span>
                <span className="text-2xl font-extrabold text-slate-900">
                  {total === null ? '-' : formatProdutoPrice(total)}
                </span>
              </div>

              <button
                onClick={() => router.push('/loja/checkout')}
                className="mt-6 w-full bg-secondary py-4 text-sm font-bold text-white hover:bg-secondary/90 transition tracking-wide"
              >
                Finalizar Compra
              </button>

              <button
                onClick={clearCart}
                className="mt-3 w-full py-2.5 text-xs text-slate-400 hover:text-slate-600 transition"
              >
                Limpar Carrinho
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
