import type { Metadata } from 'next'
import ServicosListingClient from './servicos-client'

export const metadata: Metadata = {
  title: 'Serviços | ARKNET Tecnologia & Telecomunicações',
  description: 'Soluções completas de TI, internet empresarial, cibersegurança, computação em nuvem, cabeamento estruturado e CFTV com SLA garantido em Angola.',
}

export default function Page() {
  return <ServicosListingClient />
}
