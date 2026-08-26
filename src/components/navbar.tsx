'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Menu, ShoppingCart, ShieldCheck, User, UserCheck } from 'lucide-react'
import icon from "@/assets/icon18.png";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet'
import Image from 'next/image'
import { useCart } from '@/lib/cart'
import { useAuth } from '@/lib/auth-context'
import { useCustomerAuth } from '@/lib/customer-auth-context'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const { itemCount } = useCart()
  const { user: adminUser } = useAuth()
  const { customer } = useCustomerAuth()

  const resolveHref = (href: string) => {
    if (!href.startsWith('#')) {
      return href
    }
    return pathname === '/' ? href : `/${href}`
  }

  const links = [
    { label: 'Início', href: '/' },
    { label: 'Empresa', href: '#sobre' },
    { label: 'Serviços', href: '#servicos' },
    { label: 'Loja', href: '/loja' },
    { label: 'Academia', href: '/academia' },
    { label: 'Eventos', href: '/eventos' },
    { label: 'Carreiras', href: '/carreiras' },
  ]

  return (
    <motion.nav
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 z-50 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md shadow-xs"
    >
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">

        <Link href="/" className="inline-flex items-center">
          <Image src={icon} alt="ARKNET Logo" width={200} height={200} className="h-16 w-auto object-contain" />
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

          {/* User Account / Admin Area Button */}
          {customer ? (
            <Link
              href="/cliente/perfil"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-primary/10 border border-primary/20 text-primary hover:bg-primary hover:text-white text-xs font-bold uppercase tracking-wider rounded transition"
              title="Área do Cliente"
            >
              <UserCheck className="h-3.5 w-3.5" />
              <span className="max-w-[100px] truncate">{customer.name.split(' ')[0]}</span>
            </Link>
          ) : adminUser ? (
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-950 text-white hover:bg-primary text-xs font-bold uppercase tracking-wider rounded transition shadow-xs border border-slate-800"
              title="Painel de Administração"
            >
              <ShieldCheck className="h-3.5 w-3.5 text-primary" />
              <span>Admin</span>
            </Link>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-600 hover:text-primary transition"
              title="Iniciar Sessão"
            >
              <User className="h-3.5 w-3.5" />
              <span>Entrar</span>
            </Link>
          )}

          <Link
            href={resolveHref('#contacto')}
            className="inline-flex h-9 items-center justify-center bg-secondary px-4 text-xs font-bold uppercase tracking-wider text-white shadow-xs transition hover:bg-secondary/90"
          >
            Solicitar Serviço
          </Link>
        </div>

        <div className="lg:hidden flex items-center gap-3">
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
                  href="/loja/carrinho"
                  onClick={() => setOpen(false)}
                  className="text-base text-slate-900 font-bold uppercase tracking-wider flex items-center gap-2 hover:text-primary transition"
                >
                  Carrinho ({itemCount})
                </Link>

                {/* User Link in Mobile Menu */}
                {customer ? (
                  <Link
                    href="/cliente/perfil"
                    onClick={() => setOpen(false)}
                    className="p-3 bg-primary/10 border border-primary/20 text-primary text-sm font-bold uppercase flex items-center gap-2"
                  >
                    <UserCheck className="h-4 w-4" />
                    Área do Cliente ({customer.name})
                  </Link>
                ) : adminUser ? (
                  <Link
                    href="/admin"
                    onClick={() => setOpen(false)}
                    className="p-3 bg-slate-950 text-white text-sm font-bold uppercase flex items-center gap-2 border border-slate-800"
                  >
                    <ShieldCheck className="h-4 w-4 text-primary" />
                    Admin
                  </Link>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setOpen(false)}
                    className="p-3 bg-slate-100 text-slate-800 text-sm font-bold uppercase flex items-center gap-2"
                  >
                    <User className="h-4 w-4" />
                    Entrar
                  </Link>
                )}

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
