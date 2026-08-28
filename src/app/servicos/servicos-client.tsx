'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowRight,
  ChevronRight,
  Cpu,
  Wrench,
  Laptop,
  Cable,
  Camera,
  ShieldCheck,
  Workflow,
  Sparkles,
  CheckCircle2,
  Headset,
  Award,
  Users,
  Activity,
  PhoneCall,
  FileCheck2,
  Wrench as WrenchIcon,
  ChevronDown,
  HelpCircle,
  Quote,
  Filter,
} from 'lucide-react'
import { FaWhatsapp } from 'react-icons/fa'
import { mockServices, mockTestimonials } from '@/lib/mock-data'
import Footer from '@/components/footer'

const serviceIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  Cpu: Cpu,
  Wrench: Wrench,
  Laptop: Laptop,
  Cable: Cable,
  Camera: Camera,
  ShieldCheck: ShieldCheck,
  Workflow: Workflow,
}

const trustMetrics = [
  { icon: Headset, label: 'Suporte Técnico 24/7' },
  { icon: Award, label: 'Empresa Certificada' },
  { icon: Users, label: '+500 Clientes Atendidos' },
  { icon: Activity, label: '99.9% SLA Garantido' },
]

const categories = ['Todos', 'Conectividade', 'Cloud & Infraestrutura', 'Segurança', 'Consultoria']

const processSteps = [
  {
    step: '01',
    title: 'Contacto Inicial',
    desc: 'Rececionamos o seu pedido e compreendemos os desafios tecnológicos do seu negócio.',
    icon: PhoneCall,
  },
  {
    step: '02',
    title: 'Diagnóstico Técnico',
    desc: 'A nossa equipa efetua um levantamento minucioso do ambiente e auditoria de requisitos.',
    icon: FileCheck2,
  },
  {
    step: '03',
    title: 'Proposta Personalizada',
    desc: 'Desenhamos uma arquitetura sob medida com SLA claro, prazos e orçamento transparente.',
    icon: CheckCircle2,
  },
  {
    step: '04',
    title: 'Implementação & Suporte 24/7',
    desc: 'Instalação realizada por engenheiros certificados com acompanhamento e suporte permanente.',
    icon: WrenchIcon,
  },
]

const generalFaqs = [
  {
    question: 'Qual é o tempo médio de resposta após a solicitação de uma proposta?',
    answer: 'Em menos de 24 horas úteis, a nossa equipa comercial e de engenharia entra em contacto para agendar o diagnóstico inicial ou apresentar a proposta técnica.',
  },
  {
    question: 'A ARKNET presta serviços fora da província de Luanda?',
    answer: 'Sim! Atuamos em todo o território nacional angolano, contando com equipas móveis no terreno e parceiros estratégicos nas principais províncias.',
  },
  {
    question: 'Os serviços empresariais possuem contrato de fidelização e SLA garantido?',
    answer: 'Todos os nossos serviços empresariais contam com SLA (Acordo de Nível de Serviço) de disponibilidade contratual de até 99.9%, além de planos contratuais flexíveis ajustados ao tamanho do seu negócio.',
  },
  {
    question: 'Como funciona o suporte técnico pós-instalação?',
    answer: 'Disponibilizamos apoio técnico dedicado 24 horas por dia, 7 dias por semana, através da nossa linha direta corporativa, WhatsApp de engenharia e atendimento presencial de emergência.',
  },
]

export default function ServicosListingClient() {
  const [activeCategory, setActiveCategory] = useState('Todos')
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  const filteredServices = activeCategory === 'Todos'
    ? mockServices
    : mockServices.filter((s) => s.category === activeCategory)

  return (
    <main className="min-h-screen bg-slate-50">
      {/* 1. Hero da Página de Serviços com Barra de Confiança */}
      <section className="pt-32 pb-16 bg-slate-950 text-white relative overflow-hidden border-b border-slate-800">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-6 uppercase tracking-wider">
            <Link href="/" className="hover:text-white transition">
              Início
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-slate-600" />
            <span className="text-primary font-bold">Serviços</span>
          </div>

          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs font-bold uppercase tracking-widest mb-4">
              <Sparkles className="h-3.5 w-3.5" />
              Soluções Tecnológicas ARKNET
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-[1.1] tracking-tight">
              Soluções completas para o seu negócio
            </h1>
            <p className="mt-6 text-base sm:text-lg text-slate-300 leading-relaxed">
              Explore as nossas áreas de atuação em telecomunicações, computação em nuvem, cibersegurança e infraestruturas tecnológicas com SLA garantido em Angola.
            </p>
          </div>

          {/* Barra de Credibilidade / Métricas */}
          <div className="mt-14 pt-8 border-t border-slate-800/80 grid grid-cols-2 md:grid-cols-4 gap-4">
            {trustMetrics.map((item, idx) => {
              const MetricIcon = item.icon
              return (
                <div key={idx} className="flex items-center gap-3 bg-white/5 border border-white/10 p-3.5 rounded-xl">
                  <div className="p-2 bg-primary/20 text-primary rounded-lg shrink-0">
                    <MetricIcon className="h-4 w-4" />
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-slate-200">
                    {item.label}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* 2. Filtro por Categoria & Grelha de Serviços */}
      <section className="py-20 max-w-7xl mx-auto px-6">
        {/* Header do Catálogo */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end md:justify-between gap-6 border-b border-slate-200 pb-8">
          <div>
            <p className="text-xs font-bold text-secondary uppercase tracking-[0.25em] mb-2">
              — Catálogo Especializado
            </p>
            <h2 className="text-3xl font-extrabold text-slate-900">
              Áreas de Atuação Técnica
            </h2>
          </div>
          <p className="text-sm text-slate-500 max-w-sm">
            Filtre por categoria e descubra os serviços adequados às necessidades operacionais da sua empresa.
          </p>
        </div>

        {/* Separadores de Filtro (Tabs) */}
        <div className="flex flex-wrap gap-2.5 mb-12">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all duration-200 ${
                activeCategory === cat
                  ? 'bg-primary text-white shadow-md shadow-primary/20'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* 3. Grelha de Cartões de Serviço Enriquecidos */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {filteredServices.map((service, index) => {
            const Icon = serviceIcons[service.icon] || Cpu
            const number = String(index + 1).padStart(2, '0')
            const bullets = service.bullets || []

            return (
              <motion.article
                key={service.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.35, delay: index * 0.05 }}
                className="group bg-white border border-slate-200 hover:border-primary/50 hover:shadow-xl transition-all duration-300 flex flex-col justify-between p-8 relative overflow-hidden rounded-2xl h-full"
              >
                {/* Top Accent Hover */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />

                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="p-3.5 bg-slate-900 text-white group-hover:bg-primary transition-colors duration-300 rounded-xl">
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 bg-slate-100 text-primary rounded-md border border-slate-200">
                      {service.category || 'Empresarial'}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-primary transition-colors">
                    {service.name}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6 line-clamp-2">
                    {service.tagline || service.description}
                  </p>

                  {/* 2-3 Quick Bullets */}
                  <div className="space-y-2 mb-6 pt-4 border-t border-slate-100">
                    {bullets.map((bItem, bIdx) => (
                      <div key={bIdx} className="flex items-center gap-2 text-xs text-slate-700 font-medium">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                        <span>{bItem}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-5 border-t border-slate-100 flex items-center justify-between">
                  <Link
                    href={`/servicos/${service.slug}`}
                    className="inline-flex items-center gap-2 text-xs font-bold text-slate-900 group-hover:text-primary uppercase tracking-wider transition"
                  >
                    <span>Ver detalhes</span>
                    <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                  </Link>

                  <span className="text-[11px] font-mono text-slate-400 font-semibold uppercase">
                    Módulo {number}
                  </span>
                </div>
              </motion.article>
            )
          })}
        </div>
      </section>

      {/* 4. Secção "Como Trabalhamos" (Passos do Processo Comercial) */}
      <section className="py-20 bg-slate-900 text-white border-y border-slate-800 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold text-secondary uppercase tracking-[0.25em] block mb-2">
              — Metodologia & Transparência
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              Como Trabalhamos
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-2">
              Processo comercial e técnico claro em 4 etapas para assegurar rigor e resultados imediatos.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {processSteps.map((stepItem, idx) => {
              const StepIcon = stepItem.icon
              return (
                <div
                  key={idx}
                  className="bg-slate-950/80 border border-slate-800 p-7 rounded-xl relative overflow-hidden flex flex-col justify-between group hover:border-primary/50 transition-all duration-300"
                >
                  <span className="absolute top-3 right-4 text-5xl font-black text-white/[0.04] select-none group-hover:text-primary/[0.08] transition-colors">
                    {stepItem.step}
                  </span>

                  <div>
                    <div className="p-3 w-fit bg-primary/20 text-primary mb-5 rounded-lg border border-primary/30">
                      <StepIcon className="h-5 w-5" />
                    </div>
                    <h3 className="text-base font-bold text-white mb-2">
                      {stepItem.title}
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {stepItem.desc}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-800/80 text-[10px] font-mono text-slate-500 uppercase">
                    Etapa 0{idx + 1}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* 5. Testemunhos Relacionados a Serviços */}
      <section className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <p className="text-xs font-bold text-secondary uppercase tracking-[0.25em] mb-2">
              — Prova Social & Experiência
            </p>
            <h2 className="text-3xl font-extrabold text-slate-900">
              O que dizem os nossos clientes de serviços
            </h2>
            <p className="text-sm text-slate-500 mt-2">
              Depoimentos reais de organizações que transformaram a sua infraestrutura com a ARKNET.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {mockTestimonials.slice(0, 3).map((tItem) => (
              <div
                key={tItem.id}
                className="bg-slate-50 border border-slate-200 p-8 flex flex-col justify-between rounded-xl shadow-2xs hover:shadow-md transition"
              >
                <div>
                  <Quote className="h-8 w-8 text-primary/30 mb-4" />
                  <p className="text-xs sm:text-sm text-slate-700 italic leading-relaxed mb-6">
                    "{tItem.testimonial}"
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-200">
                  <p className="font-bold text-sm text-slate-900">{tItem.clientName}</p>
                  <p className="text-xs text-primary font-semibold">{tItem.type}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. FAQ Curta (Perguntas Frequentes com Accordion) */}
      <section className="py-20 bg-slate-100/70 border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-14">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest mb-3">
              <HelpCircle className="h-3.5 w-3.5" />
              Esclarecimentos Rápidos
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900">
              Perguntas Frequentes
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-2">
              Respostas às dúvidas mais comuns sobre contratação, prazos e cobertura de serviços.
            </p>
          </div>

          <div className="space-y-4">
            {generalFaqs.map((faq, idx) => {
              const isOpen = openFaq === idx
              return (
                <div
                  key={idx}
                  className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs transition"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-6 text-left flex items-center justify-between gap-4 font-bold text-slate-900 text-sm sm:text-base hover:text-primary transition"
                  >
                    <span>{faq.question}</span>
                    <ChevronDown
                      className={`h-5 w-5 text-slate-400 shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-primary' : ''
                      }`}
                    />
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-6 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-4">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
