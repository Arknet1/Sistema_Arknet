'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  Truck,
  Clock,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  MessageCircle,
  Phone,
  Mail,
  Building2,
  Trash2,
  Package,
  ArrowUpRight,
  TrendingUp,
  User,
  ShoppingBag,
  RefreshCw,
} from 'lucide-react'
import {
  dataStore,
  ProductReservation,
  ReservationStatus,
  StoreProduct,
} from '@/lib/data-store'
import { formatProdutoPrice } from '@/lib/format-produto-price'
import { useToast } from '@/lib/toast-context'
import { StatCard } from '@/components/admin/stat-card'

const STATUS_CONFIG: Record<
  ReservationStatus,
  { label: string; bg: string; text: string; border: string }
> = {
  pendente: {
    label: 'Pendente',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
  },
  em_contacto: {
    label: 'Em Contacto',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
  },
  confirmada: {
    label: 'Confirmada',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
  },
  notificado: {
    label: 'Cliente Notificado',
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    border: 'border-purple-200',
  },
  cancelada: {
    label: 'Cancelada',
    bg: 'bg-slate-100',
    text: 'text-slate-600',
    border: 'border-slate-300',
  },
}

export default function AdminReservasPage() {
  const { success, info } = useToast()
  const [reservations, setReservations] = useState<ProductReservation[]>([])
  const [products, setProducts] = useState<StoreProduct[]>([])
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    const sync = () => {
      const db = dataStore.getSnapshot()
      setReservations(db.reservations || [])
      setProducts(db.products || [])
    }
    sync()
    const unsub = dataStore.subscribe(sync)
    return () => unsub()
  }, [])

  // Métricas
  const totalReservations = reservations.length
  const pendingReservations = reservations.filter((r) => r.status === 'pendente').length
  const totalUnitsReserved = reservations.reduce((acc, r) => acc + (r.quantity || 1), 0)

  // Mapeamento dinâmico de produtos para garantir imagens e nomes sempre atualizados
  const productMap = new Map(products.map((p) => [p.id, p]))

  // Agrupamento de procura por produto
  const productDemandMap = reservations.reduce((acc, r) => {
    const liveProduct = productMap.get(r.productId)
    const currentName = liveProduct?.name || r.productName
    const currentImage = liveProduct?.image || r.productImage
    const currentPrice = liveProduct?.price ?? r.productPrice

    if (!acc[r.productId]) {
      acc[r.productId] = {
        productId: r.productId,
        productName: currentName,
        productImage: currentImage,
        productPrice: currentPrice,
        count: 0,
        units: 0,
      }
    } else {
      if (!acc[r.productId].productImage && currentImage) {
        acc[r.productId].productImage = currentImage
      }
      if (!acc[r.productId].productName && currentName) {
        acc[r.productId].productName = currentName
      }
    }
    acc[r.productId].count += 1
    acc[r.productId].units += r.quantity || 1
    return acc
  }, {} as Record<string, { productId: string; productName: string; productImage?: string; productPrice: number | null; count: number; units: number }>)

  const sortedProductDemand = Object.values(productDemandMap).sort(
    (a, b) => b.units - a.units
  )

  // Filtragem
  const filteredReservations = reservations.filter((r) => {
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter
    const term = searchTerm.toLowerCase()
    const matchesSearch =
      r.reservationNumber.toLowerCase().includes(term) ||
      r.customerName.toLowerCase().includes(term) ||
      r.customerEmail.toLowerCase().includes(term) ||
      r.customerPhone.toLowerCase().includes(term) ||
      r.productName.toLowerCase().includes(term) ||
      (r.customerCompany && r.customerCompany.toLowerCase().includes(term))

    return matchesStatus && matchesSearch
  })

  const handleStatusChange = (id: string, newStatus: ReservationStatus) => {
    dataStore.updateReservation(id, { status: newStatus })
    success(`Estado da reserva #${id} atualizado para "${STATUS_CONFIG[newStatus].label}".`)
  }

  const handleDelete = (id: string) => {
    if (confirm('Tem a certeza que pretende eliminar esta reserva?')) {
      dataStore.deleteReservation(id)
      info('Reserva eliminada com sucesso.')
    }
  }

  const getWhatsAppNotifyLink = (r: ProductReservation) => {
    const text = encodeURIComponent(
      `Olá ${r.customerName}! 👋 Informamos que o produto *"${r.productName}"* (Reserva #${r.reservationNumber}, ${r.quantity} un.) já chegou ao armazém central da ARKNET em Luanda e está pronto para entrega/levantamento. Como prefere proceder?`
    )
    const phone = (r.customerPhone || '').replace(/\D/g, '')
    return `https://wa.me/${phone.startsWith('244') ? phone : `244${phone}`}?text=${text}`
  }

  return (
    <div className="space-y-8 pb-12">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-3 py-1 rounded-full w-fit mb-2 border border-amber-200">
            <Truck className="h-3.5 w-3.5" />
            <span>Gestão de Reservas &amp; Procura de Stock</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            Reservas de Produtos em Trânsito
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Monitorize o interesse e a procura do mercado por equipamentos fora de stock para orientar compras e entregas prioritárias.
          </p>
        </div>

        <Link
          href="/loja"
          target="_blank"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-primary text-white text-xs font-bold uppercase tracking-wider rounded-lg transition self-start sm:self-auto shadow-xs"
        >
          <ShoppingBag className="h-4 w-4" />
          <span>Ver Loja Online</span>
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total de Reservas"
          value={totalReservations}
          subtitle="Pedidos de reserva registados"
          icon={Truck}
          colorScheme="amber"
          linkHref="#lista-reservas"
          linkText="Ver Lista"
        />

        <StatCard
          title="Reservas Pendentes"
          value={pendingReservations}
          subtitle="Aguardando chegada do produto"
          icon={Clock}
          colorScheme="blue"
          linkHref="#lista-reservas"
          linkText="Filtrar Pendentes"
        />

        <StatCard
          title="Unidades Solicitadas"
          value={totalUnitsReserved}
          subtitle="Equipamentos requisitados"
          icon={Package}
          colorScheme="purple"
        />

        <StatCard
          title="Produtos em Procura"
          value={sortedProductDemand.length}
          subtitle="Itens com interesse ativo"
          icon={TrendingUp}
          colorScheme="emerald"
        />
      </div>

      {/* PROCURA DE MERCADO: TOP PRODUTOS MAIS RESERVADOS */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Procura de Mercado por Produto (Prioridade de Reposição)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Identifique quais os equipamentos em trânsito com maior procura para reforço de encomendas aos fornecedores.
            </p>
          </div>
          <span className="text-xs font-bold text-slate-400 font-mono">
            {sortedProductDemand.length} produtos procurados
          </span>
        </div>

        {sortedProductDemand.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
            {sortedProductDemand.map((item, idx) => (
              <div
                key={item.productId}
                className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-4 hover:bg-slate-100/80 transition"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-12 w-12 bg-white border border-slate-200 rounded-lg shrink-0 overflow-hidden flex items-center justify-center p-1">
                    {item.productImage ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={item.productImage}
                        alt={item.productName}
                        className="max-h-full max-w-full object-contain"
                      />
                    ) : (
                      <Package className="h-6 w-6 text-slate-300" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold uppercase text-slate-400">
                      Rank #{idx + 1}
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 truncate">
                      {item.productName}
                    </h4>
                    <p className="text-[11px] font-black text-primary mt-0.5">
                      {formatProdutoPrice(item.productPrice)}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="inline-block px-2.5 py-1 bg-amber-500 text-white rounded-lg text-xs font-black font-mono shadow-xs">
                    {item.units} un.
                  </span>
                  <span className="block text-[10px] text-slate-500 font-medium mt-1">
                    {item.count} reserva(s)
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400 py-4 text-center">
            Nenhuma reserva registada até ao momento.
          </p>
        )}
      </div>

      {/* LISTA COMPLETA DE RESERVAS */}
      <div id="lista-reservas" className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        
        {/* Toolbar */}
        <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-black text-slate-900">
              Todas as Reservas de Clientes
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Contacte os clientes ou atualize os estados de notificação de chegada de mercadoria.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Pesquisar por cliente, telefone, produto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-64 pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-primary focus:bg-white transition"
              />
            </div>

            {/* Filter Status */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 outline-none cursor-pointer"
            >
              <option value="all">Todos os Estados</option>
              <option value="pendente">Pendente</option>
              <option value="em_contacto">Em Contacto</option>
              <option value="notificado">Cliente Notificado</option>
              <option value="confirmada">Confirmada</option>
              <option value="cancelada">Cancelada</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                <th className="py-3.5 px-4">Reserva</th>
                <th className="py-3.5 px-4">Produto &amp; Quantidade</th>
                <th className="py-3.5 px-4">Cliente &amp; Contacto</th>
                <th className="py-3.5 px-4">Estado</th>
                <th className="py-3.5 px-4 text-right">Ações Rápidas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredReservations.map((r) => {
                const conf = STATUS_CONFIG[r.status] || STATUS_CONFIG.pendente
                return (
                  <tr key={r.id} className="hover:bg-slate-50/80 transition">
                    
                    {/* Número & Data */}
                    <td className="py-4 px-4 align-top font-mono">
                      <span className="font-black text-slate-900 block">
                        {r.reservationNumber}
                      </span>
                      <span className="text-[11px] text-slate-400 block mt-0.5">
                        {new Date(r.createdAt).toLocaleDateString('pt-AO', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </td>

                    {/* Produto & Qty */}
                    <td className="py-4 px-4 align-top max-w-xs">
                      {(() => {
                        const liveProduct = productMap.get(r.productId)
                        const rowImage = liveProduct?.image || r.productImage
                        const rowName = liveProduct?.name || r.productName
                        const rowPrice = liveProduct?.price ?? r.productPrice
                        return (
                          <div className="flex items-start gap-2.5">
                            <div className="h-10 w-10 bg-slate-50 border border-slate-200 rounded shrink-0 overflow-hidden flex items-center justify-center p-0.5">
                              {rowImage ? (
                                /* eslint-disable-next-line @next/next/no-img-element */
                                <img
                                  src={rowImage}
                                  alt={rowName}
                                  className="max-h-full max-w-full object-contain"
                                />
                              ) : (
                                <Truck className="h-4 w-4 text-slate-400" />
                              )}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 leading-snug line-clamp-2">
                                {rowName}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="px-2 py-0.5 bg-slate-900 text-white rounded text-[10px] font-black">
                                  {r.quantity} un.
                                </span>
                                <span className="text-[11px] text-slate-500 font-semibold">
                                  {formatProdutoPrice(rowPrice)}
                                </span>
                              </div>
                              {r.notes && (
                                <p className="text-[10px] text-slate-500 italic mt-1 bg-amber-50/60 p-1.5 rounded border border-amber-200/50">
                                  "{r.notes}"
                                </p>
                              )}
                            </div>
                          </div>
                        )
                      })()}
                    </td>

                    {/* Cliente & Contacto */}
                    <td className="py-4 px-4 align-top">
                      <p className="font-bold text-slate-900 flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5 text-slate-400" />
                        {r.customerName}
                      </p>
                      {r.customerCompany && (
                        <p className="text-[11px] text-slate-600 flex items-center gap-1 mt-0.5 font-medium">
                          <Building2 className="h-3 w-3 text-slate-400" />
                          {r.customerCompany}
                        </p>
                      )}
                      <div className="space-y-0.5 mt-1.5 text-[11px] text-slate-500">
                        <a
                          href={`tel:${r.customerPhone}`}
                          className="flex items-center gap-1 hover:text-primary transition"
                        >
                          <Phone className="h-3 w-3" />
                          {r.customerPhone}
                        </a>
                        <a
                          href={`mailto:${r.customerEmail}`}
                          className="flex items-center gap-1 hover:text-primary transition"
                        >
                          <Mail className="h-3 w-3" />
                          {r.customerEmail}
                        </a>
                      </div>
                    </td>

                    {/* Estado Selector */}
                    <td className="py-4 px-4 align-top">
                      <select
                        value={r.status}
                        onChange={(e) =>
                          handleStatusChange(r.id, e.target.value as ReservationStatus)
                        }
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-bold border outline-none cursor-pointer ${conf.bg} ${conf.text} ${conf.border}`}
                      >
                        <option value="pendente">Pendente</option>
                        <option value="em_contacto">Em Contacto</option>
                        <option value="notificado">Cliente Notificado</option>
                        <option value="confirmada">Confirmada</option>
                        <option value="cancelada">Cancelada</option>
                      </select>
                    </td>

                    {/* Ações */}
                    <td className="py-4 px-4 align-top text-right space-x-2">
                      <a
                        href={getWhatsAppNotifyLink(r)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold uppercase transition shadow-2xs"
                        title="Avisar cliente por WhatsApp"
                      >
                        <MessageCircle className="h-3.5 w-3.5" />
                        <span>Notificar WhatsApp</span>
                      </a>

                      <button
                        type="button"
                        onClick={() => handleDelete(r.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        title="Eliminar reserva"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>

                  </tr>
                )
              })}
            </tbody>
          </table>

          {filteredReservations.length === 0 && (
            <div className="py-12 text-center text-slate-400 text-xs">
              Nenhuma reserva corresponde aos filtros selecionados.
            </div>
          )}
        </div>

      </div>

    </div>
  )
}
