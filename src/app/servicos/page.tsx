import type { Metadata } from 'next'
import ServicosListingClient from './servicos-client'
import { BreadcrumbJsonLd, FaqJsonLd } from '@/components/seo/json-ld'

export const metadata: Metadata = {
  title: 'Serviços de Telecomunicações & TI em Angola | ARKNET',
  description:
    'Soluções integradas de TI em Angola: Internet Empresarial Dedicada, Cibersegurança, Cloud Corporativo, Cabeamento Estruturado e CFTV com suporte 24/7 em Luanda.',
  alternates: {
    canonical: 'https://www.arknet.co.ao/servicos',
  },
  openGraph: {
    title: 'Serviços de Telecomunicações & TI em Angola | ARKNET',
    description:
      'Soluções integradas de TI em Angola: Internet Empresarial, Cibersegurança, Cloud e Cabeamento Estruturado com SLA de 99.9%.',
    url: 'https://www.arknet.co.ao/servicos',
    type: 'website',
  },
}

const serviceFaqs = [
  {
    question: 'Qual é o tempo médio de resposta após a solicitação de uma proposta?',
    answer: 'Em menos de 24 horas úteis, a nossa equipa comercial e de engenharia entra em contacto para agendar o diagnóstico inicial ou apresentar a proposta técnica.',
  },
  {
    question: 'A ARKNET presta serviços fora da província de Luanda?',
    answer: 'Sim! Atuamos em todo o território nacional angolano, contando com equipas móveis no terreno e parceiros estratégicos nas principais províncias.',
  },
  {
    question: 'Os serviços empresariais possuem contrato de fidelização e SLA garantido?',
    answer: 'Todos os nossos serviços empresariais contam com SLA (Acordo de Nível de Serviço) de disponibilidade contratual de até 99.9%, além de planos contratuais flexíveis ajustados ao tamanho do seu negócio.',
  },
  {
    question: 'Como funciona o suporte técnico pós-instalação?',
    answer: 'Disponibilizamos apoio técnico dedicado 24 horas por dia, 7 dias por semana, através da nossa linha direta corporativa, WhatsApp de engenharia e atendimento presencial de emergência.',
  },
]

export default function Page() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'Início', url: 'https://www.arknet.co.ao' },
          { name: 'Serviços', url: 'https://www.arknet.co.ao/servicos' },
        ]}
      />
      <FaqJsonLd faqs={serviceFaqs} />
      <ServicosListingClient />
    </>
  )
}
