'use client'

import Image from "next/image"
import v1  from "@/assets/parceiros/vendor-1.jpg"
import v2  from "@/assets/parceiros/vendor-2.jpg"
import v3  from "@/assets/parceiros/vendor-3.jpg"
import v4  from "@/assets/parceiros/vendor-4.jpg"
import v5  from "@/assets/parceiros/vendor-5.jpg"
import v6  from "@/assets/parceiros/vendor-6.jpg"
import v7  from "@/assets/parceiros/vendor-7.jpg"
import v8  from "@/assets/parceiros/vendor-8.jpg"
import v9  from "@/assets/parceiros/vendor-9.jpg"
import v10 from "@/assets/parceiros/vendor-10.jpg"
import v11 from "@/assets/parceiros/vendor-11.jpg"
import v12 from "@/assets/parceiros/vendor-12.jpg"
import v13 from "@/assets/parceiros/vendor-13.jpg"
import v14 from "@/assets/parceiros/vendor-14.jpg"

const logos = [v1, v2, v3, v4, v5, v6, v7, v8, v9, v10, v11, v12, v13, v14]

export default function PartnerCarousel() {
  return (
    <div className="overflow-hidden">
      {/* Fade edges */}
      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-16 z-10 bg-gradient-to-r from-slate-50 to-transparent pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-16 z-10 bg-gradient-to-l from-slate-50 to-transparent pointer-events-none" />

        {/* Marquee track — doubled for seamless loop */}
        <div className="flex animate-marquee hover:[animation-play-state:paused]">
          {[...logos, ...logos].map((src, idx) => (
            <div
              key={idx}
              className="shrink-0 mx-4 w-36 h-20 flex items-center justify-center grayscale hover:grayscale-0 transition-all duration-300 opacity-60 hover:opacity-100"
            >
              <Image
                src={src}
                alt=""
                className="max-h-full max-w-full object-contain"
                width={144}
                height={80}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
