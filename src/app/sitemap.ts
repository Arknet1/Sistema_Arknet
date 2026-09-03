import { MetadataRoute } from 'next'
import { mockServices } from '@/lib/mock-data'
import { dataStore } from '@/lib/data-store'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.arknet.co.ao'
  const currentDate = new Date()

  // 1. Páginas Estáticas Principais
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/servicos`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/empresa`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/loja`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/projetos`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/eventos`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/loja/favoritos`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ]

  // 2. Rotas Dinâmicas de Serviços
  const serviceRoutes: MetadataRoute.Sitemap = mockServices.map((service) => ({
    url: `${baseUrl}/servicos/${service.slug}`,
    lastModified: currentDate,
    changeFrequency: 'weekly',
    priority: 0.85,
  }))

  // 3. Rotas Dinâmicas de Projetos (Cases)
  const db = dataStore.getSnapshot()
  const projectRoutes: MetadataRoute.Sitemap = (db.projects || []).map((project) => ({
    url: `${baseUrl}/projetos/${project.slug}`,
    lastModified: new Date(project.updatedAt || project.createdAt || currentDate),
    changeFrequency: 'monthly',
    priority: 0.75,
  }))

  // 4. Rotas Dinâmicas de Produtos da Loja
  const products = dataStore.getProducts()
  const productRoutes: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${baseUrl}/loja/${product.id}`,
    lastModified: new Date(product.updatedAt || product.createdAt || currentDate),
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  return [...staticRoutes, ...serviceRoutes, ...projectRoutes, ...productRoutes]
}
