'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  ChevronRight,
  Building2,
  CheckCircle2,
  Clock,
  Handshake,
  ExternalLink,
  ArrowRight,
  Sparkles,
  AlertTriangle,
  Lightbulb,
  ImageIcon,
  Maximize2,
  X,
  Calendar,
  BookOpen,
  Share2,
  Quote,
  Copy,
  Check,
} from 'lucide-react'
import { FaLinkedin, FaWhatsapp } from 'react-icons/fa'
import { dataStore, ProjectItem } from '@/lib/data-store'
import Footer from '@/components/footer'

interface ProjectDetailClientProps {
  slug: string
}

function formatDatePT(dateStr?: string) {
  if (!dateStr) return '2026'
  if (dateStr.length === 4) return dateStr
  try {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return dateStr
    return new Intl.DateTimeFormat('pt-PT', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(d)
  } catch {
    return dateStr
  }
}

export default function ProjectDetailClient({ slug }: ProjectDetailClientProps) {
  const router = useRouter()
  const [project, setProject] = useState<ProjectItem | null>(null)
  const [relatedProjects, setRelatedProjects] = useState<ProjectItem[]>([])
  const [selectedGalleryImage, setSelectedGalleryImage] = useState<string | null>(null)
  const [copiedLink, setCopiedLink] = useState(false)

  useEffect(() => {
    const sync = () => {
      const db = dataStore.getSnapshot()
      const found = (db.projects || []).find((p) => p.slug === slug)
      if (!found) {
        router.push('/projetos')
        return
      }
      setProject(found)

      // 2-3 notícias/projetos relacionados (Leia também)
      const others = (db.projects || [])
        .filter((p) => p.id !== found.id)
        .slice(0, 3)
      setRelatedProjects(others)
    }

    sync()
    const unsub = dataStore.subscribe(sync)
    return () => unsub()
  }, [slug, router])

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href)
      setCopiedLink(true)
      setTimeout(() => setCopiedLink(false), 3000)
    }
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary" />
      </div>
    )
  }

  const shareTitle = encodeURIComponent(project.title)
  const currentUrl = typeof window !== 'undefined' ? encodeURIComponent(window.location.href) : ''

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col justify-between overflow-hidden">
      
      <div className="flex-1">

        {/* 1. CABEÇALHO DO ARTIGO (ESCURO / DARK) */}
        <section className="relative pt-28 pb-14 border-b border-slate-800 bg-slate-950 text-white overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />
          <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative max-w-5xl mx-auto px-6">
            
            {/* Breadcrumb: Início / Projetos / [Nome do projeto] */}
            <nav className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-6 uppercase tracking-wider">
              <Link href="/" className="hover:text-white transition">
                Início
              </Link>
              <ChevronRight className="h-3.5 w-3.5 text-slate-600" />
              <Link href="/projetos" className="hover:text-white transition">
                Projetos &amp; Parcerias
              </Link>
              <ChevronRight className="h-3.5 w-3.5 text-slate-600" />
              <span className="text-primary font-bold truncate max-w-xs">{project.title}</span>
            </nav>

            <div className="space-y-4">
              
              {/* Etiqueta de Categoria / Tipo */}
              <div className="flex flex-wrap items-center gap-2">
                {project.partnershipType && (
                  <span className="px-3 py-1 text-xs font-black uppercase tracking-wider bg-primary text-white rounded-md shadow-md">
                    {project.partnershipType}
                  </span>
                )}
                <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider bg-white/10 text-slate-200 border border-white/15 rounded-md">
                  {project.category}
                </span>
                <span className={`px-2.5 py-1 text-xs font-bold uppercase tracking-wider rounded-md ${
                  project.status === 'concluido' ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30' : 'bg-amber-950 text-amber-400 border border-amber-500/30'
                }`}>
                  {project.status === 'concluido' ? 'Concluído' : 'Em Execução'}
                </span>
              </div>

              {/* Título do Projeto/Atividade */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white uppercase tracking-tight leading-tight">
                {project.title}
              </h1>

              {/* Resumo/Lead e Data de Publicação */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-2 text-xs text-slate-400 border-t border-slate-800">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5 font-mono font-bold text-slate-300">
                    <Calendar className="h-3.5 w-3.5 text-primary" />
                    Publicado em {formatDatePT(project.createdAt)}
                  </span>
                  <span className="flex items-center gap-1.5 text-slate-300 font-semibold">
                    <Building2 className="h-3.5 w-3.5 text-primary" />
                    {project.clientName}
                  </span>
                </div>

                {/* Botões Simples de Partilha */}
                <div className="flex items-center gap-2">
                  <span className="text-[11px] uppercase font-bold text-slate-500 hidden sm:inline">Partilhar:</span>
                  
                  <a
                    href={`https://api.whatsapp.com/send?text=${shareTitle}%20${currentUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-emerald-600/30 hover:bg-emerald-600 text-emerald-400 hover:text-white rounded-lg transition"
                    title="Partilhar no WhatsApp"
                  >
                    <FaWhatsapp className="h-3.5 w-3.5" />
                  </a>

                  <a
                    href={`https://www.linkedin.com/sharing/share-offsite/?url=${currentUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-blue-600/30 hover:bg-blue-600 text-blue-400 hover:text-white rounded-lg transition"
                    title="Partilhar no LinkedIn"
                  >
                    <FaLinkedin className="h-3.5 w-3.5" />
                  </a>

                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="p-2 bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white rounded-lg transition flex items-center gap-1 text-xs font-bold cursor-pointer"
                    title="Copiar Link"
                  >
                    {copiedLink ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>

              </div>

            </div>

          </div>
        </section>

        {/* IMAGEM DE DESTAQUE EM LARGURA TOTAL (CONTAINED MAX-W-5XL) */}
        <section className="bg-white py-8 border-b border-slate-200">
          <div className="max-w-5xl mx-auto px-6">
            <div className="relative rounded-3xl overflow-hidden border border-slate-200 shadow-xl bg-slate-900 group">
              <img
                src={project.image}
                alt={project.title}
                className="w-full h-80 sm:h-[450px] object-cover group-hover:scale-102 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
              <button
                type="button"
                onClick={() => setSelectedGalleryImage(project.image)}
                className="absolute bottom-4 right-4 p-2.5 bg-slate-950/80 hover:bg-primary text-white rounded-xl backdrop-blur-md transition shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <Maximize2 className="h-4 w-4" />
                <span className="text-xs font-bold">Ampliar Imagem</span>
              </button>
            </div>
          </div>
        </section>

        {/* 2. CORPO DO ARTIGO & CAIXA DE ASSINATURA DE PARCEIROS (CLARO / LIGHT) */}
        <section className="py-12 max-w-5xl mx-auto px-6 bg-slate-50">
          
          {/* BLOCO DESTACADO: CAIXA DE ASSINATURA DAS EMPRESAS PARCEIRAS (PERTO DO INÍCIO) */}
          {project.partners && project.partners.length > 0 && (
            <div className="mb-10 p-6 bg-white border border-slate-200/90 rounded-2xl shadow-md space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <Handshake className="h-5 w-5 text-primary" />
                <h3 className="font-black text-slate-900 text-sm uppercase tracking-wider">
                  Empresas Parceiras Envolvidas neste Projeto
                </h3>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                {project.partners.map((partner, pIdx) => (
                  <div
                    key={pIdx}
                    className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl flex items-start gap-3 hover:border-primary/40 transition"
                  >
                    <div className="p-2 bg-white border border-slate-200 rounded-lg shrink-0">
                      {partner.partnerLogo ? (
                        <img src={partner.partnerLogo} alt={partner.partnerName} className="h-8 w-auto max-w-[80px] object-contain" />
                      ) : (
                        <Building2 className="h-6 w-6 text-primary" />
                      )}
                    </div>
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-extrabold text-slate-900 text-xs">
                          {partner.partnerName}
                        </h4>
                        {partner.partnerWebsite && (
                          <a
                            href={partner.partnerWebsite}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-slate-400 hover:text-primary transition"
                            title={`Visitar site de ${partner.partnerName}`}
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-600 font-medium leading-snug">
                        {partner.role || 'Parceiro Estratégico no Projeto'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TEXTO CORRIDO DO ARTIGO */}
          <div className="space-y-8 text-slate-800 leading-relaxed font-normal">
            
            {/* Introdução / Contexto */}
            <div className="space-y-4">
              <h2 className="text-2xl font-black uppercase text-slate-900 tracking-tight flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <span>Contexto &amp; Atividade Desenvolvida</span>
              </h2>
              <p className="text-slate-700 text-base sm:text-lg leading-relaxed font-normal">
                {project.description}
              </p>
            </div>

            {/* Citação em Destaque */}
            <div className="p-6 sm:p-8 bg-gradient-to-r from-primary/10 via-slate-100 to-white border-l-4 border-l-primary border border-slate-200/90 rounded-r-3xl space-y-3 shadow-2xs">
              <Quote className="h-8 w-8 text-primary/30" />
              <p className="text-base sm:text-lg font-extrabold text-slate-900 italic leading-relaxed">
                "{project.quote?.text || `A execução deste projeto demonstrou a elevada capacidade técnica das nossas equipas e fortaleceu as alianças estratégicas com o sector em Angola.`}"
              </p>
              <p className="text-xs font-bold text-slate-600">
                — {project.quote?.author || project.clientName} ({project.quote?.role || 'Comunicação Corporativa'})
              </p>
            </div>

            {/* O Desafio & A Solução (Subtítulos no Artigo) */}
            <div className="grid sm:grid-cols-2 gap-6 pt-2">
              {project.challenge && (
                <div className="p-6 bg-rose-50/80 border-l-4 border-l-rose-500 border border-rose-200/80 rounded-r-2xl space-y-2.5">
                  <h3 className="flex items-center gap-2 text-rose-700 font-black uppercase text-xs tracking-wider">
                    <AlertTriangle className="h-4 w-4" />
                    <span>O Desafio</span>
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-800 leading-relaxed">
                    {project.challenge}
                  </p>
                </div>
              )}

              {project.solution && (
                <div className="p-6 bg-emerald-50/80 border-l-4 border-l-emerald-500 border border-emerald-200/80 rounded-r-2xl space-y-2.5">
                  <h3 className="flex items-center gap-2 text-emerald-700 font-black uppercase text-xs tracking-wider">
                    <Lightbulb className="h-4 w-4" />
                    <span>A Colaboração &amp; Solução</span>
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-800 leading-relaxed">
                    {project.solution}
                  </p>
                </div>
              )}
            </div>

            {/* Resultados em Números */}
            {project.results && project.results.length > 0 && (
              <div className="pt-6 border-t border-slate-200 space-y-4">
                <h3 className="text-xl font-bold uppercase text-slate-900 tracking-tight">
                  Destaques &amp; Resultados Atingidos
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {project.results.map((res, i) => (
                    <div key={i} className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs text-center">
                      <p className="text-2xl font-black text-primary font-mono">{res.value}</p>
                      <p className="text-xs text-slate-600 mt-1 uppercase font-bold">{res.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Galeria de Fotos */}
            {project.gallery && project.gallery.length > 0 && (
              <div className="pt-6 border-t border-slate-200 space-y-4">
                <h3 className="text-xl font-bold uppercase text-slate-900 tracking-tight flex items-center gap-2">
                  <ImageIcon className="h-5 w-5 text-primary" />
                  <span>Galeria de Fotos da Atividade</span>
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {project.gallery.map((imgUrl, gIdx) => (
                    <div
                      key={gIdx}
                      className="relative h-40 rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 group cursor-pointer shadow-sm hover:shadow-md"
                      onClick={() => setSelectedGalleryImage(imgUrl)}
                    >
                      <img
                        src={imgUrl}
                        alt={`Foto do Artigo ${gIdx + 1}`}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-slate-950/40 group-hover:bg-slate-950/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <Maximize2 className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

        </section>

        {/* 3. CTA FIXO (ESCURO / DARK BANNER) */}
        <section className="py-12 max-w-5xl mx-auto px-6">
          <div className="p-8 bg-slate-900 border border-slate-800 rounded-3xl text-white space-y-4 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-primary bg-primary/20 px-3 py-1 rounded-full border border-primary/30 inline-block">
                Contacto Corporativo
              </span>
              <h3 className="text-xl sm:text-2xl font-black uppercase leading-snug">
                Quer uma parceria ou projeto semelhante para a sua empresa?
              </h3>
              <p className="text-xs text-slate-300 max-w-xl font-normal">
                Fale com os nossos especialistas e desenhe uma solução à medida para a sua infraestrutura tecnológica.
              </p>
            </div>

            <Link
              href="/empresa#contacto"
              className="px-6 py-3.5 bg-primary hover:bg-primary/90 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg transition whitespace-nowrap shrink-0 flex items-center gap-2"
            >
              <span>Solicitar Parceria</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        {/* 4. MAIS PROJETOS E PARCERIAS ("LEIA TAMBÉM" - CLARO / LIGHT) */}
        {relatedProjects.length > 0 && (
          <section className="py-16 border-t border-slate-200 max-w-5xl mx-auto px-6 bg-white">
            <div className="flex items-center justify-between mb-8">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-primary">Leia Também</p>
                <h3 className="text-2xl font-black uppercase tracking-tight text-slate-900">
                  Mais Projetos e Parcerias
                </h3>
              </div>
              <Link
                href="/projetos"
                className="text-xs font-bold text-slate-500 hover:text-primary uppercase tracking-wider transition flex items-center gap-1"
              >
                <span>Ver Todos os Artigos</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {relatedProjects.map((rel) => (
                <Link
                  key={rel.id}
                  href={`/projetos/${rel.slug}`}
                  className="group p-4 bg-slate-50 border border-slate-200/90 hover:border-primary/50 rounded-2xl transition space-y-3 hover:shadow-md"
                >
                  <div className="relative h-40 rounded-xl overflow-hidden bg-slate-900">
                    <img
                      src={rel.image}
                      alt={rel.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-2 left-2 px-2 py-0.5 text-[9px] font-black uppercase bg-slate-950/80 text-primary rounded">
                      {rel.category}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="text-[11px] text-slate-500 font-semibold">{rel.clientName}</p>
                    <h4 className="font-extrabold text-sm text-slate-900 group-hover:text-primary transition leading-snug line-clamp-2">
                      {rel.title}
                    </h4>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* LIGHTBOX MODAL */}
        {selectedGalleryImage && (
          <div
            className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setSelectedGalleryImage(null)}
          >
            <button
              type="button"
              onClick={() => setSelectedGalleryImage(null)}
              className="absolute top-6 right-6 p-2 text-slate-400 hover:text-white bg-slate-900/80 rounded-full transition cursor-pointer"
            >
              <X className="h-6 w-6" />
            </button>
            <div className="relative max-w-4xl max-h-[85vh] overflow-hidden rounded-xl">
              <img
                src={selectedGalleryImage}
                alt="Ampliação"
                className="max-h-[85vh] w-auto object-contain rounded-xl shadow-2xl border border-white/10"
              />
            </div>
          </div>
        )}

      </div>

      {/* FOOTER MESMO NA PARTE DE BAIXO */}
      <Footer />

    </main>
  )
}
