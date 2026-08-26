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
} from 'lucide-react'

import arknetLogo from '@/assets/icon18.png'
import heroImage from '@/assets/office.jpeg'
import aboutImage from '@/assets/office.jpeg'

import {
  mockEventsInfo,
  mockEventsHighlights,
  mockEventsEmptyState,
} from '@/lib/mock-data'
import { dataStore, EventItem } from '@/lib/data-store'

export default function EventosPage() {
  const [events, setEvents] = useState<EventItem[]>([])

  useEffect(() => {
    const sync = () => {
      const db = dataStore.getSnapshot()
      setEvents(db.events.filter((e) => e.status === 'agendado' || e.status === 'decorrer'))
    }
    sync()
    const unsub = dataStore.subscribe(sync)
    return () => unsub()
  }, [])

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
                {events.map((evt) => (
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
                          {evt.capacity && (
                            <span className="flex items-center gap-1.5 font-mono">
                              <Users className="h-4 w-4 text-slate-400" />
                              {evt.capacity} Lugares
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="mt-8 pt-4 border-t border-slate-100">
                        <Link
                          href="/#contacto"
                          className="w-full inline-flex items-center justify-center gap-2 bg-[#020817] text-white py-3.5 text-xs font-bold uppercase hover:bg-red-600 transition"
                        >
                          Garantir Vaga no Evento
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
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
    </>
  )
}
