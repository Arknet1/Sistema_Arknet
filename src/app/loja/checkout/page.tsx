'use client'

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { ArrowLeft, ShoppingCart } from "lucide-react"
import { useCart } from "@/lib/cart"
import { formatLinhaPreco, formatProdutoPrice } from "@/lib/format-produto-price"

export default function CheckoutPage() {
  const router = useRouter()
  const { items, total, clearCart } = useCart()

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  })

  if (items.length === 0) {
    router.push('/loja/carrinho')
    return null
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Here you would normally send to API
    console.log('Order submitted:', { ...formData, items, total: total === null ? 'sob consulta' : total })

    alert('Pedido realizado com sucesso! Entraremos em contacto em breve.')
    clearCart()
    router.push('/')
  }

  return (
    <main className="min-h-screen pt-32 pb-20 bg-background">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-10">
          <Link href="/loja/carrinho" className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-primary">
            <ArrowLeft className="h-4 w-4" />
            Voltar ao Carrinho
          </Link>
        </div>

        <div className="grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8">
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-8">
              Finalizar Compra
            </h1>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-white p-8 border border-slate-200">
                <h2 className="text-xl font-bold text-slate-900 mb-6">Dados Pessoais</h2>

                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-semibold text-slate-700 mb-2">
                      Nome Completo
                    </label>
                    <input
                      id="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full border border-slate-300 px-4 py-3 text-sm focus:border-primary focus:outline-none"
                      placeholder="Seu nome completo"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-2">
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full border border-slate-300 px-4 py-3 text-sm focus:border-primary focus:outline-none"
                      placeholder="seu@email.com"
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <label htmlFor="phone" className="block text-sm font-semibold text-slate-700 mb-2">
                    Telefone
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full border border-slate-300 px-4 py-3 text-sm focus:border-primary focus:outline-none"
                    placeholder="+244 900 000 000"
                  />
                </div>

                <div className="mt-6">
                  <label htmlFor="address" className="block text-sm font-semibold text-slate-700 mb-2">
                    Endereço Completo
                  </label>
                  <textarea
                    id="address"
                    rows={3}
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    className="w-full border border-slate-300 px-4 py-3 text-sm focus:border-primary focus:outline-none resize-none"
                    placeholder="Rua, número, bairro, cidade"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-secondary py-4 text-sm font-semibold text-white hover:bg-secondary/90 transition shadow-sm"
              >
                Confirmar Pedido
              </button>
            </form>
          </div>

          <div className="lg:col-span-4">
            <div className="bg-white border border-slate-200 p-8 sticky top-24">
              <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-primary" />
                Resumo
              </h2>

              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={item.product.id} className="flex justify-between text-sm">
                    <span className="text-slate-600">
                      {item.product.name} x{item.quantity}
                    </span>
                    <span className="font-semibold">
                      {formatLinhaPreco(item.product.price, item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-6 border-t border-slate-200 flex justify-between items-center">
                <span className="text-lg font-semibold">Total</span>
                <span className="text-2xl font-extrabold text-primary">
                  {total === null ? '-' : formatProdutoPrice(total)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
