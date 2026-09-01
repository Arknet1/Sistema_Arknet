'use client'

import React, { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Calendar,
  Building2,
  Handshake,
  ArrowRight,
  ChevronRight,
  Sparkles,
  ChevronDown,
  BookOpen,
  Send,
  Mail,
  CheckCircle2,
} from 'lucide-react'
import { dataStore, ProjectItem } from '@/lib/data-store'
import Footer from '@/components/footer'

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

export default function ProjetosPublicationClient() {
  const [projects, setProjects] = useState<ProjectItem[]>([])
  const [visibleCount, setVisibleCount] = useState(6)

  // Newsletter state
  const [newsletterEmail, setNewsletterEmail] = useState('')
  const [newsletterSuccess, setNewsletterSuccess] = useState(false)

  useEffect(() => {
    const sync = () => {
      const db = dataStore.getSnapshot()
      setProjects(db.projects || [])
    }
    sync()
    const unsub = dataStore.subscribe(sync)
    return () => unsub()
  }, [])

  // Lista de Publicações Ordenada da Mais Recente para a Mais Antiga
  const sortedPublications = useMemo(() => {
    return [...projects].sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
  }, [projects])

  const visiblePublications = useMemo(() => {
    return sortedPublications.slice(0, visibleCount)
  }, [sortedPublications, visibleCount])

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 6)
  }

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (newsletterEmail) {
      setNewsletterSuccess(true)
      setNewsletterEmail('')
      setTimeout(() => setNewsletterSuccess(false), 5000)
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col justify-between overflow-hidden">
      
      <div className="flex-1">

        {/* 1. HERO DA PÁGINA DE PUBLICAÇÕES (DARK SLATE) */}
        <section className="relative pt-28 pb-16 border-b border-slate-800 bg-slate-950 text-white overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-35" />
          <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative max-w-7xl mx-auto px-6">
            
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-6 uppercase tracking-wider">
              <Link href="/" className="hover:text-white transition">
                Início
              </Link>
              <ChevronRight className="h-3.5 w-3.5 text-slate-600" />
              <span className="text-primary font-bold">Publicações &amp; Projetos</span>
            </div>

            {/* Título & Frase de Contexto */}
            <div className="max-w-3xl space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-primary/10 border border-primary/30 text-primary rounded-full text-xs font-bold uppercase tracking-wider">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Publicações de Engenharia &amp; Projetos ARKNET</span>
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-white leading-tight uppercase">
                Projetos &amp; <span className="text-primary">Atividades</span>
              </h1>

              <p className="text-base md:text-lg text-slate-300 leading-relaxed font-normal">
                Acompanhe o registo das nossas atividades, projetos implementados e parcerias em curso. Publicações contínuas sobre a presença operacional da ARKNET em Angola.
              </p>
            </div>

          </div>
        </section>

        {/* 2. LISTA DE PUBLICAÇÕES — FORMATO IMAGEM E TEXTO DE LADO (INTERCALADO / ZIG-ZAG) */}
        <section className="py-20 max-w-7xl mx-auto px-6 space-y-20">
          
          <div className="flex items-center justify-between pb-4 border-b border-slate-200">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-widest text-primary">Registo de Atividades</span>
              <h2 className="text-2xl font-black text-slate-900 mt-1">Últimas Publicações Realizadas</h2>
            </div>
            <span className="text-xs font-bold text-slate-500 font-mono">
              {sortedPublications.length} publicações
            </span>
          </div>

          <div className="space-y-20">
            <AnimatePresence>
              {visiblePublications.map((item, idx) => {
                const isEven = idx % 2 === 0

                return (
                  <motion.article
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-50px' }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center border-b border-slate-200/80 pb-20 last:border-b-0 last:pb-0"
                  >
                    
                    {/* Imagem da Publicação (Intercalada: Lado Esquerdo se par, Lado Direito se ímpar) */}
                    <div
                      className={`lg:col-span-6 relative h-80 sm:h-96 lg:h-[420px] w-full rounded-3xl overflow-hidden bg-slate-900 shadow-xl group ${
                        isEven ? 'lg:order-1' : 'lg:order-2'
                      }`}
                    >
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-95 group-hover:opacity-100"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />

                      {/* Badge da Data na Imagem */}
                      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs text-white">
                        <span className="flex items-center gap-1.5 font-mono font-bold bg-slate-950/80 px-3 py-1.5 rounded-xl border border-white/10 backdrop-blur-md">
                          <Calendar className="h-3.5 w-3.5 text-primary" />
                          {formatDatePT(item.createdAt)}
                        </span>
                        
                        <span className={`px-3 py-1.5 rounded-xl font-bold uppercase text-[11px] backdrop-blur-md ${
                          item.status === 'concluido' ? 'bg-emerald-950/90 text-emerald-400 border border-emerald-500/30' : 'bg-amber-950/90 text-amber-400 border border-amber-500/30'
                        }`}>
                          {item.status === 'concluido' ? 'Concluído' : 'Em Curso'}
                        </span>
                      </div>
                    </div>

                    {/* Conteúdo Informativo de Lado (Texto Explicativo) */}
                    <div
                      className={`lg:col-span-6 space-y-5 ${
                        isEven ? 'lg:order-2' : 'lg:order-1'
                      }`}
                    >
                      
                      {/* Cliente / Entidade */}
                      <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-wider">
                        <Building2 className="h-4 w-4 shrink-0" />
                        <span>{item.clientName}</span>
                      </div>

                      {/* Título da Publicação */}
                      <h3 className="text-2xl sm:text-3xl font-black text-slate-900 uppercase tracking-tight leading-snug hover:text-primary transition">
                        <Link href={`/projetos/${item.slug}`}>
                          {item.title}
                        </Link>
                      </h3>

                      {/* Texto de Descrição Corrido da Publicação */}
                      <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
                        {item.description || item.tagline}
                      </p>

                      {/* Assinatura das Empresas Parceiras Envolvidas */}
                      {item.partners && item.partners.length > 0 && (
                        <div className="p-4 bg-white border border-slate-200/90 rounded-2xl space-y-2 shadow-2xs">
                          <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                            <Handshake className="h-4 w-4 text-primary shrink-0" />
                            <span>Entidades &amp; Parceiros Envolvidos:</span>
                          </div>
                          <div className="flex flex-wrap gap-2 text-xs text-slate-600 font-medium">
                            {item.partners.map((p, pIdx) => (
                              <span key={pIdx} className="bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-md text-[11px] font-bold text-slate-800">
                                {p.partnerName} {p.role ? `(${p.role})` : ''}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Botão Ver Publicação Completa */}
                      <div className="pt-2">
                        <Link
                          href={`/projetos/${item.slug}`}
                          className="inline-flex items-center gap-2.5 px-6 py-3.5 bg-slate-900 hover:bg-primary text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition shadow-md group"
                        >
                          <span>Ver Publicação Completa</span>
                          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition" />
                        </Link>
                      </div>

                    </div>

                  </motion.article>
                )
              })}
            </AnimatePresence>
          </div>

          {/* BOTÃO CARREGAR MAIS PUBLICAÇÕES */}
          {visibleCount < sortedPublications.length && (
            <div className="pt-8 text-center border-t border-slate-200">
              <button
                type="button"
                onClick={handleLoadMore}
                className="px-8 py-3.5 bg-white border border-slate-300 hover:border-primary text-slate-900 font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-xs hover:shadow-md transition inline-flex items-center gap-2 cursor-pointer"
              >
                <span>Carregar Mais Publicações ({sortedPublications.length - visibleCount} restantes)</span>
                <ChevronDown className="h-4 w-4 text-primary" />
              </button>
            </div>
          )}

        </section>

        {/* 3. BLOCO DE SUBSCRIÇÃO DA PÁGINA DE PUBLICAÇÕES (DARK BANNER) */}
        <section className="py-16 max-w-7xl mx-auto px-6">
          <div className="relative overflow-hidden bg-gradient-to-r from-slate-950 via-slate-900 to-primary-950 border border-slate-800 p-8 md:p-12 rounded-3xl shadow-2xl text-white grid md:grid-cols-12 gap-8 items-center">
            <div className="absolute right-0 top-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

            <div className="md:col-span-7 space-y-4">
              <span className="text-xs font-bold uppercase tracking-widest text-primary bg-primary/20 px-3 py-1 rounded-full inline-block border border-primary/30">
                Acompanhe os Nossos Projetos
              </span>
              <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tight leading-snug">
                Receba as novas publicações e projetos diretamente no seu e-mail
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed font-normal">
                Mantenha-se informado sobre os novos projetos de engenharia, instalações de redes e soluções tecnológicas lançadas pela ARKNET em Angola.
              </p>
            </div>

            <div className="md:col-span-5">
              {newsletterSuccess ? (
                <div className="p-4 bg-emerald-950 border border-emerald-500/40 text-emerald-300 rounded-2xl text-xs font-bold flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                  <span>Subscrição efetuada! Passará a receber o registo de novas publicações.</span>
                </div>
              ) : (
                <form onSubmit={handleNewsletterSubmit} className="space-y-3">
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={newsletterEmail}
                      onChange={(e) => setNewsletterEmail(e.target.value)}
                      placeholder="seu.email@empresa.co.ao"
                      className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-400 focus:outline-none focus:border-primary transition"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-3.5 bg-primary hover:bg-primary/90 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg transition flex items-center justify-center gap-2"
                  >
                    <Send className="h-4 w-4" />
                    <span>Subscrever Publicações</span>
                  </button>
                </form>
              )}
            </div>

          </div>
        </section>

      </div>

      {/* FOOTER MESMO NA PARTE DE BAIXO */}
      <Footer />

    </main>
  )
}
