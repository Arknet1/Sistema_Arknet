import type { Metadata } from 'next'
import { Suspense } from 'react'
import LojaClient from './loja-client'
import { BreadcrumbJsonLd } from '@/components/seo/json-ld'

export const metadata: Metadata = {
  title: 'Loja Oficial J.Matos Tecnologia | Soluções Tecnológicas · Grupo ARKNET',
  description:
    'Compre equipamentos de redes, cabos de fibra óptica, servidores, computadores, routers e CFTV na loja oficial J.Matos Tecnologia em Angola. Entrega rápida em Luanda.',
  alternates: {
    canonical: 'https://www.arknet.co.ao/loja',
  },
  openGraph: {
    title: 'Loja Oficial J.Matos Tecnologia | Soluções Tecnológicas',
    description:
      'Compre equipamentos de redes, cabos de fibra óptica, servidores, computadores e routers na J.Matos Tecnologia em Luanda, Angola.',
    url: 'https://www.arknet.co.ao/loja',
    type: 'website',
  },
}

export default function LojaPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'Início', url: 'https://www.arknet.co.ao' },
          { name: 'Loja Online', url: 'https://www.arknet.co.ao/loja' },
        ]}
      />
      <Suspense fallback={null}>
        <LojaClient />
      </Suspense>
    </>
  )
}
