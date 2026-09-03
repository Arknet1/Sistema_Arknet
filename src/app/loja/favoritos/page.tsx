import type { Metadata } from 'next'
import FavoritosClient from './favoritos-client'
import { BreadcrumbJsonLd } from '@/components/seo/json-ld'

export const metadata: Metadata = {
  title: 'Lista de Desejos & Favoritos | Loja Online ARKNET Angola',
  description:
    'Consulte e gira a sua lista de equipamentos de telecomunicações, redes e tecnologia guardados nos favoritos da Loja Online ARKNET.',
  alternates: {
    canonical: 'https://www.arknet.co.ao/loja/favoritos',
  },
  robots: {
    index: false,
    follow: true,
  },
}

export default function WishlistPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'Início', url: 'https://www.arknet.co.ao' },
          { name: 'Loja', url: 'https://www.arknet.co.ao/loja' },
          { name: 'Favoritos', url: 'https://www.arknet.co.ao/loja/favoritos' },
        ]}
      />
      <FavoritosClient />
    </>
  )
}
