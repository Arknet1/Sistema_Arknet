import ProductDetailPageClient from "./product-detail-client"
import { mockProducts } from "@/lib/mock-data"

export function generateStaticParams() {
  return mockProducts.map((p) => ({ id: p.id }))
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <ProductDetailPageClient id={id} />
}
