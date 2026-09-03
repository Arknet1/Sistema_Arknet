import type { Metadata } from 'next'
import ProjetosListingClient from './projetos-client'
import { BreadcrumbJsonLd } from '@/components/seo/json-ld'

export const metadata: Metadata = {
  title: 'Projetos & Casos de Sucesso em Angola | ARKNET',
  description:
    'Conheça os projetos de infraestrutura de rede, cibersegurança, cloud, CFTV e internet dedicada implementados pela ARKNET para empresas e instituições de referência em Angola.',
  alternates: {
    canonical: 'https://www.arknet.co.ao/projetos',
  },
  openGraph: {
    title: 'Projetos & Casos de Sucesso em Angola | ARKNET',
    description:
      'Projetos de infraestrutura de rede, cibersegurança, cloud, CFTV e internet dedicada realizados pela ARKNET em Angola.',
    url: 'https://www.arknet.co.ao/projetos',
    type: 'website',
  },
}

export default function ProjetosPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'Início', url: 'https://www.arknet.co.ao' },
          { name: 'Projetos', url: 'https://www.arknet.co.ao/projetos' },
        ]}
      />
      <ProjetosListingClient />
    </>
  )
}
