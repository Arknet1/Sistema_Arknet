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
  MessageCircle,
  ShieldCheck,
  Check,
  Bot,
  AlertTriangle,
  Send,
  Download,
  ExternalLink,
  Sparkles,
  RefreshCw,
  Image as ImageIcon,
  CheckCheck,
} from 'lucide-react'
import {
  dataStore,
  StoreOrder,
  OrderStatus,
  WhatsAppBotStatus,
  WhatsAppChatMessage,
} from '@/lib/data-store'
import { useToast } from '@/lib/toast-context'
import { ConfirmModal } from '@/components/admin/confirm-modal'
import { ExportButton } from '@/components/admin/export-button'
import { exportToCSV } from '@/lib/export-utils'
import { formatProdutoPrice } from '@/lib/format-produto-price'
import { WhatsAppSimulatorModal } from '@/components/admin/whatsapp-simulator-modal'

export default function AdminPedidosPage() {
  const { success, error: toastError, info } = useToast()

  const [orders, setOrders] = useState<StoreOrder[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | OrderStatus>('all')
  const [botStatusFilter, setBotStatusFilter] = useState<'all' | WhatsAppBotStatus>('all')

  // Detalhe do Pedido Modal
  const [selectedOrder, setSelectedOrder] = useState<StoreOrder | null>(null)
  const [activeTab, setActiveTab] = useState<'geral' | 'whatsapp' | 'comprovativo'>('geral')
  const [internalNotes, setInternalNotes] = useState('')
  const [operatorMessage, setOperatorMessage] = useState('')
  const [isSendingMessage, setIsSendingMessage] = useState(false)
  const [isConfirmingPayment, setIsConfirmingPayment] = useState(false)

  // WhatsApp Simulator Modal
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false)
  const [simulatorOrder, setSimulatorOrder] = useState<StoreOrder | null>(null)

  // Delete Modal
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  useEffect(() => {
    const sync = () => {
      const db = dataStore.getSnapshot()
      const sorted = [...db.orders].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      setOrders(sorted)

      // Atualizar o selectedOrder se estiver aberto
      if (selectedOrder) {
        const found = sorted.find((o) => o.id === selectedOrder.id)
        if (found) setSelectedOrder(found)
      }
    }
    sync()
    const unsub = dataStore.subscribe(sync)
    return () => unsub()
  }, [selectedOrder?.id])

  // Contadores para alertas rápidos
  const pendingReceiptCount = useMemo(
    () => orders.filter((o) => o.botStatus === 'receipt_received' && o.status !== 'fechado').length,
    [orders]
  )
  const humanAttentionCount = useMemo(
    () => orders.filter((o) => o.botStatus === 'needs_human' && o.status !== 'fechado').length,
    [orders]
  )

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchSearch =
        o.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (o.customerPhone && o.customerPhone.includes(searchTerm)) ||
        (o.whatsappPhone && o.whatsappPhone.includes(searchTerm))

      const matchStatus = statusFilter === 'all' || o.status === statusFilter
      const matchBotStatus = botStatusFilter === 'all' || o.botStatus === botStatusFilter

      return matchSearch && matchStatus && matchBotStatus
    })
  }, [orders, searchTerm, statusFilter, botStatusFilter])

  const handleOpenDetail = (
    order: StoreOrder,
    initialTab: 'geral' | 'whatsapp' | 'comprovativo' = 'geral'
  ) => {
    setSelectedOrder(order)
    setActiveTab(initialTab)
    setInternalNotes(order.notes || '')
    setOperatorMessage('')
  }

  // 1-Clique: Confirmação de Pagamento & Disparo de WhatsApp
  const handleConfirmPayment = async (orderId: string) => {
    setIsConfirmingPayment(true)
    try {
      const response = await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          isConfirmation: true,
          agentName: 'Administrador ARKNET',
        }),
      })

      const data = await response.json()
      if (data.success) {
        success(
          `Pagamento do pedido #${orderId} validado! Mensagem de confirmação enviada com sucesso pelo Bot de WhatsApp.`
        )
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder(data.order)
        }
      } else {
        const updated = dataStore.confirmOrderPayment(orderId)
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder(updated)
        }
        success(`Pedido #${orderId} Aprovado com Sucesso!`)
      }
    } catch (err: any) {
      const updated = dataStore.confirmOrderPayment(orderId)
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(updated)
      }
      success(`Pedido #${orderId} Aprovado no sistema!`)
    } finally {
      setIsConfirmingPayment(false)
    }
  }

  const handleSendOperatorMessage = async () => {
    if (!selectedOrder || !operatorMessage.trim()) return
    setIsSendingMessage(true)

    try {
      const response = await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: selectedOrder.id,
          text: operatorMessage.trim(),
          agentName: 'Operador ARKNET',
        }),
      })

      const data = await response.json()
      if (data.success && data.order) {
        setSelectedOrder(data.order)
        success('Mensagem enviada com sucesso ao cliente!')
      } else {
        const updated = dataStore.addWhatsAppMessage(selectedOrder.id, {
          sender: 'agent',
          senderName: 'Operador ARKNET',
          text: operatorMessage.trim(),
        })
        setSelectedOrder(updated)
        success('Mensagem registada na conversa!')
      }
      setOperatorMessage('')
    } catch (err) {
      toastError('Falha ao enviar mensagem.')
    } finally {
      setIsSendingMessage(false)
    }
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
        { key: 'whatsappPhone', header: 'WhatsApp' },
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
        { key: 'botStatus', header: 'Estado do Bot' },
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
          <span className="px-2.5 py-1 text-[10px] font-extrabold uppercase bg-amber-100 text-amber-900 border border-amber-300 rounded-full inline-flex items-center gap-1">
            <Clock className="h-3 w-3 text-amber-700" />
            Novo Pedido
          </span>
        )
      case 'em_contacto':
        return (
          <span className="px-2.5 py-1 text-[10px] font-extrabold uppercase bg-blue-100 text-blue-900 border border-blue-300 rounded-full inline-flex items-center gap-1">
            <MessageCircle className="h-3 w-3 text-blue-700" />
            Em Validação
          </span>
        )
      case 'fechado':
        return (
          <span className="px-2.5 py-1 text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-full inline-flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3 text-emerald-700" />
            Aprovado / Fatura Emitida
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

  const getBotStatusBadge = (botStatus?: WhatsAppBotStatus) => {
    switch (botStatus) {
      case 'receipt_received':
        return (
          <span className="px-2.5 py-1 text-[10px] font-extrabold uppercase bg-emerald-500/10 text-emerald-800 border border-emerald-500/40 rounded-full inline-flex items-center gap-1.5 animate-pulse">
            <CheckCheck className="h-3.5 w-3.5 text-emerald-600" />
            Comprovativo Recebido
          </span>
        )
      case 'needs_human':
        return (
          <span className="px-2.5 py-1 text-[10px] font-extrabold uppercase bg-rose-100 text-rose-800 border border-rose-300 rounded-full inline-flex items-center gap-1.5">
            <AlertTriangle className="h-3.5 w-3.5 text-rose-600" />
            Atenção Humana
          </span>
        )
      case 'waiting_receipt':
        return (
          <span className="px-2.5 py-1 text-[10px] font-extrabold uppercase bg-blue-50 text-blue-800 border border-blue-200 rounded-full inline-flex items-center gap-1">
            <Clock className="h-3 w-3 text-blue-600" />
            Aguarda Comprovativo
          </span>
        )
      case 'confirmed':
        return (
          <span className="px-2.5 py-1 text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-full inline-flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3 text-emerald-600" />
            Confirmado via Bot
          </span>
        )
      case 'bot_active':
      default:
        return (
          <span className="px-2.5 py-1 text-[10px] font-extrabold uppercase bg-slate-100 text-slate-700 border border-slate-200 rounded-full inline-flex items-center gap-1">
            <Bot className="h-3 w-3 text-slate-500" />
            Bot Ativo
          </span>
        )
    }
  }

  return (
    <div className="space-y-6">
      
      {/* Banner Principal de Destaque do Bot WhatsApp */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 border-2 border-emerald-500/50 p-5 sm:p-6 rounded-xl shadow-lg text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-black text-xl shadow-md shrink-0">
            <Bot className="h-7 w-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] bg-emerald-400/20 text-emerald-300 border border-emerald-400/40 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                Novo • Meta Cloud API
              </span>
              <span className="text-[10px] text-emerald-400 font-mono">
                +244 935 208 449
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-black mt-1 text-white">
              Bot de WhatsApp & Validação de Pagamentos
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              O bot assume automaticamente o resumo do pedido, instruções de pagamento e receção de comprovativos. Clique no botão ao lado para abrir o testador interativo.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setSimulatorOrder(orders[0] || null)
            setIsSimulatorOpen(true)
          }}
          className="w-full md:w-auto px-6 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-lg transition transform hover:-translate-y-0.5 shadow-lg flex items-center justify-center gap-2.5 shrink-0"
        >
          <Bot className="h-5 w-5 text-slate-950" />
          <span>Abrir Testador do Bot WhatsApp</span>
          <Sparkles className="h-4 w-4 text-amber-800" />
        </button>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-extrabold text-slate-900">
              Pedidos & Faturação da Loja
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Valide comprovativos recebidos pelo WhatsApp e aprove pedidos com 1 clique para emissão de faturas oficiais.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <ExportButton onExport={handleExportCSV} label="Exportar Pedidos (CSV)" />
        </div>
      </div>

      {/* Alertas Rápidos de Ação Necessária */}
      {(pendingReceiptCount > 0 || humanAttentionCount > 0) && (
        <div className="grid sm:grid-cols-2 gap-4">
          {pendingReceiptCount > 0 && (
            <div className="p-4 bg-emerald-50 border-2 border-emerald-500/40 rounded-lg flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold">
                  <CheckCheck className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-emerald-950 text-xs uppercase tracking-wider">
                    {pendingReceiptCount} Comprovativo{pendingReceiptCount > 1 ? 's' : ''} a Aguardar Validação
                  </h4>
                  <p className="text-[11px] text-emerald-800">
                    Clique para conferir os comprovativos e aprovar os pedidos com 1 clique.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setBotStatusFilter('receipt_received')
                  setStatusFilter('all')
                }}
                className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded transition shrink-0"
              >
                Ver Fila
              </button>
            </div>
          )}

          {humanAttentionCount > 0 && (
            <div className="p-4 bg-rose-50 border-2 border-rose-400 rounded-lg flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-rose-600 text-white flex items-center justify-center font-bold">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-rose-950 text-xs uppercase tracking-wider">
                    {humanAttentionCount} Conversa{humanAttentionCount > 1 ? 's' : ''} Requerem Operador Humano
                  </h4>
                  <p className="text-[11px] text-rose-800">
                    O cliente enviou uma dúvida ou pedido de alteração fora do fluxo do bot.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setBotStatusFilter('needs_human')
                  setStatusFilter('all')
                }}
                className="px-3 py-1.5 bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs rounded transition shrink-0"
              >
                Atender
              </button>
            </div>
          )}
        </div>
      )}

      {/* Filters Toolbar */}
      <div className="bg-white border border-slate-200 p-4 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Pesquisar por nº pedido, cliente, telefone..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:bg-white focus:border-primary focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Bot Status Filter */}
          <div className="flex items-center gap-2">
            <Bot className="h-4 w-4 text-slate-400" />
            <select
              value={botStatusFilter}
              onChange={(e) => setBotStatusFilter(e.target.value as any)}
              className="px-3 py-2 bg-slate-50 border border-slate-300 text-xs text-slate-700 focus:bg-white focus:border-primary focus:outline-none font-medium"
            >
              <option value="all">Todos os Estados do Bot ({orders.length})</option>
              <option value="receipt_received">🔔 Comprovativo Recebido ({orders.filter((o) => o.botStatus === 'receipt_received').length})</option>
              <option value="needs_human">⚠️ Requer Atenção Humana ({orders.filter((o) => o.botStatus === 'needs_human').length})</option>
              <option value="waiting_receipt">⏳ Aguarda Comprovativo ({orders.filter((o) => o.botStatus === 'waiting_receipt').length})</option>
              <option value="confirmed">✅ Confirmado ({orders.filter((o) => o.botStatus === 'confirmed').length})</option>
            </select>
          </div>

          {/* Standard Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-2 bg-slate-50 border border-slate-300 text-xs text-slate-700 focus:bg-white focus:border-primary focus:outline-none font-medium"
            >
              <option value="all">Todos os Estados ({orders.length})</option>
              <option value="novo">Novos ({orders.filter((o) => o.status === 'novo').length})</option>
              <option value="em_contacto">Em Validação ({orders.filter((o) => o.status === 'em_contacto').length})</option>
              <option value="fechado">Aprovados / Fatura Liberada ({orders.filter((o) => o.status === 'fechado').length})</option>
              <option value="cancelado">Cancelados ({orders.filter((o) => o.status === 'cancelado').length})</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase tracking-wider font-bold text-[11px]">
              <tr>
                <th className="py-3.5 px-6">Nº Pedido</th>
                <th className="py-3.5 px-6">Cliente & Contacto</th>
                <th className="py-3.5 px-4">Valor Total</th>
                <th className="py-3.5 px-4">Estado Pedido</th>
                <th className="py-3.5 px-4">Fluxo WhatsApp</th>
                <th className="py-3.5 px-4">Comprovativo</th>
                <th className="py-3.5 px-6 text-right">Ações Rápidas</th>
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
                filteredOrders.map((order) => {
                  const isApproved = order.status === 'fechado'
                  const hasReceipt = Boolean(order.receiptUrl)

                  return (
                    <tr key={order.id} className="hover:bg-slate-50/80 transition group">
                      {/* Order Number */}
                      <td className="py-3.5 px-6 font-mono font-bold text-slate-900 group-hover:text-primary transition">
                        <button
                          type="button"
                          onClick={() => handleOpenDetail(order, 'geral')}
                          className="hover:underline text-left font-mono font-black"
                        >
                          {order.orderNumber}
                        </button>
                        <p className="text-[10px] text-slate-400 font-normal">
                          {new Date(order.createdAt).toLocaleDateString('pt-PT')}{' '}
                          {new Date(order.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </td>

                      {/* Customer Info */}
                      <td className="py-3.5 px-6">
                        <p className="font-bold text-slate-900">{order.customerName}</p>
                        <p className="text-[11px] text-slate-500 font-mono">
                          {order.whatsappPhone || order.customerPhone || order.customerEmail}
                        </p>
                      </td>

                      {/* Total */}
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        {order.total !== null ? formatProdutoPrice(order.total) : 'Sob Consulta'}
                        <span className="block text-[10px] text-slate-400 font-normal">
                          {order.items.reduce((acc, it) => acc + it.quantity, 0)} itens
                        </span>
                      </td>

                      {/* Order Status */}
                      <td className="py-3.5 px-4">{getStatusBadge(order.status)}</td>

                      {/* Bot Status Badge */}
                      <td className="py-3.5 px-4">{getBotStatusBadge(order.botStatus)}</td>

                      {/* Receipt Preview Trigger */}
                      <td className="py-3.5 px-4">
                        {hasReceipt ? (
                          <button
                            type="button"
                            onClick={() => handleOpenDetail(order, 'comprovativo')}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded font-bold text-[10px] transition"
                          >
                            <ImageIcon className="h-3 w-3 text-emerald-600" />
                            <span>Ver Anexo</span>
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">Pendente</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          
                          {/* 1-CLIQUE: CONFIRMAR PAGAMENTO */}
                          {!isApproved && (
                            <button
                              type="button"
                              onClick={() => handleConfirmPayment(order.id)}
                              disabled={isConfirmingPayment}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[11px] uppercase tracking-wider rounded transition flex items-center gap-1.5 shadow-xs"
                              title="Validar comprovativo e enviar mensagem oficial de aprovação via WhatsApp"
                            >
                              <Check className="h-3.5 w-3.5" />
                              <span>Aprovar</span>
                            </button>
                          )}

                          {/* Chat & Details Button */}
                          <button
                            type="button"
                            onClick={() => handleOpenDetail(order, 'whatsapp')}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-primary hover:text-white font-bold rounded text-slate-700 transition flex items-center gap-1.5"
                            title="Ver histórico de mensagens e comprovativos no WhatsApp"
                          >
                            <MessageCircle className="h-3.5 w-3.5" />
                            <span>WhatsApp</span>
                          </button>

                          {/* Delete */}
                          <button
                            type="button"
                            onClick={() => {
                              setDeletingId(order.id)
                              setIsDeleteModalOpen(true)
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition rounded"
                            title="Eliminar registo do pedido"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Detalhes & Gestão do Pedido */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm"
            onClick={() => setSelectedOrder(null)}
          />

          <div className="relative w-full max-w-4xl bg-white border border-slate-200 shadow-2xl overflow-hidden z-10 max-h-[92vh] flex flex-col">
            
            {/* Header com Abas */}
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-primary">Gestão de Pedido & Faturação</span>
                  {selectedOrder.botStatus && getBotStatusBadge(selectedOrder.botStatus)}
                </div>
                <h3 className="text-lg font-black text-slate-900 font-mono">
                  {selectedOrder.orderNumber}
                </h3>
              </div>

              <div className="flex items-center gap-3">
                {/* 1-Clique no cabeçalho do Modal */}
                {selectedOrder.status !== 'fechado' && (
                  <button
                    type="button"
                    onClick={() => handleConfirmPayment(selectedOrder.id)}
                    disabled={isConfirmingPayment}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs uppercase tracking-wider rounded transition flex items-center gap-1.5 shadow-md"
                  >
                    <Check className="h-4 w-4" />
                    <span>Confirmar Pagamento (1 Clique)</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="text-slate-400 hover:text-slate-700 p-1"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Navegação de Abas */}
            <div className="px-6 border-b border-slate-200 bg-white flex gap-6 text-xs font-bold uppercase tracking-wider">
              <button
                type="button"
                onClick={() => setActiveTab('geral')}
                className={`py-3.5 border-b-2 transition flex items-center gap-2 ${
                  activeTab === 'geral'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <FileText className="h-4 w-4" />
                <span>Resumo & Faturação</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('comprovativo')}
                className={`py-3.5 border-b-2 transition flex items-center gap-2 relative ${
                  activeTab === 'comprovativo'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <ImageIcon className="h-4 w-4" />
                <span>Comprovativo de Pagamento</span>
                {selectedOrder.receiptUrl && (
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('whatsapp')}
                className={`py-3.5 border-b-2 transition flex items-center gap-2 ${
                  activeTab === 'whatsapp'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <MessageCircle className="h-4 w-4 text-emerald-600" />
                <span>Histórico WhatsApp (Bot)</span>
                {selectedOrder.conversationHistory?.length ? (
                  <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 text-[10px] rounded-full font-mono">
                    {selectedOrder.conversationHistory.length}
                  </span>
                ) : null}
              </button>
            </div>

            {/* Conteúdo da Aba */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs bg-slate-50/50">
              
              {/* ========================================================= */}
              {/* ABA 1: GERAL & FATURAÇÃO */}
              {/* ========================================================= */}
              {activeTab === 'geral' && (
                <div className="space-y-6">
                  
                  {/* Status Banner */}
                  {selectedOrder.status === 'fechado' ? (
                    <div className="p-4 bg-emerald-50 border border-emerald-300 rounded flex items-center gap-3 text-emerald-950 font-medium">
                      <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                      <div>
                        <p className="font-bold text-emerald-900 text-sm">Pedido Aprovado & Fatura Emitida</p>
                        <p className="text-[11px] text-emerald-700">
                          O cliente já tem acesso à fatura oficial no seu Perfil. A confirmação foi enviada pelo WhatsApp.
                        </p>
                      </div>
                    </div>
                  ) : selectedOrder.botStatus === 'receipt_received' ? (
                    <div className="p-4 bg-emerald-50 border-2 border-emerald-500 rounded flex items-center justify-between gap-3 text-emerald-950">
                      <div className="flex items-center gap-3">
                        <CheckCheck className="h-6 w-6 text-emerald-600 shrink-0" />
                        <div>
                          <p className="font-extrabold text-emerald-900 text-sm">
                            Comprovativo Anexado pelo Cliente via WhatsApp!
                          </p>
                          <p className="text-[11px] text-emerald-800">
                            Confira o documento anexado na aba "Comprovativo" e aprove a emissão da fatura oficial.
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveTab('comprovativo')}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase rounded transition shrink-0 shadow-xs"
                      >
                        Conferir Comprovativo
                      </button>
                    </div>
                  ) : (
                    <div className="p-4 bg-amber-50 border border-amber-300 rounded flex items-center justify-between gap-3 text-amber-950">
                      <div className="flex items-center gap-3">
                        <Clock className="h-5 w-5 text-amber-600 shrink-0" />
                        <div>
                          <p className="font-bold text-amber-900">Aguardando Pagamento & Comprovativo</p>
                          <p className="text-[11px] text-amber-800">
                            O bot já enviou as instruções de pagamento para o WhatsApp do cliente.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Customer Info Card */}
                  <div className="p-4 bg-white border border-slate-200 grid sm:grid-cols-2 gap-4 shadow-xs">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                        Dados do Cliente
                      </p>
                      <p className="font-bold text-slate-900 text-sm">{selectedOrder.customerName}</p>
                      {selectedOrder.customerCompany && (
                        <p className="text-slate-600 text-[11px]">Empresa: {selectedOrder.customerCompany}</p>
                      )}
                      {selectedOrder.customerNif && (
                        <p className="text-slate-600 text-[11px] font-mono">NIF: {selectedOrder.customerNif}</p>
                      )}
                      <div className="flex items-center gap-2 mt-2 text-slate-600">
                        <Mail className="h-3.5 w-3.5 text-slate-400" />
                        <a href={`mailto:${selectedOrder.customerEmail}`} className="hover:underline text-primary">
                          {selectedOrder.customerEmail}
                        </a>
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-slate-600">
                        <Phone className="h-3.5 w-3.5 text-slate-400" />
                        <span className="font-mono">{selectedOrder.customerPhone}</span>
                      </div>
                    </div>

                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                        Entrega & Faturação
                      </p>
                      <div className="flex items-start gap-2 text-slate-700 mt-1">
                        <MapPin className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                        <span>{selectedOrder.customerAddress || 'A combinar em Luanda'}</span>
                      </div>
                      <div className="mt-2 text-slate-700">
                        <span className="font-bold">Método:</span>{' '}
                        <span className="uppercase font-mono">{selectedOrder.paymentMethod || 'Transferência'}</span>
                      </div>
                      <div className="mt-2 text-[11px] text-slate-400">
                        Submetido em: {new Date(selectedOrder.createdAt).toLocaleString('pt-PT')}
                      </div>
                      {selectedOrder.confirmedAt && (
                        <div className="mt-1 text-[11px] text-emerald-700 font-semibold">
                          Aprovado em: {new Date(selectedOrder.confirmedAt).toLocaleString('pt-PT')}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Items List */}
                  <div className="bg-white border border-slate-200 shadow-xs">
                    <div className="p-3.5 border-b border-slate-100 bg-slate-50/50 font-bold uppercase tracking-wider text-slate-700">
                      Itens Requisitados ({selectedOrder.items.length})
                    </div>
                    <div className="divide-y divide-slate-100">
                      {selectedOrder.items.map((item, i) => (
                        <div key={i} className="p-3.5 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-primary bg-primary/10 px-2.5 py-0.5 rounded font-mono text-xs">
                              {item.quantity}x
                            </span>
                            <div>
                              <p className="font-bold text-slate-900">{item.productName}</p>
                              <p className="text-[10px] text-slate-400 font-mono">ID: {item.productId}</p>
                            </div>
                          </div>
                          <span className="font-mono font-bold text-slate-800">
                            {item.price !== null ? formatProdutoPrice(item.price * item.quantity) : 'Sob Consulta'}
                          </span>
                        </div>
                      ))}

                      <div className="p-4 bg-slate-50 flex items-center justify-between font-bold text-slate-900">
                        <span>Total da Encomenda</span>
                        <span className="font-mono text-base text-primary">
                          {selectedOrder.total !== null ? formatProdutoPrice(selectedOrder.total) : 'Sob Consulta'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Internal Notes */}
                  <div className="bg-white border border-slate-200 p-4 shadow-xs">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Notas Internas da Equipa
                    </label>
                    <textarea
                      rows={2}
                      value={internalNotes}
                      onChange={(e) => setInternalNotes(e.target.value)}
                      placeholder="Ex: Pagamento confirmado via BAI Directo; pronto para expedição..."
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 focus:bg-white focus:border-primary focus:outline-none text-xs"
                    />
                    <div className="flex justify-end mt-2">
                      <button
                        type="button"
                        onClick={handleSaveNotes}
                        className="px-4 py-2 bg-slate-900 text-white font-bold text-xs uppercase hover:bg-primary transition rounded"
                      >
                        Guardar Notas
                      </button>
                    </div>
                  </div>

                </div>
              )}

              {/* ========================================================= */}
              {/* ABA 2: COMPROVATIVO DE PAGAMENTO */}
              {/* ========================================================= */}
              {activeTab === 'comprovativo' && (
                <div className="space-y-6">
                  {selectedOrder.receiptUrl ? (
                    <div className="bg-white border border-slate-200 p-6 rounded shadow-xs space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded inline-block mb-1">
                            Documento Anexado via WhatsApp
                          </span>
                          <h4 className="font-extrabold text-sm text-slate-900">
                            {selectedOrder.receiptFilename || 'Comprovativo de Pagamento'}
                          </h4>
                          {selectedOrder.receiptReceivedAt && (
                            <p className="text-[11px] text-slate-500">
                              Recebido em: {new Date(selectedOrder.receiptReceivedAt).toLocaleString('pt-PT')}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <a
                            href={selectedOrder.receiptUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded transition flex items-center gap-1.5"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                            <span>Abrir Original</span>
                          </a>

                          {selectedOrder.status !== 'fechado' && (
                            <button
                              type="button"
                              onClick={() => handleConfirmPayment(selectedOrder.id)}
                              disabled={isConfirmingPayment}
                              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider rounded transition flex items-center gap-1.5 shadow-md"
                            >
                              <Check className="h-4 w-4" />
                              <span>Validar & Confirmar Pagamento</span>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Visualizador de Imagem / Documento */}
                      <div className="border border-slate-200 rounded-lg p-2 bg-slate-900/5 flex items-center justify-center overflow-hidden min-h-[320px]">
                        {selectedOrder.receiptFilename?.toLowerCase().endsWith('.pdf') ? (
                          <div className="p-8 text-center space-y-3">
                            <FileText className="h-16 w-16 text-rose-500 mx-auto" />
                            <p className="font-bold text-slate-800 text-sm">
                              {selectedOrder.receiptFilename}
                            </p>
                            <p className="text-xs text-slate-500">
                              Ficheiro PDF anexado pelo cliente.
                            </p>
                            <a
                              href={selectedOrder.receiptUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white font-bold text-xs rounded uppercase tracking-wider shadow-sm"
                            >
                              <Download className="h-4 w-4" />
                              <span>Descarregar / Visualizar PDF</span>
                            </a>
                          </div>
                        ) : (
                          <div className="relative max-h-[500px] w-full flex justify-center">
                            <img
                              src={selectedOrder.receiptUrl}
                              alt="Comprovativo de Pagamento"
                              className="max-h-[480px] w-auto object-contain rounded border border-slate-200 shadow-md"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="p-12 text-center bg-white border border-slate-200 rounded space-y-3">
                      <ImageIcon className="h-12 w-12 text-slate-300 mx-auto" />
                      <h4 className="font-bold text-slate-700 text-sm">
                        Nenhum comprovativo anexado ainda
                      </h4>
                      <p className="text-xs text-slate-500 max-w-md mx-auto">
                        O cliente ainda não enviou a foto ou PDF do comprovativo no WhatsApp. Assim que enviar, o bot anexará automaticamente aqui.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setSimulatorOrder(selectedOrder)
                          setIsSimulatorOpen(true)
                        }}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded transition uppercase tracking-wider"
                      >
                        <Bot className="h-4 w-4 text-emerald-600" />
                        <span>Simular Envio de Comprovativo no Testador</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* ========================================================= */}
              {/* ABA 3: HISTÓRICO CONVERSA WHATSAPP */}
              {/* ========================================================= */}
              {activeTab === 'whatsapp' && (
                <div className="space-y-4">
                  
                  {/* Chat Container */}
                  <div className="bg-slate-900 rounded-lg border border-slate-800 shadow-md overflow-hidden flex flex-col h-[420px]">
                    
                    {/* Chat Header */}
                    <div className="px-4 py-3 bg-slate-800/90 border-b border-slate-700 flex items-center justify-between text-white">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-emerald-600 flex items-center justify-center font-bold text-xs">
                          WA
                        </div>
                        <div>
                          <p className="font-bold text-xs">
                            {selectedOrder.customerName} ({selectedOrder.whatsappPhone || selectedOrder.customerPhone || 'Sem Nº'})
                          </p>
                          <p className="text-[10px] text-slate-400">
                            Pedido #{selectedOrder.orderNumber}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {selectedOrder.customerPhone && (
                          <a
                            href={`https://wa.me/${selectedOrder.customerPhone.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-bold flex items-center gap-1 transition"
                          >
                            <ExternalLink className="h-3 w-3" />
                            <span>WhatsApp Web</span>
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Chat Message Stream */}
                    <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-950/80">
                      {(!selectedOrder.conversationHistory ||
                        selectedOrder.conversationHistory.length === 0) ? (
                        <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
                          <Bot className="h-10 w-10 text-slate-600 mb-2" />
                          <p className="text-xs font-semibold text-slate-400">
                            Nenhuma mensagem registada no histórico.
                          </p>
                        </div>
                      ) : (
                        selectedOrder.conversationHistory.map((msg: WhatsAppChatMessage) => {
                          const isBot = msg.sender === 'bot'
                          const isCustomer = msg.sender === 'customer'
                          const isAgent = msg.sender === 'agent'

                          return (
                            <div
                              key={msg.id}
                              className={`flex flex-col ${isCustomer ? 'items-start' : 'items-end'}`}
                            >
                              <div
                                className={`max-w-[85%] p-3 rounded-lg text-xs leading-relaxed shadow-sm ${
                                  isCustomer
                                    ? 'bg-slate-800 border border-slate-700 text-slate-100 rounded-tl-none'
                                    : isAgent
                                    ? 'bg-blue-600 text-white rounded-tr-none'
                                    : 'bg-emerald-800 text-white rounded-tr-none'
                                }`}
                              >
                                <div className="flex items-center justify-between gap-3 text-[10px] opacity-75 mb-1 pb-1 border-b border-white/10">
                                  <span className="font-bold">
                                    {isBot ? '🤖 Bot ARKNET' : isAgent ? `👨‍💼 ${msg.senderName || 'Operador'}` : `👤 ${msg.senderName || 'Cliente'}`}
                                  </span>
                                  <span className="font-mono">
                                    {new Date(msg.timestamp).toLocaleTimeString([], {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })}
                                  </span>
                                </div>

                                {msg.media && (
                                  <div className="mb-2 p-2 bg-slate-900/60 rounded border border-white/10">
                                    {msg.media.type === 'image' ? (
                                      <img
                                        src={msg.media.url}
                                        alt="Comprovativo"
                                        className="w-full h-32 object-cover rounded mb-1"
                                      />
                                    ) : (
                                      <div className="flex items-center gap-2 p-2 bg-slate-800 rounded">
                                        <FileText className="h-4 w-4 text-rose-400" />
                                        <span className="font-bold">{msg.media.filename}</span>
                                      </div>
                                    )}
                                  </div>
                                )}

                                <p className="whitespace-pre-wrap">{msg.text}</p>
                              </div>
                            </div>
                          )
                        })
                      )}
                    </div>

                    {/* Operator Message Input (Assumir conversa) */}
                    <div className="p-3 bg-slate-800 border-t border-slate-700">
                      <form
                        onSubmit={(e) => {
                          e.preventDefault()
                          handleSendOperatorMessage()
                        }}
                        className="flex items-center gap-2"
                      >
                        <input
                          type="text"
                          value={operatorMessage}
                          onChange={(e) => setOperatorMessage(e.target.value)}
                          placeholder="Escreva uma resposta para enviar diretamente ao cliente..."
                          disabled={isSendingMessage}
                          className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                        />

                        <button
                          type="submit"
                          disabled={isSendingMessage || !operatorMessage.trim()}
                          className="px-4 py-2 bg-primary hover:bg-primary/90 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider rounded transition flex items-center gap-1.5"
                        >
                          {isSendingMessage ? (
                            <RefreshCw className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <span>Enviar</span>
                              <Send className="h-3.5 w-3.5" />
                            </>
                          )}
                        </button>
                      </form>
                    </div>

                  </div>

                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {/* WhatsApp Simulator Modal */}
      <WhatsAppSimulatorModal
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
        order={simulatorOrder}
        onOrderUpdated={() => {
          const db = dataStore.getSnapshot()
          setOrders([...db.orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()))
        }}
      />

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
