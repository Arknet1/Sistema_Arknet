'use client'

import React, { useState, useEffect } from 'react'
import {
  MessageSquare,
  Bot,
  Send,
  User,
  Sparkles,
  CheckCircle2,
  Clock,
  Shield,
  Phone,
  Building2,
  CreditCard,
  Truck,
  Globe,
  Save,
  RefreshCw,
  AlertTriangle,
  Play,
  RotateCcw,
  Paperclip,
  Image as ImageIcon,
  FileText,
  UserCheck,
  Check,
  ChevronRight,
  Info,
} from 'lucide-react'
import { FaWhatsapp } from 'react-icons/fa6'
import { dataStore, StoreOrder } from '@/lib/data-store'
import { useToast } from '@/lib/toast-context'
import {
  generateDomingasResponse,
  getAngolaGreeting,
  formatCustomerSalutation,
} from '@/lib/whatsapp/domingas-engine'
import { ARKNET_BANK_DETAILS } from '@/lib/whatsapp/templates'

interface ChatBubbleMessage {
  id: string
  sender: 'customer' | 'bot'
  text: string
  time: string
  media?: {
    type: 'image' | 'document'
    filename: string
    url: string
  }
}

export default function AdminWhatsAppBotPage() {
  const { success, info } = useToast()

  const [activeTab, setActiveTab] = useState<'config' | 'simulator' | 'rules'>('simulator')

  // Configurações do Bot
  const [botEnabled, setBotEnabled] = useState(true)
  const [botName, setBotName] = useState('Domingas Manuel')
  const [botRole, setBotRole] = useState('Assistente Comercial da ARKNET')
  const [workingHours, setWorkingHours] = useState('08h às 17h')
  const [companyLocation, setCompanyLocation] = useState('Luanda / KK5000')
  const [companyPhone, setCompanyPhone] = useState('+244 935 208 449')
  const [companyStoreUrl, setCompanyStoreUrl] = useState('https://arknet.co.ao/loja')
  const [paymentMethods, setPaymentMethods] = useState('Transferência Bancária (BAI, BFA, BIC), Depósito e Multicaixa Express (MCX)')
  const [deliveryInfo, setDeliveryInfo] = useState('Toda Luanda e outras províncias (Prazo: 24h a 48h úteis)')
  const [bankHolder, setBankHolder] = useState(ARKNET_BANK_DETAILS.holder)
  const [mcxNumber, setMcxNumber] = useState(ARKNET_BANK_DETAILS.mcxNumber)
  const [baiIban, setBaiIban] = useState(ARKNET_BANK_DETAILS.baiIban)
  const [bfaIban, setBfaIban] = useState(ARKNET_BANK_DETAILS.bfaIban)
  const [isSaving, setIsSaving] = useState(false)

  // Estado do Simulador
  const [simMessages, setSimMessages] = useState<ChatBubbleMessage[]>([
    {
      id: 'msg-1',
      sender: 'bot',
      text: `${getAngolaGreeting()}! Sou a Domingas Manuel, assistente virtual da ARKNET. Em que posso ajudar?`,
      time: '10:00',
    },
  ])
  const [simInputText, setSimInputText] = useState('')
  const [simCustomerName, setSimCustomerName] = useState('Exmo(a). Cliente')
  const [simCustomerPhone, setSimCustomerPhone] = useState('+244 923 111 222')
  const [isTyping, setIsTyping] = useState(false)

  // Carregar definições iniciais
  useEffect(() => {
    const settings = dataStore.getSettings()
    if (settings.whatsappNumber) {
      setCompanyPhone(settings.whatsappNumber)
    }
  }, [])

  const handleSaveConfig = () => {
    setIsSaving(true)
    setTimeout(() => {
      dataStore.updateSettings({
        whatsappNumber: companyPhone,
      })
      setIsSaving(false)
      success('Configurações da Assistente Virtual Domingas guardadas com sucesso!')
    }, 400)
  }

  // Cenários rápidos de teste
  const quickTestScenarios = [
    {
      label: '1. Apresentar-se (ex.: "Sou o Jedy")',
      text: 'Olá, sou o Jedy e gostaria de conhecer as vossas soluções.',
    },
    {
      label: '2. Apenas o Nome (ex.: "Jedy")',
      text: 'Jedy',
    },
    {
      label: '3. Consultar Switch / Roteador (Catálogo)',
      text: 'Têm switches gerenciáveis e roteadores Mikrotik disponíveis na loja?',
    },
    {
      label: '4. Perguntar Preço de Produto',
      text: 'Quanto custa o Switch Gerenciável 24 Portas PoE+?',
    },
    {
      label: '5. Intenção de Compra / Encomenda',
      text: 'Quero comprar 2 switches para a minha empresa.',
    },
    {
      label: '6. Consultar Estado de Pedido',
      text: 'Gostaria de saber o estado do meu pedido #PED-2026-0001.',
    },
    {
      label: '7. Enviar Comprovativo MCX (Foto)',
      text: 'Acabei de fazer o pagamento por Multicaixa Express. Segue o comprovativo em anexo.',
      media: {
        type: 'image' as const,
        filename: 'comprovativo_mcx_transferencia.jpg',
        url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
      },
    },
    {
      label: '8. Orçamento para Empresa / Escola',
      text: 'Precisamos de um orçamento formal para fornecimento de equipamentos para uma escola com 40 postos.',
    },
    {
      label: '9. Reclamação / Pedido Atrasado',
      text: 'Fiz a encomenda ontem e até agora ninguém me ligou para a entrega. Estou insatisfeito.',
    },
    {
      label: '10. Pergunta se é Robô ou Humano',
      text: 'Estou a falar com uma pessoa ou é um robô automático?',
    },
  ]

  const handleSendSimMessage = (textToSend: string, mediaPayload?: { type: 'image' | 'document'; filename: string; url: string }) => {
    if (!textToSend.trim() && !mediaPayload) return

    const nowStr = new Date().toLocaleTimeString('pt-AO', { hour: '2-digit', minute: '2-digit' })
    const userMsgId = `usr-${Date.now()}`

    const userMessage: ChatBubbleMessage = {
      id: userMsgId,
      sender: 'customer',
      text: textToSend,
      time: nowStr,
      media: mediaPayload,
    }

    setSimMessages((prev) => [...prev, userMessage])
    setSimInputText('')
    setIsTyping(true)

    // Simular tempo de resposta natural da Domingas Manuel
    setTimeout(() => {
      let botResponseText = ''

      if (mediaPayload) {
        botResponseText = `Agradeço o envio do comprovativo, ${formatCustomerSalutation(simCustomerName)}. O documento foi anexado com sucesso e encaminhado para validação financeira. Entraremos em contacto assim que o crédito for confirmado.`
      } else {
        const replyResult = generateDomingasResponse(textToSend, {
          senderPhone: simCustomerPhone,
          senderName: simCustomerName,
          customerTitle: 'Sr.',
        })
        botResponseText = replyResult.text

        // Atualizar o nome do cliente no simulador se foi detetado
        if (replyResult.extractedCustomerName) {
          setSimCustomerName(replyResult.extractedCustomerName)
        }
      }

      const botMessage: ChatBubbleMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: botResponseText,
        time: new Date().toLocaleTimeString('pt-AO', { hour: '2-digit', minute: '2-digit' }),
      }

      setSimMessages((prev) => [...prev, botMessage])
      setIsTyping(false)
    }, 600)
  }

  const handleResetChat = () => {
    setSimCustomerName('Exmo(a). Cliente')
    setSimMessages([
      {
        id: 'msg-1',
        sender: 'bot',
        text: `${getAngolaGreeting()}! Sou a Domingas Manuel, assistente virtual da ARKNET. Em que posso ajudar?`,
        time: new Date().toLocaleTimeString('pt-AO', { hour: '2-digit', minute: '2-digit' }),
      },
    ])
    info('Conversa de teste reiniciada.')
  }

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full w-fit mb-2 border border-emerald-200">
            <FaWhatsapp className="h-4 w-4 text-emerald-600" />
            <span>Assistente Comercial Oficial no WhatsApp</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 flex items-center gap-3">
            <span>Assistente Virtual: Domingas Manuel</span>
            <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-300">
              Operacional
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-3xl">
            Configure as regras, directrizes e respostas da assistente comercial para atendimento aos clientes no WhatsApp, validação de pedidos, consulta de produtos e escalamento humano.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleSaveConfig}
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/90 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition shadow-sm disabled:opacity-50"
          >
            <Save className={`h-4 w-4 ${isSaving ? 'animate-spin' : ''}`} />
            <span>{isSaving ? 'A guardar...' : 'Guardar Definições'}</span>
          </button>
        </div>
      </div>

      {/* Tabs de Navegação */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab('simulator')}
          className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition ${
            activeTab === 'simulator'
              ? 'border-emerald-600 text-emerald-600 bg-emerald-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Play className="h-4 w-4" />
          <span>Simulador &amp; Testador de Conversa</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('config')}
          className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition ${
            activeTab === 'config'
              ? 'border-primary text-primary bg-primary/5'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Bot className="h-4 w-4" />
          <span>Identidade &amp; Parâmetros do Bot</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('rules')}
          className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition ${
            activeTab === 'rules'
              ? 'border-primary text-primary bg-primary/5'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Shield className="h-4 w-4" />
          <span>Regras de Conduta &amp; Modelos</span>
        </button>
      </div>

      {/* ABA 1: SIMULADOR DE CONVERSA WHATSAPP */}
      {activeTab === 'simulator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Coluna Esquerda: Cenários Rápidos de Teste */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-emerald-600" />
                  <span>Cenários de Teste Rápidos</span>
                </h2>
                <span className="text-[10px] font-bold uppercase bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                  10 Casos de Uso
                </span>
              </div>
              <p className="text-xs text-slate-500 mb-4">
                Clique num dos cenários abaixo para testar instantaneamente a reação e aderência às regras da Domingas Manuel:
              </p>

              <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
                {quickTestScenarios.map((scen, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSendSimMessage(scen.text, scen.media)}
                    className="w-full text-left p-3 rounded-lg border border-slate-200 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 transition flex items-start justify-between gap-2 group"
                  >
                    <div>
                      <div className="text-xs font-black text-slate-800 group-hover:text-emerald-800">
                        {scen.label}
                      </div>
                      <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5 font-mono">
                        &quot;{scen.text}&quot;
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-emerald-600 shrink-0 mt-0.5" />
                  </button>
                ))}
              </div>
            </div>

            {/* Caixa de Ajuste do Cliente Teste */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-primary" />
                <span>Perfil do Cliente em Teste</span>
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Nome do Cliente:</label>
                  <input
                    type="text"
                    value={simCustomerName}
                    onChange={(e) => setSimCustomerName(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-primary outline-none"
                    placeholder="ex.: Sr. Paulo, Sra. Marta"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Telefone WhatsApp:</label>
                  <input
                    type="text"
                    value={simCustomerPhone}
                    onChange={(e) => setSimCustomerPhone(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-primary outline-none font-mono"
                    placeholder="+244 923 000 000"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Coluna Direita: Janela de Chat Estilo WhatsApp */}
          <div className="lg:col-span-7 bg-white border border-slate-300 rounded-2xl shadow-md overflow-hidden flex flex-col h-[680px]">
            
            {/* WhatsApp Header */}
            <div className="bg-[#075E54] text-white px-4 py-3 flex items-center justify-between shrink-0 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="h-10 w-10 rounded-full bg-emerald-100 text-emerald-800 font-black flex items-center justify-center border-2 border-white shadow-xs">
                    DM
                  </div>
                  <span className="absolute bottom-0 right-0 h-3 w-3 bg-emerald-400 border-2 border-[#075E54] rounded-full"></span>
                </div>
                <div>
                  <h3 className="text-sm font-bold leading-tight">Domingas Manuel</h3>
                  <p className="text-[11px] text-emerald-100 flex items-center gap-1">
                    <span className="h-1.5 w-1.5 bg-emerald-400 rounded-full"></span>
                    Assistente Comercial • ARKNET Oficial
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleResetChat}
                  title="Reiniciar Conversa"
                  className="p-2 hover:bg-white/10 rounded-full text-white/90 transition text-xs flex items-center gap-1 font-bold"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Limpar</span>
                </button>
              </div>
            </div>

            {/* Chat Body Wallpaper */}
            <div
              className="flex-1 overflow-y-auto p-4 space-y-3"
              style={{
                backgroundColor: '#EFEAE2',
                backgroundImage: `radial-gradient(#d4ccc2 1px, transparent 1px)`,
                backgroundSize: '20px 20px',
              }}
            >
              {/* Aviso de Criptografia / Canal Oficial */}
              <div className="flex justify-center my-2">
                <div className="bg-amber-100/90 border border-amber-200 text-amber-800 text-[10px] px-3 py-1 rounded-md shadow-xs text-center max-w-sm">
                  🔒 Canal Oficial ARKNET. Atendimento automatizado por Domingas Manuel em Luanda, Angola.
                </div>
              </div>

              {/* Mensagens */}
              {simMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === 'customer' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-lg p-3 text-xs leading-relaxed shadow-xs relative ${
                      msg.sender === 'customer'
                        ? 'bg-[#E7FFDB] text-slate-900 rounded-tr-none'
                        : 'bg-white text-slate-900 rounded-tl-none border border-slate-200'
                    }`}
                  >
                    {/* Media Preview if attached */}
                    {msg.media && (
                      <div className="mb-2 p-2 bg-black/5 rounded border border-black/10 flex items-center gap-2">
                        {msg.media.type === 'image' ? (
                          <ImageIcon className="h-5 w-5 text-emerald-600 shrink-0" />
                        ) : (
                          <FileText className="h-5 w-5 text-rose-600 shrink-0" />
                        )}
                        <span className="font-mono text-[11px] truncate">{msg.media.filename}</span>
                      </div>
                    )}

                    <div className="whitespace-pre-line">{msg.text}</div>

                    <div
                      className={`text-[9px] text-slate-400 mt-1 flex items-center justify-end gap-1 ${
                        msg.sender === 'customer' ? 'text-emerald-700/60' : 'text-slate-400'
                      }`}
                    >
                      <span>{msg.time}</span>
                      {msg.sender === 'customer' && (
                        <span className="text-emerald-600 font-bold">✓✓</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex items-start">
                  <div className="bg-white text-slate-600 rounded-lg rounded-tl-none px-3 py-2 text-xs shadow-xs border border-slate-200 flex items-center gap-1.5">
                    <span className="h-2 w-2 bg-emerald-500 rounded-full animate-bounce"></span>
                    <span className="h-2 w-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                    <span className="h-2 w-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                    <span className="text-[11px] text-slate-500 ml-1">Assistente virtual a responder...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Chat Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleSendSimMessage(simInputText)
              }}
              className="bg-[#F0F2F5] p-3 border-t border-slate-200 flex items-center gap-2 shrink-0"
            >
              <button
                type="button"
                onClick={() =>
                  handleSendSimMessage('Segue em anexo o comprovativo de transferência bancária.', {
                    type: 'document',
                    filename: 'Comprovativo_BAI_Bancario.pdf',
                    url: 'https://example.com/comprovativo.pdf',
                  })
                }
                title="Anexar Comprovativo PDF de Teste"
                className="p-2 text-slate-500 hover:text-emerald-600 hover:bg-slate-200 rounded-full transition"
              >
                <Paperclip className="h-4 w-4" />
              </button>

              <input
                type="text"
                value={simInputText}
                onChange={(e) => setSimInputText(e.target.value)}
                placeholder="Escreva uma mensagem como cliente..."
                className="flex-1 text-xs px-4 py-2.5 bg-white border border-slate-300 rounded-full focus:ring-1 focus:ring-emerald-500 outline-none shadow-xs"
              />

              <button
                type="submit"
                disabled={!simInputText.trim() || isTyping}
                className="p-2.5 bg-[#00A884] hover:bg-[#008f70] text-white rounded-full transition shadow-xs disabled:opacity-40"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ABA 2: IDENTIDADE & CONFIGURAÇÕES */}
      {activeTab === 'config' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Identidade do Bot */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
            <h2 className="text-base font-black text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
              <Bot className="h-5 w-5 text-primary" />
              <span>Identidade Institucional</span>
            </h2>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Nome do Assistente Virtual:</label>
              <input
                type="text"
                value={botName}
                onChange={(e) => setBotName(e.target.value)}
                className="w-full text-xs px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-primary outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Cargo / Função:</label>
              <input
                type="text"
                value={botRole}
                onChange={(e) => setBotRole(e.target.value)}
                className="w-full text-xs px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-primary outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Horário de Atendimento Comercial:</label>
              <input
                type="text"
                value={workingHours}
                onChange={(e) => setWorkingHours(e.target.value)}
                className="w-full text-xs px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-primary outline-none font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Morada e Pontos de Levantamento:</label>
              <input
                type="text"
                value={companyLocation}
                onChange={(e) => setCompanyLocation(e.target.value)}
                className="w-full text-xs px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-primary outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Contacto Telefónico da Equipa:</label>
              <input
                type="text"
                value={companyPhone}
                onChange={(e) => setCompanyPhone(e.target.value)}
                className="w-full text-xs px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-primary outline-none font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Endereço da Loja Online:</label>
              <input
                type="text"
                value={companyStoreUrl}
                onChange={(e) => setCompanyStoreUrl(e.target.value)}
                className="w-full text-xs px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-primary outline-none font-mono"
              />
            </div>
          </div>

          {/* Dados Bancários & Pagamentos */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
            <h2 className="text-base font-black text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
              <CreditCard className="h-5 w-5 text-emerald-600" />
              <span>Instruções Bancárias &amp; Logística</span>
            </h2>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Titular da Conta Oficial:</label>
              <input
                type="text"
                value={bankHolder}
                onChange={(e) => setBankHolder(e.target.value)}
                className="w-full text-xs px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-primary outline-none"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Aviso de segurança: A Domingas reforça sempre aos clientes que a ARKNET não recebe pagamentos em contas particulares.
              </span>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Número Multicaixa Express (MCX):</label>
              <input
                type="text"
                value={mcxNumber}
                onChange={(e) => setMcxNumber(e.target.value)}
                className="w-full text-xs px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-primary outline-none font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">IBAN Banco BAI:</label>
              <input
                type="text"
                value={baiIban}
                onChange={(e) => setBaiIban(e.target.value)}
                className="w-full text-xs px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-primary outline-none font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">IBAN Banco BFA:</label>
              <input
                type="text"
                value={bfaIban}
                onChange={(e) => setBfaIban(e.target.value)}
                className="w-full text-xs px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-primary outline-none font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Zonas e Prazos de Entrega:</label>
              <input
                type="text"
                value={deliveryInfo}
                onChange={(e) => setDeliveryInfo(e.target.value)}
                className="w-full text-xs px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-primary outline-none"
              />
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleSaveConfig}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition"
              >
                Salvar Alterações de Parâmetros
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ABA 3: REGRAS OPERACIONAIS & MODELOS */}
      {activeTab === 'rules' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-6">
          <div className="pb-4 border-b border-slate-100">
            <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Shield className="h-5 w-5 text-amber-600" />
              <span>Orientações da Assistente Virtual</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              As respostas usam dados do catálogo e regras de atendimento. Quando falta informação, a conversa deve seguir para a equipa.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
              <div className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                <Check className="h-4 w-4 text-emerald-600" />
                <span>Tom e Postura</span>
              </div>
              <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside">
                <li>Profissional, cordial e segura.</li>
                <li>Trata por &quot;Sr.&quot; ou &quot;Sra.&quot; seguido do nome.</li>
                <li>Português de Angola correto e cuidado.</li>
                <li>Sem gírias ou abreviaturas de chat.</li>
              </ul>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
              <div className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                <Check className="h-4 w-4 text-emerald-600" />
                <span>Formato das Mensagens</span>
              </div>
              <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside">
                <li>Mensagens de 2 a 4 frases concisas.</li>
                <li>Valores sempre em Kwanzas (ex.: 185.000 Kz).</li>
                <li>Uma pergunta por mensagem.</li>
                <li>Máximo 1 emoji e apenas em saudações (😊).</li>
              </ul>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
              <div className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                <Check className="h-4 w-4 text-emerald-600" />
                <span>Escalamento Humano</span>
              </div>
              <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside">
                <li>Reclamações e devoluções.</li>
                <li>Orçamentos corporativos e para escolas.</li>
                <li>Dúvidas técnicas não documentadas.</li>
                <li>Sempre que o cliente solicitar expressamente.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
