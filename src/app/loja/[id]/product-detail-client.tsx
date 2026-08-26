'use client'

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, ShoppingCart, Trash2, Check, Phone } from "lucide-react"
import { useCart } from "@/lib/cart"
import { dataStore, StoreProduct } from "@/lib/data-store"
import { formatProdutoPrice } from "@/lib/format-produto-price"

const monthlyCategories = ['Internet', 'Hosting', 'Cloud', 'Comunicações']

export default function ProductDetailPageClient({ id }: { id: string }) {
  const router = useRouter()
  const { items, addItem, removeItem } = useCart()
  const [isAdding, setIsAdding] = useState(false)
  const [product, setProduct] = useState<StoreProduct | undefined>(undefined)

  useEffect(() => {
    const sync = () => {
      const p = dataStore.getProductById(id)
      setProduct(p)
    }
    sync()
    const unsub = dataStore.subscribe(sync)
    return () => unsub()
  }, [id])

  const isInCart = product ? items.some(item => item.product.id === product.id) : false
  const isMonthly = product ? monthlyCategories.includes(product.category) && product.price != null : false

  const handleAddToCart = async () => {
    if (!product || isAdding) return
    setIsAdding(true)
    await new Promise(resolve => setTimeout(resolve, 300))
    addItem(product as any)
    setIsAdding(false)
    router.push('/loja/carrinho')
  }

  if (!product) {
    return (
      <main className="min-h-screen pt-32 pb-20 bg-background">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-slate-500 text-lg">Produto não encontrado.</p>
          <Link href="/loja" className="mt-6 inline-flex items-center gap-2 text-sm text-primary hover:underline font-bold">
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
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-[420px] object-contain p-4 bg-white"
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
              <span className="text-4xl font-black text-slate-900 font-mono">
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
                  Disponível em Stock
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-700 bg-rose-50 px-2.5 py-1">
                  Indisponível / Esgotado
                </span>
              )}
              {product.sku && (
                <span className="text-xs text-slate-400 font-mono">Ref: {product.sku}</span>
              )}
            </div>

            <p className="mt-6 text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">
              {product.description}
            </p>

            {/* Actions */}
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              {product.price != null && product.inStock !== false && (
                <button
                  onClick={handleAddToCart}
                  disabled={isAdding}
                  className="flex-1 bg-secondary text-white py-4 px-6 font-bold text-sm hover:bg-secondary/90 transition flex items-center justify-center gap-2 uppercase tracking-wide shadow-lg shadow-secondary/20 disabled:opacity-50"
                >
                  <ShoppingCart className="h-4 w-4" />
                  {isAdding ? 'A adicionar...' : isInCart ? 'Ver no Carrinho' : 'Adicionar ao Carrinho'}
                </button>
              )}

              <Link
                href="/#contacto"
                className="flex-1 border-2 border-slate-900 text-slate-900 py-4 px-6 font-bold text-sm hover:bg-slate-900 hover:text-white transition flex items-center justify-center gap-2 uppercase tracking-wide text-center"
              >
                <Phone className="h-4 w-4" />
                Pedir Cotação
              </Link>
            </div>

            {isInCart && (
              <div className="mt-4 flex items-center justify-between text-xs text-slate-500 bg-slate-50 p-3 border border-slate-200">
                <span className="text-green-700 font-medium">✓ Este produto está no seu carrinho</span>
                <button
                  onClick={() => removeItem(product.id)}
                  className="text-red-500 hover:underline flex items-center gap-1"
                >
                  <Trash2 className="h-3 w-3" />
                  Remover
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
