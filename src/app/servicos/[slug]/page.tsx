import ServiceDetailClient from "./service-detail-client"
import { mockServices } from "@/lib/mock-data"
import { redirect } from "next/navigation"
import type { Metadata } from "next"

export function generateStaticParams() {
  return mockServices.map((s) => ({ slug: s.slug }))
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
      title: "Serviço | ARKNET",
    }
  }

  return {
    title: `${service.name} | ARKNET Tecnologia & Telecomunicações`,
    description: service.description,
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

  return <ServiceDetailClient slug={slug} />
}

