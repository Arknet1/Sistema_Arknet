'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  AlertCircle,
  CheckCircle2,
  Copy,
  Check,
  Send,
  Loader2,
  ArrowLeft,
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

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        
        {/* Navigation back */}
        <nav className="flex items-center justify-between border-b border-slate-200 pb-4">
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
        </nav>

        <header className="max-w-3xl border-l-4 border-primary pl-5 py-1">
          <p className="text-xs font-bold uppercase tracking-wider text-primary">Apoio ao cliente</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">
            Reclamações e pedidos de informação
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
            Envie os detalhes do seu pedido. A equipa ARKNET responderá por email, usando o protocolo atribuído.
          </p>
          {isAuthenticated && (
            <p className="mt-3 text-xs text-primary">
              Sessão iniciada como <strong>{customer?.name}</strong>. Os seus dados de contacto foram preenchidos.
            </p>
          )}
        </header>

        {/* Submission confirmation */}
        {createdProtocol ? (
          <section className="border-y border-slate-200 bg-white px-5 py-8 sm:px-8">
            <div className="flex items-center gap-3 border-b border-slate-200 pb-5">
              <CheckCircle2 className="h-7 w-7 shrink-0 text-primary" />
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-primary">Pedido registado</p>
                <h2 className="mt-1 text-xl font-bold text-slate-900">Recebemos o seu {TICKET_TYPE_CONFIG[type].label.toLowerCase()}.</h2>
              </div>
            </div>

            <p className="py-5 text-sm text-slate-600">
              Enviámos a confirmação para <strong className="text-slate-900">{email}</strong>.
            </p>

            <div className="flex flex-col gap-3 border-y border-slate-200 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500">Protocolo</p>
                <span className="mt-1 block font-mono text-xl font-bold text-slate-900">{createdProtocol}</span>
              </div>
              <button
                type="button"
                onClick={handleCopyProtocol}
                className="inline-flex items-center gap-2 self-start border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 sm:self-auto"
                title="Copiar protocolo"
              >
                {hasCopiedProtocol ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
                {hasCopiedProtocol ? 'Copiado' : 'Copiar'}
              </button>
            </div>

            <p className="pt-4 text-sm text-slate-600">
              A equipa responderá pelo email indicado dentro de 24 a 48 horas úteis.
              {phone && <span> Também poderá ser contactado pelo telefone {phone}.</span>}
            </p>

            <div className="pt-6 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={handleResetForm}
                className="border border-primary px-5 py-2.5 text-sm font-semibold text-primary transition hover:bg-blue-50"
              >
                Submeter outro pedido
              </button>
              <Link
                href="/"
                className="px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:text-primary"
              >
                Voltar à página inicial
              </Link>
            </div>
          </section>
        ) : (
          <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_260px] lg:gap-12">
          <form onSubmit={handleSubmit} className="border-y border-slate-200 bg-white px-5 py-6 sm:px-8 sm:py-8 space-y-7">
            <fieldset className="space-y-2">
              <legend className="text-sm font-semibold text-slate-900">Tipo de pedido</legend>
              <div className="grid grid-cols-2 border border-slate-300">
                <button
                  type="button"
                  onClick={() => setType('RECLAMACAO')}
                  aria-pressed={type === 'RECLAMACAO'}
                  className={`px-3 py-3 text-left text-sm font-semibold transition ${
                    type === 'RECLAMACAO'
                      ? 'bg-primary text-white'
                      : 'bg-white text-slate-700 hover:bg-blue-50'
                  }`}
                >
                  Reclamação
                </button>
                <button
                  type="button"
                  onClick={() => setType('INFORMACAO')}
                  aria-pressed={type === 'INFORMACAO'}
                  className={`border-l border-slate-300 px-3 py-3 text-left text-sm font-semibold transition ${
                    type === 'INFORMACAO'
                      ? 'bg-primary text-white'
                      : 'bg-white text-slate-700 hover:bg-blue-50'
                  }`}
                >
                  Pedido de informação
                </button>
              </div>
            </fieldset>

            <div>
              <label htmlFor="ticket-category" className="mb-1.5 block text-sm font-semibold text-slate-900">
                Categoria
              </label>
              <select
                id="ticket-category"
                value={category}
                onChange={(e) => setCategory(e.target.value as TicketCategory)}
                className="w-full border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                {(Object.keys(TICKET_CATEGORY_CONFIG) as TicketCategory[]).map((categoryKey) => (
                  <option key={categoryKey} value={categoryKey}>{TICKET_CATEGORY_CONFIG[categoryKey].label}</option>
                ))}
              </select>
            </div>

            {/* Contact Details */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <h3 className="text-sm font-semibold text-slate-900">Dados de contacto</h3>

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
                    minLength={3}
                    maxLength={120}
                    className="w-full rounded-sm border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
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
                    maxLength={150}
                    className="w-full rounded-sm border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
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
                    maxLength={30}
                    className="w-full rounded-sm border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
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
                    maxLength={50}
                    className="w-full rounded-sm border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>
            </div>

            {/* Subject and message */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <h3 className="text-sm font-semibold text-slate-900">Descrição do pedido</h3>

              {/* Assunto */}
              <div>
                <label htmlFor="ticket-subject" className="block text-xs font-bold text-slate-700 mb-1">
                  Assunto Principal *
                </label>
                <input
                  id="ticket-subject"
                  type="text"
                  required
                  minLength={5}
                  maxLength={180}
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Ex: Dúvida sobre instalação de switch ou Atraso na entrega"
                  className="w-full rounded-sm border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              {/* Mensagem */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="ticket-message" className="block text-sm font-semibold text-slate-900">
                    Mensagem detalhada *
                  </label>
                  <span className="text-xs text-slate-500">
                    {message.length} / 2000 carateres (mín. 20)
                  </span>
                </div>
                <textarea
                  id="ticket-message"
                  required
                  minLength={20}
                  maxLength={2000}
                  rows={6}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Descreva a sua situação de forma clara, indicando modelos, datas, referências ou detalhes relevantes..."
                  className="w-full rounded-sm border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
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

            {/* Privacy consent */}
            <div className="border-t border-slate-200 pt-4">
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
                className="inline-flex w-full items-center justify-center gap-2 bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    A enviar pedido...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Enviar pedido
                  </>
                )}
              </button>
            </div>
          </form>
            <aside className="space-y-6 border-l-2 border-primary pl-5 text-sm">
              <h2 className="font-semibold text-slate-900">Informação útil</h2>
              <div className="space-y-1">
                <h3 className="font-semibold text-slate-800">Protocolo</h3>
                <p className="text-slate-600">Guarde o número apresentado após o envio para identificar o pedido.</p>
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold text-slate-800">Resposta</h3>
                <p className="text-slate-600">A equipa responderá por email. O prazo habitual é de 24 a 48 horas úteis.</p>
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold text-slate-800">Apoio urgente</h3>
                <p className="text-slate-600">Para avarias críticas de rede ou servidores, ligue para</p>
                <a href="tel:+244935208449" className="font-semibold text-primary hover:underline">+244 935 208 449</a>
              </div>
            </aside>
          </div>
        )}

        <section className="border-t border-slate-200 pt-6">
          <h2 className="mb-3 text-sm font-semibold text-slate-900">Informações de atendimento</h2>
          <div className="divide-y divide-slate-200">
            <details className="py-3">
              <summary className="cursor-pointer text-sm font-medium text-slate-800">Como acompanhar o pedido?</summary>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">Use o protocolo apresentado após a submissão ao falar com a equipa. Se responder ao email de confirmação, mantenha o protocolo no assunto.</p>
            </details>
            <details className="py-3">
              <summary className="cursor-pointer text-sm font-medium text-slate-800">Qual é o horário de atendimento?</summary>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">De segunda a sexta-feira, das 08h00 às 17h00, e aos sábados, das 08h30 às 12h30 (hora de Luanda).</p>
            </details>
          </div>
        </section>

      </div>
    </main>
  )
}
