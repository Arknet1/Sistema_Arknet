'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, ShoppingCart, Trash2, Check, Phone } from "lucide-react"
import { useCart } from "@/lib/cart"
import { mockProducts } from "@/lib/mock-data"
import { formatProdutoPrice } from "@/lib/format-produto-price"

const monthlyCategories = ['Internet', 'Hosting', 'Cloud', 'Comunicações']

export default function ProductDetailPageClient({ id }: { id: string }) {
  const router = useRouter()
  const { items, addItem, removeItem } = useCart()
  const [isAdding, setIsAdding] = useState(false)

  const product = mockProducts.find(p => p.id === id)
  const isInCart = product ? items.some(item => item.product.id === product.id) : false
  const isMonthly = product ? monthlyCategories.includes(product.category) && product.price != null : false

  const handleAddToCart = async () => {
    if (!product || isAdding) return
    setIsAdding(true)
    await new Promise(resolve => setTimeout(resolve, 300))
    addItem(product)
    setIsAdding(false)
    router.push('/loja/carrinho')
  }

  if (!product) {
    return (
      <main className="min-h-screen pt-32 pb-20 bg-background">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-slate-500 text-lg">Produto não encontrado.</p>
          <Link href="/loja" className="mt-6 inline-flex items-center gap-2 text-sm text-primary hover:underline">
            <ArrowLeft className="h-4 w-4" />
            Voltar para a Loja
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen pt-24 pb-20 bg-background">
      <div className="max-w-7xl mx-auto px-6">

        {/* Breadcrumb */}
        <nav className="mb-8 flex items-center gap-2 text-sm text-slate-500">
          <Link href="/loja" className="hover:text-primary transition">Loja</Link>
          <span>/</span>
          <span className="text-slate-400">{product.category}</span>
          <span>/</span>
          <span className="text-slate-900 font-medium truncate max-w-xs">{product.name}</span>
        </nav>

        <div className="grid md:grid-cols-2 gap-12 items-start">

          {/* Image */}
          <div className="bg-white border border-slate-200 overflow-hidden">
            {product.image ? (
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-[420px] object-cover"
              />
            ) : (
              <div className="w-full h-[420px] flex items-center justify-center bg-slate-50">
                <ShoppingCart className="h-16 w-16 text-slate-200" />
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">
              {product.category}
            </p>

            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight">
              {product.name}
            </h1>

            <div className="mt-5 flex items-baseline gap-2">
              <span className="text-4xl font-black text-slate-900">
                {formatProdutoPrice(product.price)}
              </span>
              {isMonthly && (
                <span className="text-sm text-slate-500 font-normal">/mês</span>
              )}
            </div>

            <div className="mt-2 flex items-center gap-2">
              {product.inStock !== false ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-700 bg-green-50 px-2.5 py-1">
                  <Check className="h-3 w-3" />
                  Disponível
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1">
                  Esgotado
                </span>
              )}
            </div>

            <p className="mt-6 text-slate-600 leading-relaxed text-base">
              {product.description}
            </p>

            <div className="mt-8 space-y-3">
              {isInCart ? (
                <button
                  onClick={() => removeItem(product.id)}
                  className="w-full inline-flex items-center justify-center gap-2 border border-red-200 text-red-600 px-8 py-4 text-sm font-semibold hover:bg-red-50 transition"
                >
                  <Trash2 className="h-4 w-4" />
                  Remover do Carrinho
                </button>
              ) : (
                <button
                  onClick={handleAddToCart}
                  disabled={product.inStock === false || isAdding}
                  className="w-full inline-flex items-center justify-center gap-2 bg-secondary px-8 py-4 text-sm font-semibold text-white hover:bg-secondary/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isAdding ? (
                    <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <ShoppingCart className="h-5 w-5" />
                  )}
                  {product.inStock === false ? 'Esgotado' : isAdding ? 'A adicionar...' : 'Adicionar ao Carrinho'}
                </button>
              )}

              <Link
                href="/#contacto"
                className="w-full inline-flex items-center justify-center gap-2 border border-slate-200 bg-white px-8 py-4 text-sm font-semibold text-slate-700 hover:border-primary hover:text-primary transition"
              >
                <Phone className="h-4 w-4" />
                Pedir Cotação Personalizada
              </Link>
            </div>

            <p className="mt-5 text-xs text-slate-400 text-center">
              Resposta em menos de 24 horas · Suporte técnico incluído
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
