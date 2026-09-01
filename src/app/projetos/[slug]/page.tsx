import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { dataStore } from '@/lib/data-store'
import ProjectDetailClient from './project-detail-client'

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
      title: 'Projeto | ARKNET Tecnologia & Telecomunicações',
      description: 'Projeto tecnológico realizado pela ARKNET em Angola.',
    }
  }

  return {
    title: `${project.title} | Casos de Sucesso ARKNET`,
    description: project.tagline || project.description,
    openGraph: {
      title: project.title,
      description: project.tagline || project.description,
      images: [project.image],
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

  return <ProjectDetailClient slug={slug} />
}
