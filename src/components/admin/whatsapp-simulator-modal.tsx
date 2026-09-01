'use client'

import React, { useState } from 'react'
import {
  X,
  Send,
  Bot,
  User,
  Paperclip,
  Image as ImageIcon,
  FileText,
  Sparkles,
  CheckCircle2,
  RefreshCw,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react'
import { StoreOrder, dataStore } from '@/lib/data-store'
import { formatProdutoPrice } from '@/lib/format-produto-price'

interface WhatsAppSimulatorModalProps {
  isOpen: boolean
  onClose: () => void
  order: StoreOrder | null
  onOrderUpdated?: () => void
}

export function WhatsAppSimulatorModal({
  isOpen,
  onClose,
  order,
  onOrderUpdated,
}: WhatsAppSimulatorModalProps) {
  const [inputText, setInputText] = useState('')
  const [selectedOrder, setSelectedOrder] = useState<StoreOrder | null>(order)
  const [isSending, setIsSending] = useState(false)
  const [customPhone, setCustomPhone] = useState(
    order?.whatsappPhone || order?.customerPhone || '+244 923 111 222'
  )
  const [customName, setCustomName] = useState(order?.customerName || 'Afonso Mário Ribeiro')

  // Sample quick scenarios
  const quickScenarios = [
    {
      label: '1. Iniciar Finalização (Link Carrinho)',
      text: order
        ? `Olá ARKNET! Acabei de registar o pedido *${order.orderNumber}* no valor de *${
            order.total ? formatProdutoPrice(order.total) : 'Sob consulta'
          }* na loja online.`
        : 'Olá ARKNET! Acabei de registar o pedido *PED-2026-0042* na loja online.',
      media: undefined,
    },
    {
      label: '2. Enviar Foto do Comprovativo MCX',
      text: 'Segue a foto do comprovativo de transferência via Multicaixa Express.',
      media: {
        url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
        type: 'image' as const,
        filename: 'comprovativo_mcx_transferencia.jpg',
      },
    },
    {
      label: '3. Enviar PDF do Comprovativo Bancário',
      text: 'Envio em anexo o PDF do comprovativo emitido pelo BAI Directo.',
      media: {
        url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        type: 'document' as const,
        filename: 'Comprovativo_BAI_Directo.pdf',
      },
    },
    {
      label: '4. Dúvida / Pergunta (Escalar para Humano)',
      text: 'Boa tarde! Consigo alterar o endereço de entrega para o Talatona antes de pagarem?',
      media: undefined,
    },
    {
      label: '5. Pedido Inexistente (Erro)',
      text: 'Olá, gostaria de saber do pedido #PED-9999-INEXISTENTE',
      media: undefined,
    },
  ]

  if (!isOpen) return null

  const activeOrder =
    selectedOrder ||
    order ||
    dataStore.getOrders().find((o) => o.status !== 'fechado') ||
    dataStore.getOrders()[0]

  const handleSendMessage = async (
    textToSend: string,
    mediaToSend?: { url: string; type: 'image' | 'document'; filename: string }
  ) => {
    if (!textToSend.trim() && !mediaToSend) return
    setIsSending(true)

    try {
      const response = await fetch('/api/whatsapp/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderPhone: customPhone,
          senderName: customName,
          text: textToSend,
          media: mediaToSend,
          orderNumber: activeOrder?.orderNumber,
        }),
      })

      const data = await response.json()
      if (data.success && data.order) {
        setSelectedOrder(data.order)
      } else if (activeOrder) {
        // Recarregar do store local
        const refreshed = dataStore.getOrders().find((o) => o.id === activeOrder.id)
        if (refreshed) setSelectedOrder(refreshed)
      }

      setInputText('')
      if (onOrderUpdated) onOrderUpdated()
    } catch (err) {
      console.error('Erro na simulação do bot:', err)
    } finally {
      setIsSending(false)
    }
  }

  const messages = activeOrder?.conversationHistory || []

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700 shadow-2xl rounded-lg overflow-hidden z-10 max-h-[92vh] flex flex-col text-slate-100">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-800/90 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center font-bold">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm text-white">
                  Simulador do Bot de WhatsApp — ARKNET
                </h3>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-mono font-bold">
                  Meta Cloud API
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Simule o comportamento do cliente final e teste o fluxo em tempo real.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body: Two columns (Scenarios / Config + WhatsApp Device Mockup) */}
        <div className="grid md:grid-cols-12 flex-1 overflow-hidden">
          
          {/* Left Panel: Scenarios & Order Selector */}
          <div className="md:col-span-5 p-5 bg-slate-800/40 border-r border-slate-700 overflow-y-auto space-y-4 text-xs">
            
            {/* Target Order Selector */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Pedido Associado ao Teste:
              </label>
              <select
                value={activeOrder?.id || ''}
                onChange={(e) => {
                  const found = dataStore.getOrders().find((o) => o.id === e.target.value)
                  if (found) {
                    setSelectedOrder(found)
                    setCustomPhone(found.whatsappPhone || found.customerPhone)
                    setCustomName(found.customerName)
                  }
                }}
                className="w-full bg-slate-900 border border-slate-700 p-2.5 rounded text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
              >
                {dataStore.getOrders().map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.orderNumber} — {o.customerName} ({o.status})
                  </option>
                ))}
              </select>
            </div>

            {/* Quick Test Actions */}
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                Cenários de Teste Rápido:
              </p>
              <div className="space-y-2">
                {quickScenarios.map((sc, i) => (
                  <button
                    key={i}
                    type="button"
                    disabled={isSending}
                    onClick={() => handleSendMessage(sc.text, sc.media)}
                    className="w-full text-left p-2.5 bg-slate-900/90 hover:bg-slate-700/80 border border-slate-700/80 hover:border-emerald-500/60 rounded transition group"
                  >
                    <p className="font-bold text-slate-200 group-hover:text-emerald-400 text-[11px] flex items-center justify-between">
                      <span>{sc.label}</span>
                      <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition text-emerald-400" />
                    </p>
                    <p className="text-[10px] text-slate-400 truncate mt-0.5">
                      {sc.text}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Bot Status Card */}
            {activeOrder && (
              <div className="p-3 bg-slate-900/80 border border-slate-700/60 rounded space-y-1.5 text-[11px]">
                <p className="font-bold uppercase tracking-wider text-slate-400 text-[10px]">
                  Estado Atual no Backend:
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Estado do Pedido:</span>
                  <span className="font-bold text-emerald-400 uppercase font-mono">{activeOrder.status}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Estado do Bot:</span>
                  <span className="font-bold text-amber-400 uppercase font-mono">{activeOrder.botStatus || 'bot_active'}</span>
                </div>
                {activeOrder.receiptUrl && (
                  <div className="flex justify-between items-center text-emerald-300 pt-1 border-t border-slate-800">
                    <span>Comprovativo Anexado:</span>
                    <span className="font-bold">Sim (Validar no Painel)</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Panel: WhatsApp Chat Screen Mockup */}
          <div className="md:col-span-7 flex flex-col bg-slate-950/90 h-[520px] overflow-hidden">
            
            {/* Chat Header */}
            <div className="px-4 py-3 bg-slate-800 border-b border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white font-black text-xs">
                  ARK
                </div>
                <div>
                  <p className="font-bold text-xs text-white">ARKNET Comercial (Bot Oficial)</p>
                  <p className="text-[10px] text-emerald-400 font-mono">+244 935 208 449 • Online</p>
                </div>
              </div>

              {activeOrder?.botStatus === 'needs_human' && (
                <span className="px-2 py-0.5 bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-bold rounded flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  Operador Humano Chamado
                </span>
              )}
            </div>

            {/* Chat Message Thread */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px]">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
                  <Bot className="h-10 w-10 text-slate-600 mb-2" />
                  <p className="text-xs font-semibold text-slate-400">Nenhuma mensagem trocada ainda.</p>
                  <p className="text-[11px] text-slate-500 mt-1 max-w-xs">
                    Clique em um dos cenários à esquerda ou escreva uma mensagem abaixo para simular o cliente.
                  </p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isBot = msg.sender === 'bot'
                  const isCustomer = msg.sender === 'customer'
                  const isAgent = msg.sender === 'agent'

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isCustomer ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-[85%] p-3 rounded-lg text-xs leading-relaxed shadow-md ${
                          isCustomer
                            ? 'bg-emerald-700 text-white rounded-tr-none'
                            : isAgent
                            ? 'bg-blue-600 text-white rounded-tl-none'
                            : 'bg-slate-800 border border-slate-700 text-slate-100 rounded-tl-none'
                        }`}
                      >
                        {/* Sender Label */}
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

                        {/* Media Attachment Card */}
                        {msg.media && (
                          <div className="mb-2 p-2 bg-slate-900/60 rounded border border-white/10">
                            {msg.media.type === 'image' ? (
                              <div>
                                <img
                                  src={msg.media.url}
                                  alt="Comprovativo"
                                  className="w-full h-32 object-cover rounded mb-1"
                                />
                                <span className="text-[10px] text-slate-300 flex items-center gap-1">
                                  <ImageIcon className="h-3 w-3" />
                                  {msg.media.filename || 'comprovativo.jpg'}
                                </span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 p-2 bg-slate-800 rounded text-[11px]">
                                <FileText className="h-5 w-5 text-rose-400 shrink-0" />
                                <div className="truncate">
                                  <p className="font-bold truncate">{msg.media.filename || 'comprovativo.pdf'}</p>
                                  <span className="text-[9px] text-slate-400">Documento PDF</span>
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Text */}
                        <p className="whitespace-pre-wrap">{msg.text}</p>
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            {/* Input Bar */}
            <div className="p-3 bg-slate-800 border-t border-slate-700">
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleSendMessage(inputText)
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Escreva como se fosse o cliente no WhatsApp..."
                  disabled={isSending}
                  className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                />

                <button
                  type="button"
                  title="Anexar Comprovativo de Exemplo"
                  onClick={() =>
                    handleSendMessage('Segue o comprovativo da transferência.', {
                      url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
                      type: 'image',
                      filename: 'comprovativo_mcx.jpg',
                    })
                  }
                  className="p-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded transition"
                >
                  <Paperclip className="h-4 w-4" />
                </button>

                <button
                  type="submit"
                  disabled={isSending || !inputText.trim()}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded transition flex items-center gap-1.5 shadow-sm"
                >
                  {isSending ? (
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

      </div>
    </div>
  )
}
