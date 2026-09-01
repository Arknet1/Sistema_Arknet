import type { Metadata } from 'next'
import ProjetosListingClient from './projetos-client'

export const metadata: Metadata = {
  title: 'Projetos & Portfólio | ARKNET Tecnologia & Telecomunicações',
  description:
    'Conheça os projetos de infraestrutura de rede, cibersegurança, cloud, CFTV e internet dedicada que a ARKNET implementou para empresas e instituições de referência em Angola.',
}

export default function ProjetosPage() {
  return <ProjetosListingClient />
}
