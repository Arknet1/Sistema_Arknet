import ServiceDetailClient from "./service-detail-client"
import { mockServices } from "@/lib/mock-data"
import { redirect } from "next/navigation"
import type { Metadata } from "next"
import { ServiceJsonLd, FaqJsonLd, BreadcrumbJsonLd } from "@/components/seo/json-ld"

export function generateStaticParams() {
  return mockServices.map((s) => ({ slug: s.slug }))
}

// Mapeamento de Títulos SEO Naturais e Estratégicos por Serviço
const serviceSeoTitles: Record<string, string> = {
  'internet-empresarial': 'Internet Empresarial em Angola | Links Dedicados & SLA 99.9% | ARKNET',
  'instalacao-e-manutencao': 'Instalação e Manutenção de TI em Angola | Suporte Técnico | ARKNET',
  'reparacao-e-manutencao': 'Reparação e Manutenção de Equipamentos de TI em Luanda | ARKNET',
  'cablagem-estruturada': 'Cabeamento Estruturado & Redes de Fibra em Angola | ARKNET',
  'seguranca-cftv': 'Segurança Eletrónica & CFTV em Angola | Videovigilância IP | ARKNET',
  'ciberseguranca': 'Cibersegurança em Angola | Proteção de Dados & Firewalls | ARKNET',
  'consultoria-e-auditoria': 'Consultoria e Auditoria de TI em Angola | Transformação Digital | ARKNET',
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const service = mockServices.find((s) => s.slug === slug)

  if (!service) {
    return {
      title: "Serviço de Tecnologia e TI | ARKNET Angola",
    }
  }

  const seoTitle = serviceSeoTitles[slug] || `${service.name} em Angola | Soluções de TI | ARKNET`
  const canonicalUrl = `https://www.arknet.co.ao/servicos/${slug}`

  return {
    title: seoTitle,
    description: `${service.description} Conectividade, engenharia certificada e assistência técnica 24/7 em Luanda, Angola.`,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: seoTitle,
      description: service.description,
      url: canonicalUrl,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: seoTitle,
      description: service.description,
    },
  }
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const service = mockServices.find((s) => s.slug === slug)

  if (!service) {
    redirect('/servicos')
  }

  const canonicalUrl = `https://www.arknet.co.ao/servicos/${slug}`

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'Início', url: 'https://www.arknet.co.ao' },
          { name: 'Serviços', url: 'https://www.arknet.co.ao/servicos' },
          { name: service.name, url: canonicalUrl },
        ]}
      />
      <ServiceJsonLd
        name={service.name}
        description={service.description}
        url={canonicalUrl}
      />
      {service.faqs && service.faqs.length > 0 && (
        <FaqJsonLd
          faqs={service.faqs.map((f) => ({
            question: f.q,
            answer: f.a,
          }))}
        />
      )}
      <ServiceDetailClient slug={slug} />
    </>
  )
}
