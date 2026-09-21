'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowRight, Sparkles, Building2 } from 'lucide-react'
import { ProjectItem } from '@/lib/data-store'

interface ProjectsFeaturedCarouselProps {
  projects: ProjectItem[]
}

export default function ProjectsFeaturedCarousel({
  projects,
}: ProjectsFeaturedCarouselProps) {
  // Ordenar para priorizar os projetos em destaque
  const displayProjects = React.useMemo(() => {
    if (!projects || projects.length === 0) return []
    const featured = projects.filter((p) => p.featured)
    const others = projects.filter((p) => !p.featured)
    return [...featured, ...others]
  }, [projects])

  if (displayProjects.length === 0) {
    return null
  }

  // Multiplicação da lista para garantir rotação contínua (Marquee) fluida e infinita
  const repeatCount = Math.max(2, Math.ceil(12 / displayProjects.length))
  const infiniteProjects = Array.from({ length: repeatCount }).flatMap(() => displayProjects)

  return (
    <section className="py-16 bg-slate-50 border-t border-b border-slate-200/80 overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Cabeçalho Limpo, Direto e Elegante */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
              Projetos em Destaque
            </h2>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-slate-400 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>{displayProjects.length} Casos de Sucesso</span>
          </div>
        </div>

        {/* Trilho Deslizante Dinâmico Contínuo (Marquee Animado) */}
        <div className="relative overflow-hidden -mx-6 px-6">
          
          {/* Sombras / Sfumato de transição suave nas extremidades */}
          <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-28 z-10 bg-gradient-to-r from-slate-50 to-transparent pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-28 z-10 bg-gradient-to-l from-slate-50 to-transparent pointer-events-none" />

          {/* Rotação Contínua Fluida */}
          <div className="flex animate-marquee-slow hover:[animation-play-state:paused] py-3 gap-6">
            {infiniteProjects.map((project, idx) => {
              // Teaser curto e instigante para despertar a curiosidade do usuário
              const teaser =
                project.tagline ||
                (project.description ? project.description.slice(0, 115) + '…' : '') ||
                'Descubra a infraestrutura de alto desempenho implementada pela ARKNET.'

              return (
                <div
                  key={`${project.id || project.slug}-${idx}`}
                  className="w-[290px] sm:w-[320px] shrink-0 flex flex-col group"
                >
                  <article className="bg-white border border-slate-200 hover:border-primary/60 rounded-2xl overflow-hidden shadow-xs hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 flex flex-col justify-between h-full">
                    
                    {/* Imagem com Capa e Badge Simples */}
                    <div className="relative aspect-16/10 overflow-hidden bg-slate-100">
                      <Link href={`/projetos/${project.slug}`} className="block w-full h-full">
                        <img
                          src={project.image}
                          alt={project.title}
                          className="w-full h-full object-cover group-hover:scale-106 transition-transform duration-500 ease-out"
                          loading="lazy"
                        />
                      </Link>

                      {/* Badge da Categoria */}
                      <span className="absolute top-2.5 left-2.5 bg-slate-900/90 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md backdrop-blur-sm pointer-events-none border border-white/10">
                        {project.category || 'Engenharia'}
                      </span>

                      {/* Cliente */}
                      {project.clientName && (
                        <span className="absolute bottom-2.5 left-2.5 right-2.5 bg-slate-950/80 text-slate-200 text-[11px] font-medium px-2.5 py-1 rounded-md backdrop-blur-sm flex items-center gap-1.5 border border-white/10 truncate">
                          <Building2 className="h-3 w-3 text-primary shrink-0" />
                          <span className="truncate">{project.clientName}</span>
                        </span>
                      )}
                    </div>

                    {/* Conteúdo Limpo e Curioso */}
                    <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between space-y-3">
                      <div className="space-y-1.5">
                        <Link href={`/projetos/${project.slug}`}>
                          <h3 className="text-sm sm:text-[15px] font-black text-slate-900 group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                            {project.title}
                          </h3>
                        </Link>

                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed font-normal">
                          {teaser}
                        </p>
                      </div>

                      {/* Rodapé do Card com Botão de Saber Mais Compacto */}
                      <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-[11px] font-mono text-slate-400 font-medium uppercase tracking-wider">
                          Caso Real
                        </span>
                        <Link
                          href={`/projetos/${project.slug}`}
                          className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-primary text-white text-[11px] font-extrabold uppercase tracking-wider py-1.5 px-3 rounded-lg transition-colors shadow-2xs group/btn"
                        >
                          <span>Saber mais</span>
                          <ArrowRight className="h-3 w-3 group-hover/btn:translate-x-0.5 transition-transform" />
                        </Link>
                      </div>

                    </div>

                  </article>
                </div>
              )
            })}
          </div>

        </div>

      </div>
    </section>
  )
}
