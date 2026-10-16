'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  ShoppingBag,
  ExternalLink,
} from 'lucide-react'
import { useCart } from '@/lib/cart'
import { formatProdutoPrice } from '@/lib/format-produto-price'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'

interface LojaMiniCartProps {
  isOpen: boolean
  onClose: () => void
}

export default function LojaMiniCart({ isOpen, onClose }: LojaMiniCartProps) {
  const { items, total, itemCount, updateQuantity, removeItem } = useCart()

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md p-0 flex flex-col bg-white border-l border-slate-200 z-[100]"
        showCloseButton={true}
      >
        {/* Cabeçalho do Drawer */}
        <SheetHeader className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center justify-between pr-8">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-primary/10 text-primary">
                <ShoppingCart className="h-5 w-5" />
              </div>
              <div>
                <SheetTitle className="text-base font-extrabold text-slate-900 tracking-tight">
                  O Seu Carrinho
                </SheetTitle>
                <p className="text-xs text-slate-500 font-medium">
                  {itemCount} {itemCount === 1 ? 'item adicionado' : 'itens adicionados'}
                </p>
              </div>
            </div>
            {itemCount > 0 && (
              <span className="px-2.5 py-1 rounded-full bg-secondary text-[11px] font-black text-slate-950 shadow-2xs">
                {itemCount}
              </span>
            )}
          </div>
        </SheetHeader>

        {/* Lista de Produtos ou Estado Vazio */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-5 py-4 divide-y divide-slate-100">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-12 px-4">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-4 shadow-inner">
                <ShoppingBag className="h-8 w-8 stroke-[1.5]" />
              </div>
              <h3 className="text-base font-bold text-slate-800">
                O seu carrinho está vazio
              </h3>
              <p className="text-xs text-slate-500 max-w-xs mt-1.5 leading-relaxed">
                Navegue pelas categorias de equipamentos e adicione produtos ao carrinho para solicitar a sua encomenda.
              </p>
              <Link
                href="/loja"
                onClick={onClose}
                className="mt-6 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 transition shadow-xs"
              >
                Explorar Catálogo da Loja
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          ) : (
            items.map((item) => {
              const itemPrice = item.price ?? item.product.price
              const itemTotal = itemPrice !== null && itemPrice > 0 ? itemPrice * item.quantity : null

              return (
                <div key={item.id} className="py-4 flex gap-3 sm:gap-4 group">
                  {/* Imagem do Produto */}
                  <div className="relative h-18 w-18 sm:h-20 sm:w-20 rounded-xl bg-slate-50 border border-slate-200/80 overflow-hidden shrink-0 flex items-center justify-center p-1.5">
                    {item.product.image ? (
                      <Image
                        src={item.product.image}
                        alt={item.product.name}
                        fill
                        sizes="80px"
                        className="object-contain p-1"
                      />
                    ) : (
                      <ShoppingBag className="h-6 w-6 text-slate-300" />
                    )}
                  </div>

                  {/* Detalhes do Produto */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          href={`/loja/${item.product.id}`}
                          onClick={onClose}
                          className="text-xs sm:text-sm font-bold text-slate-900 hover:text-primary transition line-clamp-2 leading-snug"
                        >
                          {item.product.name}
                        </Link>
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 transition shrink-0 rounded-lg hover:bg-rose-50"
                          title="Remover item"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      {item.variantLabel && (
                        <p className="text-[11px] text-slate-500 font-medium mt-0.5 line-clamp-1">
                          Opção: {item.variantLabel}
                        </p>
                      )}
                    </div>

                    {/* Preço e Controlo de Quantidade */}
                    <div className="flex items-center justify-between gap-2 mt-2">
                      <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50 overflow-hidden shadow-2xs">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                          disabled={item.quantity <= 1}
                          className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-white disabled:opacity-40 disabled:hover:bg-transparent transition"
                          title="Diminuir quantidade"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-7 text-center text-xs font-bold text-slate-800">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-white transition"
                          title="Aumentar quantidade"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>

                      <div className="text-right">
                        <p className="text-xs sm:text-sm font-extrabold text-slate-900">
                          {formatProdutoPrice(itemTotal)}
                        </p>
                        {item.quantity > 1 && itemPrice && (
                          <p className="text-[10px] text-slate-400 font-medium">
                            {formatProdutoPrice(itemPrice)} un.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Rodapé de Checkout e Subtotal */}
        {items.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50/70 space-y-3">
            <div className="flex items-baseline justify-between">
              <span className="text-xs font-semibold text-slate-600">Subtotal Estimado:</span>
              <span className="text-base sm:text-lg font-black text-slate-950">
                {formatProdutoPrice(total)}
              </span>
            </div>

            <p className="text-[11px] text-slate-500 leading-tight">
              Preços com IVA incluído. Suporte na entrega e instalação em Luanda.
            </p>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <Link
                href="/loja/carrinho"
                onClick={onClose}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold transition shadow-2xs"
              >
                Ver Carrinho
                <ExternalLink className="h-3.5 w-3.5 text-slate-500" />
              </Link>
              <Link
                href="/loja/checkout"
                onClick={onClose}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-primary hover:bg-primary/95 text-white text-xs font-extrabold transition shadow-xs"
              >
                Finalizar Compra
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
