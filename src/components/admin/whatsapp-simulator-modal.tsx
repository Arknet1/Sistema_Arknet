'use client'

import React, { useState, useRef, useEffect } from 'react'
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
  RotateCcw,
  MessageCircle,
} from 'lucide-react'
import { StoreOrder, dataStore } from '@/lib/data-store'
import { formatProdutoPrice } from '@/lib/format-produto-price'

interface SimulatorMessage {
  id: string
  role: 'customer' | 'bot'
  text: string
  timestamp: string
  media?: { url: string; type: string; filename: string }
}

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
  const [customName, setCustomName] = useState(order?.customerName || '')
  const [simulatorMessages, setSimulatorMessages] = useState<SimulatorMessage[]>([])
  const [detectedClientName, setDetectedClientName] = useState<string | null>(null)
  const [botStatus, setBotStatus] = useState<string>('bot_active')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [simulatorMessages])

  // Sample quick scenarios
  const quickScenarios = [
    {
      label: '💬 Saudação Simples',
      text: 'Olá, boa tarde!',
      media: undefined,
    },
    {
      label: '👤 Apresentação com Nome',
      text: 'Olá, sou o Paulo Mendes',
      media: undefined,
    },
    {
      label: '📦 Perguntar Produtos',
      text: 'Quais equipamentos de rede têm disponíveis?',
      media: undefined,
    },
    {
      label: '💰 Perguntar Preço',
      text: 'Quanto custa um roteador MikroTik?',
      media: undefined,
    },
    {
      label: '🚚 Perguntar Entrega',
      text: 'Fazem entregas em Viana?',
      media: undefined,
    },
    {
      label: '💳 Formas de Pagamento',
      text: 'Quais são as formas de pagamento?',
      media: undefined,
    },
    {
      label: '🕐 Horário',
      text: 'Qual é o horário de atendimento?',
      media: undefined,
    },
    {
      label: '🏢 Sobre a ARKNET',
      text: 'O que é a ARKNET e que serviços oferecem?',
      media: undefined,
    },
    {
      label: '🛠️ Suporte Técnico',
      text: 'Preciso de suporte técnico para configurar um equipamento',
      media: undefined,
    },
    {
      label: '📝 Reclamação',
      text: 'Não recebi o meu pedido e já passou o prazo de entrega',
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

    // Adicionar mensagem do cliente ao histórico local imediatamente
    const clientMsg: SimulatorMessage = {
      id: `sim-${Date.now()}-client`,
      role: 'customer',
      text: textToSend,
      timestamp: new Date().toISOString(),
      media: mediaToSend,
    }
    setSimulatorMessages(prev => [...prev, clientMsg])

    try {
      const response = await fetch('/api/whatsapp/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderPhone: customPhone,
          senderName: customName || undefined,
          text: textToSend,
          media: mediaToSend,
          // Não enviar orderNumber para permitir conversa livre
        }),
      })

      const data = await response.json()
      
      if (data.success) {
        // Adicionar respostas do bot ao histórico local
        if (data.result?.responseMessages) {
          const botMessages: SimulatorMessage[] = data.result.responseMessages.map(
            (msg: string, i: number) => ({
              id: `sim-${Date.now()}-bot-${i}`,
              role: 'bot' as const,
              text: msg,
              timestamp: new Date().toISOString(),
            })
          )
          setSimulatorMessages(prev => [...prev, ...botMessages])
        }

        // Atualizar estado do bot
        if (data.result?.botStatus) {
          setBotStatus(data.result.botStatus)
        }

        // Detectar nome extraído
        if (data.result?.extractedCustomerName) {
          setDetectedClientName(data.result.extractedCustomerName)
        }

        if (data.order) {
          setSelectedOrder(data.order)
        }
      }

      setInputText('')
      if (onOrderUpdated) onOrderUpdated()
    } catch (err) {
      console.error('Erro na simulação do bot:', err)
      // Mostrar erro no chat
      setSimulatorMessages(prev => [
        ...prev,
        {
          id: `sim-${Date.now()}-error`,
          role: 'bot',
          text: '⚠️ Erro ao processar mensagem. Verifique a consola do servidor.',
          timestamp: new Date().toISOString(),
        },
      ])
    } finally {
      setIsSending(false)
    }
  }

  const handleResetConversation = () => {
    setSimulatorMessages([])
    setDetectedClientName(null)
    setBotStatus('bot_active')
    setCustomName('')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-700 shadow-2xl rounded-lg overflow-hidden z-10 max-h-[92vh] flex flex-col text-slate-100">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-800/90 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center font-bold">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm text-white">
                  Simulador WhatsApp — Domingas Manuel
                </h3>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-mono font-bold">
                  Assistente IA
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Teste a conversa como se fosse o cliente. O bot mantém memória do contexto.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleResetConversation}
              className="text-slate-400 hover:text-amber-400 p-1.5 rounded transition flex items-center gap-1 text-[11px]"
              title="Reiniciar Conversa"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Limpar</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="grid md:grid-cols-12 flex-1 overflow-hidden">
          
          {/* Left Panel: Scenarios & Config */}
          <div className="md:col-span-4 p-4 bg-slate-800/40 border-r border-slate-700 overflow-y-auto space-y-4 text-xs">
            
            {/* Phone & Name Config */}
            <div className="space-y-2">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Configuração do Cliente:
              </label>
              <input
                type="text"
                value={customPhone}
                onChange={(e) => setCustomPhone(e.target.value)}
                placeholder="Telefone (+244 ...)"
                className="w-full bg-slate-900 border border-slate-700 p-2 rounded text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
              />
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="Nome do cliente (opcional, o bot detecta)"
                className="w-full bg-slate-900 border border-slate-700 p-2 rounded text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Quick Test Actions */}
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                Cenários Rápidos:
              </p>
              <div className="space-y-1.5 max-h-[350px] overflow-y-auto pr-1">
                {quickScenarios.map((sc, i) => (
                  <button
                    key={i}
                    type="button"
                    disabled={isSending}
                    onClick={() => handleSendMessage(sc.text, sc.media)}
                    className="w-full text-left p-2 bg-slate-900/90 hover:bg-slate-700/80 border border-slate-700/80 hover:border-emerald-500/60 rounded transition group"
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

            {/* Session Status Card */}
            <div className="p-3 bg-slate-900/80 border border-slate-700/60 rounded space-y-1.5 text-[11px]">
              <p className="font-bold uppercase tracking-wider text-slate-400 text-[10px]">
                Estado da Sessão:
              </p>
              <div className="flex justify-between items-center">
                <span className="text-slate-300">Nome Detectado:</span>
                <span className={`font-bold font-mono ${detectedClientName ? 'text-emerald-400' : 'text-slate-500'}`}>
                  {detectedClientName || '(não detectado)'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-300">Estado do Bot:</span>
                <span className={`font-bold uppercase font-mono ${
                  botStatus === 'needs_human' ? 'text-rose-400' :
                  botStatus === 'waiting_receipt' ? 'text-amber-400' :
                  'text-emerald-400'
                }`}>{botStatus}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-300">Mensagens:</span>
                <span className="font-bold text-slate-300 font-mono">{simulatorMessages.length}</span>
              </div>
            </div>
          </div>

          {/* Right Panel: WhatsApp Chat Screen */}
          <div className="md:col-span-8 flex flex-col bg-slate-950/90 h-[560px] overflow-hidden">
            
            {/* Chat Header */}
            <div className="px-4 py-3 bg-slate-800 border-b border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white font-black text-xs">
                  DM
                </div>
                <div>
                  <p className="font-bold text-xs text-white">Domingas Manuel — ARKNET</p>
                  <p className="text-[10px] text-emerald-400 font-mono">Assistente Comercial • Online</p>
                </div>
              </div>

              {botStatus === 'needs_human' && (
                <span className="px-2 py-0.5 bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-bold rounded flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  Operador Chamado
                </span>
              )}
            </div>

            {/* Chat Message Thread */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px]">
              {simulatorMessages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
                  <MessageCircle className="h-12 w-12 text-emerald-600/30 mb-3" />
                  <p className="text-sm font-semibold text-slate-300">Simulador de Conversa</p>
                  <p className="text-[11px] text-slate-500 mt-1 max-w-xs">
                    Escreva uma mensagem abaixo ou clique num cenário rápido à esquerda. O bot mantém memória do seu nome e do contexto da conversa.
                  </p>
                </div>
              ) : (
                <>
                  {simulatorMessages.map((msg) => {
                    const isBot = msg.role === 'bot'

                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${!isBot ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`max-w-[85%] p-3 rounded-lg text-xs leading-relaxed shadow-md ${
                            !isBot
                              ? 'bg-emerald-700 text-white rounded-tr-none'
                              : 'bg-slate-800 border border-slate-700 text-slate-100 rounded-tl-none'
                          }`}
                        >
                          {/* Sender Label */}
                          <div className="flex items-center justify-between gap-3 text-[10px] opacity-75 mb-1 pb-1 border-b border-white/10">
                            <span className="font-bold flex items-center gap-1">
                              {isBot ? (
                                <>
                                  <Bot className="h-3 w-3" />
                                  Domingas Manuel
                                </>
                              ) : (
                                <>
                                  <User className="h-3 w-3" />
                                  {detectedClientName || customName || 'Cliente'}
                                </>
                              )}
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

                          {/* Text - render with whitespace and bold */}
                          <p className="whitespace-pre-wrap">{msg.text}</p>
                        </div>
                      </div>
                    )
                  })}
                  <div ref={messagesEndRef} />
                </>
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
                  className="flex-1 px-3 py-2.5 bg-slate-900 border border-slate-700 rounded text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
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
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded transition flex items-center gap-1.5 shadow-sm"
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
