'use client'

import React, { useState, useEffect, useRef, FormEvent } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import {
  Search,
  ShoppingCart,
  Heart,
  User,
  ShieldCheck,
  ChevronDown,
  LogOut,
  ArrowLeft,
  Menu,
  X,
  Layers,
} from 'lucide-react'
import { FaWhatsapp } from 'react-icons/fa'
import { useCart } from '@/lib/cart'
import { useWishlist } from '@/lib/wishlist-store'
import { useAuth } from '@/lib/auth-context'
import { useCustomerAuth } from '@/lib/customer-auth-context'
import { JMATOS_CONFIG } from '@/lib/empresas'
import { dataStore, ProductCategory, StoreProduct } from '@/lib/data-store'
import { getVisibleCategories } from '@/lib/loja-category-utils'
import LojaMegaMenu from './loja-mega-menu'
import LojaMiniCart from './loja-mini-cart'
import LojaMobileDrawer from './loja-mobile-drawer'
import LojaCategoryCarousel from './loja-category-carousel'

export default function LojaHeader() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const { itemCount } = useCart()
  const { count: wishlistCount } = useWishlist()
  const { user: adminUser } = useAuth()
  const { customer, logout: customerLogout } = useCustomerAuth()

  // Estados locais
  const [categories, setCategories] = useState<ProductCategory[]>([])
  const [products, setProducts] = useState<StoreProduct[]>([])
  const [searchQuery, setSearchQuery] = useState('')

  // Modais e Dropdowns
  const [megaMenuOpen, setMegaMenuOpen] = useState(false)
  const [miniCartOpen, setMiniCartOpen] = useState(false)
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false)
  const [userDropdownOpen, setUserDropdownOpen] = useState(false)
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)

  const dropdownRef = useRef<HTMLDivElement>(null)
  const megaMenuContainerRef = useRef<HTMLDivElement>(null)

  // Sincronizar catálogo e categorias
  useEffect(() => {
    const sync = () => {
      const allCategories = dataStore.getCategories().sort((a, b) => a.order - b.order)
      const allProducts = dataStore.getProducts()
      setCategories([...allCategories])
      setProducts([...allProducts])
    }
    sync()
    const unsub = dataStore.subscribe(sync)
    return () => unsub()
  }, [])

  // Sincronizar input de pesquisa com query param
  useEffect(() => {
    const q = searchParams.get('search') || searchParams.get('q') || ''
    setSearchQuery(q)
  }, [searchParams])

  // Fechar dropdowns ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      if (dropdownRef.current && !dropdownRef.current.contains(target)) {
        setUserDropdownOpen(false)
      }
      if (megaMenuContainerRef.current && !megaMenuContainerRef.current.contains(target)) {
        setMegaMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Fechar menus ao mudar de rota
  useEffect(() => {
    setMegaMenuOpen(false)
    setMiniCartOpen(false)
    setMobileDrawerOpen(false)
    setUserDropdownOpen(false)
    setMobileSearchOpen(false)
  }, [pathname, searchParams])

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault()
    const trimmed = searchQuery.trim()
    if (trimmed) {
      router.push(`/loja?search=${encodeURIComponent(trimmed)}`)
      setMobileSearchOpen(false)
    } else {
      router.push('/loja')
    }
  }

  const handleClearSearch = () => {
    setSearchQuery('')
    router.push('/loja')
  }

  const visibleCategories = getVisibleCategories(categories, products).filter((c) => c.name !== 'Todos')
  const activeCategoryParam = searchParams.get('categoria') || ''

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-slate-100 shadow-2xs">
      
      {/* ===================================================================== */}
      {/* LINHA 1: HEADER PRINCIPAL (Estilo Idêntico NCR Angola)                 */}
      {/* ===================================================================== */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-18 sm:h-20 flex items-center justify-between gap-4 sm:gap-8">
        
        {/* Esquerda: Menu Hambúrguer Mobile + Logótipo J.Matos */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setMobileDrawerOpen(true)}
            className="lg:hidden p-2 -ml-2 text-slate-700 hover:text-primary transition rounded-lg"
            aria-label="Abrir menu"
          >
            <Menu className="h-6 w-6" />
          </button>

          <Link
            href="/loja"
            className="inline-flex items-center focus:outline-none"
            aria-label="Loja J.Matos Tecnologia"
          >
            <div className="relative h-10 sm:h-12 w-36 sm:w-44">
              <Image
                src={JMATOS_CONFIG.logo}
                alt={`${JMATOS_CONFIG.nome}`}
                fill
                sizes="(max-width: 640px) 144px, 176px"
                priority
                className="object-contain object-left"
              />
            </div>
          </Link>
        </div>

        {/* Centro: Barra de Pesquisa Minimalista (idêntica à NCR "O que procuras?") */}
        <div className="hidden md:flex flex-1 max-w-xl lg:max-w-2xl items-center justify-center">
          <form
            onSubmit={handleSearchSubmit}
            className="w-full flex items-center relative bg-[#f3f5f8] rounded-lg border border-slate-200/50 hover:border-slate-300 transition-colors h-11"
            role="search"
          >
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="O que procuras?"
              className="w-full bg-transparent pl-4 pr-12 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 outline-none font-medium"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-10 p-1 text-slate-400 hover:text-slate-600"
                title="Limpar pesquisa"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
            <button
              type="submit"
              className="absolute right-3 p-1 text-slate-400 hover:text-slate-700 transition"
              title="Pesquisar"
            >
              <Search className="h-4 w-4" />
            </button>
          </form>
        </div>

        {/* Direita: Ações Rápidas (Portal ARKNET, Apoio, Entrar, Favoritos, Carrinho) */}
        <div className="flex items-center gap-4 sm:gap-6 shrink-0 text-slate-700">
          
          {/* Botão de Pesquisa (Apenas Mobile < 768px) */}
          <button
            type="button"
            onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
            className="md:hidden p-2 text-slate-700 hover:text-primary transition"
            aria-label="Pesquisar"
          >
            <Search className="h-5 w-5" />
          </button>

          {/* Atalho Portal ARKNET */}
          <Link
            href="/"
            className="hidden xl:inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-primary transition"
            title="Voltar ao portal ARKNET"
          >
            <ArrowLeft className="h-4 w-4 text-slate-400" />
            <span>Portal ARKNET</span>
          </Link>

          {/* Atalho Apoio WhatsApp */}
          <a
            href="https://wa.me/244935208449?text=Loja%20J.Matos%20Tecnologia:%20Ol%C3%A1!%20Gostaria%20de%20informa%C3%A7%C3%B5es%20sobre%20equipamentos"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden lg:inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-emerald-600 transition"
            title="Apoio comercial WhatsApp"
          >
            <FaWhatsapp className="h-4 w-4 text-emerald-600" />
            <span>Apoio</span>
          </a>

          {/* Login / Perfil "Entrar ˅" */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 hover:text-primary transition p-1"
            >
              <User className="h-5 w-5 stroke-[1.8] text-slate-700" />
              <span className="hidden sm:inline">
                {customer ? customer.name.split(' ')[0] : 'Entrar'}
              </span>
              <ChevronDown className="h-3 w-3 text-slate-400" />
            </button>

            {userDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden py-1 animate-in fade-in zoom-in-95 duration-100">
                {customer ? (
                  <>
                    <div className="px-4 py-3 bg-slate-50 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-900 truncate">{customer.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{customer.email}</p>
                    </div>

                    <Link
                      href="/cliente/pedidos"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50 transition"
                    >
                      <Layers className="h-4 w-4 text-primary" />
                      As Minhas Encomendas
                    </Link>

                    {adminUser && (
                      <Link
                        href="/admin"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-primary hover:bg-primary/5 transition border-t border-slate-100"
                      >
                        <ShieldCheck className="h-4 w-4 text-primary" />
                        Painel Admin
                      </Link>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        setUserDropdownOpen(false)
                        customerLogout()
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-xs text-rose-600 hover:bg-rose-50 transition border-t border-slate-100 text-left"
                    >
                      <LogOut className="h-4 w-4" />
                      Terminar Sessão
                    </button>
                  </>
                ) : (
                  <div className="p-3 space-y-2">
                    <Link
                      href="/login"
                      onClick={() => setUserDropdownOpen(false)}
                      className="w-full flex items-center justify-center py-2 rounded-lg bg-primary text-white text-xs font-bold shadow-2xs hover:bg-primary/90 transition"
                    >
                      Iniciar Sessão
                    </Link>
                    <p className="text-[11px] text-slate-500 text-center">
                      Novo cliente?{' '}
                      <Link
                        href="/login"
                        onClick={() => setUserDropdownOpen(false)}
                        className="text-primary font-bold hover:underline"
                      >
                        Criar conta
                      </Link>
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Favoritos (Ícone de Coração minimalista) */}
          <Link
            href="/loja/favoritos"
            className="relative p-1 text-slate-700 hover:text-rose-600 transition"
            title="Favoritos"
          >
            <Heart className={`h-5 w-5 stroke-[1.8] ${wishlistCount > 0 ? 'text-rose-600 fill-rose-600' : ''}`} />
            {wishlistCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white">
                {wishlistCount}
              </span>
            )}
          </Link>

          {/* Carrinho (Ícone de Carrinho minimalista) */}
          <button
            type="button"
            onClick={() => setMiniCartOpen(true)}
            className="relative p-1 text-slate-700 hover:text-primary transition"
            title="Carrinho de Compras"
          >
            <ShoppingCart className="h-5 w-5 stroke-[1.8]" />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-secondary text-[10px] font-bold text-slate-950 shadow-2xs">
                {itemCount}
              </span>
            )}
          </button>

        </div>
      </div>

      {/* Barra de Pesquisa Expansível (Apenas Mobile < 768px) */}
      {mobileSearchOpen && (
        <div className="md:hidden px-4 pb-3 pt-1 border-t border-slate-100 bg-white">
          <form onSubmit={handleSearchSubmit} className="flex items-center relative bg-[#f3f5f8] rounded-lg border border-slate-200">
            <input
              type="search"
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="O que procuras?"
              className="w-full pl-4 pr-10 py-2.5 text-xs bg-transparent outline-none text-slate-800"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-3 p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </form>
        </div>
      )}

      {/* ===================================================================== */}
      {/* LINHA 2: TODOS OS PRODUTOS + CARROSSEL RODANTE DAS CATEGORIAS          */}
      {/* ===================================================================== */}
      <div className="border-t border-slate-100 bg-white" ref={megaMenuContainerRef}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-12 flex items-center gap-3 sm:gap-6">
          
          {/* Botão Todos os Produtos (Abre Mega Menu) */}
          <button
            type="button"
            onClick={() => setMegaMenuOpen(!megaMenuOpen)}
            className="flex items-center gap-2 text-xs sm:text-[13px] font-bold text-slate-900 hover:text-primary transition shrink-0 pr-4 sm:pr-6 border-r border-slate-100"
          >
            <Menu className="h-4 w-4 text-slate-800" />
            <span className="whitespace-nowrap">Todos os Produtos</span>
          </button>

          {/* Carrossel Rodante das Categorias (Autoplay, Loop e Setas de Navegação) */}
          <LojaCategoryCarousel
            categories={visibleCategories}
            activeCategory={activeCategoryParam}
          />

        </div>

        {/* Mega Menu Dropdown */}
        <LojaMegaMenu
          isOpen={megaMenuOpen}
          onClose={() => setMegaMenuOpen(false)}
          categories={categories}
          products={products}
        />
      </div>

      {/* Mini-Carrinho Lateral (Sheet) */}
      <LojaMiniCart
        isOpen={miniCartOpen}
        onClose={() => setMiniCartOpen(false)}
      />

      {/* Gaveta Lateral Mobile (Sheet) */}
      <LojaMobileDrawer
        isOpen={mobileDrawerOpen}
        onClose={() => setMobileDrawerOpen(false)}
        categories={categories}
        products={products}
        customer={customer}
        adminUser={adminUser}
        wishlistCount={wishlistCount}
        customerLogout={customerLogout}
      />

    </header>
  )
}
