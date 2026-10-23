import type { Metadata } from 'next'
import EmpresaClient from './empresa-client'
import { BreadcrumbJsonLd } from '@/components/seo/json-ld'

export const metadata: Metadata = {
  title: 'Sobre a ARKNET | Empresa de Telecomunicações e TI em Angola',
  description:
    'Conheça a ARKNET: missão, visão, valores e compromisso com a excelência em telecomunicações, internet empresarial e soluções de TI em Angola. Mais de 10 anos de experiência em Luanda.',
  alternates: {
    canonical: 'https://www.arknet.co.ao/empresa',
  },
  openGraph: {
    title: 'Sobre a ARKNET | Empresa de Telecomunicações e TI em Angola',
    description:
      'Conheça a ARKNET: missão, visão, valores e compromisso com a excelência em telecomunicações e soluções de TI em Angola.',
    url: 'https://www.arknet.co.ao/empresa',
    type: 'website',
  },
}

export default function Page() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'Início', url: 'https://www.arknet.co.ao' },
          { name: 'Sobre a Empresa', url: 'https://www.arknet.co.ao/empresa' },
        ]}
      />
      <EmpresaClient />
    </>
  )
}
