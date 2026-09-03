'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import {
  Menu,
  ShoppingCart,
  ShieldCheck,
  User,
  UserCheck,
  LogOut,
  ChevronDown,
  ShoppingBag,
  Headset,
  KeyRound,
  LayoutDashboard,
  Package,
  Layers,
  Calendar,
  Heart,
} from 'lucide-react'
import icon from '@/assets/icon18.png'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet'
import Image from 'next/image'
import { useCart } from '@/lib/cart'
import { useWishlist } from '@/lib/wishlist-store'
import { useAuth } from '@/lib/auth-context'
import { useCustomerAuth } from '@/lib/customer-auth-context'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [userDropdownOpen, setUserDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const pathname = usePathname()
  const { itemCount } = useCart()
  const { count: wishlistCount } = useWishlist()
  const { user: adminUser, logout: adminLogout } = useAuth()
  const { customer, logout: customerLogout } = useCustomerAuth()

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Close dropdown on route change
  useEffect(() => {
    setUserDropdownOpen(false)
    setOpen(false)
  }, [pathname])

  const resolveHref = (href: string) => {
    if (!href.startsWith('#')) {
      return href
    }
    return pathname === '/' ? href : `/${href}`
  }

  const handleCustomerLogout = () => {
    setUserDropdownOpen(false)
    setOpen(false)
    customerLogout()
    router.push('/')
  }

  const handleAdminLogout = () => {
    setUserDropdownOpen(false)
    setOpen(false)
    adminLogout()
    router.push('/login')
  }

  const links = [
    { label: 'Início', href: '/' },
    { label: 'Empresa', href: '/empresa' },
    { label: 'Serviços', href: '/servicos' },
    { label: 'Projetos', href: '/projetos' },
    { label: 'Loja', href: '/loja' },
    { label: 'Eventos', href: '/eventos' },
  ]

  return (
    <motion.nav
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 z-50 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md shadow-xs"
    >
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link href="/" className="inline-flex items-center" aria-label="ARKNET Angola — Página Inicial">
          <Image src={icon} alt="ARKNET — Soluções de Telecomunicações e TI em Angola" width={200} height={200} className="h-16 w-auto object-contain" priority />
        </Link>

        <div className="hidden lg:flex items-center gap-6">
          {links.map((item) => (
            <Link
              key={item.href}
              href={resolveHref(item.href)}
              className="text-xs font-bold uppercase tracking-wider text-slate-700 transition hover:text-primary"
            >
              {item.label}
            </Link>
          ))}

          <Link
            href="/loja/favoritos"
            className="relative inline-flex items-center justify-center p-1.5 text-slate-700 hover:text-rose-600 transition"
            title="Lista de Desejos / Favoritos"
          >
            <Heart className={`h-5 w-5 ${wishlistCount > 0 ? 'text-rose-600 fill-rose-600' : 'text-slate-700'}`} />
            {wishlistCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white">
                {wishlistCount}
              </span>
            )}
          </Link>

          <Link
            href="/loja/carrinho"
            className="relative inline-flex items-center justify-center p-1.5"
            title="Carrinho de Compras"
          >
            <ShoppingCart className="h-5 w-5 text-slate-700 hover:text-primary transition" />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-secondary text-[10px] font-bold text-white">
                {itemCount}
              </span>
            )}
          </Link>

          {/* Admin Indicator - Shows when admin is logged in */}
          {adminUser && (
            <div className="relative" ref={!customer ? dropdownRef : undefined}>
              <button
                type="button"
                onClick={() => !customer ? setUserDropdownOpen(!userDropdownOpen) : null}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 border border-amber-500/30 text-amber-700 hover:bg-amber-500 hover:text-white text-xs font-bold uppercase tracking-wider rounded transition"
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Admin</span>
                {!customer && <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${userDropdownOpen ? 'rotate-180' : ''}`} />}
              </button>

              {!customer && userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                  <div className="p-4 bg-gradient-to-r from-slate-900 to-slate-800 text-white">
                    <p className="text-xs font-bold text-white truncate">{adminUser.name}</p>
                    <p className="text-[11px] text-slate-400 font-mono truncate mt-0.5">{adminUser.email}</p>
                    <span className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 bg-amber-950 border border-amber-700 text-amber-400 text-[9px] font-bold uppercase rounded-full">
                      <ShieldCheck className="h-2.5 w-2.5" />
                      Administrador
                    </span>
                  </div>

                  <div className="p-1.5 text-xs text-slate-700">
                    <Link
                      href="/admin"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 font-semibold hover:bg-slate-100 rounded-lg transition"
                    >
                      <LayoutDashboard className="h-4 w-4 text-slate-400" />
                      <span>Painel Admin</span>
                    </Link>
                    <Link
                      href="/admin/produtos"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 font-semibold hover:bg-slate-100 rounded-lg transition"
                    >
                      <Package className="h-4 w-4 text-slate-400" />
                      <span>Gerir Produtos</span>
                    </Link>
                    <Link
                      href="/admin/leads"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 font-semibold hover:bg-slate-100 rounded-lg transition"
                    >
                      <Layers className="h-4 w-4 text-slate-400" />
                      <span>Ver Leads</span>
                    </Link>
                  </div>

                  <div className="p-1.5 border-t border-slate-100 bg-slate-50">
                    <button
                      type="button"
                      onClick={handleAdminLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-lg transition"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Terminar Sessão Admin</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* User Account / Customer Dropdown */}
          {customer ? (
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-primary/10 border border-primary/20 text-primary hover:bg-primary hover:text-white text-xs font-bold uppercase tracking-wider rounded transition"
              >
                <UserCheck className="h-3.5 w-3.5" />
                <span className="max-w-[100px] truncate">{customer.name.split(' ')[0]}</span>
                <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${userDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                  <div className="p-4 bg-slate-950 text-white">
                    <p className="text-xs font-bold text-white truncate">{customer.name}</p>
                    <p className="text-[11px] text-slate-400 font-mono truncate mt-0.5">{customer.email}</p>
                    <span className="mt-2 inline-block px-2 py-0.5 bg-emerald-950 border border-emerald-700 text-emerald-400 text-[9px] font-bold uppercase rounded-full">
                      Cliente Ativo
                    </span>
                  </div>

                  <div className="p-1.5 text-xs text-slate-700">
                    <Link
                      href="/cliente/perfil"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 font-semibold hover:bg-slate-100 rounded-lg transition"
                    >
                      <User className="h-4 w-4 text-slate-400" />
                      <span>Meu Perfil & Empresa</span>
                    </Link>
                    <Link
                      href="/loja/favoritos"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 font-semibold hover:bg-slate-100 rounded-lg transition text-slate-700"
                    >
                      <Heart className="h-4 w-4 text-rose-500" />
                      <span>Artigos Favoritos ({wishlistCount})</span>
                    </Link>
                    <Link
                      href="/cliente/perfil?tab=pedidos"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 font-semibold hover:bg-slate-100 rounded-lg transition"
                    >
                      <ShoppingBag className="h-4 w-4 text-slate-400" />
                      <span>Minhas Encomendas &amp; Faturas</span>
                    </Link>
                    <Link
                      href="/cliente/perfil?tab=eventos"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 font-semibold hover:bg-slate-100 rounded-lg transition"
                    >
                      <Calendar className="h-4 w-4 text-slate-400" />
                      <span>Meus Eventos &amp; Inscrições</span>
                    </Link>
                    <Link
                      href="/cliente/perfil?tab=servicos"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 font-semibold hover:bg-slate-100 rounded-lg transition"
                    >
                      <Headset className="h-4 w-4 text-slate-400" />
                      <span>Cotações &amp; Serviços</span>
                    </Link>
                    <Link
                      href="/cliente/perfil?tab=seguranca"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 font-semibold hover:bg-slate-100 rounded-lg transition"
                    >
                      <KeyRound className="h-4 w-4 text-slate-400" />
                      <span>Segurança &amp; Senha</span>
                    </Link>
                  </div>

                  <div className="p-1.5 border-t border-slate-100 bg-slate-50">
                    <button
                      type="button"
                      onClick={handleCustomerLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-lg transition"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Terminar Sessão</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : !adminUser ? (
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-primary hover:bg-primary/90 text-white text-xs font-bold uppercase tracking-wider rounded transition shadow-sm"
              title="Iniciar Sessão"
            >
              <User className="h-3.5 w-3.5" />
              <span>Entrar</span>
            </Link>
          ) : null}

          <Link
            href={resolveHref('#contacto')}
            className="inline-flex h-9 items-center justify-center bg-secondary px-4 text-xs font-bold uppercase tracking-wider text-white shadow-xs transition hover:bg-secondary/90"
          >
            Solicitar Serviço
          </Link>
        </div>

        <div className="lg:hidden flex items-center gap-3">
          <Link
            href="/loja/favoritos"
            className="relative inline-flex items-center"
            title="Favoritos"
          >
            <Heart className={`h-6 w-6 ${wishlistCount > 0 ? 'text-rose-600 fill-rose-600' : 'text-slate-700'}`} />
            {wishlistCount > 0 && (
              <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-rose-600 text-xs font-bold text-white">
                {wishlistCount}
              </span>
            )}
          </Link>

          <Link
            href="/loja/carrinho"
            className="relative inline-flex items-center"
          >
            <ShoppingCart className="h-6 w-6 text-slate-700" />
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-secondary text-xs font-bold text-white">
                {itemCount}
              </span>
            )}
          </Link>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger>
              <Menu className="w-7 h-7 text-slate-700" />
            </SheetTrigger>
            <SheetContent side="right" className="p-8 bg-white overflow-y-auto">
              <div className="flex flex-col gap-5 mt-8">
                {links.map((item) => (
                  <Link
                    key={item.href}
                    href={resolveHref(item.href)}
                    onClick={() => setOpen(false)}
                    className="text-base text-slate-900 font-bold uppercase tracking-wider hover:text-primary transition"
                  >
                    {item.label}
                  </Link>
                ))}

                <Link
                  href="/loja/favoritos"
                  onClick={() => setOpen(false)}
                  className="text-base text-slate-900 font-bold uppercase tracking-wider flex items-center gap-2 hover:text-rose-600 transition"
                >
                  <Heart className="h-5 w-5 text-rose-600" />
                  <span>Favoritos ({wishlistCount})</span>
                </Link>

                <Link
                  href="/loja/carrinho"
                  onClick={() => setOpen(false)}
                  className="text-base text-slate-900 font-bold uppercase tracking-wider flex items-center gap-2 hover:text-primary transition"
                >
                  Carrinho ({itemCount})
                </Link>

                {/* Admin Link in Mobile Menu */}
                {adminUser && (
                  <div className="space-y-2 pt-2 border-t border-amber-200">
                    <Link
                      href="/admin"
                      onClick={() => setOpen(false)}
                      className="p-3 bg-amber-500/10 border border-amber-500/30 text-amber-700 text-sm font-bold uppercase flex items-center justify-between rounded"
                    >
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4" />
                        <span>Painel Admin ({adminUser.name?.split(' ')[0]})</span>
                      </div>
                    </Link>
                    {!customer && (
                      <button
                        type="button"
                        onClick={handleAdminLogout}
                        className="w-full p-3 bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100 text-xs font-bold uppercase flex items-center justify-center gap-2 rounded transition"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Terminar Sessão Admin</span>
                      </button>
                    )}
                  </div>
                )}

                {/* Customer Link in Mobile Menu */}
                {customer ? (
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <Link
                      href="/cliente/perfil"
                      onClick={() => setOpen(false)}
                      className="p-3 bg-primary/10 border border-primary/20 text-primary text-sm font-bold uppercase flex items-center justify-between rounded"
                    >
                      <div className="flex items-center gap-2">
                        <UserCheck className="h-4 w-4" />
                        <span>Área do Cliente ({customer.name.split(' ')[0]})</span>
                      </div>
                    </Link>
                    <button
                      type="button"
                      onClick={handleCustomerLogout}
                      className="w-full p-3 bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100 text-xs font-bold uppercase flex items-center justify-center gap-2 rounded transition"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Terminar Sessão</span>
                    </button>
                  </div>
                ) : !adminUser ? (
                  <Link
                    href="/login"
                    onClick={() => setOpen(false)}
                    className="p-3 bg-primary text-white text-sm font-bold uppercase flex items-center gap-2 rounded shadow-sm"
                  >
                    <User className="h-4 w-4" />
                    Iniciar Sessão
                  </Link>
                ) : null}

                <Link
                  href={resolveHref('#contacto')}
                  onClick={() => setOpen(false)}
                  className="mt-2 inline-flex h-12 items-center justify-center bg-secondary px-6 text-xs font-bold uppercase tracking-wider text-white shadow-sm"
                >
                  Solicitar Serviço
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </motion.nav>
  )
}
