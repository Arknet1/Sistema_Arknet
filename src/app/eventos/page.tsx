'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import Footer from '@/components/footer'
import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  Mail,
  Bell,
  MapPin,
  Clock,
  Users,
  X,
  User,
  Phone,
  Building2,
  MessageSquare,
  Loader2,
  PartyPopper,
} from 'lucide-react'

import arknetLogo from '@/assets/icon18.png'
import heroImage from '@/assets/office.jpeg'
import aboutImage from '@/assets/office.jpeg'

import {
  mockEventsInfo,
  mockEventsHighlights,
  mockEventsEmptyState,
} from '@/lib/mock-data'
import { dataStore, EventItem, EventRegistration } from '@/lib/data-store'

export default function EventosPage() {
  const [events, setEvents] = useState<EventItem[]>([])
  const [registrations, setRegistrations] = useState<EventRegistration[]>([])

  // Registration modal state
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    notes: '',
  })

  useEffect(() => {
    const sync = () => {
      const db = dataStore.getSnapshot()
      setEvents(db.events.filter((e) => e.status === 'agendado' || e.status === 'decorrer'))
      setRegistrations(db.eventRegistrations || [])
    }
    sync()
    const unsub = dataStore.subscribe(sync)
    return () => unsub()
  }, [])

  const getRegistrationCount = (eventId: string) => {
    return registrations.filter((r) => r.eventId === eventId && r.status !== 'cancelada').length
  }

  const handleOpenRegistration = (evt: EventItem) => {
    setSelectedEvent(evt)
    setFormData({ name: '', email: '', phone: '', company: '', notes: '' })
    setSubmitSuccess(false)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedEvent(null)
    setSubmitSuccess(false)
  }

  const handleSubmitRegistration = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedEvent || !formData.name.trim() || !formData.email.trim() || !formData.phone.trim()) return

    setIsSubmitting(true)

    // Simulate small delay for UX
    setTimeout(() => {
      dataStore.addEventRegistration({
        eventId: selectedEvent.id,
        eventTitle: selectedEvent.title,
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        company: formData.company.trim() || undefined,
        notes: formData.notes.trim() || undefined,
        status: 'confirmada',
      })

      setIsSubmitting(false)
      setSubmitSuccess(true)
    }, 800)
  }

  return (
    <>
      <main className="bg-white pt-20">
        {/* HERO */}
        <section className="relative bg-[#020817] text-white overflow-hidden">
          <div className="grid lg:grid-cols-2 min-h-[600px]">
            <div className="flex items-center">
              <div className="px-6 lg:px-16 py-20 max-w-2xl">
                <p className="text-xs uppercase tracking-[0.2em] text-red-600 font-bold mb-6">
                  Eventos &amp; Networking
                </p>

                <Image
                  src={arknetLogo}
                  alt="Arknet"
                  width={200}
                  height={200}
                  className="mb-10"
                />

                <h1 className="text-5xl lg:text-7xl font-extrabold uppercase leading-tight">
                  {mockEventsInfo.heroTitle}
                </h1>

                <p className="mt-8 text-lg text-slate-300 leading-relaxed max-w-xl">
                  {mockEventsInfo.heroSubtitle}
                </p>

                <div className="flex flex-wrap gap-4 mt-10">
                  <a
                    href="#agenda"
                    className="bg-red-600 px-8 py-4 text-sm font-bold uppercase flex items-center gap-2 hover:bg-red-700 transition"
                  >
                    Ficar a par
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </div>
              </div>
            </div>

            <div className="relative hidden lg:block">
              <Image
                src={heroImage}
                alt="Eventos ARKNET"
                fill
                className="object-cover opacity-50"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-l from-transparent to-[#020817]" />
            </div>
          </div>
        </section>

        {/* SOBRE */}
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-14 items-start">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-red-600 font-bold mb-5">
                  01 · SOBRE OS EVENTOS
                </p>

                <h2 className="text-4xl lg:text-5xl font-extrabold text-[#020817] leading-tight">
                  {mockEventsInfo.aboutTitle}
                </h2>

                <p className="mt-8 text-base lg:text-lg text-slate-600 leading-relaxed">
                  {mockEventsInfo.aboutDescription}
                </p>

                <p className="mt-6 text-base lg:text-lg text-slate-600 leading-relaxed">
                  {mockEventsInfo.aboutDescription2}
                </p>
              </div>

              <div className="relative h-[350px]">
                <Image
                  src={aboutImage}
                  alt="Eventos Arknet"
                  fill
                  className="object-cover"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 mt-16 border border-slate-200">
              {mockEventsHighlights.map((item) => (
                <div
                  key={item.id}
                  className="p-8 border-r border-b lg:border-b-0 border-slate-200 last:border-r-0"
                >
                  <CheckCircle2 className="h-7 w-7 text-red-600 mb-5" />
                  <h3 className="text-lg font-bold text-[#020817]">{item.title}</h3>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* AGENDA DINÂMICA */}
        <section id="agenda" className="bg-slate-50 border-y border-slate-200 py-24 scroll-mt-24">
          <div className="max-w-7xl mx-auto px-6">
            <p className="text-xs uppercase tracking-[0.2em] text-red-600 font-bold mb-5">
              02 · AGENDA DE EVENTOS
            </p>

            <h2 className="text-4xl lg:text-5xl font-extrabold text-[#020817] leading-tight mb-8">
              Próximos Encontros Tecnológicos
            </h2>

            {events.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-8">
                {events.map((evt) => {
                  const regCount = getRegistrationCount(evt.id)
                  const spotsLeft = evt.capacity ? evt.capacity - regCount : null
                  const isFull = spotsLeft !== null && spotsLeft <= 0

                  return (
                    <div
                      key={evt.id}
                      className="bg-white border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col justify-between overflow-hidden"
                    >
                      {evt.image && (
                        <div className="relative h-48 w-full bg-slate-900 overflow-hidden">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={evt.image}
                            alt={evt.title}
                            className="h-full w-full object-cover"
                          />
                          <div className="absolute top-4 left-4 bg-red-600 text-white text-xs font-bold uppercase px-3 py-1">
                            {evt.format}
                          </div>
                          {evt.status === 'decorrer' && (
                            <div className="absolute top-4 right-4 bg-emerald-600 text-white text-xs font-bold uppercase px-3 py-1 animate-pulse">
                              A Decorrer
                            </div>
                          )}
                        </div>
                      )}

                      <div className="p-8 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center gap-4 text-xs font-bold text-red-600 mb-3">
                            <span className="flex items-center gap-1.5">
                              <Calendar className="h-4 w-4" />
                              {new Date(evt.date).toLocaleDateString('pt-PT', { day: '2-digit', month: 'long', year: 'numeric' })}
                            </span>
                            {evt.time && (
                              <span className="flex items-center gap-1.5 text-slate-500">
                                <Clock className="h-4 w-4" />
                                {evt.time}
                              </span>
                            )}
                          </div>

                          <h3 className="text-2xl font-extrabold text-[#020817] mb-3 leading-snug">
                            {evt.title}
                          </h3>

                          <p className="text-slate-600 text-sm leading-relaxed mb-6">
                            {evt.description}
                          </p>

                          <div className="flex items-center justify-between text-xs text-slate-500 pt-4 border-t border-slate-100">
                            <span className="flex items-center gap-1.5 font-medium">
                              <MapPin className="h-4 w-4 text-red-600" />
                              {evt.location}
                            </span>
                            <div className="flex items-center gap-3">
                              {regCount > 0 && (
                                <span className="flex items-center gap-1 text-emerald-600 font-bold">
                                  <Users className="h-3.5 w-3.5" />
                                  {regCount} inscritos
                                </span>
                              )}
                              {evt.capacity && (
                                <span className="flex items-center gap-1 font-mono text-[11px]">
                                  <Users className="h-3.5 w-3.5 text-slate-400" />
                                  {evt.capacity} Lugares
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="mt-8 pt-4 border-t border-slate-100">
                          {isFull ? (
                            <div className="w-full inline-flex items-center justify-center gap-2 bg-slate-200 text-slate-500 py-3.5 text-xs font-bold uppercase cursor-not-allowed">
                              <Users className="h-4 w-4" />
                              Lotação Esgotada
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleOpenRegistration(evt)}
                              className="w-full inline-flex items-center justify-center gap-2 bg-[#020817] text-white py-3.5 text-xs font-bold uppercase hover:bg-red-600 transition"
                            >
                              Inscrever-me no Evento
                              <ArrowRight className="h-4 w-4" />
                            </button>
                          )}
                          {spotsLeft !== null && spotsLeft > 0 && (
                            <p className="text-center text-[11px] text-slate-400 mt-2 font-medium">
                              {spotsLeft} {spotsLeft === 1 ? 'vaga restante' : 'vagas restantes'}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="max-w-3xl">
                <p className="text-lg text-slate-600 leading-relaxed mb-10">
                  {mockEventsEmptyState.description}
                </p>

                <div className="border border-slate-200 bg-white p-8 space-y-6">
                  <div className="flex items-start gap-4">
                    <Calendar className="h-6 w-6 text-red-600 shrink-0 mt-1" />
                    <div>
                      <p className="font-bold text-[#020817]">Próximos eventos</p>
                      <p className="text-sm text-slate-600 mt-1">
                        A agenda será actualizada aqui assim que tivermos datas confirmadas.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <Bell className="h-6 w-6 text-red-600 shrink-0 mt-1" />
                    <div>
                      <p className="font-bold text-[#020817]">Quer ser avisado?</p>
                      <p className="text-sm text-slate-600 mt-1">
                        Subscreva a newsletter no rodapé ou contacte-nos para receber novidades sobre eventos.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <Mail className="h-6 w-6 text-red-600 shrink-0 mt-1" />
                    <div>
                      <p className="font-bold text-[#020817]">Parcerias e propostas</p>
                      <a
                        href={`mailto:${mockEventsEmptyState.email}?subject=Eventos%20ARKNET`}
                        className="text-sm text-red-600 hover:underline mt-1 inline-block font-mono"
                      >
                        {mockEventsEmptyState.email}
                      </a>
                    </div>
                  </div>
                </div>

                <div className="mt-10">
                  <Link
                    href="/#contacto"
                    className="inline-flex bg-[#020817] text-white px-8 py-4 text-sm font-bold uppercase items-center gap-2 hover:bg-red-600 transition"
                  >
                    Falar connosco
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />

      {/* ====== MODAL DE INSCRIÇÃO ====== */}
      {isModalOpen && selectedEvent && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm"
            onClick={handleCloseModal}
          />

          <div className="relative w-full max-w-lg bg-white border border-slate-200 shadow-2xl overflow-hidden z-10 max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-slate-100 bg-[#020817] text-white">
              <div className="flex items-start justify-between">
                <div className="pr-8">
                  <p className="text-[10px] uppercase tracking-[0.15em] text-red-400 font-bold mb-1.5">
                    Inscrição no Evento
                  </p>
                  <h3 className="text-base font-extrabold leading-snug">
                    {selectedEvent.title}
                  </h3>
                  <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {new Date(selectedEvent.date).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {selectedEvent.location}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="text-slate-400 hover:text-white p-1 transition"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1">
              {submitSuccess ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5">
                    <PartyPopper className="h-8 w-8 text-emerald-600" />
                  </div>
                  <h4 className="text-xl font-extrabold text-slate-900 mb-2">
                    Inscrição Confirmada!
                  </h4>
                  <p className="text-sm text-slate-600 leading-relaxed max-w-sm mx-auto">
                    A sua inscrição no evento <strong>{selectedEvent.title}</strong> foi registada com sucesso.
                    Receberá mais informações no email fornecido.
                  </p>

                  <div className="mt-8 p-4 bg-slate-50 border border-slate-200 text-left space-y-2">
                    <div className="flex items-center gap-2 text-xs">
                      <Calendar className="h-3.5 w-3.5 text-red-600" />
                      <span className="font-bold text-slate-700">
                        {new Date(selectedEvent.date).toLocaleDateString('pt-PT', { day: '2-digit', month: 'long', year: 'numeric' })}
                        {selectedEvent.time && ` · ${selectedEvent.time}`}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <MapPin className="h-3.5 w-3.5 text-red-600" />
                      <span className="text-slate-600">{selectedEvent.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                        {selectedEvent.format}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="mt-6 px-8 py-3 bg-[#020817] text-white text-xs font-bold uppercase hover:bg-red-600 transition"
                  >
                    Fechar
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmitRegistration} className="space-y-4">
                  <p className="text-xs text-slate-500 mb-4">
                    Preencha os seus dados para garantir a sua vaga. Os campos marcados com <span className="text-red-600 font-bold">*</span> são obrigatórios.
                  </p>

                  {/* Nome Completo */}
                  <div>
                    <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      <User className="h-3.5 w-3.5 text-slate-400" />
                      Nome Completo <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                      placeholder="ex: João Manuel da Silva"
                      className="w-full px-4 py-3 text-sm border border-slate-300 focus:border-red-600 focus:outline-none transition"
                    />
                  </div>

                  {/* Email & Telefone */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                        <Mail className="h-3.5 w-3.5 text-slate-400" />
                        Email <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                        placeholder="email@empresa.co.ao"
                        className="w-full px-4 py-3 text-sm border border-slate-300 focus:border-red-600 focus:outline-none transition"
                      />
                    </div>
                    <div>
                      <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                        <Phone className="h-3.5 w-3.5 text-slate-400" />
                        Telefone <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                        placeholder="+244 9XX XXX XXX"
                        className="w-full px-4 py-3 text-sm border border-slate-300 focus:border-red-600 focus:outline-none transition"
                      />
                    </div>
                  </div>

                  {/* Empresa */}
                  <div>
                    <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      <Building2 className="h-3.5 w-3.5 text-slate-400" />
                      Empresa / Organização
                    </label>
                    <input
                      type="text"
                      value={formData.company}
                      onChange={(e) => setFormData((prev) => ({ ...prev, company: e.target.value }))}
                      placeholder="ex: Nome da Empresa, S.A."
                      className="w-full px-4 py-3 text-sm border border-slate-300 focus:border-red-600 focus:outline-none transition"
                    />
                  </div>

                  {/* Notas */}
                  <div>
                    <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      <MessageSquare className="h-3.5 w-3.5 text-slate-400" />
                      Observações (opcional)
                    </label>
                    <textarea
                      rows={2}
                      value={formData.notes}
                      onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                      placeholder="Indique necessidades especiais, temas de interesse ou dúvidas..."
                      className="w-full px-4 py-3 text-sm border border-slate-300 focus:border-red-600 focus:outline-none transition resize-none"
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="px-4 py-2.5 text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 uppercase transition"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-6 py-2.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 uppercase shadow-sm transition disabled:opacity-50 flex items-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          A Processar...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Confirmar Inscrição
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
