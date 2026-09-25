'use client'

import { useCallback, useEffect, useState } from 'react'
import Image, { type StaticImageData } from 'next/image'
import Link from 'next/link'
import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export type HeroSlide = {
  id?: string
  imageUrl?: string | StaticImageData
  videoUrl?: string
  mediaType: 'image' | 'video'
  linkHref: string
  altText: string
  badge?: string
  title?: string
  subtitle?: string
  active: boolean
}

type HeroCarouselProps = {
  slides: HeroSlide[]
}

export default function HeroCarousel({ slides }: HeroCarouselProps) {
  const activeSlides = slides.filter((slide) => slide.active !== false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [reducedMotion, setReducedMotion] = useState(false)
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: activeSlides.length > 1 }, [
    Autoplay({ delay: 5500, stopOnInteraction: true, stopOnMouseEnter: true }),
  ])

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const updatePreference = () => setReducedMotion(mediaQuery.matches)
    updatePreference()
    mediaQuery.addEventListener('change', updatePreference)
    return () => mediaQuery.removeEventListener('change', updatePreference)
  }, [])

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi])
  const stopAutoplay = useCallback(() => {
    emblaApi?.plugins().autoplay?.stop()
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return

    const autoplay = emblaApi.plugins().autoplay
    const updateSelectedIndex = () => setSelectedIndex(emblaApi.selectedScrollSnap())
    updateSelectedIndex()
    if (reducedMotion) autoplay?.stop()
    emblaApi.on('select', updateSelectedIndex)
    emblaApi.on('pointerDown', stopAutoplay)

    return () => {
      emblaApi.off('select', updateSelectedIndex)
      emblaApi.off('pointerDown', stopAutoplay)
    }
  }, [emblaApi, reducedMotion, stopAutoplay])

  if (activeSlides.length === 0) return null

  const goToSlide = (index: number) => {
    stopAutoplay()
    emblaApi?.scrollTo(index)
  }

  return (
    <section
      aria-label="Promoções e destaques da loja ARKNET"
      className="relative overflow-hidden bg-background text-slate-900"
      onFocusCapture={stopAutoplay}
    >
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex touch-pan-y">
          {activeSlides.map((slide, index) => {
            const isCurrent = selectedIndex === index

            return (
              <div className="relative min-w-0 flex-[0_0_100%]" key={`${slide.linkHref}-${index}`}>
                <div className="relative grid aspect-[16/9] min-h-[420px] sm:min-h-[480px] lg:min-h-[540px] w-full overflow-hidden bg-[#f5f7fa] sm:aspect-[16/7] sm:min-h-0 sm:grid-cols-[50%_50%]">
                  <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,rgba(245,247,250,1)_0%,rgba(255,255,255,0.96)_36%,rgba(194,215,255,0.65)_72%,rgba(255,255,255,0.35)_100%)]" />
                  <div className="pointer-events-none absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(30,96,182,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(30,96,182,0.08)_1px,transparent_1px)] [background-size:42px_42px]" />
                  
                  {/* Text Content: Only Title and Phrase with Large Animated Typography */}
                  <div className="relative z-[1] flex flex-col justify-center px-8 pb-16 pt-10 sm:px-12 lg:px-[max(3rem,calc((100vw-80rem)/2))]">
                    {/* Title */}
                    <h2
                      key={`title-${selectedIndex}`}
                      className={`max-w-xl text-3xl sm:text-5xl md:text-6xl lg:text-[4.2rem] font-black leading-[1.04] tracking-tight text-slate-900 ${
                        isCurrent ? 'animate-hero-title' : 'opacity-0'
                      }`}
                    >
                      {slide.title || 'Leve o essencial.'}
                    </h2>
                    
                    {/* Phrase / Subtitle */}
                    <p
                      key={`subtitle-${selectedIndex}`}
                      className={`mt-4 sm:mt-6 max-w-xl text-lg sm:text-xl md:text-2xl font-medium leading-relaxed text-slate-600 ${
                        isCurrent ? 'animate-hero-subtitle' : 'opacity-0'
                      }`}
                    >
                      {slide.subtitle || 'Viva o extraordinário.'}
                    </p>
                  </div>

                  {/* Media Image / Video with Polygon Clip */}
                  <div className="absolute inset-y-0 right-0 w-[57%] overflow-hidden bg-[linear-gradient(115deg,rgba(245,247,250,1)_0%,rgba(255,255,255,0.96)_36%,rgba(194,215,255,0.65)_72%,rgba(255,255,255,0.35)_100%)] shadow-[-18px_0_40px_rgba(0,0,0,0.08)] ring-1 ring-slate-200/80 sm:relative sm:w-full sm:[clip-path:polygon(12%_0,100%_0,100%_100%,0_100%)]">
                    {slide.mediaType === 'video' ? (
                      <video
                        className={`pointer-events-none h-full w-full object-contain bg-transparent p-5 transition duration-700 sm:p-8 lg:p-12 ${selectedIndex === index ? 'scale-100 opacity-100' : 'scale-95 opacity-70'}`}
                        src={slide.videoUrl || String(slide.imageUrl || '')}
                        autoPlay={!reducedMotion}
                        muted
                        loop
                        playsInline
                        aria-label={slide.altText}
                      />
                    ) : (
                      <Image
                        src={slide.imageUrl || '/uploads/metaverse-posa-fundos_23-2150145319-1788797270882.avif'}
                        alt={slide.altText}
                        fill
                        priority={index === 0}
                        loading={index === 0 ? 'eager' : 'lazy'}
                        sizes="(max-width: 640px) 57vw, 52vw"
                        className={`pointer-events-none object-contain bg-transparent p-5 transition duration-700 sm:p-8 lg:p-12 ${selectedIndex === index ? 'scale-100 opacity-100' : 'scale-95 opacity-70'}`}
                      />
                    )}
                  </div>

                  {selectedIndex === index && !reducedMotion && (
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-1.5 bg-white/20">
                      <div className="hero-carousel-progress h-full bg-secondary" />
                    </div>
                  )}

                  <Link href={slide.linkHref} className="group absolute inset-0 z-0" aria-label={slide.altText} />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {activeSlides.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => {
              stopAutoplay()
              scrollPrev()
            }}
            aria-label="Banner anterior"
            className="absolute left-4 top-1/2 z-10 -translate-y-1/2 border border-white/30 bg-slate-950/40 p-2.5 text-white backdrop-blur-sm transition hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:left-8"
          >
            <ChevronLeft className="h-5 w-5" aria-hidden="true" />
          </button>
          
          <button
            type="button"
            onClick={() => {
              stopAutoplay()
              scrollNext()
            }}
            aria-label="Próximo banner"
            className="absolute right-4 top-1/2 z-10 -translate-y-1/2 border border-white/30 bg-slate-950/40 p-2.5 text-white backdrop-blur-sm transition hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:right-8"
          >
            <ChevronRight className="h-5 w-5" aria-hidden="true" />
          </button>
          
          <div className="absolute bottom-5 left-1/2 z-10 flex -translate-x-1/2 gap-2" role="tablist" aria-label="Selecionar banner">
            {activeSlides.map((slide, index) => (
              <button
                key={`dot-${slide.linkHref}-${index}`}
                type="button"
                role="tab"
                aria-label={`Ir para o banner ${index + 1}`}
                aria-selected={selectedIndex === index}
                onClick={() => goToSlide(index)}
                className={`h-2.5 rounded-full transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${selectedIndex === index ? 'w-8 bg-secondary' : 'w-2.5 bg-white/60 hover:bg-white'}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  )
}