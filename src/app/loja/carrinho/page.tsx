'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Plus,
  Minus,
  Trash2,
  ArrowLeft,
  ShoppingCart,
  ShieldCheck,
  UserCheck,
  Lock,
  ArrowRight,
  Sparkles,
  Info,
} from 'lucide-react'
import { useCart } from '@/lib/cart'
import { useCustomerAuth } from '@/lib/customer-auth-context'
import { formatLinhaPreco, formatProdutoPrice } from '@/lib/format-produto-price'

export default function CarrinhoPage() {
  const router = useRouter()
  const { items, total, itemCount, updateQuantity, removeItem, clearCart } = useCart()
  const { customer } = useCustomerAuth()

  if (itemCount === 0) {
    return (
      <main className="min-h-screen pt-32 pb-20 bg-background">
        <div className="max-w-lg mx-auto px-6 text-center">
          <div className="mb-6 inline-flex h-20 w-20 items-center justify-center bg-slate-100 mx-auto">
            <ShoppingCart className="h-9 w-9 text-slate-400" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">O carrinho está vazio</h1>
          <p className="mt-3 text-slate-500 text-sm">
            Adicione equipamentos ou produtos do catálogo ARKNET para continuar.
          </p>
          <Link
            href="/loja"
            className="mt-8 inline-flex items-center gap-2 bg-slate-900 text-white px-8 py-3 text-sm font-semibold hover:bg-primary transition"
          >
            <ArrowLeft className="h-4 w-4" />
            Explorar Loja de Equipamentos
          </Link>
        </div>
      </main>
    )
  }

  const handleProceedToCheckout = () => {
    if (!customer) {
      router.push('/login?redirect=/loja/checkout')
    } else {
      router.push('/loja/checkout')
    }
  }

  return (
    <main className="min-h-screen pt-24 pb-20 bg-background">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <Link
              href="/loja"
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-primary transition mb-3"
            >
              <ArrowLeft className="h-4 w-4" />
              Continuar a comprar
            </Link>
            <h1 className="text-3xl font-extrabold text-slate-900">Carrinho de Compras</h1>
            <p className="mt-1 text-sm text-slate-500">
              Tem <strong>{itemCount}</strong> {itemCount === 1 ? 'artigo selecionado' : 'artigos selecionados'} no seu pedido
            </p>
          </div>

          {/* Status do Cliente */}
          {customer ? (
            <div className="flex items-center gap-2.5 bg-emerald-50 border border-emerald-200 px-4 py-2 text-emerald-800 text-xs font-semibold rounded">
              <UserCheck className="h-4 w-4 text-emerald-600" />
              <span>Sessão iniciada como <strong>{customer.name}</strong></span>
            </div>
          ) : (
            <div className="flex items-center gap-2.5 bg-amber-50 border border-amber-200 px-4 py-2 text-amber-900 text-xs font-semibold rounded">
              <Lock className="h-4 w-4 text-amber-600" />
              <span>Acesso restrito: Login necessário para finalizar a compra</span>
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          
          {/* Product Items List */}
          <div className="lg:col-span-8 space-y-3">
            {items.map((item) => (
              <div
                key={item.product.id}
                className="bg-white border border-slate-200 p-5 flex flex-col sm:flex-row sm:items-center gap-5 transition hover:border-slate-300"
              >
                <div className="h-20 w-20 bg-slate-50 shrink-0 overflow-hidden border border-slate-100">
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
                  <Link
                    href={`/loja/${item.product.id}`}
                    className="text-sm font-bold text-slate-900 hover:text-primary transition line-clamp-1"
                  >
                    {item.product.name}
                  </Link>
                  {item.product.category && (
                    <p className="text-xs text-slate-500 mt-0.5">{item.product.category}</p>
                  )}
                  <p className="text-base font-bold text-primary mt-1.5 font-mono">
                    {formatLinhaPreco(item.product.price, item.quantity)}
                  </p>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                  <div className="flex items-center gap-2 border border-slate-200 bg-slate-50 p-1">
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                      className="h-7 w-7 flex items-center justify-center bg-white border border-slate-200 hover:border-slate-400 transition text-slate-700"
                      title="Diminuir"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-8 text-center text-xs font-bold font-mono">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      className="h-7 w-7 flex items-center justify-center bg-white border border-slate-200 hover:border-slate-400 transition text-slate-700"
                      title="Aumentar"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>

                  <button
                    onClick={() => removeItem(item.product.id)}
                    className="text-slate-400 hover:text-rose-600 transition p-2"
                    title="Remover produto"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}

            {/* Aviso de Política de Compra */}
            <div className="p-4 bg-slate-50 border border-slate-200 flex items-start gap-3 text-xs text-slate-600">
              <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-slate-800">Garantia & Faturação ARKNET</p>
                <p className="mt-0.5 text-slate-500">
                  Todos os equipamentos possuem garantia técnica oficial com suporte técnico e emissão automática de fatura proforma / recibo para a sua empresa ou registo particular.
                </p>
              </div>
            </div>
          </div>

          {/* Checkout Summary Column */}
          <div className="lg:col-span-4">
            <div className="bg-white border border-slate-200 p-7 sticky top-24 shadow-sm">
              <h2 className="text-base font-bold text-slate-900 uppercase tracking-wider mb-5 pb-3 border-b border-slate-100">
                Resumo da Compra
              </h2>

              <ul className="space-y-3 mb-5 max-h-60 overflow-y-auto pr-1">
                {items.map((item) => (
                  <li key={item.product.id} className="flex justify-between text-xs">
                    <span className="text-slate-600 truncate pr-3">
                      {item.product.name} <strong className="text-slate-800">×{item.quantity}</strong>
                    </span>
                    <span className="font-bold text-slate-900 shrink-0 font-mono">
                      {formatLinhaPreco(item.product.price, item.quantity)}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="pt-4 border-t border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal Equipamentos:</span>
                  <span className="font-semibold text-slate-800 font-mono">
                    {total === null ? 'Sob consulta' : formatProdutoPrice(total)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Impostos / IVA (14%):</span>
                  <span className="font-semibold text-slate-800">Incluso / Regime Geral</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Entrega em Luanda:</span>
                  <span className="font-bold text-emerald-600">Grátis / A combinar</span>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t-2 border-slate-900 flex justify-between items-baseline">
                <span className="font-bold text-slate-900 uppercase text-xs tracking-wider">Total Estimado</span>
                <span className="text-2xl font-black text-slate-900 font-mono">
                  {total === null ? 'Sob consulta' : formatProdutoPrice(total)}
                </span>
              </div>

              {/* Botão de Finalizar Compra com Verificação de Conta */}
              {customer ? (
                <button
                  onClick={handleProceedToCheckout}
                  className="mt-6 w-full bg-secondary hover:bg-secondary/90 text-white font-bold text-xs uppercase tracking-wider py-4 transition flex items-center justify-center gap-2 shadow-md"
                >
                  <span>Avançar para o Checkout</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <div className="mt-6 space-y-2.5">
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded text-amber-900 text-xs">
                    <p className="font-bold flex items-center gap-1.5 mb-1">
                      <Lock className="h-3.5 w-3.5 text-amber-700" />
                      Conta de Cliente Obrigatória
                    </p>
                    <p className="text-[11px] text-amber-800 leading-snug">
                      Inicie sessão ou crie uma conta gratuita para finalizar a encomenda e emitir a fatura proforma.
                    </p>
                  </div>

                  <button
                    onClick={handleProceedToCheckout}
                    className="w-full bg-primary hover:bg-primary/90 text-white font-bold text-xs uppercase tracking-wider py-3.5 transition flex items-center justify-center gap-2 shadow-md"
                  >
                    <span>Entrar para Concluir Compra</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>

                  <Link
                    href="/login?tab=registo&redirect=/loja/checkout"
                    className="w-full inline-block text-center py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs uppercase tracking-wider transition"
                  >
                    Criar Registo de Cliente
                  </Link>
                </div>
              )}

              <button
                onClick={clearCart}
                className="mt-4 w-full py-2 text-xs text-slate-400 hover:text-rose-600 transition"
              >
                Limpar Todo o Carrinho
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
