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
  ArrowRight,
  PlusCircle,
  Clock,
  Truck,
} from 'lucide-react'
import { dataStore, ArknetDatabase } from '@/lib/data-store'
import { StatCard } from '@/components/admin/stat-card'

export default function AdminOverviewPage() {
  const [db, setDb] = useState<ArknetDatabase>(dataStore.getSnapshot())

  useEffect(() => {
    const update = () => setDb({ ...dataStore.getSnapshot() })
    const unsub = dataStore.subscribe(update)
    // Força sincronização com o servidor ao carregar o painel
    dataStore.syncWithServer().then((synced) => {
      if (synced) update()
    })
    return () => unsub()
  }, [])

  // Métricas calculadas
  const totalProducts = db.products.length
  const inStockProducts = db.products.filter((p) => typeof p.quantity === 'number' && p.quantity > 0).length
  const totalOrders = db.orders.length
  const newOrders = db.orders.filter((o) => o.status === 'novo').length
  const totalLeads = db.leads.length
  const newLeads = db.leads.filter((l) => l.status === 'novo').length
  const totalSubscribers = db.subscribers.filter((s) => s.status === 'active').length
  const upcomingEvents = db.events.filter((e) => e.status === 'agendado').length
  const totalPartners = db.partners.length
  const totalTestimonials = db.testimonials.length
  const totalCategories = db.categories.length
  const totalReservations = (db.reservations || []).length
  const pendingReservations = (db.reservations || []).filter((r) => r.status === 'pendente').length

  // Procura de produtos em trânsito com dados sempre atualizados do catálogo
  const productMap = new Map((db.products || []).map((p) => [p.id, p]))
  const productDemand = (db.reservations || []).reduce((acc, r) => {
    const liveProduct = productMap.get(r.productId)
    const currentName = liveProduct?.name || r.productName
    const currentImage = liveProduct?.image || r.productImage
    const currentPrice = liveProduct?.price ?? r.productPrice

    if (!acc[r.productId]) {
      acc[r.productId] = {
        id: r.productId,
        name: currentName,
        image: currentImage,
        price: currentPrice,
        count: 0,
        units: 0,
      }
    } else {
      if (!acc[r.productId].image && currentImage) {
        acc[r.productId].image = currentImage
      }
      if (!acc[r.productId].name && currentName) {
        acc[r.productId].name = currentName
      }
    }
    acc[r.productId].count += 1
    acc[r.productId].units += (Number(r.quantity) || 1)
    return acc
  }, {} as Record<string, { id: string; name: string; image?: string; price: number | null; count: number; units: number }>)

  const topDemandProducts = Object.values(productDemand).sort((a, b) => b.units - a.units).slice(0, 3)

  const currentDate = new Date()
  const monthlyData = Array.from({ length: 6 }, (_, index) => {
    const monthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 5 + index, 1)
    const nextMonthDate = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 1)
    const isInMonth = (createdAt: string) => {
      const timestamp = new Date(createdAt).getTime()
      return Number.isFinite(timestamp) && timestamp >= monthDate.getTime() && timestamp < nextMonthDate.getTime()
    }

    return {
      month: monthDate.toLocaleDateString('pt-PT', { month: 'short' }).replace('.', ''),
      year: monthDate.getFullYear(),
      leads: db.leads.filter((lead) => isInMonth(lead.createdAt)).length,
      orders: db.orders.filter((order) => isInMonth(order.createdAt)).length,
    }
  })

  const maxVal = Math.max(...monthlyData.map((item) => Math.max(item.leads, item.orders)), 1)
  const hasMonthlyActivity = monthlyData.some((item) => item.leads > 0 || item.orders > 0)

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Visão geral</h1>
          <p className="mt-1 text-sm text-slate-600">Resumo de produtos, vendas e atividade comercial.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/admin/produtos"
              className="inline-flex items-center gap-2 border border-slate-300 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <PlusCircle className="h-4 w-4 text-primary" />
              Novo Produto
            </Link>
            <Link
              href="/admin/leads"
              className="inline-flex items-center gap-2 bg-primary px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-primary-hover"
            >
              <Inbox className="h-4 w-4" />
              Pedidos de serviço ({newLeads})
            </Link>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Produtos na Loja"
          value={totalProducts}
          subtitle={`${inStockProducts} produtos com stock registado`}
          icon={Package}
          linkHref="/admin/produtos"
          linkText="Gerir Catálogo"
        />

        <StatCard
          title="Pedidos & Cotações"
          value={totalOrders}
          subtitle={`${newOrders} novos pedidos pendentes`}
          icon={ShoppingCart}
          linkHref="/admin/pedidos"
          linkText="Ver Pedidos"
        />

        <StatCard
          title="Leads de Serviço"
          value={totalLeads}
          subtitle={`${newLeads} novos pedidos de contacto`}
          icon={Inbox}
          linkHref="/admin/leads"
          linkText="Gerir Leads"
        />

        <StatCard
          title="Subscritores Newsletter"
          value={totalSubscribers}
          subtitle="Audiência ativa no site"
          icon={Mail}
          linkHref="/admin/newsletter"
          linkText="Lista de Emails"
        />
      </div>

      {/* Secondary Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 bg-white border border-slate-200 p-4 sm:p-6 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 text-primary shrink-0">
            <Truck className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xl font-extrabold text-slate-900">{totalReservations}</p>
            <p className="text-xs text-slate-500 font-medium">Reservas ({pendingReservations} pend.)</p>
          </div>
        </div>

        <div className="flex items-center gap-3 border-l border-slate-100 pl-4">
          <div className="p-3 bg-blue-50 text-primary rounded-lg shrink-0">
            <Calendar className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xl font-extrabold text-slate-900">{upcomingEvents}</p>
            <p className="text-xs text-slate-500 font-medium">Eventos Futuros</p>
          </div>
        </div>

        <div className="flex items-center gap-3 border-l border-slate-100 pl-4">
          <div className="p-3 bg-primary/10 text-primary shrink-0">
            <MessageSquareQuote className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xl font-extrabold text-slate-900">{totalTestimonials}</p>
            <p className="text-xs text-slate-500 font-medium">Testemunhos</p>
          </div>
        </div>

        <div className="flex items-center gap-3 border-l border-slate-100 pl-4">
          <div className="p-3 bg-primary/10 text-primary shrink-0">
            <Handshake className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xl font-extrabold text-slate-900">{totalPartners}</p>
            <p className="text-xs text-slate-500 font-medium">Parceiros &amp; Marcas</p>
          </div>
        </div>

        <div className="flex items-center gap-3 border-l border-slate-100 pl-4">
          <div className="p-3 bg-primary/10 text-primary shrink-0">
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
                Leads
              </div>
              <div className="flex items-center gap-1.5 font-semibold text-slate-700">
                <span className="h-3 w-3 rounded-full bg-secondary" />
                Pedidos
              </div>
              <Link
                href="/admin/relatorios"
                className="ml-2 font-bold text-primary hover:text-secondary inline-flex items-center gap-1 border border-primary/20 bg-primary/5 px-2.5 py-1 rounded-md transition"
              >
                Analytics Completo <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>

          {/* Responsive SVG Chart */}
          <div className="w-full pt-4 pb-2">
            <div className="h-64 flex items-end justify-between gap-3 sm:gap-6 border-b border-slate-200 pb-2 px-2">
              {hasMonthlyActivity ? monthlyData.map((item, idx) => {
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
              }) : (
                <p className="w-full self-center text-center text-sm text-slate-500">Sem registos nos últimos seis meses.</p>
              )}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Registos por data de criação</span>
            <span>{monthlyData[0].month} {monthlyData[0].year} – {monthlyData[5].month} {monthlyData[5].year}</span>
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
              <span className="text-xs text-slate-500">
                Registos recentes
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
      {/* WIDGET: PROCURA DE PRODUTOS EM TRÂNSITO (RESERVAS) */}
      {topDemandProducts.length > 0 && (
        <div className="bg-white border border-slate-200 p-6 shadow-xs rounded-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-primary/10 text-primary">
                <Truck className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Procura de Equipamentos em Trânsito (Reservas Ativas)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Itens fora de stock com maior volume de pedidos de reserva por clientes.
                </p>
              </div>
            </div>

            <Link
              href="/admin/reservas"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-semibold transition self-start sm:self-auto"
            >
              <span>Gerir Todas as Reservas ({totalReservations})</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {topDemandProducts.map((p, idx) => (
              <div
                key={p.id}
                className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3"
              >
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-semibold text-primary block">
                    Posição {idx + 1} por procura
                  </span>
                  <h4 className="text-xs font-bold text-slate-900 truncate mt-0.5">
                    {p.name}
                  </h4>
                  <p className="text-[11px] text-slate-500 font-semibold">
                    {p.count} cliente(s) interessado(s)
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className="inline-block bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary font-mono">
                    {p.units} un.
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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
