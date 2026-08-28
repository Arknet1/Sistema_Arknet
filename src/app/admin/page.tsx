'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Package,
  Inbox,
  ShoppingCart,
  Mail,
  Calendar,
  MessageSquareQuote,
  Handshake,
  Tags,
  TrendingUp,
  ArrowRight,
  PlusCircle,
  Clock,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { dataStore, ArknetDatabase } from '@/lib/data-store'
import { StatCard } from '@/components/admin/stat-card'

export default function AdminOverviewPage() {
  const { user, isAdmin } = useAuth()
  const [db, setDb] = useState<ArknetDatabase>(dataStore.getSnapshot())

  useEffect(() => {
    const update = () => setDb({ ...dataStore.getSnapshot() })
    const unsub = dataStore.subscribe(update)
    return () => unsub()
  }, [])

  // Métricas calculadas
  const totalProducts = db.products.length
  const inStockProducts = db.products.filter((p) => p.inStock).length
  const totalOrders = db.orders.length
  const newOrders = db.orders.filter((o) => o.status === 'novo').length
  const totalLeads = db.leads.length
  const newLeads = db.leads.filter((l) => l.status === 'novo').length
  const totalSubscribers = db.subscribers.filter((s) => s.status === 'active').length
  const upcomingEvents = db.events.filter((e) => e.status === 'agendado').length
  const totalPartners = db.partners.length
  const totalTestimonials = db.testimonials.length
  const totalCategories = db.categories.length

  // Histórico simplificado dos últimos 6 meses para o gráfico
  const monthlyData = [
    { month: 'Março', leads: 8, orders: 4 },
    { month: 'Abril', leads: 12, orders: 7 },
    { month: 'Maio', leads: 15, orders: 11 },
    { month: 'Junho', leads: 19, orders: 14 },
    { month: 'Julho', leads: 22, orders: 18 },
    { month: 'Agosto', leads: totalLeads + 6, orders: totalOrders + 4 },
  ]

  const maxVal = Math.max(...monthlyData.map((d) => Math.max(d.leads, d.orders)), 25)

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative bg-gradient-to-r from-[#0d2149] via-[#10316b] to-[#1e60b6] p-6 sm:p-8 text-white shadow-md overflow-hidden border border-primary/20">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-semibold uppercase tracking-wider mb-3">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              Painel Central Operacional
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Olá, {user?.name || 'Administrador'}!
            </h1>
            <p className="text-slate-200 text-xs sm:text-sm max-w-2xl mt-2 leading-relaxed">
              Bem-vindo ao centro de gestão da ARKNET. Aqui pode monitorizar novos pedidos, leads de serviços comerciais, produtos da loja e conteúdos do website em tempo real.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              href="/admin/produtos"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-slate-900 text-xs font-bold uppercase tracking-wider hover:bg-slate-100 transition shadow-sm"
            >
              <PlusCircle className="h-4 w-4 text-primary" />
              Novo Produto
            </Link>
            <Link
              href="/admin/leads"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-secondary text-white text-xs font-bold uppercase tracking-wider hover:bg-secondary/90 transition shadow-sm"
            >
              <Inbox className="h-4 w-4" />
              Ver Leads ({newLeads})
            </Link>
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Produtos na Loja"
          value={totalProducts}
          subtitle={`${inStockProducts} produtos disponíveis em stock`}
          icon={Package}
          colorScheme="blue"
          trend={{ value: '+12%', isPositive: true }}
          linkHref="/admin/produtos"
          linkText="Gerir Catálogo"
        />

        <StatCard
          title="Pedidos & Cotações"
          value={totalOrders}
          subtitle={`${newOrders} novos pedidos pendentes`}
          icon={ShoppingCart}
          colorScheme="red"
          trend={{ value: '+8%', isPositive: true }}
          linkHref="/admin/pedidos"
          linkText="Ver Pedidos"
        />

        <StatCard
          title="Leads de Serviço"
          value={totalLeads}
          subtitle={`${newLeads} novos pedidos de contacto`}
          icon={Inbox}
          colorScheme="purple"
          trend={{ value: '+24%', isPositive: true }}
          linkHref="/admin/leads"
          linkText="Gerir Leads"
        />

        <StatCard
          title="Subscritores Newsletter"
          value={totalSubscribers}
          subtitle="Audiência ativa no site"
          icon={Mail}
          colorScheme="emerald"
          trend={{ value: '+15%', isPositive: true }}
          linkHref="/admin/newsletter"
          linkText="Lista de Emails"
        />
      </div>

      {/* Secondary Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-white border border-slate-200 p-4 sm:p-6 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-50 text-primary rounded-lg shrink-0">
            <Calendar className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xl font-extrabold text-slate-900">{upcomingEvents}</p>
            <p className="text-xs text-slate-500 font-medium">Eventos Futuros</p>
          </div>
        </div>

        <div className="flex items-center gap-3 border-l border-slate-100 pl-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-lg shrink-0">
            <MessageSquareQuote className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xl font-extrabold text-slate-900">{totalTestimonials}</p>
            <p className="text-xs text-slate-500 font-medium">Testemunhos</p>
          </div>
        </div>

        <div className="flex items-center gap-3 border-l border-slate-100 pl-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg shrink-0">
            <Handshake className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xl font-extrabold text-slate-900">{totalPartners}</p>
            <p className="text-xs text-slate-500 font-medium">Parceiros & Marcas</p>
          </div>
        </div>

        <div className="flex items-center gap-3 border-l border-slate-100 pl-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-lg shrink-0">
            <Tags className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xl font-extrabold text-slate-900">{totalCategories}</p>
            <p className="text-xs text-slate-500 font-medium">Categorias Loja</p>
          </div>
        </div>
      </div>

      {/* Main Analytics & Activity Section */}
      <div className="grid lg:grid-cols-12 gap-8">
        {/* Left 7 Cols: Evolution Chart */}
        <div className="lg:col-span-7 bg-white border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Desempenho Comercial</p>
              <h3 className="text-lg font-bold text-slate-900">Leads e Pedidos Recebidos</h3>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5 font-semibold text-slate-700">
                <span className="h-3 w-3 rounded-full bg-primary" />
                Leads de Serviço
              </div>
              <div className="flex items-center gap-1.5 font-semibold text-slate-700">
                <span className="h-3 w-3 rounded-full bg-secondary" />
                Pedidos da Loja
              </div>
            </div>
          </div>

          {/* Responsive SVG Chart */}
          <div className="w-full pt-4 pb-2">
            <div className="h-64 flex items-end justify-between gap-3 sm:gap-6 border-b border-slate-200 pb-2 px-2">
              {monthlyData.map((item, idx) => {
                const leadHeight = (item.leads / maxVal) * 100
                const orderHeight = (item.orders / maxVal) * 100

                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group relative">
                    {/* Tooltip on hover */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-12 z-20 bg-slate-900 text-white text-[11px] py-1 px-2.5 rounded shadow-lg pointer-events-none whitespace-nowrap">
                      {item.month}: {item.leads} Leads | {item.orders} Pedidos
                    </div>

                    <div className="w-full flex items-end justify-center gap-1 sm:gap-2 h-full">
                      {/* Leads Bar */}
                      <div
                        style={{ height: `${leadHeight}%` }}
                        className="w-full max-w-[20px] bg-primary rounded-t-sm hover:brightness-110 transition-all duration-300 relative"
                      />
                      {/* Orders Bar */}
                      <div
                        style={{ height: `${orderHeight}%` }}
                        className="w-full max-w-[20px] bg-secondary rounded-t-sm hover:brightness-110 transition-all duration-300 relative"
                      />
                    </div>

                    <span className="text-[11px] font-semibold text-slate-500 truncate w-full text-center">
                      {item.month.substring(0, 3)}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Período: Últimos 6 meses</span>
            <span className="font-semibold text-primary">Crescimento de +38% no último trimestre</span>
          </div>
        </div>

        {/* Right 5 Cols: Recent Activity Log */}
        <div className="lg:col-span-5 bg-white border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Auditoria & Sistema</p>
                <h3 className="text-lg font-bold text-slate-900">Atividade Recente</h3>
              </div>
              <span className="text-xs px-2.5 py-1 bg-slate-100 text-slate-700 font-bold rounded-full">
                Em Direto
              </span>
            </div>

            <div className="space-y-4 max-h-[290px] overflow-y-auto pr-1">
              {db.activities && db.activities.length > 0 ? (
                db.activities.slice(0, 6).map((act) => (
                  <div key={act.id} className="flex items-start gap-3 text-xs pb-3 border-b border-slate-100 last:border-0">
                    <div className="h-7 w-7 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                      <Clock className="h-3.5 w-3.5 text-slate-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-800 leading-snug">{act.action}</p>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1">
                        <span className="font-medium text-slate-500">{act.userName}</span>
                        <span>•</span>
                        <span>{new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 py-6 text-center">Nenhum registo de atividade recente.</p>
              )}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100">
            <Link
              href="/admin/leads"
              className="text-xs font-bold text-primary hover:text-secondary flex items-center justify-center gap-1.5 transition"
            >
              Ver todos os registos e pedidos &rarr;
            </Link>
          </div>
        </div>
      </div>

      {/* Latest Leads Table Preview */}
      <div className="bg-white border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Últimos Pedidos de Serviço (Leads)</h3>
            <p className="text-xs text-slate-500 mt-0.5">Pedidos recebidos através do formulário comercial "Solicitar Serviço".</p>
          </div>
          <Link
            href="/admin/leads"
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-xs font-bold uppercase hover:bg-primary transition shadow-sm"
          >
            Gerir Todos os Leads
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold text-[11px]">
              <tr>
                <th className="py-3 px-6">Cliente / Empresa</th>
                <th className="py-3 px-6">Serviço Solicitado</th>
                <th className="py-3 px-6">Contacto</th>
                <th className="py-3 px-6">Estado</th>
                <th className="py-3 px-6">Data</th>
                <th className="py-3 px-6 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {db.leads.slice(0, 4).map((lead) => (
                <tr key={lead.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3.5 px-6 font-bold text-slate-900">
                    {lead.name}
                  </td>
                  <td className="py-3.5 px-6 font-semibold text-primary">
                    {lead.service}
                  </td>
                  <td className="py-3.5 px-6 text-slate-500 font-mono text-[11px]">
                    {lead.phone || lead.email}
                  </td>
                  <td className="py-3.5 px-6">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide rounded-full ${
                        lead.status === 'novo'
                          ? 'bg-rose-100 text-secondary'
                          : lead.status === 'contactado'
                          ? 'bg-amber-100 text-amber-800'
                          : lead.status === 'convertido'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {lead.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-6 text-slate-400">
                    {new Date(lead.createdAt).toLocaleDateString('pt-PT')}
                  </td>
                  <td className="py-3.5 px-6 text-right">
                    <Link
                      href="/admin/leads"
                      className="text-primary hover:text-secondary font-bold inline-flex items-center gap-1"
                    >
                      Tratar &rarr;
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
