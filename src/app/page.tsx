import type { Metadata } from 'next'
import Hero from '../components/hero'
import Services from '@/components/services'
import FeaturedProducts from '@/components/featured-products'
import Sobre from '@/components/sobre'
import PorQueNosEscolher from '@/components/porque-nos-escolher'
import Testimonials from '@/components/testimonials'
import QuoteRequest from '@/components/quote-request'
import Footer from '@/components/footer'

export const metadata: Metadata = {
  title: 'ARKNET Angola | Telecomunicações, Internet Empresarial e Soluções de TI',
  description:
    'Soluções integradas de Telecomunicações, Internet Dedicada Empresarial, Cibersegurança, Computação em Nuvem e Cabeamento Estruturado em Angola. Conectividade de alta disponibilidade e suporte técnico 24/7 em Luanda.',
  alternates: {
    canonical: 'https://www.arknet.co.ao',
  },
  openGraph: {
    title: 'ARKNET Angola | Telecomunicações, Internet Empresarial e Soluções de TI',
    description:
      'Soluções integradas de Telecomunicações, Internet Dedicada, Cibersegurança, Cloud e Infraestruturas de TI para empresas em Angola.',
    url: 'https://www.arknet.co.ao',
    type: 'website',
  },
}

export default function HomePage() {
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'ARKNET Angola',
    url: 'https://www.arknet.co.ao',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://www.arknet.co.ao/loja?q={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  }

  return (
    <main className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <Hero />
      <Services />
      <FeaturedProducts />
      <Sobre />
      <PorQueNosEscolher />
      <Testimonials />
      <QuoteRequest />
      <Footer />
    </main>
  )
}
