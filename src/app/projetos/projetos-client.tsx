'use client'

import React, { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowRight,
  ChevronRight,
  Sparkles,
  Send,
  Mail,
  CheckCircle2,
  Clock,
  Award,
  Users,
  MapPin,
  TrendingUp,
  X,
  PhoneCall,
  Activity,
} from 'lucide-react'
import { dataStore, ProjectItem, DailyActivityItem } from '@/lib/data-store'
import ProjectsFeaturedCarousel from '@/components/projects-featured-carousel'
import Footer from '@/components/footer'

export default function ProjetosPublicationClient() {
  const [projects, setProjects] = useState<ProjectItem[]>(() => dataStore.getProjects())
  const [dailyActivities, setDailyActivities] = useState<DailyActivityItem[]>(() => dataStore.getDailyActivities())

  // Filtro do Blog de Notícias & Atividades Diárias
  const [activityFilter, setActivityFilter] = useState<'all' | 'radio' | 'formacoes' | 'eventos' | 'operacoes' | 'institucional'>('all')

  // Lightbox Modal para o Artigo do Blog
  const [selectedActivity, setSelectedActivity] = useState<DailyActivityItem | null>(null)

  // Newsletter state
  const [newsletterEmail, setNewsletterEmail] = useState('')
  const [newsletterSuccess, setNewsletterSuccess] = useState(false)

  useEffect(() => {
    const sync = () => {
      const db = dataStore.getSnapshot()
      setProjects(db.projects || [])
      setDailyActivities(Array.isArray(db.dailyActivities) ? db.dailyActivities : dataStore.getDailyActivities())
    }
    sync()
    const unsub = dataStore.subscribe(sync)
    return () => unsub()
  }, [])

  // Filtragem das Notícias & Atividades (Blog Style)
  const filteredDailyActivities = useMemo(() => {
    return dailyActivities.filter((act) => {
      const cat = (act.category || '').toLowerCase()
      const text = (act.title + ' ' + act.description + ' ' + (act.tags || []).join(' ')).toLowerCase()

      if (activityFilter === 'radio') {
        return cat.includes('rádio') || cat.includes('imprensa') || text.includes('rádio') || text.includes('entrevista')
      }
      if (activityFilter === 'formacoes') {
        return cat.includes('formação') || cat.includes('academia') || text.includes('formação') || text.includes('workshop') || text.includes('capacitação')
      }
      if (activityFilter === 'eventos') {
        return cat.includes('evento') || cat.includes('palestra') || text.includes('painel') || text.includes('conferência') || text.includes('fórum')
      }
      if (activityFilter === 'operacoes') {
        return cat.includes('operação') || text.includes('fibra') || text.includes('rádio') || text.includes('infraestrutura') || text.includes('enlace')
      }
      if (activityFilter === 'institucional') {
        return cat.includes('institucional') || text.includes('estudantes') || text.includes('visita') || text.includes('jovens')
      }
      return true
    })
  }, [dailyActivities, activityFilter])


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

        {/* 1. HERO CORPORATIVO PREMIUM */}
        <section className="relative pt-28 pb-18 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white overflow-hidden border-b border-slate-800">
          <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />
          <div className="absolute top-1/4 right-10 w-96 h-96 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-10 left-10 w-80 h-80 bg-secondary/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative max-w-7xl mx-auto px-6">
            
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-6 uppercase tracking-wider">
              <Link href="/" className="hover:text-white transition">
                Início
              </Link>
              <ChevronRight className="h-3.5 w-3.5 text-slate-600" />
              <span className="text-primary font-bold">Projetos &amp; Atividades</span>
            </div>

            {/* Título e Subtítulo */}
            <div className="grid lg:grid-cols-12 gap-10 items-end">
              <div className="lg:col-span-8 space-y-4">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-primary/20 border border-primary/40 text-primary-300 rounded-full text-xs font-black uppercase tracking-wider">
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                  <span>Portfólio de Engenharia &amp; Atividades no Terreno</span>
                </div>

                <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-white leading-[1.1] uppercase">
                  Projetos &amp; <span className="text-primary">Atividades</span> Técnicas
                </h1>

                <p className="text-sm sm:text-base md:text-lg text-slate-300 max-w-2xl leading-relaxed">
                  Conheça os projetos corporativos e casos de sucesso da ARKNET em Angola: infraestruturas de redes estruturadas, telecomunicações simétricas, cibersegurança avançada, centros de dados e o registo das nossas atividades, formações e presenças públicas.
                </p>
              </div>

              {/* Quick CTAs */}
              <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3 justify-end">
                <Link
                  href="/#contacto"
                  className="inline-flex items-center justify-center gap-2.5 px-6 py-4 bg-primary hover:bg-primary/90 text-white text-xs font-extrabold uppercase tracking-wider rounded-xl shadow-lg transition"
                >
                  <PhoneCall className="h-4 w-4" />
                  <span>Solicitar Proposta Técnica</span>
                </Link>

                <a
                  href="https://wa.me/244975669357?text=Olá%20ARKNET!%20Gostaria%20de%20consultar%20a%20vossa%20equipa%20técnica%20sobre%20um%20novo%20projeto."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold uppercase tracking-wider rounded-xl backdrop-blur-md transition"
                >
                  <span>Falar com Engenheiro no WhatsApp</span>
                  <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            </div>

            {/* 2. BARRA DE MÉTRICAS DE IMPACTO DA ARKNET */}
            <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-4 p-5 sm:p-6 bg-slate-900/90 border border-slate-800 rounded-2xl backdrop-blur-xl shadow-2xl">
              
              <div className="flex items-center gap-3.5 p-2">
                <div className="p-3 bg-primary/20 text-primary rounded-xl shrink-0">
                  <Award className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-2xl sm:text-3xl font-black text-white font-mono">+50</p>
                  <p className="text-xs text-slate-400 font-medium">Projetos Implementados</p>
                </div>
              </div>

              <div className="flex items-center gap-3.5 p-2 border-l border-slate-800/80">
                <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-xl shrink-0">
                  <MapPin className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-2xl sm:text-3xl font-black text-white font-mono">18</p>
                  <p className="text-xs text-slate-400 font-medium">Províncias com Atuação</p>
                </div>
              </div>

              <div className="flex items-center gap-3.5 p-2 border-t md:border-t-0 md:border-l border-slate-800/80">
                <div className="p-3 bg-blue-500/20 text-blue-400 rounded-xl shrink-0">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-2xl sm:text-3xl font-black text-white font-mono">99.9%</p>
                  <p className="text-xs text-slate-400 font-medium">SLA de Disponibilidade</p>
                </div>
              </div>

              <div className="flex items-center gap-3.5 p-2 border-t md:border-t-0 border-l border-slate-800/80">
                <div className="p-3 bg-amber-500/20 text-amber-400 rounded-xl shrink-0">
                  <Users className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-2xl sm:text-3xl font-black text-white font-mono">+120</p>
                  <p className="text-xs text-slate-400 font-medium">Clientes Corporativos</p>
                </div>
              </div>

            </div>

          </div>
        </section>

        {/* 3. CARROSSEL DINÂMICO DE PROJETOS EM DESTAQUE */}
        <ProjectsFeaturedCarousel projects={projects} />

        {/* 5. BLOG DE NOTÍCIAS & ATIVIDADES EM DESTAQUE (RÁDIO, FORMAÇÕES, PALESTRAS) */}
        <section id="blog-atividades" className="py-24 bg-gradient-to-b from-slate-100 via-slate-50 to-white text-slate-900 relative overflow-hidden border-y border-slate-200/90">
          {/* Luzes Suaves e Malha Geométrica de Fundo */}
          <div className="absolute inset-0 bg-[radial-gradient(#94a3b8_1px,transparent_1px)] [background-size:24px_24px] opacity-25 pointer-events-none" />
          <div className="absolute top-10 left-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none animate-pulse" style={{ animationDuration: '6s' }} />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-secondary/15 rounded-full blur-3xl pointer-events-none animate-pulse" style={{ animationDuration: '8s' }} />

          <div className="max-w-7xl mx-auto px-6 space-y-12 relative z-10">
            
            {/* Cabeçalho Editorial do Blog */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-200">
              <div className="space-y-3 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-primary/10 text-primary border border-primary/20 rounded-full text-xs font-black uppercase tracking-wider shadow-2xs">
                  <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
                  <span>Notícias, Rádio &amp; Academia</span>
                </div>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 uppercase tracking-tight leading-[1.1]">
                  Blog de <span className="text-primary">Notícias</span> &amp; Atividades
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                  Acompanhe a participação da ARKNET em programas de rádio, oficinas técnicas da nossa academia, palestras do sector, parcerias universitárias e operações diárias de engenharia no terreno.
                </p>
              </div>

              {/* Contador de Notícias em Destaque */}
              <div className="bg-white/95 border border-slate-200/90 shadow-md backdrop-blur-md p-4 rounded-2xl flex items-center gap-4 shrink-0 hover:shadow-lg transition-shadow">
                <div className="p-3 bg-primary/10 text-primary rounded-xl shrink-0">
                  <Activity className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-2xl font-mono font-black text-slate-900">{filteredDailyActivities.length}</p>
                  <p className="text-[11px] text-slate-500 uppercase font-bold tracking-wide">Publicações Ativas</p>
                </div>
              </div>
            </div>

            {/* Filtros Editoriais com Animação de Botões */}
            <div className="flex flex-wrap items-center gap-2.5">
              {[
                { id: 'all', label: 'Todas as Notícias' },
                { id: 'radio', label: 'Rádio & Imprensa' },
                { id: 'formacoes', label: 'Formações & Academia' },
                { id: 'eventos', label: 'Eventos & Palestras' },
                { id: 'operacoes', label: 'Operações Técnicas' },
                { id: 'institucional', label: 'Institucional' },
              ].map((filterTab) => {
                const isActive = activityFilter === filterTab.id
                return (
                  <button
                    key={filterTab.id}
                    type="button"
                    onClick={() => setActivityFilter(filterTab.id as any)}
                    className={`px-4.5 py-2.5 text-xs font-black uppercase rounded-full transition-all duration-300 border cursor-pointer ${
                      isActive
                        ? 'bg-primary text-white border-primary shadow-lg shadow-primary/25 scale-105 ring-2 ring-primary/20'
                        : 'bg-white text-slate-600 border-slate-200/90 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300 shadow-2xs hover:scale-102'
                    }`}
                  >
                    {filterTab.label}
                  </button>
                )
              })}
            </div>

            {/* Grelha Animada de Artigos do Blog (Cards Azuis) */}
            <motion.div
              layout
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7"
            >
              <AnimatePresence mode="popLayout">
                {filteredDailyActivities.map((act) => {
                  return (
                    <motion.article
                      key={act.id}
                      layout
                      initial={{ opacity: 0, scale: 0.93, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.93, y: 20 }}
                      transition={{ duration: 0.35, ease: 'easeOut' }}
                      whileHover={{ y: -7, transition: { duration: 0.25 } }}
                      onClick={() => setSelectedActivity(act)}
                      className="bg-gradient-to-b from-slate-900 via-slate-900 to-[#0b1b36] border border-slate-800 hover:border-primary/60 rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl hover:shadow-primary/20 transition-all duration-300 flex flex-col group cursor-pointer relative"
                    >
                      {/* Efeito sutil de brilho interno no hover */}
                      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                      {/* Imagem de Capa do Artigo com Zoom Suave */}
                      <div className="relative aspect-16/10 overflow-hidden bg-slate-950">
                        <img
                          src={act.image}
                          alt={act.title}
                          className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/30 to-transparent" />
                        
                        {/* Badge Categoria */}
                        <div className="absolute top-3.5 left-3.5">
                          <span className="px-3 py-1.5 bg-primary text-white text-[10px] font-black uppercase tracking-wider rounded-xl shadow-md border border-white/10 backdrop-blur-md">
                            {act.category || 'Notícia'}
                          </span>
                        </div>
                      </div>

                      {/* Corpo do Artigo */}
                      <div className="p-6 flex flex-col flex-1 justify-between space-y-4">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                            <span className="flex items-center gap-1.5 text-slate-300 font-medium">
                              <MapPin className="h-3.5 w-3.5 text-secondary shrink-0" />
                              <span className="truncate max-w-[170px]">{act.clientOrLocation || 'Luanda'}</span>
                            </span>
                            <span>{act.date}</span>
                          </div>

                          <h3 className="text-base sm:text-lg font-black text-white group-hover:text-primary-300 transition-colors line-clamp-2 leading-snug">
                            {act.title}
                          </h3>

                          <p className="text-xs sm:text-[13px] text-slate-300 line-clamp-3 leading-relaxed font-normal">
                            {act.description}
                          </p>
                        </div>
                      </div>
                    </motion.article>
                  )
                })}
              </AnimatePresence>
            </motion.div>

            {filteredDailyActivities.length === 0 && (
              <div className="py-16 text-center bg-white border border-slate-200 rounded-3xl p-8 shadow-xs">
                <p className="text-slate-800 font-black text-base">Nenhuma publicação encontrada para esta editoria.</p>
                <p className="text-slate-500 text-xs mt-1">Consulte as outras categorias editoriais para ver mais atividades.</p>
                <button
                  type="button"
                  onClick={() => setActivityFilter('all')}
                  className="mt-4 px-6 py-2.5 bg-primary text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-md hover:bg-primary/90 transition cursor-pointer"
                >
                  Ver Todas as Notícias
                </button>
              </div>
            )}

            {/* Rodapé Informativo do Blog */}
            <div className="p-6 bg-white border border-slate-200/90 rounded-3xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-slate-600">
              <span className="flex items-center gap-3 leading-relaxed font-medium">
                <Sparkles className="h-4.5 w-4.5 text-primary shrink-0" />
                Comprometidos com a partilha de conhecimento, a capacitação de talentos e a evolução tecnológica de Angola.
              </span>
              <span className="text-[11px] font-mono text-slate-400 font-bold uppercase tracking-widest shrink-0">
                ARKNET Comunicação &amp; Engenharia
              </span>
            </div>

          </div>
        </section>

        {/* 6. METODOLOGIA DE ENGENHARIA ARKNET (CICLO DE VIDA DO PROJETO) */}
        <section className="py-20 max-w-7xl mx-auto px-6 space-y-12">
          
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-black uppercase tracking-widest text-primary">Rigor &amp; Padrões Internacionais</span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 uppercase tracking-tight">
              Como Desenvolvemos os Nossos Projetos
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Metodologia estruturada em 4 etapas para garantir conformidade técnica, alta disponibilidade e segurança operacional desde o primeiro dia.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-4 hover:border-primary transition">
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center font-black text-lg font-mono">
                01
              </div>
              <h3 className="text-base font-black text-slate-900">
                Diagnóstico &amp; Levantamento
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Inspeção minuciosa no terreno, análise de requisitos de tráfego, estudo de viabilidade óptica/rádio e mapeamento de riscos.
              </p>
            </div>

            <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-4 hover:border-primary transition">
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center font-black text-lg font-mono">
                02
              </div>
              <h3 className="text-base font-black text-slate-900">
                Engenharia &amp; Arquitetura
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Desenho de diagramas de rede, dimensionamento de redundância, topologias de segurança NGFW e seleção de equipamentos certificados.
              </p>
            </div>

            <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-4 hover:border-primary transition">
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center font-black text-lg font-mono">
                03
              </div>
              <h3 className="text-base font-black text-slate-900">
                Execução &amp; Certificação
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Lançamento de cabos, fusões de fibra, montagem de racks, configuração de switches e certificação formal de cada ponto de rede.
              </p>
            </div>

            <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-4 hover:border-primary transition">
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center font-black text-lg font-mono">
                04
              </div>
              <h3 className="text-base font-black text-slate-900">
                Operação Contínua &amp; Suporte 24/7
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Monitorização contínua de latência e nós ativos, planos de resposta rápida a incidentes e relatórios mensais de desempenho.
              </p>
            </div>

          </div>

        </section>

        {/* 7. BANNER DE SUBSCRIÇÃO DA PÁGINA DE PUBLICAÇÕES */}
        <section className="py-12 max-w-7xl mx-auto px-6">
          <div className="relative overflow-hidden bg-gradient-to-r from-slate-950 via-slate-900 to-primary-950 border border-slate-800 p-8 md:p-12 rounded-3xl shadow-2xl text-white grid md:grid-cols-12 gap-8 items-center">
            <div className="absolute right-0 top-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

            <div className="md:col-span-7 space-y-4">
              <span className="text-xs font-bold uppercase tracking-widest text-primary bg-primary/20 px-3 py-1 rounded-full inline-block border border-primary/30">
                Acompanhe os Nossos Projetos
              </span>
              <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tight leading-snug">
                Receba novas publicações técnicas e novidades de engenharia
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                Mantenha-se informado sobre novos projetos corporativos, ampliações de redes e soluções inovadoras implementadas pela ARKNET em Angola.
              </p>
            </div>

            <div className="md:col-span-5">
              {newsletterSuccess ? (
                <div className="p-4 bg-emerald-950 border border-emerald-500/40 text-emerald-300 rounded-2xl text-xs font-bold flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                  <span>Subscrição efetuada! Passará a receber os relatórios de novas atividades.</span>
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
                    className="w-full py-3.5 bg-primary hover:bg-primary/90 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
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

      {/* MODAL EDITORIAL DE LEITURA DO ARTIGO / NOTÍCIA (SEM BOTÃO DE VENDAS OU SOLICITAÇÃO) */}
      {selectedActivity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 text-white rounded-3xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col">
            <button
              onClick={() => setSelectedActivity(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-950/80 hover:bg-slate-800 text-white transition z-10 cursor-pointer"
              title="Fechar artigo"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Imagem de Destaque com Categoria */}
            <div className="relative aspect-16/9 bg-black shrink-0">
              <img
                src={selectedActivity.image}
                alt={selectedActivity.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
              
              <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-primary text-white text-[10px] font-black uppercase rounded-lg shadow-md">
                  {selectedActivity.category || 'Atividade em Destaque'}
                </span>
                <span className="px-3 py-1 bg-slate-950/80 backdrop-blur-md text-white text-[10px] font-mono rounded-lg border border-white/10">
                  {selectedActivity.date} {selectedActivity.time ? `• ${selectedActivity.time}` : ''}
                </span>
              </div>
            </div>

            {/* Conteúdo do Artigo */}
            <div className="p-6 sm:p-8 space-y-5 overflow-y-auto">
              <div>
                {/* Linha de Autor & Local */}
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 font-mono mb-2">
                  <span className="text-primary font-bold">
                    {selectedActivity.author || 'Comunicação ARKNET'}
                  </span>
                  {selectedActivity.clientOrLocation && (
                    <>
                      <span>•</span>
                      <span className="text-amber-400 flex items-center gap-1 font-semibold">
                        <MapPin className="h-3 w-3" />
                        {selectedActivity.clientOrLocation}
                      </span>
                    </>
                  )}
                </div>

                <h3 className="text-xl sm:text-2xl font-black text-white leading-snug">
                  {selectedActivity.title}
                </h3>
              </div>

              {/* Texto da Notícia / Reportagem */}
              <div className="space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-slate-800/80 pt-4">
                <p className="font-medium text-slate-200 text-sm">
                  {selectedActivity.description}
                </p>

                {selectedActivity.content && selectedActivity.content !== selectedActivity.description && (
                  <p className="text-slate-300 whitespace-pre-line">
                    {selectedActivity.content}
                  </p>
                )}
              </div>

              {/* Tags Editoriais */}
              {selectedActivity.tags && selectedActivity.tags.length > 0 && (
                <div className="pt-3 border-t border-slate-800/80 flex flex-wrap gap-2">
                  {selectedActivity.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 bg-slate-800 border border-slate-700 text-slate-300 text-[11px] font-mono rounded-lg"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Rodapé Editorial com Apenas o Botão de Fechar / Voltar (Sem Vendas) */}
              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[11px] font-mono text-slate-500">
                  Publicado no portal oficial de notícias ARKNET
                </span>

                <button
                  onClick={() => setSelectedActivity(null)}
                  className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase rounded-xl transition cursor-pointer"
                >
                  Voltar às Notícias
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <Footer />

    </main>
  )
}
