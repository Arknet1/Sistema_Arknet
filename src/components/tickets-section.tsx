'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  AlertCircle,
  CheckCircle2,
  Copy,
  Check,
  HelpCircle,
  MessageSquare,
  Send,
  ShieldCheck,
  X,
  ChevronRight,
} from 'lucide-react'
import { FaWhatsapp } from 'react-icons/fa'
import { useCustomerAuth } from '@/lib/customer-auth-context'
import {
  TicketType,
  TicketCategory,
  TICKET_CATEGORY_CONFIG,
} from '@/lib/tickets/types'

interface TicketsSectionProps {
  id?: string
  className?: string
}

export default function TicketsSection({
  id = 'reclamacoes-e-informacoes',
  className = '',
}: TicketsSectionProps) {
  const { customer } = useCustomerAuth()

  // Modal State
  const [isOpen, setIsOpen] = useState(false)
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
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successProtocol, setSuccessProtocol] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  // Pre-fill user data if logged in
  React.useEffect(() => {
    if (customer) {
      if (customer.name && !name) setName(customer.name)
      if (customer.email && !email) setEmail(customer.email)
      if (customer.phone && !phone) setPhone(customer.phone)
    }
  }, [customer, name, email, phone])

  const openModalWithType = (selectedType: TicketType) => {
    setType(selectedType)
    setErrorMessage(null)
    setSuccessProtocol(null)
    setRenderedAt(Date.now())
    setIsOpen(true)
  }

  const closeModal = () => {
    setIsOpen(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    if (message.trim().length < 20) {
      setErrorMessage('Por favor forneça uma descrição com pelo menos 20 caracteres.')
      return
    }

    if (!consentAccepted) {
      setErrorMessage('Deve aceitar os termos de tratamento de dados para submeter.')
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
          consentAccepted,
          website_url_hp: honeypot,
          renderedAt,
        }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Não foi possível registar a sua solicitação.')
      }

      setSuccessProtocol(data.protocol)
    } catch (err: any) {
      setErrorMessage(err.message || 'Ocorreu um erro ao enviar. Por favor tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCopyProtocol = () => {
    if (successProtocol) {
      navigator.clipboard.writeText(successProtocol)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    }
  }

  return (
    <>
      {/* 1. DISCREET WHITE / LIGHT BANNER */}
      <section id={id} className={`py-6 sm:py-8 bg-white border-y border-slate-200/90 text-slate-800 ${className}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6 bg-slate-50/90 border border-slate-200/80 rounded-2xl p-4 sm:p-6 shadow-xs hover:border-slate-300 transition-all">
            {/* Left: Info */}
            <div className="flex items-center gap-3.5 text-center md:text-left">
              <div className="hidden sm:flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 text-primary">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center justify-center md:justify-start gap-2">
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                    Reclamações, Dúvidas &amp; Sugestões
                  </h3>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
                    SLA 24-48h
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5">
                  Registe uma reclamação formal ou solicite informações. Atendimento oficial com número de protocolo.
                </p>
              </div>
            </div>

            {/* Right: Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 shrink-0">
              <button
                type="button"
                onClick={() => openModalWithType('RECLAMACAO')}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-semibold transition-all shadow-xs"
              >
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Fazer Reclamação</span>
              </button>

              <button
                type="button"
                onClick={() => openModalWithType('INFORMACAO')}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-semibold transition-all shadow-xs"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Pedido de Informação</span>
              </button>

              <a
                href="https://wa.me/244935208449?text=Ol%C3%A1%20ARKNET!%20Gostaria%20de%20obter%20suporte%20e%20informa%C3%A7%C3%B5es."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-semibold transition-all"
                title="Apoio Imediato via WhatsApp"
              >
                <FaWhatsapp className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">WhatsApp</span>
              </a>

              <Link
                href="/reclamacoes"
                className="inline-flex items-center gap-1 px-2.5 py-2 text-slate-500 hover:text-slate-900 text-xs font-medium transition"
                title="Abrir portal completo de reclamações"
              >
                <span>Portal</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. SLEEK WHITE MODAL POPUP */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            />

            {/* Modal Dialog */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden z-10 max-h-[90vh] flex flex-col text-slate-800"
            >
              {/* Header */}
              <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`p-2 rounded-lg ${
                      type === 'RECLAMACAO'
                        ? 'bg-red-50 text-red-600 border border-red-200'
                        : 'bg-primary/10 text-primary border border-primary/20'
                    }`}
                  >
                    {type === 'RECLAMACAO' ? (
                      <AlertCircle className="w-4 h-4" />
                    ) : (
                      <HelpCircle className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm sm:text-base font-bold text-slate-900">
                      {type === 'RECLAMACAO' ? 'Submeter Reclamação' : 'Pedido de Informação'}
                    </h4>
                    <p className="text-[11px] text-slate-500">Registo confidencial com protocolo ARKNET</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={closeModal}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition"
                  aria-label="Fechar"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
                {successProtocol ? (
                  /* Success Box */
                  <div className="text-center py-4 space-y-4">
                    <div className="w-12 h-12 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-xl flex items-center justify-center mx-auto">
                      <CheckCircle2 className="w-7 h-7" />
                    </div>
                    <h5 className="text-lg font-bold text-slate-900">Registo Efetuado com Sucesso!</h5>
                    <p className="text-xs text-slate-600 max-w-sm mx-auto">
                      A sua ocorrência foi registada com sucesso e encaminhada para a equipa técnica da ARKNET.
                    </p>

                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 max-w-sm mx-auto flex items-center justify-between">
                      <div className="text-left">
                        <span className="text-[10px] text-slate-500 font-semibold uppercase block">Protocolo</span>
                        <span className="text-base font-mono font-bold text-primary tracking-wider">{successProtocol}</span>
                      </div>
                      <button
                        type="button"
                        onClick={handleCopyProtocol}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-primary/90 transition shadow-xs"
                      >
                        {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        {copied ? 'Copiado' : 'Copiar'}
                      </button>
                    </div>

                    <div className="flex gap-2 justify-center pt-2">
                      <a
                        href={`https://wa.me/244935208449?text=${encodeURIComponent(`Olá ARKNET! Registei o protocolo ${successProtocol} no site e gostaria de obter acompanhamento.`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl transition shadow-xs"
                      >
                        <FaWhatsapp className="w-3.5 h-3.5" />
                        Acompanhar no WhatsApp
                      </a>
                      <button
                        type="button"
                        onClick={closeModal}
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 transition"
                      >
                        Concluir
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Form */
                  <form onSubmit={handleSubmit} className="space-y-3.5">
                    {/* Switcher */}
                    <div className="grid grid-cols-2 gap-2">
                      {(['RECLAMACAO', 'INFORMACAO'] as TicketType[]).map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setType(t)}
                          className={`p-2 rounded-lg text-xs font-semibold border transition ${
                            type === t
                              ? t === 'RECLAMACAO'
                                ? 'bg-red-50 border-red-300 text-red-700 ring-1 ring-red-200'
                                : 'bg-primary/10 border-primary/40 text-primary ring-1 ring-primary/20'
                              : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          {t === 'RECLAMACAO' ? 'Reclamação' : 'Pedido de Informação'}
                        </button>
                      ))}
                    </div>

                    {/* Category */}
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Categoria <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value as TicketCategory)}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 text-xs focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                      >
                        {(
                          [
                            'PRODUTO',
                            'ENTREGA',
                            'PAGAMENTO',
                            'ATENDIMENTO',
                            'SERVICO_TECNICO',
                            'OUTRO',
                          ] as TicketCategory[]
                        ).map((c) => (
                          <option key={c} value={c} className="bg-white text-slate-800">
                            {TICKET_CATEGORY_CONFIG[c].label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Name & Email */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Nome Completo <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="O seu nome"
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 text-xs focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Endereço de E-mail <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="email@empresa.ao"
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 text-xs focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                        />
                      </div>
                    </div>

                    {/* Phone & Order Number */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Telefone / WhatsApp <span className="text-slate-400">(Opcional)</span>
                        </label>
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+244 9XX XXX XXX"
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 text-xs focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Nº Encomenda <span className="text-slate-400">(Opcional)</span>
                        </label>
                        <input
                          type="text"
                          value={orderNumber}
                          onChange={(e) => setOrderNumber(e.target.value)}
                          placeholder="Ex: ARK-ORD-123"
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 text-xs focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                        />
                      </div>
                    </div>

                    {/* Subject */}
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Assunto do Pedido <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="Resumo do pedido ou ocorrência"
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 text-xs focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                      />
                    </div>

                    {/* Message */}
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Descrição <span className="text-red-500">*</span> (Mín. 20 carateres)
                      </label>
                      <textarea
                        required
                        rows={3}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Descreva detalhadamente a sua solicitação..."
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 text-xs focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none"
                      />
                    </div>

                    {/* Honeypot anti-spam */}
                    <input
                      type="text"
                      name="website_url_hp"
                      value={honeypot}
                      onChange={(e) => setHoneypot(e.target.value)}
                      className="hidden"
                      tabIndex={-1}
                      autoComplete="off"
                    />

                    {/* Consent */}
                    <div className="flex items-start gap-2 pt-1">
                      <input
                        type="checkbox"
                        id="modal-consent"
                        checked={consentAccepted}
                        onChange={(e) => setConsentAccepted(e.target.checked)}
                        className="mt-0.5 h-3.5 w-3.5 rounded border-slate-300 bg-white text-primary cursor-pointer focus:ring-primary"
                      />
                      <label htmlFor="modal-consent" className="text-[11px] text-slate-600 leading-tight cursor-pointer">
                        Autorizo o tratamento dos dados pela ARKNET para contacto e resposta, nos termos da{' '}
                        <Link href="/privacidade" target="_blank" className="text-primary hover:underline font-medium">
                          Política de Privacidade
                        </Link>
                        .
                      </label>
                    </div>

                    {/* Error */}
                    {errorMessage && (
                      <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-red-600 text-xs flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{errorMessage}</span>
                      </div>
                    )}

                    {/* Submit */}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-2.5 px-4 rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold text-xs transition flex items-center justify-center gap-2 disabled:opacity-50 shadow-sm"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>A enviar...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Enviar Solicitação</span>
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
