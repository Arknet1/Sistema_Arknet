'use client'

import Hero from '../components/hero'
import Services from '@/components/services'
import FeaturedProducts from '@/components/featured-products'
import Sobre from '@/components/sobre'
import PorQueNosEscolher from '@/components/porque-nos-escolher'
import Testimonials from '@/components/testimonials'
import QuoteRequest from '@/components/quote-request'
import Footer from '@/components/footer'

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Hero />
      <Services />
      <FeaturedProducts />
      <Sobre />
      <PorQueNosEscolher />
      <Testimonials />
      <QuoteRequest />
      <Footer />
    </div>
  )
}
