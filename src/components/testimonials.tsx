'use client'

import React, { useState, useEffect } from 'react'
import { Quote, Star } from "lucide-react"
import PartnerCarousel from "@/components/partner-carousel"
import { dataStore, TestimonialItem } from "@/lib/data-store"

export default function Testimonials() {
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>([])

  useEffect(() => {
    const sync = () => {
      const db = dataStore.getSnapshot()
      const activeList = db.testimonials
        .filter((t) => t.active !== false)
        .sort((a, b) => a.order - b.order)
      setTestimonials(activeList)
    }
    sync()
    const unsub = dataStore.subscribe(sync)
    return () => unsub()
  }, [])

  const itemsToDisplay = testimonials.length > 0 ? testimonials : []
  // Doubled for seamless infinite loop
  const doubled = [...itemsToDisplay, ...itemsToDisplay]

  return (
    <section id="testemunhos" className="bg-slate-50 py-28">
      <div className="mx-auto max-w-7xl px-6">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-14">
          <div className="max-w-xl">
            <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 leading-[1.1]">
              O que os nossos<br />clientes dizem
            </h2>
          </div>
          <p className="text-base text-slate-500 leading-relaxed max-w-sm md:text-right">
            Feedback de empresas que contam com a ARKNET para suporte e infraestrutura tecnológica em Angola.
          </p>
        </div>

        {/* Testimonials auto-scroll marquee */}
        {doubled.length > 0 ? (
          <div className="relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-20 z-10 bg-gradient-to-r from-slate-50 to-transparent pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-20 z-10 bg-gradient-to-l from-slate-50 to-transparent pointer-events-none" />

            <div className="flex animate-marquee-slow hover:[animation-play-state:paused] pb-2">
              {doubled.map((item, index) => (
                <article
                  key={`${item.id}-${index}`}
                  className="w-[360px] shrink-0 mx-3 bg-white border border-slate-200 p-7 flex flex-col justify-between"
                >
                  <div>
                    <Quote className="h-6 w-6 text-primary shrink-0" />

                    <div className="mt-3 flex gap-0.5">
                      {Array.from({ length: item.rating || 5 }).map((_, i) => (
                        <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      ))}
                    </div>

                    <p className="mt-5 text-sm leading-7 text-slate-600 flex-1 italic">
                      &ldquo;{item.testimonial}&rdquo;
                    </p>
                  </div>

                  <div className="mt-6 pt-5 border-t border-slate-100">
                    <p className="text-sm font-bold text-slate-900">{item.clientName}</p>
                    <p className="mt-0.5 text-xs text-slate-500">{item.company} {item.role ? `— ${item.role}` : ''}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        ) : null}

        {/* Partners */}
        <div id="parceiros" className="mt-24">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900">
                Marcas que confiam na ARKNET
              </h2>
            </div>
            <p className="text-sm text-slate-500 max-w-xs md:text-right">
              Empresas e instituições que escolheram a ARKNET como parceiro tecnológico.
            </p>
          </div>

          <PartnerCarousel />
        </div>
      </div>
    </section>
  )
}
