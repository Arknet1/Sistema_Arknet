'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Copy,
  Check,
  Send,
  Loader2,
  Package,
  Truck,
  CreditCard,
  Users,
  Wrench,
  HelpCircle,
  ShieldCheck,
  FileText,
  Phone,
  Mail,
  ArrowLeft,
  ChevronDown,
  Sparkles,
} from 'lucide-react'
import { useCustomerAuth } from '@/lib/customer-auth-context'
import { TicketType, TicketCategory, TICKET_TYPE_CONFIG, TICKET_CATEGORY_CONFIG } from '@/lib/tickets/types'

export default function ReclamacoesClient() {
  const { customer } = useCustomerAuth()
  const isAuthenticated = !!customer

  const [type, setType] = useState<TicketType>('RECLAMACAO')
  const [category, setCategory] = useState<TicketCategory>('PRODUTO')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [orderNumber, setOrderNumber] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [consentAccepted, setConsentAccepted] = useState(false)
  const [honeypot, setHoneypot] = useState('')
  const [renderedAt, setRenderedAt] = useState<number>(Date.now())

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [createdProtocol, setCreatedProtocol] = useState<string | null>(null)
  const [hasCopiedProtocol, setHasCopiedProtocol] = useState(false)

  // Pre-fill user data when authenticated customer is present
  useEffect(() => {
    setRenderedAt(Date.now())
    if (customer) {
      if (customer.name && !name) setName(customer.name)
      if (customer.email && !email) setEmail(customer.email)
      if (customer.phone && !phone) setPhone(customer.phone)
    }
  }, [customer])

  const handleCopyProtocol = () => {
    if (!createdProtocol) return
    navigator.clipboard.writeText(createdProtocol)
    setHasCopiedProtocol(true)
    setTimeout(() => setHasCopiedProtocol(false), 3000)
  }

  const handleResetForm = () => {
    setCreatedProtocol(null)
    setFormError(null)
    setSubject('')
    setMessage('')
    setOrderNumber('')
    setConsentAccepted(false)
    setHoneypot('')
    setRenderedAt(Date.now())
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    if (!name.trim() || name.trim().length < 3) {
      setFormError('Por favor introduza o seu nome completo (mínimo 3 caracteres).')
      return
    }

    if (!email.trim() || !email.includes('@')) {
      setFormError('Por favor introduza um endereço de correio eletrónico válido.')
      return
    }

    if (!subject.trim() || subject.trim().length < 5) {
      setFormError('Por favor indique um assunto claro (mínimo 5 caracteres).')
      return
    }

    if (!message.trim() || message.trim().length < 20) {
      setFormError('A sua mensagem deve conter no mínimo 20 caracteres para que a nossa equipa possa analisar detalhadamente o seu caso.')
      return
    }

    if (message.trim().length > 2000) {
      setFormError('A sua mensagem não pode exceder 2000 caracteres.')
      return
    }

    if (!consentAccepted) {
      setFormError('Deve aceitar os termos de tratamento de dados e política de privacidade para prosseguir.')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          category,
          name: name.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim() || undefined,
          orderNumber: orderNumber.trim() || undefined,
          subject: subject.trim(),
          message: message.trim(),
          consentAccepted: true,
          website_url_hp: honeypot,
          renderedAt,
        }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Falha ao submeter pedido.')
      }

      setCreatedProtocol(data.protocol)
    } catch (err: any) {
      setFormError(err.message || 'Ocorreu um erro ao submeter o seu pedido. Por favor tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const categoryIcons: Record<TicketCategory, React.ElementType> = {
    PRODUTO: Package,
    ENTREGA: Truck,
    PAGAMENTO: CreditCard,
    ATENDIMENTO: Users,
    SERVICO_TECNICO: Wrench,
    OUTRO: HelpCircle,
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Navigation back */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-600 hover:text-primary transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar ao Início
          </Link>

          <Link
            href="/contactos"
            className="text-xs font-bold text-slate-500 hover:text-primary transition"
          >
            Outros Canais de Contacto
          </Link>
        </div>

        {/* Hero Banner */}
        <div className="bg-[#080e1e] text-white p-8 sm:p-10 rounded-3xl border border-slate-800 shadow-xl relative overflow-hidden">
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-primary-200 text-xs font-bold uppercase tracking-wider mb-4 border border-white/10">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Canal Oficial de Qualidade & Apoio
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
              Reclamações & Pedidos de Informação
            </h1>
            <p className="text-slate-300 text-sm sm:text-base mt-2 max-w-xl leading-relaxed">
              Submeta a sua solicitação com protocolo formal. A equipa de qualidade da ARKNET garante acompanhamento e resposta no prazo de <strong>24h a 48h úteis</strong>.
            </p>

            {isAuthenticated && (
              <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-primary/20 border border-primary/40 text-xs text-blue-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Sessão iniciada como <strong>{customer?.name}</strong> (dados preenchidos automaticamente)
              </div>
            )}
          </div>
        </div>

        {/* SUCCESS CONFIRMATION CARD */}
        {createdProtocol ? (
          <div className="bg-white rounded-3xl border border-emerald-200 p-8 sm:p-10 shadow-lg text-center space-y-6 animate-fade-in">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="space-y-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800">
                Submissão Registada com Sucesso
              </span>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                Recebemos o seu {TICKET_TYPE_CONFIG[type].label}!
              </h2>
              <p className="text-sm text-slate-600 max-w-lg mx-auto">
                O seu processo foi registado no sistema central da ARKNET e atribuído para triagem prioritária. Enviámos uma cópia de confirmação para <strong>{email}</strong>.
              </p>
            </div>

            {/* Protocol Display Box */}
            <div className="max-w-md mx-auto p-5 rounded-2xl bg-slate-50 border-2 border-slate-200 space-y-2">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Número Oficial de Protocolo
              </p>
              <div className="flex items-center justify-center gap-3">
                <span className="text-2xl sm:text-3xl font-black font-mono text-slate-900 tracking-wider">
                  {createdProtocol}
                </span>
                <button
                  onClick={handleCopyProtocol}
                  className="p-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 transition shadow-xs cursor-pointer flex items-center gap-1 text-xs font-bold"
                  title="Copiar Protocolo"
                >
                  {hasCopiedProtocol ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span className="text-emerald-600">Copiado</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copiar</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* SLA Info */}
            <div className="max-w-md mx-auto p-4 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-950 flex items-start gap-3 text-left">
              <Clock className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Tempo Estimado de Resposta:</p>
                <p className="text-blue-900 mt-0.5">
                  A nossa equipa responderá através do seu e-mail (<strong>{email}</strong>){phone ? ` ou WhatsApp (${phone})` : ''} dentro de 24 a 48 horas úteis.
                </p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleResetForm}
                className="w-full sm:w-auto px-6 py-3 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold uppercase tracking-wider transition cursor-pointer"
              >
                Submeter Novo Pedido
              </button>
              <Link
                href="/"
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold uppercase tracking-wider transition text-center"
              >
                Ir para a Página Principal
              </Link>
            </div>
          </div>
        ) : (
          /* FORM CARD */
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-sm space-y-8"
          >
            {/* 1. Type Selector (Reclamação vs Pedido de Informação) */}
            <div className="space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                1. Tipo de Solicitação *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Reclamação */}
                <button
                  type="button"
                  onClick={() => setType('RECLAMACAO')}
                  className={`p-4 rounded-2xl border-2 text-left transition flex items-start gap-3.5 cursor-pointer ${
                    type === 'RECLAMACAO'
                      ? 'border-secondary bg-red-50/50 ring-2 ring-secondary/20'
                      : 'border-slate-200 hover:border-slate-300 bg-slate-50/40'
                  }`}
                >
                  <div
                    className={`p-2.5 rounded-xl shrink-0 ${
                      type === 'RECLAMACAO' ? 'bg-secondary text-white' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-extrabold text-slate-900 text-sm">Reclamação</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Reportar avaria, atraso de entrega ou insatisfação com produto/serviço.
                    </p>
                  </div>
                </button>

                {/* Pedido de Informação */}
                <button
                  type="button"
                  onClick={() => setType('INFORMACAO')}
                  className={`p-4 rounded-2xl border-2 text-left transition flex items-start gap-3.5 cursor-pointer ${
                    type === 'INFORMACAO'
                      ? 'border-primary bg-blue-50/50 ring-2 ring-primary/20'
                      : 'border-slate-200 hover:border-slate-300 bg-slate-50/40'
                  }`}
                >
                  <div
                    className={`p-2.5 rounded-xl shrink-0 ${
                      type === 'INFORMACAO' ? 'bg-primary text-white' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-extrabold text-slate-900 text-sm">Pedido de Informação</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Dúvidas técnicas, orçamentos, esclarecimento de especificações ou garantias.
                    </p>
                  </div>
                </button>
              </div>
            </div>

            {/* 2. Category Selector */}
            <div className="space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                2. Categoria do Assunto *
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {(Object.keys(TICKET_CATEGORY_CONFIG) as TicketCategory[]).map((catKey) => {
                  const cfg = TICKET_CATEGORY_CONFIG[catKey]
                  const Icon = categoryIcons[catKey]
                  const isSelected = category === catKey
                  return (
                    <button
                      key={catKey}
                      type="button"
                      onClick={() => setCategory(catKey)}
                      className={`p-3 rounded-xl border text-left transition flex flex-col justify-between gap-2 cursor-pointer ${
                        isSelected
                          ? 'border-primary bg-primary/5 text-primary ring-1 ring-primary font-bold'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isSelected ? 'text-primary' : 'text-slate-400'}`} />
                      <span className="text-xs">{cfg.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* 3. Contact Details */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                3. Seus Dados de Contacto *
              </h3>

              <div className="grid sm:grid-cols-2 gap-4">
                {/* Nome */}
                <div>
                  <label htmlFor="ticket-name" className="block text-xs font-bold text-slate-700 mb-1">
                    Nome Completo *
                  </label>
                  <input
                    id="ticket-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Domingas Mário"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition shadow-xs"
                  />
                </div>

                {/* E-mail */}
                <div>
                  <label htmlFor="ticket-email" className="block text-xs font-bold text-slate-700 mb-1">
                    Endereço de E-mail *
                  </label>
                  <input
                    id="ticket-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Ex: domingas@empresa.ao"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition shadow-xs"
                  />
                </div>

                {/* Telefone / WhatsApp */}
                <div>
                  <label htmlFor="ticket-phone" className="block text-xs font-bold text-slate-700 mb-1">
                    Telefone / WhatsApp (Opcional)
                  </label>
                  <input
                    id="ticket-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Ex: +244 923 000 111"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition shadow-xs"
                  />
                </div>

                {/* Nº Encomenda */}
                <div>
                  <label htmlFor="ticket-order" className="block text-xs font-bold text-slate-700 mb-1">
                    Nº de Encomenda Relacionada (Opcional)
                  </label>
                  <input
                    id="ticket-order"
                    type="text"
                    value={orderNumber}
                    onChange={(e) => setOrderNumber(e.target.value)}
                    placeholder="Ex: PED-2026-0042"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition shadow-xs"
                  />
                </div>
              </div>
            </div>

            {/* 4. Subject and Message */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                4. Descrição do Pedido *
              </h3>

              {/* Assunto */}
              <div>
                <label htmlFor="ticket-subject" className="block text-xs font-bold text-slate-700 mb-1">
                  Assunto Principal *
                </label>
                <input
                  id="ticket-subject"
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Ex: Dúvida sobre instalação de switch ou Atraso na entrega"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition shadow-xs"
                />
              </div>

              {/* Mensagem */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="ticket-message" className="block text-xs font-bold text-slate-700">
                    Mensagem Detalhada *
                  </label>
                  <span
                    className={`text-[11px] font-mono font-bold ${
                      message.length < 20
                        ? 'text-amber-600'
                        : message.length > 1900
                        ? 'text-rose-600'
                        : 'text-slate-400'
                    }`}
                  >
                    {message.length} / 2000 carateres (mín. 20)
                  </span>
                </div>
                <textarea
                  id="ticket-message"
                  required
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Descreva a sua situação de forma clara, indicando modelos, datas, referências ou detalhes relevantes..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition shadow-xs"
                />
              </div>
            </div>

            {/* Honeypot hidden input for anti-bot spam */}
            <div className="hidden" aria-hidden="true">
              <label htmlFor="website_url_hp">Não preencha este campo</label>
              <input
                id="website_url_hp"
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
              />
            </div>

            {/* 5. Privacy Consent Checkbox */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={consentAccepted}
                  onChange={(e) => setConsentAccepted(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary cursor-pointer"
                />
                <span className="text-xs text-slate-600 leading-relaxed">
                  Autorizo a <strong>ARKNET Tecnologia, LDA.</strong> a tratar os meus dados de contacto para efeitos exclusivos de análise, resposta e acompanhamento deste pedido, de acordo com a nossa{' '}
                  <Link href="/privacidade" target="_blank" className="text-primary font-bold hover:underline">
                    Política de Privacidade
                  </Link>
                  .
                </span>
              </label>
            </div>

            {/* Error banner */}
            {formError && (
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-wider text-white shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 ${
                  type === 'RECLAMACAO'
                    ? 'bg-secondary hover:bg-secondary/90'
                    : 'bg-primary hover:bg-primary-hover'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    A Registar o Pedido no Sistema...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Submeter {TICKET_TYPE_CONFIG[type].label} com Protocolo
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Informative FAQs / Help Box */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-4 shadow-xs">
          <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-primary" />
            Perguntas Frequentes & Prazos de Atendimento
          </h3>

          <div className="divide-y divide-slate-100 text-xs sm:text-sm text-slate-600">
            <div className="py-3 space-y-1">
              <p className="font-bold text-slate-800">Como posso acompanhar o meu pedido?</p>
              <p className="text-slate-500">
                Após o envio, é gerado um código de protocolo exclusivo (ex.: ARK-2026-000123). A nossa equipa entrará em contacto diretamente por e-mail ou WhatsApp. Para adicionar informações, responda ao e-mail mantendo o protocolo no assunto.
              </p>
            </div>

            <div className="py-3 space-y-1">
              <p className="font-bold text-slate-800">Qual é o horário de atendimento?</p>
              <p className="text-slate-500">
                O nosso departamento de apoio ao cliente opera de Segunda a Sexta-feira, das 08h00 às 17h00, e aos Sábados das 08h30 às 12h30 (Hora de Luanda).
              </p>
            </div>

            <div className="py-3 space-y-1">
              <p className="font-bold text-slate-800">Preciso de assistência técnica urgente no local?</p>
              <p className="text-slate-500">
                Para situações críticas de paragem de infraestruturas de rede ou servidores de clientes empresariais, pode também ligar para a linha direta de piquete: <strong>+244 935 208 449</strong>.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
