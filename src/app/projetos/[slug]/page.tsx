import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { dataStore } from '@/lib/data-store'
import ProjectDetailClient from './project-detail-client'
import { BreadcrumbJsonLd } from '@/components/seo/json-ld'

export function generateStaticParams() {
  const db = dataStore.getSnapshot()
  return (db.projects || []).map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const project = dataStore.getProjectBySlug(slug)

  if (!project) {
    return {
      title: 'Projeto de TI em Angola | ARKNET',
      description: 'Projeto tecnológico realizado pela ARKNET em Angola.',
    }
  }

  const canonicalUrl = `https://www.arknet.co.ao/projetos/${slug}`

  return {
    title: `${project.title} | Casos de Sucesso ARKNET Angola`,
    description: project.tagline || project.description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${project.title} | ARKNET Angola`,
      description: project.tagline || project.description,
      url: canonicalUrl,
      images: [project.image],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${project.title} | ARKNET Angola`,
      description: project.tagline || project.description,
    },
  }
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const project = dataStore.getProjectBySlug(slug)

  if (!project) {
    redirect('/projetos')
  }

  const canonicalUrl = `https://www.arknet.co.ao/projetos/${slug}`

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'Início', url: 'https://www.arknet.co.ao' },
          { name: 'Projetos', url: 'https://www.arknet.co.ao/projetos' },
          { name: project.title, url: canonicalUrl },
        ]}
      />
      <ProjectDetailClient slug={slug} />
    </>
  )
}
