import type { Metadata } from 'next'
import ProductDetailPageClient from "./product-detail-client"
import { mockProducts } from "@/lib/mock-data"
import { dataStore } from "@/lib/data-store"
import { BreadcrumbJsonLd } from "@/components/seo/json-ld"

export const dynamicParams = true

export function generateStaticParams() {
  return mockProducts.map((p) => ({ id: p.id }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const product = dataStore.getProductById(id)

  if (!product) {
    return {
      title: 'Produto | Loja J.Matos Tecnologia',
      description: 'Equipamento disponível na loja online J.Matos Tecnologia em Angola.',
    }
  }

  const canonicalUrl = `https://www.arknet.co.ao/loja/${id}`

  return {
    title: `${product.name} | Loja J.Matos Tecnologia`,
    description: `${product.description?.substring(0, 150) || product.name}. Equipamento disponível na J.Matos Tecnologia, Luanda. Entrega em Angola.`,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${product.name} | J.Matos Tecnologia`,
      description: product.description || product.name,
      url: canonicalUrl,
      type: 'website',
      images: product.image ? [{ url: product.image }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.name} | J.Matos Tecnologia`,
      description: product.description || product.name,
    },
  }
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const product = dataStore.getProductById(id)

  return (
    <>
      {product && (
        <BreadcrumbJsonLd
          items={[
            { name: 'Início', url: 'https://www.arknet.co.ao' },
            { name: 'Loja', url: 'https://www.arknet.co.ao/loja' },
            { name: product.name, url: `https://www.arknet.co.ao/loja/${id}` },
          ]}
        />
      )}
      <ProductDetailPageClient id={id} />
    </>
  )
}
