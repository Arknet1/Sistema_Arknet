import React from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Home,
  Wifi,
  ShieldCheck,
  Cpu,
  ShoppingBag,
  Headset,
  Phone,
} from 'lucide-react'

export const metadata = {
  title: 'Página Não Encontrada (404) | ARKNET Angola',
  description: 'A página solicitada não foi encontrada ou foi movida. Explore os nossos serviços de telecomunicações e TI.',
  robots: {
    index: false,
    follow: true,
  },
}

export default function NotFound() {
  return (
    <main className="min-h-screen pt-32 pb-20 bg-slate-950 text-white flex items-center justify-center relative overflow-hidden">
      
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/15 blur-3xl rounded-full pointer-events-none" />

      <div className="max-w-2xl w-full mx-auto px-6 text-center relative z-10">
        <span className="inline-block text-7xl sm:text-9xl font-black text-secondary tracking-tight select-none">
          404
        </span>

        <h1 className="text-2xl sm:text-4xl font-extrabold text-white mt-2">
          Página não encontrada
        </h1>

        <p className="text-sm sm:text-base text-slate-300 mt-4 leading-relaxed max-w-lg mx-auto">
          O endereço que procurou não existe, foi alterado ou está temporariamente indisponível. Utilize as hiperligações abaixo para navegar pelo nosso ecossistema de soluções tecnológicas:
        </p>

        {/* Quick Links Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8 text-left">
          <Link
            href="/servicos/internet-empresarial"
            className="p-3.5 bg-slate-900 border border-slate-800 hover:border-primary/50 rounded-xl transition group"
          >
            <Wifi className="h-5 w-5 text-primary mb-2 group-hover:scale-110 transition-transform" />
            <p className="text-xs font-bold text-white">Internet Dedicada</p>
            <p className="text-[10px] text-slate-400 mt-0.5">SLA 99.9% Angola</p>
          </Link>

          <Link
            href="/servicos/ciberseguranca"
            className="p-3.5 bg-slate-900 border border-slate-800 hover:border-primary/50 rounded-xl transition group"
          >
            <ShieldCheck className="h-5 w-5 text-emerald-400 mb-2 group-hover:scale-110 transition-transform" />
            <p className="text-xs font-bold text-white">Cibersegurança</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Proteção Digital</p>
          </Link>

          <Link
            href="/servicos/cablagem-estruturada"
            className="p-3.5 bg-slate-900 border border-slate-800 hover:border-primary/50 rounded-xl transition group"
          >
            <Cpu className="h-5 w-5 text-indigo-400 mb-2 group-hover:scale-110 transition-transform" />
            <p className="text-xs font-bold text-white">Redes &amp; Cablagem</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Infraestrutura TI</p>
          </Link>

          <Link
            href="/loja"
            className="p-3.5 bg-slate-900 border border-slate-800 hover:border-primary/50 rounded-xl transition group"
          >
            <ShoppingBag className="h-5 w-5 text-amber-400 mb-2 group-hover:scale-110 transition-transform" />
            <p className="text-xs font-bold text-white">Loja Online</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Hardware &amp; Redes</p>
          </Link>
        </div>

        {/* Back to Home CTA */}
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3.5 bg-primary hover:bg-primary/90 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition"
          >
            <Home className="h-4 w-4" />
            <span>Voltar à Página Inicial</span>
          </Link>

          <Link
            href="/#contacto"
            className="inline-flex items-center gap-2 px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl border border-slate-700 transition"
          >
            <Phone className="h-4 w-4 text-primary" />
            <span>Contactar Suporte ARKNET</span>
          </Link>
        </div>

      </div>
    </main>
  )
}
