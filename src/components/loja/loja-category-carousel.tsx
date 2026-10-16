'use client'

import React, { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { ProductCategory } from '@/lib/data-store'
import { isCategoryMatch } from '@/lib/loja-category-utils'

interface LojaCategoryCarouselProps {
  categories: ProductCategory[]
  activeCategory?: string
}

export default function LojaCategoryCarousel({
  categories,
  activeCategory = '',
}: LojaCategoryCarouselProps) {
  const [canScrollPrev, setCanScrollPrev] = useState(false)
  const [canScrollNext, setCanScrollNext] = useState(false)

  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      align: 'start',
      dragFree: true,
      containScroll: 'trimSnaps',
    },
    [
      Autoplay({
        delay: 3500,
        stopOnInteraction: false,
        stopOnMouseEnter: true,
      }),
    ]
  )

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev()
  }, [emblaApi])

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext()
  }, [emblaApi])

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setCanScrollPrev(emblaApi.canScrollPrev())
    setCanScrollNext(emblaApi.canScrollNext())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    onSelect()
    emblaApi.on('select', onSelect)
    emblaApi.on('reInit', onSelect)
    return () => {
      emblaApi.off('select', onSelect)
      emblaApi.off('reInit', onSelect)
    }
  }, [emblaApi, onSelect])

  if (!categories || categories.length === 0) return null

  return (
    <div className="relative flex-1 flex items-center min-w-0 overflow-hidden">
      {/* Botão Anterior */}
      <button
        type="button"
        onClick={scrollPrev}
        className="p-1 rounded-full text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition shrink-0 z-10"
        aria-label="Categoria anterior"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {/* Viewport do Carrossel */}
      <div className="overflow-hidden flex-1 mx-1" ref={emblaRef}>
        <div className="flex items-center gap-1 sm:gap-2">
          {categories.map((cat) => {
            const isActive = isCategoryMatch(activeCategory, cat.name)

            return (
              <div key={cat.id || cat.name} className="shrink-0">
                <Link
                  href={`/loja?categoria=${encodeURIComponent(cat.name)}`}
                  className={`inline-block whitespace-nowrap px-3 sm:px-4 py-2.5 text-xs sm:text-[13px] font-medium transition-colors ${
                    isActive
                      ? 'text-primary font-bold border-b-2 border-primary'
                      : 'text-slate-700 hover:text-primary'
                  }`}
                >
                  {cat.name}
                </Link>
              </div>
            )
          })}
        </div>
      </div>

      {/* Botão Seguinte */}
      <button
        type="button"
        onClick={scrollNext}
        className="p-1 rounded-full text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition shrink-0 z-10"
        aria-label="Categoria seguinte"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  )
}
