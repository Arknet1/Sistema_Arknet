'use client'

import React, { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Calendar,
  Download,
  Printer,
  RefreshCw,
  ShoppingCart,
  Users,
  Layers,
  Package,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  DollarSign,
  Bot,
  Zap,
  Tag,
  Share2,
  FileSpreadsheet,
  FileJson,
  Truck,
  AlertTriangle,
  ChevronRight,
  ExternalLink,
  FileText,
  ShieldCheck,
  Eye,
  LayoutDashboard,
} from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { dataStore, ArknetDatabase } from '@/lib/data-store'
import {
  calculateAnalytics,
  exportAnalyticsToCsv,
  AnalyticsPeriod,
  AnalyticsSummary,
  TimeSeriesPoint,
} from '@/lib/analytics-utils'
import { formatProdutoPrice } from '@/lib/format-produto-price'
import arknetIcon from '@/assets/icon18.png'

export default function AdminRelatoriosPage() {
  const { user } = useAuth()
  const [db, setDb] = useState<ArknetDatabase>(dataStore.getSnapshot())
  const [selectedPeriod, setSelectedPeriod] = useState<AnalyticsPeriod>('30d')
  const [chartMetric, setChartMetric] = useState<'revenue' | 'orders' | 'leads'>('revenue')
  const [hoveredPoint, setHoveredPoint] = useState<TimeSeriesPoint | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'dashboard' | 'executive_document'>('dashboard')

  useEffect(() => {
    const update = () => setDb({ ...dataStore.getSnapshot() })
    const unsub = dataStore.subscribe(update)
    return () => unsub()
  }, [])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await dataStore.syncWithServer()
      setDb({ ...dataStore.getSnapshot() })
    } finally {
      setTimeout(() => setIsRefreshing(false), 500)
    }
  }

  // Compute analytics
  const summary: AnalyticsSummary = useMemo(() => {
    return calculateAnalytics(db, selectedPeriod)
  }, [db, selectedPeriod])

  // Filtered top selling products
  const filteredTopProducts = useMemo(() => {
    if (categoryFilter === 'all') return summary.topSellingProducts
    return summary.topSellingProducts.filter((p) => p.category === categoryFilter)
  }, [summary.topSellingProducts, categoryFilter])

  // Export handlers
  const handleExportCsv = () => {
    const csvContent = exportAnalyticsToCsv(summary)
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `relatorio_executivo_arknet_${selectedPeriod}_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleExportJson = () => {
    const jsonStr = JSON.stringify(summary, null, 2)
    const blob = new Blob([jsonStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `analytics_arknet_${selectedPeriod}_${new Date().toISOString().split('T')[0]}.json`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handlePrintOrPdf = () => {
    // Switch to document mode temporarily or trigger direct print
    const previousMode = viewMode
    if (viewMode !== 'executive_document') {
      setViewMode('executive_document')
      setTimeout(() => {
        window.print()
      }, 200)
    } else {
      window.print()
    }
  }

  // Chart Calculations
  const chartPoints = summary.timeSeries
  const maxVal = useMemo(() => {
    if (!chartPoints.length) return 1
    const vals = chartPoints.map((p) => {
      if (chartMetric === 'revenue') return p.revenue
      if (chartMetric === 'orders') return p.ordersCount
      return p.leadsCount
    })
    const max = Math.max(...vals, 1)
    return max
  }, [chartPoints, chartMetric])

  // SVG dimensions
  const svgWidth = 800
  const svgHeight = 240
  const paddingX = 40
  const paddingY = 30
  const usableWidth = svgWidth - paddingX * 2
  const usableHeight = svgHeight - paddingY * 2

  const pointsCoordinates = useMemo(() => {
    if (!chartPoints.length) return []
    return chartPoints.map((p, index) => {
      const x = paddingX + (index / Math.max(chartPoints.length - 1, 1)) * usableWidth
      const val = chartMetric === 'revenue' ? p.revenue : chartMetric === 'orders' ? p.ordersCount : p.leadsCount
      const y = svgHeight - paddingY - (val / maxVal) * usableHeight
      return { x, y, point: p, val }
    })
  }, [chartPoints, chartMetric, maxVal, usableWidth, usableHeight, svgHeight])

  const pathD = useMemo(() => {
    if (pointsCoordinates.length === 0) return ''
    if (pointsCoordinates.length === 1) {
      return `M ${pointsCoordinates[0].x} ${pointsCoordinates[0].y}`
    }
    return pointsCoordinates.reduce((acc, curr, idx) => {
      if (idx === 0) return `M ${curr.x} ${curr.y}`
      const prev = pointsCoordinates[idx - 1]
      const cp1x = prev.x + (curr.x - prev.x) / 2
      const cp1y = prev.y
      const cp2x = prev.x + (curr.x - prev.x) / 2
      const cp2y = curr.y
      return `${acc} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${curr.x} ${curr.y}`
    }, '')
  }, [pointsCoordinates])

  const areaD = useMemo(() => {
    if (pointsCoordinates.length === 0) return ''
    const first = pointsCoordinates[0]
    const last = pointsCoordinates[pointsCoordinates.length - 1]
    const bottomY = svgHeight - paddingY
    return `${pathD} L ${last.x} ${bottomY} L ${first.x} ${bottomY} Z`
  }, [pathD, pointsCoordinates, svgHeight, paddingY])

  const periodOptions: { id: AnalyticsPeriod; label: string }[] = [
    { id: 'today', label: 'Hoje' },
    { id: '7d', label: 'Últimos 7 dias' },
    { id: '30d', label: 'Últimos 30 dias' },
    { id: '90d', label: 'Últimos 90 dias' },
    { id: 'this_year', label: 'Este Ano' },
    { id: 'all', label: 'Todo o Histórico' },
  ]

  const currentDateFormatted = new Date().toLocaleDateString('pt-AO', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="space-y-6 pb-16 print:p-0 print:m-0 print:space-y-0">
      {/* Top Action Bar (Hidden when printing) */}
      <div className="no-print bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-primary/10 text-primary uppercase tracking-wider flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Administração
            </span>
            <span className="text-xs text-slate-500">Dados disponíveis no backoffice</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Relatórios e indicadores
          </h1>
        </div>

        {/* View Mode Toggle & Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Mode Switcher */}
          <div className="inline-flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
            <button
              onClick={() => setViewMode('dashboard')}
              className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                viewMode === 'dashboard'
                  ? 'bg-white text-primary shadow-xs font-extrabold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              Painel Interativo
            </button>
            <button
              onClick={() => setViewMode('executive_document')}
              className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                viewMode === 'executive_document'
                  ? 'bg-white text-primary shadow-xs font-extrabold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-primary" />
              Pré-visualização de impressão
            </button>
          </div>

          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 shadow-xs disabled:opacity-50"
            title="Sincronizar com base de dados"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-primary' : ''}`} />
            Sincronizar
          </button>

          <button
            onClick={handleExportCsv}
            className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
            title="Descarregar ficheiro CSV para Excel"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            CSV / Excel
          </button>

          <button
            onClick={handleExportJson}
            className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
            title="Descarregar ficheiro JSON estruturado"
          >
            <FileJson className="w-3.5 h-3.5 text-indigo-600" />
            JSON
          </button>

          <button
            onClick={handlePrintOrPdf}
            className="px-4 py-2 bg-primary hover:bg-primary-hover text-white text-sm font-semibold transition flex items-center gap-2"
            title="Imprimir ou guardar em PDF"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir / Guardar PDF</span>
          </button>
        </div>
      </div>

      {/* Period Filter Bar (Hidden in Print) */}
      <div className="no-print bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
          <Calendar className="w-4 h-4 text-primary" />
          <span>Período do Relatório:</span>
        </div>
        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          {periodOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setSelectedPeriod(opt.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                selectedPeriod === opt.id
                  ? 'bg-primary text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODE 1: INTERACTIVE DASHBOARD VIEW (Shown when viewMode === 'dashboard') */}
      {/* ========================================================================= */}
      {viewMode === 'dashboard' && (
        <div className="space-y-8 no-print animate-fade-in">
          {/* Executive KPIs Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Revenue */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 border-l-4 border-l-primary shadow-xs flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">Receita Total Faturada</p>
                  <h3 className="text-2xl font-black text-slate-900 mt-1">
                    {formatProdutoPrice(summary.totalRevenue)}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">{summary.completedOrders} encomendas concluídas</p>
                </div>
                <div className="p-3 bg-primary/10 text-primary rounded-xl shrink-0">
                  <DollarSign className="w-6 h-6" />
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1 font-bold">
                  {summary.revenueGrowthPercent >= 0 ? (
                    <span className="flex items-center text-emerald-600">
                      <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
                      +{summary.revenueGrowthPercent}%
                    </span>
                  ) : (
                    <span className="flex items-center text-rose-600">
                      <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />
                      {summary.revenueGrowthPercent}%
                    </span>
                  )}
                  <span className="text-slate-400 font-normal">vs ciclo anterior</span>
                </div>
                <span className="text-[11px] font-semibold text-slate-400">{summary.periodLabel}</span>
              </div>
            </div>

            {/* Ticket Médio */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 border-l-4 border-l-secondary shadow-xs flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">Ticket Médio por Venda</p>
                  <h3 className="text-2xl font-black text-slate-900 mt-1">
                    {formatProdutoPrice(summary.averageTicket)}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">{summary.totalOrders} pedidos registados</p>
                </div>
                <div className="p-3 bg-secondary/10 text-secondary rounded-xl shrink-0">
                  <ShoppingCart className="w-6 h-6" />
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-600 font-medium">{summary.pendingOrders} pendentes de validação</span>
                <Link href="/admin/pedidos" className="text-primary font-bold hover:underline inline-flex items-center gap-0.5">
                  Ver pedidos <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
            </div>

            {/* Conversão de Leads */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 border-l-4 border-l-emerald-500 shadow-xs flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">Eficácia Comercial Leads</p>
                  <h3 className="text-2xl font-black text-slate-900 mt-1">
                    {summary.leadConversionRate}%
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">{summary.convertedLeads} contratos de {summary.totalLeads} contactos</p>
                </div>
                <div className="p-3 bg-emerald-500/10 text-emerald-600 rounded-xl shrink-0">
                  <Users className="w-6 h-6" />
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(summary.leadConversionRate, 100)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Bot WhatsApp */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 border-l-4 border-l-indigo-500 shadow-xs flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">Automação WhatsApp Domingas</p>
                  <h3 className="text-2xl font-black text-slate-900 mt-1">
                    {summary.whatsappReceiptsProcessed} Comprovativos
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">{summary.whatsappBotOrders} transações assistidas</p>
                </div>
                <div className="p-3 bg-indigo-500/10 text-indigo-600 rounded-xl shrink-0">
                  <Bot className="w-6 h-6" />
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-emerald-700 bg-emerald-50 font-bold px-2 py-0.5 rounded">
                  {summary.whatsappBotConversionRate}% Conversão Bot
                </span>
                <Link href="/admin/whatsapp" className="text-indigo-600 font-bold hover:underline inline-flex items-center gap-0.5">
                  Ver Bot <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>

          {/* Evolution Chart */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Evolução Temporal ({summary.periodLabel})
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Interaja com os pontos do gráfico para avaliar o desempenho diário ou mensal.
                </p>
              </div>

              {/* Metric Selector Toggle */}
              <div className="inline-flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
                <button
                  onClick={() => setChartMetric('revenue')}
                  className={`px-3 py-1.5 rounded-lg transition ${
                    chartMetric === 'revenue'
                      ? 'bg-primary text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Receita (Kz)
                </button>
                <button
                  onClick={() => setChartMetric('orders')}
                  className={`px-3 py-1.5 rounded-lg transition ${
                    chartMetric === 'orders'
                      ? 'bg-secondary text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Volume Pedidos
                </button>
                <button
                  onClick={() => setChartMetric('leads')}
                  className={`px-3 py-1.5 rounded-lg transition ${
                    chartMetric === 'leads'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Leads & Contactos
                </button>
              </div>
            </div>

            {/* Hover tooltip bar */}
            <div className="h-10 mb-2 flex items-center">
              {hoveredPoint ? (
                <div className="bg-slate-900 text-white text-xs px-3.5 py-1.5 rounded-lg flex items-center gap-4 animate-fade-in shadow-md">
                  <span className="font-bold text-slate-300">{hoveredPoint.label}:</span>
                  <span className="text-emerald-400 font-extrabold">{formatProdutoPrice(hoveredPoint.revenue)}</span>
                  <span>•</span>
                  <span>{hoveredPoint.ordersCount} Encomendas</span>
                  <span>•</span>
                  <span>{hoveredPoint.leadsCount} Leads</span>
                </div>
              ) : (
                <span className="text-xs text-slate-400 italic">
                  Passe o rato por cima do gráfico para inspecionar os valores detalhados
                </span>
              )}
            </div>

            {/* SVG Interactive Area Chart */}
            <div className="relative w-full overflow-x-auto">
              <div className="min-w-[650px] w-full">
                <svg
                  viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                  className="w-full h-auto overflow-visible select-none"
                >
                  <defs>
                    <linearGradient id="chartGradientRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0d6efd" stopOpacity="0.35" />
                      <stop offset="100%" stopColor="#0d6efd" stopOpacity="0.0" />
                    </linearGradient>
                    <linearGradient id="chartGradientOrders" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#dc2626" stopOpacity="0.35" />
                      <stop offset="100%" stopColor="#dc2626" stopOpacity="0.0" />
                    </linearGradient>
                    <linearGradient id="chartGradientLeads" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Grid Lines */}
                  {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
                    const y = svgHeight - paddingY - ratio * usableHeight
                    const gridVal = chartMetric === 'revenue' 
                      ? formatProdutoPrice(Math.round(maxVal * ratio))
                      : Math.round(maxVal * ratio)
                    return (
                      <g key={ratio}>
                        <line
                          x1={paddingX}
                          y1={y}
                          x2={svgWidth - paddingX}
                          y2={y}
                          stroke="#f1f5f9"
                          strokeWidth="1"
                          strokeDasharray={ratio === 0 ? '0' : '4 4'}
                        />
                        <text
                          x={paddingX - 8}
                          y={y + 3}
                          textAnchor="end"
                          fontSize="9"
                          fill="#94a3b8"
                          className="font-mono font-medium"
                        >
                          {gridVal}
                        </text>
                      </g>
                    )
                  })}

                  {/* Area fill */}
                  {areaD && (
                    <path
                      d={areaD}
                      fill={`url(#${
                        chartMetric === 'revenue'
                          ? 'chartGradientRevenue'
                          : chartMetric === 'orders'
                          ? 'chartGradientOrders'
                          : 'chartGradientLeads'
                      })`}
                    />
                  )}

                  {/* Line path */}
                  {pathD && (
                    <path
                      d={pathD}
                      fill="none"
                      stroke={
                        chartMetric === 'revenue'
                          ? '#0d6efd'
                          : chartMetric === 'orders'
                          ? '#dc2626'
                          : '#10b981'
                      }
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  )}

                  {/* Interactive Points */}
                  {pointsCoordinates.map(({ x, y, point }, i) => (
                    <g key={i} className="cursor-pointer group">
                      <circle
                        cx={x}
                        cy={y}
                        r="5"
                        className={`transition-all duration-200 ${
                          chartMetric === 'revenue'
                            ? 'fill-primary stroke-white'
                            : chartMetric === 'orders'
                            ? 'fill-secondary stroke-white'
                            : 'fill-emerald-600 stroke-white'
                        } stroke-2 group-hover:r-7`}
                        onMouseEnter={() => setHoveredPoint(point)}
                        onMouseLeave={() => setHoveredPoint(null)}
                      />
                      <circle
                        cx={x}
                        cy={y}
                        r="18"
                        fill="transparent"
                        onMouseEnter={() => setHoveredPoint(point)}
                        onMouseLeave={() => setHoveredPoint(null)}
                      />
                      {(pointsCoordinates.length <= 12 || i % Math.ceil(pointsCoordinates.length / 8) === 0) && (
                        <text
                          x={x}
                          y={svgHeight - 10}
                          textAnchor="middle"
                          fontSize="10"
                          fill="#64748b"
                          className="font-medium"
                        >
                          {point.label}
                        </text>
                      )}
                    </g>
                  ))}
                </svg>
              </div>
            </div>
          </div>

          {/* Products & Leads Two Columns */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Top Selling Products */}
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                      <Package className="w-5 h-5 text-primary" />
                      Produtos Mais Vendidos & Faturação
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Ranking por volume de receita gerada e unidades escoadas de inventário.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-slate-500 font-medium">Categoria:</span>
                    <select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      className="bg-slate-50 border border-slate-200 text-slate-800 rounded-lg px-2.5 py-1.5 font-bold focus:outline-none focus:ring-2 focus:ring-primary/20"
                    >
                      <option value="all">Todas as Categorias</option>
                      {summary.categoryDistribution.map((c) => (
                        <option key={c.category} value={c.category}>
                          {c.category} ({c.unitsSold} unid.)
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-[11px] font-black uppercase tracking-wider text-slate-400 bg-slate-50/50">
                        <th className="py-3 px-3">#</th>
                        <th className="py-3 px-3">Produto</th>
                        <th className="py-3 px-3 text-center">Unidades</th>
                        <th className="py-3 px-3 text-right">Receita (Kz)</th>
                        <th className="py-3 px-3 text-center">Impacto</th>
                        <th className="py-3 px-3 text-center">Stock</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                      {filteredTopProducts.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                            Nenhuma venda registada para esta categoria no período selecionado.
                          </td>
                        </tr>
                      ) : (
                        filteredTopProducts.slice(0, 8).map((p, idx) => (
                          <tr key={p.id} className="hover:bg-slate-50/80 transition">
                            <td className="py-3 px-3 font-mono font-bold text-slate-400 text-xs">
                              {idx + 1}
                            </td>
                            <td className="py-3 px-3">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                                  {p.image ? (
                                    <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                                  ) : (
                                    <Package className="w-5 h-5 text-slate-400" />
                                  )}
                                </div>
                                <div>
                                  <p className="font-bold text-slate-900 text-xs line-clamp-1">{p.name}</p>
                                  <div className="flex items-center gap-1.5 mt-0.5">
                                    <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-medium">
                                      {p.category}
                                    </span>
                                    {p.sku && (
                                      <span className="text-[10px] text-slate-400 font-mono">
                                        SKU: {p.sku}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-3 text-center font-bold text-slate-800">
                              {p.unitsSold}
                            </td>
                            <td className="py-3 px-3 text-right font-black text-slate-900">
                              {formatProdutoPrice(p.totalRevenue)}
                            </td>
                            <td className="py-3 px-3 text-center">
                              <div className="flex items-center justify-center gap-1.5">
                                <div className="w-12 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                  <div
                                    className="bg-primary h-full rounded-full"
                                    style={{ width: `${Math.min(p.percentageOfRevenue, 100)}%` }}
                                  />
                                </div>
                                <span className="text-[11px] font-bold text-slate-500">
                                  {p.percentageOfRevenue}%
                                </span>
                              </div>
                            </td>
                            <td className="py-3 px-3 text-center">
                              {p.currentStock <= 0 ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full">
                                  Esgotado
                                </span>
                              ) : p.currentStock <= p.minStockAlert ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                                  <AlertTriangle className="w-3 h-3 text-amber-600" />
                                  {p.currentStock} unid (Baixo)
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                  {p.currentStock} em stock
                                </span>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">
                  Apresentando os produtos com maior impacto no volume de vendas.
                </span>
                <Link
                  href="/admin/produtos"
                  className="text-primary font-bold hover:underline inline-flex items-center gap-1"
                >
                  Gerir Catálogo Completo <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </div>

            {/* Lead Funnel & Conversion */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <h2 className="text-lg font-black text-slate-900 flex items-center gap-2 mb-1">
                  <Users className="w-5 h-5 text-emerald-600" />
                  Funil de Leads & Cotações
                </h2>
                <p className="text-xs text-slate-500 mb-6">
                  Distribuição do ciclo de vida das oportunidades de serviço.
                </p>

                <div className="space-y-4">
                  {summary.leadFunnel.map((stage) => (
                    <div key={stage.status} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-700">{stage.label}</span>
                        <span className="font-extrabold text-slate-900">
                          {stage.count} ({stage.percentage}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            backgroundColor: stage.color,
                            width: `${Math.max(stage.percentage, 4)}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 pt-6 border-t border-slate-100">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-3">
                    Serviços Mais Solicitados
                  </h3>
                  <div className="space-y-2.5">
                    {summary.serviceDemand.slice(0, 4).map((s) => (
                      <div
                        key={s.service}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                          <span className="font-bold text-slate-800 line-clamp-1">{s.service}</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-slate-500 font-medium">{s.count} pedidos</span>
                          <span className="bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded text-[10px]">
                            {s.conversionRate}% conv.
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">Total de {summary.totalLeads} oportunidades</span>
                <Link
                  href="/admin/leads"
                  className="text-emerald-700 font-bold hover:underline inline-flex items-center gap-1"
                >
                  Ver Todas as Leads <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================================= */}
      {/* MODE 2: FORMAL EXECUTIVE DOSSIER (Rendered on screen in document mode and always in PRINT) */}
      {/* ========================================================================================= */}
      <div
        className={`${
          viewMode === 'executive_document' ? 'block' : 'hidden print:block'
        } bg-white text-slate-900 print:p-0 print:m-0 print:border-none print:shadow-none border border-slate-300 p-6 sm:p-10 max-w-5xl mx-auto`}
      >
        {/* Document Corporate Header */}
          <div className="border-b border-slate-300 pb-5 mb-6 flex flex-col sm:flex-row justify-between items-start gap-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 bg-[#080e1e] p-2 flex items-center justify-center shrink-0">
              <Image src={arknetIcon} alt="ARKNET" width={48} height={48} className="w-10 h-auto object-contain" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                ARKNET TECNOLOGIA, LDA.
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                Relatório de atividade
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right text-xs text-slate-600 shrink-0">
            <p><strong>Período:</strong> {summary.periodLabel}</p>
            <p className="mt-1"><strong>Emitido:</strong> {currentDateFormatted}</p>
            {user?.name && <p className="mt-1"><strong>Utilizador:</strong> {user.name}</p>}
          </div>
        </div>

        {/* Section 1: Executive Summary */}
        <div className="mb-8">
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-slate-200">
            Resumo do período
          </h3>
          <p className="text-xs sm:text-sm text-slate-700 mt-3 leading-relaxed text-justify">
            Indicadores calculados a partir dos registos disponíveis no backoffice para o período selecionado.
          </p>
          <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-500">Receita Homologada</p>
              <p className="text-base sm:text-lg font-black text-slate-900 mt-0.5">{formatProdutoPrice(summary.totalRevenue)}</p>
              <p className="text-[10px] text-slate-500">{summary.revenueGrowthPercent > 0 ? '+' : ''}{summary.revenueGrowthPercent}% vs período anterior</p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-500">Ticket Médio</p>
              <p className="text-base sm:text-lg font-black text-slate-900 mt-0.5">{formatProdutoPrice(summary.averageTicket)}</p>
              <p className="text-[10px] text-slate-500">{summary.totalOrders} encomendas</p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-500">Conversão Comercial</p>
              <p className="text-base sm:text-lg font-bold text-primary mt-0.5">{summary.leadConversionRate}%</p>
              <p className="text-[10px] text-slate-500">{summary.convertedLeads} contratos fechados</p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-500">Automação Domingas</p>
              <p className="text-base sm:text-lg font-bold text-primary mt-0.5">{summary.whatsappReceiptsProcessed}</p>
              <p className="text-[10px] text-slate-500">Comprovativos validados</p>
            </div>
          </div>
        </div>

        {/* Section 2: Financial & Operational KPIs Table */}
        <div className="mb-8 break-inside-avoid">
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-slate-200">
            <DollarSign className="w-4 h-4 text-primary" />
            Indicadores do período
          </h3>
          <table className="w-full text-left border-collapse mt-3 text-xs">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-extrabold uppercase text-[10px] border-b border-slate-300">
                <th className="py-2.5 px-3">Indicador</th>
                <th className="py-2.5 px-3 text-right">Resultado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              <tr>
                <td className="py-2.5 px-3 font-medium text-slate-800">Receita bruta</td>
                <td className="py-2.5 px-3 text-right font-semibold text-slate-900">{formatProdutoPrice(summary.totalRevenue)}</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-medium text-slate-800">Ticket médio</td>
                <td className="py-2.5 px-3 text-right font-semibold text-slate-900">{formatProdutoPrice(summary.averageTicket)}</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-medium text-slate-800">Encomendas concluídas</td>
                <td className="py-2.5 px-3 text-right font-semibold text-slate-900">{summary.completedOrders} / {summary.totalOrders}</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-medium text-slate-800">Leads convertidos</td>
                <td className="py-2.5 px-3 text-right font-semibold text-slate-900">{summary.convertedLeads} / {summary.totalLeads} ({summary.leadConversionRate}%)</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-medium text-slate-800">Reservas confirmadas</td>
                <td className="py-2.5 px-3 text-right font-semibold text-slate-900">{summary.confirmedReservations} / {summary.totalReservations}</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-medium text-slate-800">Encomendas assistidas por WhatsApp</td>
                <td className="py-2.5 px-3 text-right font-semibold text-slate-900">{summary.whatsappBotOrders} ({summary.whatsappBotConversionRate}% do total)</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Section 3: Product Sales & Stock Depletion */}
        <div className="mb-8 break-inside-avoid">
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-slate-200">
            <Package className="w-4 h-4 text-primary" />
            Vendas e stock por produto
          </h3>
          <table className="w-full text-left border-collapse mt-3 text-xs">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-extrabold uppercase text-[10px] border-b border-slate-300">
                <th className="py-2 px-3">Código / SKU</th>
                <th className="py-2 px-3">Designação do Produto</th>
                <th className="py-2 px-3">Categoria</th>
                <th className="py-2 px-3 text-center">Unidades</th>
                <th className="py-2 px-3 text-right">Preço Médio</th>
                <th className="py-2 px-3 text-right">Faturação Total</th>
                <th className="py-2 px-3 text-center">Peso (%)</th>
                <th className="py-2 px-3 text-center">Estado Stock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {summary.topSellingProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-4 text-center text-slate-500">Sem registos de vendas no período selecionado.</td>
                </tr>
              ) : (
                summary.topSellingProducts.slice(0, 8).map((p, idx) => (
                  <tr key={p.id}>
                    <td className="py-2 px-3 font-mono font-bold text-slate-500 text-[11px]">
                      {p.sku || '—'}
                    </td>
                    <td className="py-2 px-3 font-bold text-slate-900">{p.name}</td>
                    <td className="py-2 px-3 text-slate-600">{p.category}</td>
                    <td className="py-2 px-3 text-center font-bold text-slate-800">{p.unitsSold}</td>
                    <td className="py-2 px-3 text-right font-medium text-slate-600">{formatProdutoPrice(p.price)}</td>
                    <td className="py-2 px-3 text-right font-black text-slate-900">{formatProdutoPrice(p.totalRevenue)}</td>
                    <td className="py-2 px-3 text-center font-bold text-slate-700">{p.percentageOfRevenue}%</td>
                    <td className="py-2 px-3 text-center">
                      {p.currentStock <= 0 ? (
                        <span className="text-rose-700 font-black text-[10px]">Esgotado (0)</span>
                      ) : p.currentStock <= p.minStockAlert ? (
                        <span className="text-amber-700 font-bold text-[10px]">Crítico ({p.currentStock})</span>
                      ) : (
                        <span className="text-emerald-700 font-bold text-[10px]">Normal ({p.currentStock})</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Section 4: Lead Funnel & Services */}
        <div className="mb-8 break-inside-avoid">
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-slate-200">
            <Users className="w-4 h-4 text-primary" />
            Leads e procura por serviço
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
            {/* Stages */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
              <h4 className="font-extrabold text-slate-900 uppercase text-[11px] mb-3">Distribuição do Funil</h4>
              <div className="space-y-2">
                {summary.leadFunnel.map((f) => (
                  <div key={f.status} className="flex items-center justify-between border-b border-slate-200/60 pb-1.5">
                    <span className="text-slate-700">{f.label}</span>
                    <span className="font-bold text-slate-900">{f.count} ({f.percentage}%)</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Services */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
              <h4 className="font-extrabold text-slate-900 uppercase text-[11px] mb-3">Serviços Mais Procurados</h4>
              <div className="space-y-2">
                {summary.serviceDemand.slice(0, 4).map((s) => (
                  <div key={s.service} className="flex items-center justify-between border-b border-slate-200/60 pb-1.5">
                    <span className="text-slate-700 font-medium">{s.service}</span>
                    <span className="font-bold text-slate-900">{s.count} pedidos ({s.conversionRate}% conv.)</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <p className="border-t border-slate-300 pt-4 text-xs text-slate-500">
          Os valores refletem os registos disponíveis no backoffice no momento da emissão e podem ser atualizados após nova sincronização.
        </p>
      </div>
    </div>
  )
}
