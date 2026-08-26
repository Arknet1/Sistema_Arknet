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
        <div className="absolute left-0 top-0 bottom-0 w-16 z-10 bg-gradient-to-r from-slate-50 to-transparent pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-16 z-10 bg-gradient-to-l from-slate-50 to-transparent pointer-events-none" />

        {/* Marquee track */}
        <div className="flex animate-marquee hover:[animation-play-state:paused]">
          {doubled.map((item, idx) => (
            <div
              key={`${item.id}-${idx}`}
              className="shrink-0 mx-4 w-40 h-20 bg-white border border-slate-100 p-3 flex items-center justify-center grayscale hover:grayscale-0 transition-all duration-300 opacity-70 hover:opacity-100"
              title={item.name}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.logo}
                alt={item.name}
                className="max-h-full max-w-full object-contain"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
