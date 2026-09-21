import type { Metadata } from 'next'
import EventosClient from './eventos-client'
import { BreadcrumbJsonLd } from '@/components/seo/json-ld'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Eventos e Oficinas de Tecnologia em Angola | ARKNET',
  description:
    'Participe nos seminários, oficinas e conferências tecnológicas da ARKNET em Angola. Formação técnica e criação de contactos para profissionais e empresas de TI em Luanda.',
  alternates: {
    canonical: 'https://www.arknet.co.ao/eventos',
  },
  openGraph: {
    title: 'Eventos e Oficinas de Tecnologia em Angola | ARKNET',
    description:
      'Participe nos seminários, oficinas e conferências tecnológicas da ARKNET em Angola. Formação técnica e criação de contactos em Luanda.',
    url: 'https://www.arknet.co.ao/eventos',
    type: 'website',
  },
}

export default function EventosPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'Início', url: 'https://www.arknet.co.ao' },
          { name: 'Eventos & Formações', url: 'https://www.arknet.co.ao/eventos' },
        ]}
      />
      <EventosClient />
    </>
  )
}
