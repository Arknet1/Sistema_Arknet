'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowLeft,
  User,
  Heart,
  ShoppingCart,
  ShieldCheck,
  LogOut,
  ChevronDown,
  Layers,
  Phone,
  Sparkles,
  ExternalLink,
} from 'lucide-react'
import { FaWhatsapp } from 'react-icons/fa'
import { ProductCategory, StoreProduct } from '@/lib/data-store'
import { JMATOS_CONFIG } from '@/lib/empresas'
import { getCategoryIcon } from './category-icons'
import { isCategoryMatch } from '@/lib/loja-category-utils'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'

interface LojaMobileDrawerProps {
  isOpen: boolean
  onClose: () => void
  categories: ProductCategory[]
  products: StoreProduct[]
  customer: any
  adminUser: any
  wishlistCount: number
  customerLogout: () => void
}

export default function LojaMobileDrawer({
  isOpen,
  onClose,
  categories,
  products,
  customer,
  adminUser,
  wishlistCount,
  customerLogout,
}: LojaMobileDrawerProps) {
  const [categoriesExpanded, setCategoriesExpanded] = useState(true)

  const displayCategories = categories.filter((c) => c.name !== 'Todos')

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="left"
        className="w-full sm:max-w-xs p-0 flex flex-col bg-white border-r border-slate-200 z-[100]"
        showCloseButton={true}
      >
        {/* Cabeçalho do Menu Mobile */}
        <SheetHeader className="p-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="relative h-10 w-32">
              <Image
                src={JMATOS_CONFIG.logo}
                alt={JMATOS_CONFIG.nome}
                fill
                sizes="130px"
                className="object-contain object-left"
              />
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary uppercase">
              Loja Oficial
            </span>
          </div>
          <SheetTitle className="sr-only">Menu da Loja J.Matos</SheetTitle>
        </SheetHeader>

        {/* Corpo com Scroll */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          
          {/* Botão de Retorno ao Portal ARKNET */}
          <Link
            href="/"
            onClick={onClose}
            className="flex items-center justify-between p-3 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-800 border border-slate-200/80 transition shadow-2xs group"
          >
            <div className="flex items-center gap-2 text-xs font-bold">
              <ArrowLeft className="h-4 w-4 text-primary group-hover:-translate-x-1 transition-transform" />
              <span>Voltar ao Portal ARKNET</span>
            </div>
            <span className="text-[10px] text-slate-500 font-normal">Site Principal</span>
          </Link>

          {/* Área de Autenticação / Perfil */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
            {customer ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                    {customer.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-900 truncate">{customer.name}</p>
                    <p className="text-[10px] text-slate-500 truncate">{customer.email}</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 flex flex-col gap-1">
                  <Link
                    href="/cliente/pedidos"
                    onClick={onClose}
                    className="text-xs font-semibold text-slate-700 hover:text-primary py-1"
                  >
                    As Minhas Encomendas
                  </Link>

                  {adminUser && (
                    <Link
                      href="/admin"
                      onClick={onClose}
                      className="text-xs font-bold text-primary hover:underline py-1 flex items-center gap-1.5"
                    >
                      <ShieldCheck className="h-3.5 w-3.5" />
                      Painel de Administração
                    </Link>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      customerLogout()
                      onClose()
                    }}
                    className="text-xs font-bold text-rose-600 hover:text-rose-700 text-left py-1 flex items-center gap-1.5"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    Terminar Sessão
                  </button>
                </div>
              </div>
            ) : adminUser ? (
              <div className="space-y-2">
                <p className="text-xs font-bold text-slate-800">Sessão de Administrador</p>
                <Link
                  href="/admin"
                  onClick={onClose}
                  className="inline-flex items-center gap-2 text-xs font-bold text-primary hover:underline"
                >
                  <ShieldCheck className="h-4 w-4" />
                  Ir para Painel de Controlo
                </Link>
              </div>
            ) : (
              <Link
                href="/login"
                onClick={onClose}
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-primary text-white text-xs font-bold shadow-xs hover:bg-primary/90 transition"
              >
                <User className="h-4 w-4" />
                Iniciar Sessão ou Criar Conta
              </Link>
            )}
          </div>

          {/* Atalhos Rápidos */}
          <div className="grid grid-cols-2 gap-2">
            <Link
              href="/loja/favoritos"
              onClick={onClose}
              className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs font-bold text-slate-800 hover:border-rose-300 hover:bg-rose-50/50 transition"
            >
              <div className="flex items-center gap-2">
                <Heart className={`h-4 w-4 ${wishlistCount > 0 ? 'text-rose-600 fill-rose-600' : 'text-slate-500'}`} />
                <span>Favoritos</span>
              </div>
              {wishlistCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-rose-600 text-[10px] font-black text-white">
                  {wishlistCount}
                </span>
              )}
            </Link>

            <Link
              href="/loja/carrinho"
              onClick={onClose}
              className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs font-bold text-slate-800 hover:border-primary/30 hover:bg-primary/5 transition"
            >
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-4 w-4 text-primary" />
                <span>Carrinho</span>
              </div>
            </Link>
          </div>

          {/* Categorias de Produtos em Acordeão */}
          <div className="space-y-1 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setCategoriesExpanded(!categoriesExpanded)}
              className="w-full flex items-center justify-between py-2 text-xs font-extrabold uppercase tracking-wider text-slate-900"
            >
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-primary" />
                <span>Categorias de Equipamentos</span>
              </div>
              <ChevronDown
                className={`h-4 w-4 text-slate-400 transition-transform ${
                  categoriesExpanded ? 'rotate-180' : ''
                }`}
              />
            </button>

            {categoriesExpanded && (
              <div className="space-y-1 pl-1 pt-1">
                <Link
                  href="/loja"
                  onClick={onClose}
                  className="flex items-center justify-between py-2 px-2.5 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
                >
                  <span>Todos os Equipamentos</span>
                  <span className="text-[10px] text-slate-400 font-medium">
                    {products.length}
                  </span>
                </Link>

                {displayCategories.map((cat) => {
                  const Icon = getCategoryIcon(cat.icon)
                  const count = products.filter((p) => isCategoryMatch(p.category, cat.name)).length

                  return (
                    <Link
                      key={cat.id || cat.name}
                      href={`/loja?categoria=${encodeURIComponent(cat.name)}`}
                      onClick={onClose}
                      className="flex items-center justify-between py-2 px-2.5 rounded-lg text-xs font-medium text-slate-600 hover:text-primary hover:bg-primary/5 transition"
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="h-3.5 w-3.5 text-slate-400" />
                        <span className="truncate">{cat.name}</span>
                      </div>
                      <span className="text-[10px] font-semibold text-slate-400">
                        {count}
                      </span>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>

          {/* Apoio ao Cliente WhatsApp */}
          <div className="pt-2 border-t border-slate-100">
            <a
              href="https://wa.me/244935208449?text=Loja%20J.Matos%20Tecnologia:%20Ol%C3%A1!%20Gostaria%20de%20informa%C3%A7%C3%B5es%20sobre%20equipamentos"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-200/80 text-xs font-bold shadow-2xs hover:bg-emerald-100 transition"
            >
              <FaWhatsapp className="h-4 w-4 text-emerald-600" />
              <span>Apoio WhatsApp (+244 935 208 449)</span>
            </a>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
