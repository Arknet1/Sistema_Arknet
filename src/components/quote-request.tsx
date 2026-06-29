"use client"

import { FormEvent, useEffect, useMemo, useRef, useState } from "react"
import { motion } from "framer-motion"
import { CheckCircle2, Clock3, Headset, Mail, PhoneCall } from "lucide-react"
import { FaWhatsapp } from "react-icons/fa"
import { mockServices, mockContactInfo } from "@/lib/mock-data"

type QuoteRequestFormState = {
  name: string
  email: string
  phone: string
  service: string
  message: string
}

export default function QuoteRequest() {
  const [formState, setFormState] = useState<QuoteRequestFormState>({
    name: "",
    email: "",
    phone: "",
    service: "",
    message: "",
  })
  const [submitted, setSubmitted] = useState(false)
  const [mailtoLink, setMailtoLink] = useState("")
  const redirectTriggered = useRef(false)

  const serviceOptions = useMemo(() => mockServices.map((item) => item.name), [])

  const primaryPhone = mockContactInfo.phones?.[0] ?? ""
  const secondaryPhone = mockContactInfo.phones?.[1] ?? ""
  const primaryEmail = mockContactInfo.emails?.[0] ?? ""
  const quoteEmail = "info@arknet.co.ao";

  const buildQuoteMailto = (data: QuoteRequestFormState) => {
    const subject = `Pedido de Cotação: ${data.service} — ${data.name}`
    const body = [
      "Novo pedido de cotação via website ARKNET",
      "",
      `Nome: ${data.name}`,
      `Email: ${data.email}`,
      `Telefone: ${data.phone || "Não indicado"}`,
      `Serviço: ${data.service}`,
      "",
      "Mensagem:",
      data.message,
    ].join("\n")

    const params = new URLSearchParams({
      subject,
      body,
    })

    return `mailto:${quoteEmail}?${params.toString()}`
  }

  const openEmailApp = (link: string) => {
    window.location.assign(link)
  }

  useEffect(() => {
    if (!submitted || !mailtoLink || redirectTriggered.current) return

    redirectTriggered.current = true
    const timer = window.setTimeout(() => openEmailApp(mailtoLink), 600)
    return () => window.clearTimeout(timer)
  }, [submitted, mailtoLink])

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const link = buildQuoteMailto(formState)
    setMailtoLink(link)
    setSubmitted(true)
  }

  const handleReset = () => {
    redirectTriggered.current = false
    setSubmitted(false)
    setMailtoLink("")
    setFormState({ name: "", email: "", phone: "", service: "", message: "" })
  }

  const inputClass = "w-full border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition"

  return (
    <section id="contacto" className="py-28 bg-white">
      <div className="max-w-7xl mx-auto px-6">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="mb-14"
        >
          <p className="text-xs font-bold text-secondary uppercase tracking-[0.25em] mb-5">
            — Solicitar Serviço
          </p>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 leading-[1.1]">
              Precisa de um serviço?
            </h2>
            <p className="text-base text-slate-500 max-w-sm md:text-right">
              Entre em contacto e receba uma proposta personalizada para o seu negócio.
            </p>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-12 gap-10">

          {/* Left panel — contact info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="lg:col-span-4 flex flex-col gap-4"
          >
            {/* Guarantees */}
            <div className="border border-slate-200 p-6 space-y-5">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-primary text-white shrink-0">
                  <Clock3 className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-bold text-slate-900 text-sm">Resposta em 24h</p>
                  <p className="text-xs text-slate-500 mt-0.5">Equipa pronta para enviar proposta clara.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="p-2 bg-primary text-white shrink-0">
                  <Headset className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-bold text-slate-900 text-sm">Apoio 24/7</p>
                  <p className="text-xs text-slate-500 mt-0.5">Suporte contínuo e assistência técnica.</p>
                </div>
              </div>
            </div>

            {/* Phone block */}
            <div className="bg-slate-950 text-white p-7 flex-1">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500 mb-4">Contacto Direto</p>
              <a
                href={primaryPhone ? `tel:${primaryPhone.replace(/\s+/g, "")}` : "#"}
                className="flex items-center gap-3 group"
              >
                <PhoneCall className="h-7 w-7 text-primary shrink-0" />
                <span className="text-2xl font-extrabold text-white group-hover:text-primary transition leading-none">
                  {primaryPhone || "Sem telefone"}
                </span>
              </a>

              {(primaryEmail || secondaryPhone) && (
                <div className="mt-5 pt-5 border-t border-white/10 space-y-2 text-sm text-slate-400">
                  {primaryEmail && <p>{primaryEmail}</p>}
                  {secondaryPhone && <p>{secondaryPhone}</p>}
                </div>
              )}

              <a
                href={`https://wa.me/${primaryPhone ? primaryPhone.replace(/\D/g, '') : '244935208449'}`}
                target="_blank"
                rel="noreferrer"
                className="mt-6 inline-flex items-center justify-center gap-2.5 bg-primary px-5 py-3 text-sm font-semibold text-white hover:bg-green-700 transition w-full"
              >
                <FaWhatsapp className="h-4 w-4" />
                Contactar via WhatsApp
              </a>
            </div>
          </motion.div>

          {/* Right panel — form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="lg:col-span-8 bg-slate-50 p-8 md:p-10"
          >
            {submitted ? (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col items-center justify-center text-center py-10 px-4"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600 mb-6">
                  <CheckCircle2 className="h-8 w-8" />
                </div>

                <h3 className="text-2xl font-extrabold text-slate-900 mb-3">
                  Pedido concluído!
                </h3>

                <p className="text-slate-600 max-w-md mb-2 leading-relaxed">
                  O seu pedido foi preparado com sucesso. Estamos a abrir a sua app de email para
                  enviar a mensagem à ARKNET.
                </p>

                <p className="text-sm text-slate-500 mb-8">
                  Confirme o envio no Gmail, Outlook ou na app de email do seu dispositivo.
                </p>

                <a
                  href={mailtoLink}
                  className="inline-flex w-full sm:w-auto items-center justify-center gap-2 bg-secondary px-8 py-4 text-sm font-bold text-white uppercase tracking-wide hover:bg-secondary/90 transition shadow-lg shadow-secondary/20"
                >
                  <Mail className="h-4 w-4" />
                  Abrir app de email
                </a>

                <button
                  type="button"
                  onClick={handleReset}
                  className="mt-5 text-sm text-slate-500 hover:text-primary transition"
                >
                  Enviar outro pedido
                </button>
              </motion.div>
            ) : (
            <motion.form
              onSubmit={handleSubmit}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } } }}
              className="space-y-6"
            >
              <motion.div
                variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } }}
                className="grid sm:grid-cols-2 gap-6"
              >
                <div>
                  <label htmlFor="nome" className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-2">
                    Nome
                  </label>
                  <input
                    id="nome"
                    type="text"
                    value={formState.name}
                    onChange={(e) => setFormState((prev) => ({ ...prev, name: e.target.value }))}
                    required
                    className={inputClass}
                    placeholder="O seu nome"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-2">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={formState.email}
                    onChange={(e) => setFormState((prev) => ({ ...prev, email: e.target.value }))}
                    required
                    className={inputClass}
                    placeholder="nome@empresa.com"
                  />
                </div>
              </motion.div>

              <motion.div
                variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } }}
                className="grid sm:grid-cols-2 gap-6"
              >
                <div>
                  <label htmlFor="telefone" className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-2">
                    Telefone
                  </label>
                  <input
                    id="telefone"
                    type="tel"
                    value={formState.phone}
                    onChange={(e) => setFormState((prev) => ({ ...prev, phone: e.target.value }))}
                    className={inputClass}
                    placeholder="+244 900 000 000"
                  />
                </div>

                <div>
                  <label htmlFor="servico" className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-2">
                    Serviço pretendido
                  </label>
                  <select
                    id="servico"
                    value={formState.service}
                    onChange={(e) => setFormState((prev) => ({ ...prev, service: e.target.value }))}
                    required
                    className={inputClass}
                  >
                    <option value="">Selecione um serviço</option>
                    {serviceOptions.map((service) => (
                      <option key={service} value={service}>{service}</option>
                    ))}
                  </select>
                </div>
              </motion.div>

              <motion.div
                variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } }}
              >
                <label htmlFor="mensagem" className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-2">
                  Mensagem
                </label>
                <textarea
                  id="mensagem"
                  rows={5}
                  value={formState.message}
                  onChange={(e) => setFormState((prev) => ({ ...prev, message: e.target.value }))}
                  required
                  className={`${inputClass} resize-none`}
                  placeholder="Descreva o que precisa..."
                />
              </motion.div>

              <motion.div
                variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } }}
                className="space-y-3"
              >
                <motion.button
                  type="submit"
                  disabled={serviceOptions.length === 0}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.97 }}
                  className="w-full bg-secondary py-4 text-sm font-bold text-white tracking-wide hover:bg-secondary/90 transition disabled:opacity-50 uppercase shadow-lg shadow-secondary/20"
                >
                  Enviar Pedido
                </motion.button>

                <p className="text-center text-xs text-slate-500">
                  Resposta em até 24h ·{" "}
                  <a
                    href={`mailto:${quoteEmail}`}
                    className="text-primary hover:underline"
                  >
                    {quoteEmail}
                  </a>
                </p>
              </motion.div>
            </motion.form>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
