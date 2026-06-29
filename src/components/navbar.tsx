'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Menu, ShoppingCart } from 'lucide-react'
import icon from "@/assets/icon18.png";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet'
import Image from 'next/image'
import { useCart } from '@/lib/cart'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const { itemCount } = useCart()

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
  ]

  return (
    <motion.nav
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 z-50 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-md shadow-sm"
    >
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">

        <Link href="#top" className="inline-flex items-center">
          <Image src={icon} alt="ARKNET Logo" width={200} height={200} className="h-20 w-auto" />
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {links.map((item) => (
            <Link
              key={item.href}
              href={resolveHref(item.href)}
              className="text-sm font-medium text-slate-700 transition hover:text-primary"
            >
              {item.label}
            </Link>
          ))}

          <Link
            href="/loja/carrinho"
            className="relative inline-flex items-center justify-center"
          >
            <ShoppingCart className="h-6 w-6 text-slate-700 hover:text-primary transition" />
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-secondary text-xs font-bold text-white">
                {itemCount}
              </span>
            )}
          </Link>

          <Link
            href={resolveHref('#contacto')}
            className="inline-flex h-10 items-center justify-center bg-secondary px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-secondary/90"
          >
            Solicitar Serviço
          </Link>
        </div>

        <div className="md:hidden flex items-center gap-4">
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
            <SheetContent side="right" className="p-8 bg-white">
              <div className="flex flex-col gap-6 mt-10">
                {links.map((item) => (
                  <Link
                    key={item.href}
                    href={resolveHref(item.href)}
                    onClick={() => setOpen(false)}
                    className="text-lg text-slate-900 font-semibold"
                  >
                    {item.label}
                  </Link>
                ))}

                <Link
                  href="/loja/carrinho"
                  onClick={() => setOpen(false)}
                  className="text-lg text-slate-900 font-semibold flex items-center gap-2"
                >
                  Carrinho ({itemCount})
                </Link>

                <Link
                  href={resolveHref('#contacto')}
                  onClick={() => setOpen(false)}
                  className="mt-4 inline-flex h-12 items-center justify-center bg-secondary px-6 text-sm font-semibold text-white shadow-sm"
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
