'use client'

import React, { useState, useEffect, useMemo } from 'react'
import {
  ShoppingCart,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  Clock,
  Phone,
  Mail,
  MapPin,
  FileText,
  X,
  Trash2,
  DollarSign,
} from 'lucide-react'
import { dataStore, StoreOrder, OrderStatus } from '@/lib/data-store'
import { useToast } from '@/lib/toast-context'
import { ConfirmModal } from '@/components/admin/confirm-modal'
import { ExportButton } from '@/components/admin/export-button'
import { exportToCSV } from '@/lib/export-utils'
import { formatProdutoPrice } from '@/lib/format-produto-price'

export default function AdminPedidosPage() {
  const { success, info } = useToast()

  const [orders, setOrders] = useState<StoreOrder[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | OrderStatus>('all')

  // Detalhe do Pedido Modal
  const [selectedOrder, setSelectedOrder] = useState<StoreOrder | null>(null)
  const [internalNotes, setInternalNotes] = useState('')

  // Delete Modal
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  useEffect(() => {
    const sync = () => {
      const db = dataStore.getSnapshot()
      setOrders([...db.orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()))
    }
    sync()
    const unsub = dataStore.subscribe(sync)
    return () => unsub()
  }, [])

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchSearch =
        o.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (o.customerPhone && o.customerPhone.includes(searchTerm))

      const matchStatus = statusFilter === 'all' || o.status === statusFilter
      return matchSearch && matchStatus
    })
  }, [orders, searchTerm, statusFilter])

  const handleOpenDetail = (order: StoreOrder) => {
    setSelectedOrder(order)
    setInternalNotes(order.notes || '')
  }

  const handleUpdateStatus = (orderId: string, newStatus: OrderStatus) => {
    dataStore.updateOrderStatus(orderId, newStatus, internalNotes)
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder((prev) => (prev ? { ...prev, status: newStatus } : null))
    }
    success(`Estado do pedido #${orderId} alterado para "${newStatus.replace('_', ' ')}".`)
  }

  const handleSaveNotes = () => {
    if (selectedOrder) {
      dataStore.updateOrderStatus(selectedOrder.id, selectedOrder.status, internalNotes)
      setSelectedOrder((prev) => (prev ? { ...prev, notes: internalNotes } : null))
      success('Notas internas guardadas com sucesso!')
    }
  }

  const handleDeleteConfirm = () => {
    if (deletingId) {
      dataStore.deleteOrder(deletingId)
      success('Registo do pedido eliminado com sucesso.')
      setIsDeleteModalOpen(false)
      if (selectedOrder?.id === deletingId) setSelectedOrder(null)
      setDeletingId(null)
    }
  }

  const handleExportCSV = () => {
    exportToCSV(
      filteredOrders,
      'ARKNET_Pedidos_Loja',
      [
        { key: 'orderNumber', header: 'Nº do Pedido' },
        { key: 'customerName', header: 'Nome do Cliente' },
        { key: 'customerEmail', header: 'Email' },
        { key: 'customerPhone', header: 'Telefone' },
        { key: 'customerAddress', header: 'Endereço de Entrega' },
        {
          key: 'items',
          header: 'Itens do Pedido',
          format: (items) => (items || []).map((i: any) => `${i.quantity}x ${i.productName}`).join(' | '),
        },
        {
          key: 'total',
          header: 'Total (Kz)',
          format: (val) => (val !== null ? `${val} Kz` : 'Sob Consulta'),
        },
        { key: 'status', header: 'Estado' },
        { key: 'notes', header: 'Notas Internas' },
        {
          key: 'createdAt',
          header: 'Data de Realização',
          format: (date) => new Date(date).toLocaleString('pt-PT'),
        },
      ]
    )
  }

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'novo':
        return (
          <span className="px-2.5 py-1 text-[10px] font-extrabold uppercase bg-rose-100 text-secondary rounded-full">
            Novo Pedido
          </span>
        )
      case 'em_contacto':
        return (
          <span className="px-2.5 py-1 text-[10px] font-extrabold uppercase bg-amber-100 text-amber-800 rounded-full">
            Em Contacto
          </span>
        )
      case 'fechado':
        return (
          <span className="px-2.5 py-1 text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800 rounded-full">
            Fechado / Concluído
          </span>
        )
      case 'cancelado':
        return (
          <span className="px-2.5 py-1 text-[10px] font-extrabold uppercase bg-slate-100 text-slate-600 rounded-full">
            Cancelado
          </span>
        )
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-extrabold text-slate-900">Pedidos & Cotações da Loja</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Histórico e tratamento de encomendas e pedidos de cotação finalizados pelos clientes no checkout (`/loja/checkout`).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <ExportButton onExport={handleExportCSV} label="Exportar Pedidos (CSV)" />
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-white border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Pesquisar por nº pedido, nome do cliente, email..."
            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:bg-white focus:border-primary focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 bg-slate-50 border border-slate-300 text-xs text-slate-700 focus:bg-white focus:border-primary focus:outline-none"
          >
            <option value="all">Todos os Estados ({orders.length})</option>
            <option value="novo">Novos ({orders.filter((o) => o.status === 'novo').length})</option>
            <option value="em_contacto">Em Contacto ({orders.filter((o) => o.status === 'em_contacto').length})</option>
            <option value="fechado">Fechados ({orders.filter((o) => o.status === 'fechado').length})</option>
            <option value="cancelado">Cancelados ({orders.filter((o) => o.status === 'cancelado').length})</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase tracking-wider font-bold text-[11px]">
              <tr>
                <th className="py-3.5 px-6">Nº Pedido</th>
                <th className="py-3.5 px-6">Cliente</th>
                <th className="py-3.5 px-4">Qtd. Itens</th>
                <th className="py-3.5 px-4">Valor Total</th>
                <th className="py-3.5 px-4">Estado</th>
                <th className="py-3.5 px-4">Data</th>
                <th className="py-3.5 px-6 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Nenhum pedido encontrado com os filtros selecionados.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/80 transition group">
                    <td className="py-3.5 px-6 font-mono font-bold text-slate-900 group-hover:text-primary transition">
                      {order.orderNumber}
                    </td>

                    <td className="py-3.5 px-6">
                      <p className="font-bold text-slate-900">{order.customerName}</p>
                      <p className="text-[11px] text-slate-400 font-mono">{order.customerPhone || order.customerEmail}</p>
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-slate-700">
                      {order.items.reduce((acc, it) => acc + it.quantity, 0)} itens
                    </td>

                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {order.total !== null ? formatProdutoPrice(order.total) : 'Sob Consulta'}
                    </td>

                    <td className="py-3.5 px-4">{getStatusBadge(order.status)}</td>

                    <td className="py-3.5 px-4 text-slate-400">
                      {new Date(order.createdAt).toLocaleDateString('pt-PT')}{' '}
                      <span className="text-[10px]">
                        {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </td>

                    <td className="py-3.5 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenDetail(order)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-primary hover:text-white font-bold rounded text-slate-700 transition flex items-center gap-1"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          Detalhes
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setDeletingId(order.id)
                            setIsDeleteModalOpen(true)
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                          title="Eliminar pedido"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Detalhes do Pedido */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm"
            onClick={() => setSelectedOrder(null)}
          />

          <div className="relative w-full max-w-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden z-10 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <div>
                <span className="text-xs font-mono font-bold text-primary">Detalhes do Pedido</span>
                <h3 className="text-lg font-extrabold text-slate-900">{selectedOrder.orderNumber}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              {/* Customer Info Card */}
              <div className="p-4 bg-slate-50 border border-slate-200 grid sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Cliente</p>
                  <p className="font-bold text-slate-900 text-sm">{selectedOrder.customerName}</p>
                  <div className="flex items-center gap-2 mt-2 text-slate-600">
                    <Mail className="h-3.5 w-3.5 text-slate-400" />
                    <a href={`mailto:${selectedOrder.customerEmail}`} className="hover:underline text-primary">
                      {selectedOrder.customerEmail}
                    </a>
                  </div>
                  {selectedOrder.customerPhone && (
                    <div className="flex items-center gap-2 mt-1 text-slate-600">
                      <Phone className="h-3.5 w-3.5 text-slate-400" />
                      <a href={`tel:${selectedOrder.customerPhone}`} className="hover:underline font-mono">
                        {selectedOrder.customerPhone}
                      </a>
                    </div>
                  )}
                </div>

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Endereço / Local de Entrega
                  </p>
                  <div className="flex items-start gap-2 text-slate-700 mt-1">
                    <MapPin className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                    <span>{selectedOrder.customerAddress || 'Não especificado (A combinar)'}</span>
                  </div>
                  <div className="mt-3 text-[11px] text-slate-400">
                    Submetido em: {new Date(selectedOrder.createdAt).toLocaleString('pt-PT')}
                  </div>
                </div>
              </div>

              {/* Status Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Alterar Estado do Pedido
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(['novo', 'em_contacto', 'fechado', 'cancelado'] as OrderStatus[]).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => handleUpdateStatus(selectedOrder.id, st)}
                      className={`py-2 px-3 text-xs font-bold uppercase rounded border transition ${
                        selectedOrder.status === st
                          ? 'bg-primary text-white border-primary shadow-sm'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {st.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Items List */}
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Itens Requisitados ({selectedOrder.items.length})
                </p>
                <div className="border border-slate-200 divide-y divide-slate-100">
                  {selectedOrder.items.map((item, i) => (
                    <div key={i} className="p-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-primary bg-primary/10 px-2 py-0.5 rounded font-mono">
                          {item.quantity}x
                        </span>
                        <span className="font-semibold text-slate-900">{item.productName}</span>
                      </div>
                      <span className="font-mono font-bold text-slate-700">
                        {item.price !== null ? formatProdutoPrice(item.price * item.quantity) : 'Sob Consulta'}
                      </span>
                    </div>
                  ))}

                  <div className="p-3 bg-slate-50 flex items-center justify-between font-bold text-slate-900 text-sm">
                    <span>Total do Pedido</span>
                    <span className="font-mono text-base text-primary">
                      {selectedOrder.total !== null ? formatProdutoPrice(selectedOrder.total) : 'Sob Consulta'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Internal Notes */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Notas Internas da Equipa
                </label>
                <textarea
                  rows={3}
                  value={internalNotes}
                  onChange={(e) => setInternalNotes(e.target.value)}
                  placeholder="Ex: Contactado cliente por telefone; aguarda comprovativo de transferência bancária..."
                  className="w-full p-3 border border-slate-300 focus:border-primary focus:outline-none"
                />
                <div className="flex justify-end mt-2">
                  <button
                    type="button"
                    onClick={handleSaveNotes}
                    className="px-4 py-2 bg-slate-900 text-white font-bold text-xs uppercase hover:bg-primary transition"
                  >
                    Guardar Notas
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Eliminar Pedido"
        message="Tem a certeza que deseja eliminar o registo deste pedido do histórico? Esta ação é irreversível."
        confirmText="Sim, Eliminar"
        cancelText="Cancelar"
      />
    </div>
  )
}
