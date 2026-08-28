'use client'

import React, { useState, useEffect } from "react"
import { dataStore, PartnerItem } from "@/lib/data-store"

export default function PartnerCarousel() {
  const [partners, setPartners] = useState<PartnerItem[]>([])

  useEffect(() => {
    const sync = () => {
      const db = dataStore.getSnapshot()
      setPartners(db.partners.filter((p) => p.active !== false).sort((a, b) => a.order - b.order))
    }
    sync()
    const unsub = dataStore.subscribe(sync)
    return () => unsub()
  }, [])

  if (partners.length === 0) return null

  // Marquee track — doubled for seamless loop
  const doubled = [...partners, ...partners]

  return (
    <div className="overflow-hidden">
      {/* Fade edges */}
      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-20 z-10 bg-gradient-to-r from-slate-50 to-transparent pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-20 z-10 bg-gradient-to-l from-slate-50 to-transparent pointer-events-none" />

        {/* Marquee track */}
        <div className="flex animate-marquee hover:[animation-play-state:paused] py-2">
          {doubled.map((item, idx) => (
            <div
              key={`${item.id}-${idx}`}
              className="shrink-0 mx-3.5 w-44 h-24 bg-white border border-slate-200/90 rounded-lg p-4 flex flex-col items-center justify-center shadow-xs hover:shadow-md transition-all duration-300 group"
              title={`${item.name} — ${item.category || 'Parceiro ARKNET'}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.logo}
                alt={item.name}
                className="max-h-14 max-w-full object-contain filter grayscale group-hover:grayscale-0 transition-all duration-300 opacity-80 group-hover:opacity-100 transform group-hover:scale-105"
              />
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1 opacity-0 group-hover:opacity-100 transition-opacity truncate max-w-full">
                {item.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
