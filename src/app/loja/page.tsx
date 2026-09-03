import type { Metadata } from 'next'
import LojaClient from './loja-client'
import { BreadcrumbJsonLd } from '@/components/seo/json-ld'

export const metadata: Metadata = {
  title: 'Loja Online de Equipamentos de TI & Redes em Angola | ARKNET',
  description:
    'Compre equipamentos de redes, cabos de fibra óptica, servidores, computadores, routers e CFTV em Angola. Entrega rápida em Luanda e cotações sob medida.',
  alternates: {
    canonical: 'https://www.arknet.co.ao/loja',
  },
  openGraph: {
    title: 'Loja Online de Equipamentos de TI & Redes em Angola | ARKNET',
    description:
      'Compre equipamentos de redes, cabos de fibra óptica, servidores, computadores, routers e CFTV em Angola. Entrega rápida em Luanda.',
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
      <LojaClient />
    </>
  )
}
