import { ArknetDatabase, StoreOrder, ServiceLead, StoreProduct, ProductReservation } from './data-store'

export type AnalyticsPeriod = 'today' | '7d' | '30d' | '90d' | 'this_month' | 'this_year' | 'all'

export interface TimeSeriesPoint {
  dateKey: string // YYYY-MM-DD or Month Label
  label: string
  revenue: number
  ordersCount: number
  leadsCount: number
  reservationsCount: number
}

export interface ProductSalesStat {
  id: string
  name: string
  sku?: string
  category: string
  image?: string
  price: number | null
  unitsSold: number
  totalRevenue: number
  currentStock: number
  inStock: boolean
  minStockAlert: number
  percentageOfRevenue: number
}

export interface CategorySalesStat {
  category: string
  ordersCount: number
  unitsSold: number
  totalRevenue: number
  percentage: number
  color: string
}

export interface LeadFunnelStat {
  status: string
  label: string
  count: number
  percentage: number
  color: string
}

export interface ServiceDemandStat {
  service: string
  count: number
  convertedCount: number
  conversionRate: number
  color: string
}

export interface PaymentChannelStat {
  name: string
  count: number
  totalRevenue: number
  percentage: number
}

export interface AnalyticsSummary {
  period: AnalyticsPeriod
  periodLabel: string
  startDate: Date
  endDate: Date
  
  // Executive KPIs
  totalRevenue: number
  previousPeriodRevenue: number
  revenueGrowthPercent: number
  
  totalOrders: number
  completedOrders: number
  pendingOrders: number
  ordersGrowthPercent: number
  
  averageTicket: number
  
  totalLeads: number
  convertedLeads: number
  leadConversionRate: number
  leadsGrowthPercent: number
  
  totalReservations: number
  confirmedReservations: number
  
  whatsappBotOrders: number
  whatsappReceiptsProcessed: number
  whatsappBotConversionRate: number
  
  // Breakdown & Series
  timeSeries: TimeSeriesPoint[]
  topSellingProducts: ProductSalesStat[]
  categoryDistribution: CategorySalesStat[]
  leadFunnel: LeadFunnelStat[]
  serviceDemand: ServiceDemandStat[]
  paymentMethods: PaymentChannelStat[]
  channelDistribution: PaymentChannelStat[]
}

const CATEGORY_COLORS = [
  '#0d6efd', // Primary Blue
  '#dc2626', // Secondary Red
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#8b5cf6', // Violet
  '#06b6d4', // Cyan
  '#ec4899', // Pink
  '#64748b', // Slate
]

/**
 * Filter items by date range based on period
 */
export function getDateRangeForPeriod(period: AnalyticsPeriod): { start: Date; end: Date; label: string } {
  const now = new Date()
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)
  let start: Date
  let label = 'Todos os Dados'

  switch (period) {
    case 'today':
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0)
      label = 'Hoje'
      break
    case '7d':
      start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      start.setHours(0, 0, 0, 0)
      label = 'Últimos 7 dias'
      break
    case '30d':
      start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      start.setHours(0, 0, 0, 0)
      label = 'Últimos 30 dias'
      break
    case '90d':
      start = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
      start.setHours(0, 0, 0, 0)
      label = 'Últimos 90 dias'
      break
    case 'this_month':
      start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0)
      label = 'Este Mês'
      break
    case 'this_year':
      start = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0)
      label = 'Este Ano'
      break
    case 'all':
    default:
      start = new Date(2025, 0, 1)
      label = 'Todo o Histórico'
      break
  }

  return { start, end, label }
}

/**
 * Calculate comprehensive analytics snapshot
 */
export function calculateAnalytics(db: ArknetDatabase, period: AnalyticsPeriod = '30d'): AnalyticsSummary {
  const { start, end, label: periodLabel } = getDateRangeForPeriod(period)
  
  // Calculate previous period for growth comparison
  const durationMs = end.getTime() - start.getTime()
  const prevStart = new Date(start.getTime() - durationMs)
  const prevEnd = new Date(start.getTime() - 1)

  const orders = db.orders || []
  const leads = db.leads || []
  const products = db.products || []
  const reservations = db.reservations || []

  // Filter current period
  const periodOrders = orders.filter((o) => {
    const d = new Date(o.createdAt || o.updatedAt || Date.now())
    return period === 'all' || (d >= start && d <= end)
  })

  const prevPeriodOrders = orders.filter((o) => {
    const d = new Date(o.createdAt || o.updatedAt || Date.now())
    return d >= prevStart && d <= prevEnd
  })

  const periodLeads = leads.filter((l) => {
    const d = new Date(l.createdAt || l.updatedAt || Date.now())
    return period === 'all' || (d >= start && d <= end)
  })

  const prevPeriodLeads = leads.filter((l) => {
    const d = new Date(l.createdAt || l.updatedAt || Date.now())
    return d >= prevStart && d <= prevEnd
  })

  const periodReservations = reservations.filter((r) => {
    const d = new Date(r.createdAt || r.updatedAt || Date.now())
    return period === 'all' || (d >= start && d <= end)
  })

  // 1. Revenue & Order KPIs
  const totalRevenue = periodOrders.reduce((sum, o) => sum + (o.total || 0), 0)
  const prevTotalRevenue = prevPeriodOrders.reduce((sum, o) => sum + (o.total || 0), 0)
  const revenueGrowthPercent = prevTotalRevenue > 0 
    ? Math.round(((totalRevenue - prevTotalRevenue) / prevTotalRevenue) * 100) 
    : (totalRevenue > 0 ? 100 : 0)

  const totalOrders = periodOrders.length
  const completedOrders = periodOrders.filter((o) => o.status === 'fechado' || o.botStatus === 'confirmed').length
  const pendingOrders = periodOrders.filter((o) => o.status === 'novo' || o.status === 'em_contacto').length
  
  const prevTotalOrders = prevPeriodOrders.length
  const ordersGrowthPercent = prevTotalOrders > 0
    ? Math.round(((totalOrders - prevTotalOrders) / prevTotalOrders) * 100)
    : (totalOrders > 0 ? 100 : 0)

  const averageTicket = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0

  // 2. Leads KPIs
  const totalLeads = periodLeads.length
  const convertedLeads = periodLeads.filter((l) => l.status === 'convertido').length
  const leadConversionRate = totalLeads > 0 ? Math.round((convertedLeads / totalLeads) * 100) : 0
  
  const prevTotalLeads = prevPeriodLeads.length
  const leadsGrowthPercent = prevTotalLeads > 0
    ? Math.round(((totalLeads - prevTotalLeads) / prevTotalLeads) * 100)
    : (totalLeads > 0 ? 100 : 0)

  // 3. Reservations KPIs
  const totalReservations = periodReservations.length
  const confirmedReservations = periodReservations.filter((r) => r.status === 'confirmada' || r.status === 'notificado').length

  // 4. WhatsApp Bot KPIs
  const whatsappBotOrders = periodOrders.filter((o) => !!o.botStatus || !!o.whatsappPhone).length
  const whatsappReceiptsProcessed = periodOrders.filter((o) => !!o.receiptUrl || o.botStatus === 'receipt_received' || o.botStatus === 'confirmed').length
  const whatsappConfirmed = periodOrders.filter((o) => o.botStatus === 'confirmed').length
  const whatsappBotConversionRate = whatsappBotOrders > 0 ? Math.round((whatsappConfirmed / whatsappBotOrders) * 100) : 0

  // 5. Build Time Series (Dynamic granularity: Daily for <= 30d, Monthly for > 30d or all)
  const timeSeriesMap = new Map<string, TimeSeriesPoint>()

  if (period === 'today' || period === '7d' || period === '30d') {
    // Generate all day intervals in range
    const daysCount = period === 'today' ? 1 : period === '7d' ? 7 : 30
    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date(end.getTime() - i * 24 * 60 * 60 * 1000)
      const dateKey = d.toISOString().split('T')[0]
      const label = d.toLocaleDateString('pt-AO', { day: '2-digit', month: 'short' })
      timeSeriesMap.set(dateKey, {
        dateKey,
        label,
        revenue: 0,
        ordersCount: 0,
        leadsCount: 0,
        reservationsCount: 0,
      })
    }
  } else {
    // Monthly intervals
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
    const curYear = end.getFullYear()
    for (let m = 0; m < 12; m++) {
      const monthKey = `${curYear}-${String(m + 1).padStart(2, '0')}`
      timeSeriesMap.set(monthKey, {
        dateKey: monthKey,
        label: `${months[m]} ${curYear}`,
        revenue: 0,
        ordersCount: 0,
        leadsCount: 0,
        reservationsCount: 0,
      })
    }
  }

  // Populate time series with orders
  periodOrders.forEach((order) => {
    const d = new Date(order.createdAt || Date.now())
    const dateKey = (period === 'today' || period === '7d' || period === '30d')
      ? d.toISOString().split('T')[0]
      : `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`

    if (timeSeriesMap.has(dateKey)) {
      const point = timeSeriesMap.get(dateKey)!
      point.revenue += order.total || 0
      point.ordersCount += 1
    }
  })

  // Populate time series with leads
  periodLeads.forEach((lead) => {
    const d = new Date(lead.createdAt || Date.now())
    const dateKey = (period === 'today' || period === '7d' || period === '30d')
      ? d.toISOString().split('T')[0]
      : `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`

    if (timeSeriesMap.has(dateKey)) {
      const point = timeSeriesMap.get(dateKey)!
      point.leadsCount += 1
    }
  })

  // Populate time series with reservations
  periodReservations.forEach((res) => {
    const d = new Date(res.createdAt || Date.now())
    const dateKey = (period === 'today' || period === '7d' || period === '30d')
      ? d.toISOString().split('T')[0]
      : `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`

    if (timeSeriesMap.has(dateKey)) {
      const point = timeSeriesMap.get(dateKey)!
      point.reservationsCount += (Number(res.quantity) || 1)
    }
  })

  const timeSeries = Array.from(timeSeriesMap.values())

  // 6. Top Selling Products
  const productCatalogMap = new Map<string, StoreProduct>(products.map((p) => [p.id, p]))
  const productSalesMap = new Map<string, { unitsSold: number; totalRevenue: number; name: string; category: string; image?: string; price: number | null; sku?: string }>()

  periodOrders.forEach((order) => {
    (order.items || []).forEach((item) => {
      const prod = productCatalogMap.get(item.productId)
      const name = prod?.name || item.productName || 'Produto'
      const category = prod?.category || 'Geral'
      const image = prod?.image || item.image
      const price = item.price ?? prod?.price ?? 0
      const units = Number(item.quantity) || 1
      const lineTotal = (Number(price) || 0) * units

      const existing = productSalesMap.get(item.productId) || {
        unitsSold: 0,
        totalRevenue: 0,
        name,
        category,
        image,
        price,
        sku: prod?.sku,
      }

      existing.unitsSold += units
      existing.totalRevenue += lineTotal
      if (!existing.image && image) existing.image = image
      productSalesMap.set(item.productId, existing)
    })
  })

  const topSellingProducts: ProductSalesStat[] = Array.from(productSalesMap.entries())
    .map(([id, stat]) => {
      const prod = productCatalogMap.get(id)
      const rawStock = prod?.quantity
      const parsedStock = typeof rawStock === 'number' ? rawStock : (typeof rawStock === 'string' ? parseInt(rawStock, 10) : NaN)
      const currentStock = !isNaN(parsedStock) ? Math.max(0, parsedStock) : (prod?.inStock ? 15 : 0)
      const rawMin = prod?.minStockAlert
      const parsedMin = typeof rawMin === 'number' ? rawMin : (typeof rawMin === 'string' ? parseInt(rawMin, 10) : NaN)
      const minStockAlert = !isNaN(parsedMin) ? Math.max(1, parsedMin) : 5
      const inStock = prod ? (prod.inStock && currentStock > 0) : true
      const percentageOfRevenue = totalRevenue > 0 ? Math.round((stat.totalRevenue / totalRevenue) * 100) : 0

      return {
        id,
        name: stat.name,
        sku: stat.sku,
        category: stat.category,
        image: stat.image,
        price: stat.price,
        unitsSold: stat.unitsSold,
        totalRevenue: stat.totalRevenue,
        currentStock,
        inStock,
        minStockAlert,
        percentageOfRevenue,
      }
    })
    .sort((a, b) => b.totalRevenue - a.totalRevenue)

  // 7. Category Distribution
  const categoryMap = new Map<string, { ordersCount: number; unitsSold: number; totalRevenue: number }>()

  periodOrders.forEach((order) => {
    (order.items || []).forEach((item) => {
      const prod = productCatalogMap.get(item.productId)
      const cat = prod?.category || 'Geral'
      const units = Number(item.quantity) || 1
      const rev = ((item.price ?? prod?.price ?? 0)) * units

      const existing = categoryMap.get(cat) || { ordersCount: 0, unitsSold: 0, totalRevenue: 0 }
      existing.ordersCount += 1
      existing.unitsSold += units
      existing.totalRevenue += rev
      categoryMap.set(cat, existing)
    })
  })

  const categoryDistribution: CategorySalesStat[] = Array.from(categoryMap.entries())
    .map(([category, stat], index) => ({
      category,
      ordersCount: stat.ordersCount,
      unitsSold: stat.unitsSold,
      totalRevenue: stat.totalRevenue,
      percentage: totalRevenue > 0 ? Math.round((stat.totalRevenue / totalRevenue) * 100) : 0,
      color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
    }))
    .sort((a, b) => b.totalRevenue - a.totalRevenue)

  // 8. Lead Funnel
  const novoLeads = periodLeads.filter((l) => l.status === 'novo').length
  const contactadoLeads = periodLeads.filter((l) => l.status === 'contactado').length
  const convertidoLeads = periodLeads.filter((l) => l.status === 'convertido').length
  const arquivadoLeads = periodLeads.filter((l) => l.status === 'arquivado').length

  const leadFunnel: LeadFunnelStat[] = [
    {
      status: 'novo',
      label: 'Novos Contactos / Não Lidos',
      count: novoLeads,
      percentage: totalLeads > 0 ? Math.round((novoLeads / totalLeads) * 100) : 0,
      color: '#0d6efd',
    },
    {
      status: 'contactado',
      label: 'Em Tratamento / Proposta Enviada',
      count: contactadoLeads,
      percentage: totalLeads > 0 ? Math.round((contactadoLeads / totalLeads) * 100) : 0,
      color: '#f59e0b',
    },
    {
      status: 'convertido',
      label: 'Ganhos / Convertidos em Contratos',
      count: convertidoLeads,
      percentage: totalLeads > 0 ? Math.round((convertidoLeads / totalLeads) * 100) : 0,
      color: '#10b981',
    },
    {
      status: 'arquivado',
      label: 'Arquivados / Cancelados',
      count: arquivadoLeads,
      percentage: totalLeads > 0 ? Math.round((arquivadoLeads / totalLeads) * 100) : 0,
      color: '#64748b',
    },
  ]

  // 9. Service Demand Breakdown
  const serviceMap = new Map<string, { count: number; convertedCount: number }>()
  periodLeads.forEach((lead) => {
    const s = lead.service || 'Geral'
    const existing = serviceMap.get(s) || { count: 0, convertedCount: 0 }
    existing.count += 1
    if (lead.status === 'convertido') existing.convertedCount += 1
    serviceMap.set(s, existing)
  })

  const serviceDemand: ServiceDemandStat[] = Array.from(serviceMap.entries())
    .map(([service, stat], index) => ({
      service,
      count: stat.count,
      convertedCount: stat.convertedCount,
      conversionRate: stat.count > 0 ? Math.round((stat.convertedCount / stat.count) * 100) : 0,
      color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
    }))
    .sort((a, b) => b.count - a.count)

  // 10. Payment and Channel Stats
  const paymentMethodsMap = new Map<string, { count: number; totalRevenue: number }>()
  periodOrders.forEach((o) => {
    const method = o.paymentMethod || (o.botStatus ? 'Multicaixa Express (WhatsApp Bot)' : 'Transferência Bancária')
    const existing = paymentMethodsMap.get(method) || { count: 0, totalRevenue: 0 }
    existing.count += 1
    existing.totalRevenue += o.total || 0
    paymentMethodsMap.set(method, existing)
  })

  const paymentMethods: PaymentChannelStat[] = Array.from(paymentMethodsMap.entries())
    .map(([name, stat]) => ({
      name,
      count: stat.count,
      totalRevenue: stat.totalRevenue,
      percentage: totalRevenue > 0 ? Math.round((stat.totalRevenue / totalRevenue) * 100) : 0,
    }))
    .sort((a, b) => b.totalRevenue - a.totalRevenue)

  const channelDistribution: PaymentChannelStat[] = [
    {
      name: 'WhatsApp Bot (Domingas)',
      count: whatsappBotOrders,
      totalRevenue: periodOrders.filter((o) => !!o.botStatus || !!o.whatsappPhone).reduce((sum, o) => sum + (o.total || 0), 0),
      percentage: totalOrders > 0 ? Math.round((whatsappBotOrders / totalOrders) * 100) : 0,
    },
    {
      name: 'Loja Web Direta',
      count: totalOrders - whatsappBotOrders,
      totalRevenue: periodOrders.filter((o) => !o.botStatus && !o.whatsappPhone).reduce((sum, o) => sum + (o.total || 0), 0),
      percentage: totalOrders > 0 ? Math.round(((totalOrders - whatsappBotOrders) / totalOrders) * 100) : 0,
    },
  ]

  return {
    period,
    periodLabel,
    startDate: start,
    endDate: end,
    totalRevenue,
    previousPeriodRevenue: prevTotalRevenue,
    revenueGrowthPercent,
    totalOrders,
    completedOrders,
    pendingOrders,
    ordersGrowthPercent,
    averageTicket,
    totalLeads,
    convertedLeads,
    leadConversionRate,
    leadsGrowthPercent,
    totalReservations,
    confirmedReservations,
    whatsappBotOrders,
    whatsappReceiptsProcessed,
    whatsappBotConversionRate,
    timeSeries,
    topSellingProducts,
    categoryDistribution,
    leadFunnel,
    serviceDemand,
    paymentMethods,
    channelDistribution,
  }
}

/**
 * Export helpers for CSV & JSON
 */
export function exportAnalyticsToCsv(summary: AnalyticsSummary): string {
  const lines: string[] = []
  
  lines.push('=== RELATÓRIO EXECUTIVO E ANALYTICS - ARKNET TECNOLOGIA ===')
  lines.push(`Período Selecionado:;${summary.periodLabel}`)
  lines.push(`Data de Extração:;${new Date().toLocaleString('pt-AO')}`)
  lines.push('')
  
  lines.push('--- MÉTRICAS PRINCIPAIS (KPIS) ---')
  lines.push(`Receita Total (Kz):;${summary.totalRevenue}`)
  lines.push(`Crescimento de Receita (%):;${summary.revenueGrowthPercent}%`)
  lines.push(`Total de Encomendas:;${summary.totalOrders}`)
  lines.push(`Encomendas Concluídas:;${summary.completedOrders}`)
  lines.push(`Ticket Médio (Kz):;${summary.averageTicket}`)
  lines.push(`Total de Leads / Cotações:;${summary.totalLeads}`)
  lines.push(`Leads Convertidos:;${summary.convertedLeads}`)
  lines.push(`Taxa de Conversão de Leads (%):;${summary.leadConversionRate}%`)
  lines.push(`Total Reservas (Em Trânsito):;${summary.totalReservations}`)
  lines.push(`Interações Bot WhatsApp:;${summary.whatsappBotOrders}`)
  lines.push(`Comprovativos WhatsApp Validados:;${summary.whatsappReceiptsProcessed}`)
  lines.push('')

  lines.push('--- PRODUTOS MAIS VENDIDOS ---')
  lines.push('Posição;Produto;Categoria;Preço Unitário (Kz);Unidades Vendidas;Receita Gerada (Kz);% da Receita;Stock Atual')
  summary.topSellingProducts.forEach((p, index) => {
    lines.push(`${index + 1};"${p.name.replace(/"/g, '""')}";"${p.category}";${p.price ?? 0};${p.unitsSold};${p.totalRevenue};${p.percentageOfRevenue}%;${p.currentStock}`)
  })
  lines.push('')

  lines.push('--- EVOLUÇÃO TEMPORAL (VENDAS E LEADS) ---')
  lines.push('Data / Período;Receita (Kz);Qtd Encomendas;Qtd Leads;Qtd Reservas')
  summary.timeSeries.forEach((pt) => {
    lines.push(`"${pt.label}";${pt.revenue};${pt.ordersCount};${pt.leadsCount};${pt.reservationsCount}`)
  })
  lines.push('')

  lines.push('--- DISTRIBUIÇÃO POR CATEGORIA ---')
  lines.push('Categoria;Pedidos;Unidades;Receita (Kz);% do Total')
  summary.categoryDistribution.forEach((c) => {
    lines.push(`"${c.category}";${c.ordersCount};${c.unitsSold};${c.totalRevenue};${c.percentage}%`)
  })
  lines.push('')

  lines.push('--- FUNIL DE CONVERSÃO DE LEADS ---')
  lines.push('Fase / Estado;Qtd;% do Total')
  summary.leadFunnel.forEach((f) => {
    lines.push(`"${f.label}";${f.count};${f.percentage}%`)
  })

  return lines.join('\n')
}
