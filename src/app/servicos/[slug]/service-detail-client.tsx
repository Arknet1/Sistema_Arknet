'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowRight,
  ChevronRight,
  CheckCircle2,
  Cpu,
  Wrench,
  Laptop,
  Cable,
  Camera,
  ShieldCheck,
  Workflow,
  Sparkles,
  Layers,
  Building2,
  Check,
  PhoneCall,
  FileCheck2,
  Wrench as WrenchIcon,
  ChevronDown,
  HelpCircle,
  Zap,
} from 'lucide-react'
import { FaWhatsapp } from 'react-icons/fa'
import { mockServices } from '@/lib/mock-data'
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

const standardSteps = [
  {
    step: '01',
    title: 'Contacto & Diagnóstico Inicial',
    description: 'Recebemos o seu pedido de cotação ou agendamento de visita técnica para levantar as necessidades específicas da sua infraestrutura.',
    icon: PhoneCall,
  },
  {
    step: '02',
    title: 'Análise Técnica & Dimensionamento',
    description: 'A nossa equipa de engenheiros analisa o ambiente, projeta a arquitetura ideal e dimensiona os equipamentos com o melhor custo-benefício.',
    icon: FileCheck2,
  },
  {
    step: '03',
    title: 'Apresentação de Proposta Comercial',
    description: 'Apresentamos uma proposta transparente com prazos, cronograma de execução e Acordos de Nível de Serviço (SLA) claramente definidos.',
    icon: CheckCircle2,
  },
  {
    step: '04',
    title: 'Implementação & Suporte 24/7',
    description: 'Executamos o projeto com equipas certificadas e garantimos monitorização contínua, manutenção e assistência técnica permanente.',
    icon: WrenchIcon,
  },
]

export default function ServiceDetailClient({ slug }: { slug: string }) {
  const service = mockServices.find((s) => s.slug === slug) || mockServices[0]
  const Icon = serviceIcons[service.icon] || Cpu

  const [openFaq, setOpenFaq] = useState<number | null>(0)

  // Suggest 3 other services from the same category or remaining catalog
  const otherServices = mockServices
    .filter((s) => s.slug !== service.slug)
    .sort((a, b) => (a.category === service.category ? -1 : 1))
    .slice(0, 3)

  const detailedBenefits = service.detailedBenefits || [
    { title: 'Velocidade e Estabilidade', desc: 'Desempenho garantido sem oscilações em picos de tráfego.' },
    { title: 'Suporte Local 24/7', desc: 'Apoio técnico permanente com engenheiros certificados no terreno.' },
    { title: 'Escalabilidade ao Negócio', desc: 'Arquitetura flexível pronta para acompanhar o crescimento da empresa.' },
  ]

  const serviceFaqs = service.faqs || [
    { q: 'Qual é o tempo de resposta após a solicitação deste serviço?', a: 'A nossa equipa responde em menos de 24 horas úteis para agendar a avaliação técnica inicial.' },
    { q: 'Como é garantido o SLA deste serviço?', a: 'O SLA é acordado contratualmente com garantias formais de tempo de paragem máximo e suporte prioritário.' },
  ]

  return (
    <main className="min-h-screen bg-slate-50">
      {/* 1. Hero do Serviço com Botão Direto */}
      <section className="pt-32 pb-20 bg-slate-950 text-white relative overflow-hidden border-b border-slate-800">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb de navegação" className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-400 mb-6 uppercase tracking-wider">
            <Link href="/" className="hover:text-white transition">
              Início
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-slate-600" aria-hidden="true" />
            <Link href="/servicos" className="hover:text-white transition">
              Serviços
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-slate-600" aria-hidden="true" />
            <span className="text-primary font-bold" aria-current="page">{service.name}</span>
          </nav>

          <div className="grid lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-8">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs font-bold uppercase tracking-widest mb-4">
                <Sparkles className="h-3.5 w-3.5" />
                {service.category || 'Solução Empresarial'}
              </span>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-[1.1] tracking-tight">
                {service.name}
              </h1>

              <p className="mt-4 text-base sm:text-xl text-slate-200 font-semibold leading-relaxed">
                {service.tagline || service.description}
              </p>

              <p className="mt-4 text-xs sm:text-sm text-slate-400 leading-relaxed max-w-2xl">
                {service.description}
              </p>

              {/* Botões do Hero Topo */}
              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  href={`/?servico=${encodeURIComponent(service.name)}#contacto`}
                  className="inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-secondary hover:bg-secondary/90 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-secondary/20 transition"
                >
                  <span>Solicitar este serviço</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <a
                  href="https://wa.me/244935208449"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2.5 px-6 py-4 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white font-bold text-xs uppercase tracking-wider transition"
                >
                  <FaWhatsapp className="h-4 w-4 text-green-500" />
                  <span>Dúvidas Técnicas</span>
                </a>
              </div>
            </div>

            {/* Caixa Representativa / Ilustrativa */}
            <div className="lg:col-span-4 flex justify-center lg:justify-end">
              <div className="relative p-10 bg-slate-900 border border-slate-800 text-white rounded-2xl shadow-2xl text-center flex flex-col items-center w-full max-w-sm">
                <div className="p-6 bg-primary text-white rounded-xl mb-4 shadow-lg">
                  <Icon className="h-16 w-16" />
                </div>
                <p className="text-xs font-mono text-secondary uppercase font-bold tracking-widest">
                  Engenharia ARKNET
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  SLA Garantido & Suporte 24/7
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Conteúdo Principal do Serviço */}
      <section className="py-20 max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-12 gap-12">
          {/* Coluna Principal (8 Colunas) */}
          <div className="lg:col-span-8 space-y-16">

            {/* 2. O que inclui */}
            <div className="bg-white p-8 sm:p-10 border border-slate-200 shadow-xs rounded-2xl">
              <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                <div className="p-2.5 bg-primary/10 text-primary rounded-lg">
                  <Layers className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900">
                    O que inclui este serviço
                  </h2>
                  <p className="text-xs text-slate-500">
                    Cobertura técnica objetiva incluída na proposta
                  </p>
                </div>
              </div>

              <ul className="space-y-4">
                {service.includes.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-slate-700 bg-slate-50 p-4 border border-slate-200/80 rounded-xl">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="leading-relaxed font-medium">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 3. Para quem é */}
            <div className="bg-white p-8 sm:p-10 border border-slate-200 shadow-xs rounded-2xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 bg-secondary/10 text-secondary rounded-lg">
                  <Building2 className="h-5 w-5" />
                </div>
                <h2 className="text-xl font-extrabold text-slate-900">
                  Para quem é este serviço
                </h2>
              </div>

              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50 p-6 border-l-4 border-secondary rounded-r-xl font-medium">
                {service.targetAudience}
              </p>
            </div>

            {/* 4. Benefícios Principais (3 Cartões) */}
            <div className="bg-white p-8 sm:p-10 border border-slate-200 shadow-xs rounded-2xl">
              <div className="mb-6 border-b border-slate-100 pb-4">
                <h2 className="text-xl font-extrabold text-slate-900">
                  Benefícios Estratégicos
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Vantagens diretas para a sua operação
                </p>
              </div>

              <div className="grid sm:grid-cols-3 gap-6">
                {detailedBenefits.map((bItem, bIdx) => (
                  <div key={bIdx} className="bg-slate-50 border border-slate-200 p-5 rounded-xl flex flex-col justify-between">
                    <div>
                      <div className="p-2 w-fit bg-primary/10 text-primary rounded-md mb-3">
                        <Zap className="h-4 w-4" />
                      </div>
                      <h3 className="font-bold text-slate-900 text-sm mb-2">
                        {bItem.title}
                      </h3>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {bItem.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 5. Como Funciona (Passos) */}
            <div className="bg-white p-8 sm:p-10 border border-slate-200 shadow-xs rounded-2xl">
              <div className="mb-8 border-b border-slate-100 pb-4">
                <h2 className="text-xl font-extrabold text-slate-900">
                  Como funciona a contratação e implementação
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Processo simples e transparente em 4 passos
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                {standardSteps.map((stepItem, idx) => {
                  const StepIcon = stepItem.icon
                  return (
                    <div key={idx} className="p-6 bg-slate-50 border border-slate-200 rounded-xl relative overflow-hidden">
                      <span className="absolute top-3 right-3 text-4xl font-black text-slate-200/60 select-none">
                        {stepItem.step}
                      </span>
                      <div className="p-2.5 w-fit bg-slate-900 text-white mb-4 rounded-lg relative z-10">
                        <StepIcon className="h-5 w-5" />
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 mb-2 relative z-10">
                        {stepItem.title}
                      </h3>
                      <p className="text-xs text-slate-600 leading-relaxed relative z-10">
                        {stepItem.description}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* 6. Perguntas Frequentes Específicas do Serviço */}
            <div className="bg-white p-8 sm:p-10 border border-slate-200 shadow-xs rounded-2xl">
              <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                <div className="p-2.5 bg-primary/10 text-primary rounded-lg">
                  <HelpCircle className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900">
                    Perguntas Frequentes sobre {service.name}
                  </h2>
                  <p className="text-xs text-slate-500">
                    Dúvidas técnicas específicas sobre este serviço
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {serviceFaqs.map((faq, idx) => {
                  const isOpen = openFaq === idx
                  return (
                    <div
                      key={idx}
                      className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden transition"
                    >
                      <button
                        type="button"
                        onClick={() => setOpenFaq(isOpen ? null : idx)}
                        className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-slate-900 text-xs sm:text-sm hover:text-primary transition"
                      >
                        <span>{faq.q}</span>
                        <ChevronDown
                          className={`h-4 w-4 text-slate-400 shrink-0 transition-transform duration-200 ${
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
                            <div className="px-5 pb-5 text-xs text-slate-600 leading-relaxed border-t border-slate-200/60 pt-3">
                              {faq.a}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )
                })}
              </div>
            </div>

          </div>

          {/* 7. Coluna Lateral Fixo / Sticky CTA Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-slate-900 text-white p-8 border border-slate-800 rounded-2xl shadow-xl sticky top-28">
              <span className="text-[11px] font-bold uppercase tracking-widest text-secondary block mb-2">
                Solicitação Direta
              </span>
              <h3 className="text-2xl font-bold text-white mb-3">
                Interessado em {service.name}?
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-6">
                Clique abaixo para abrir o formulário comercial. O serviço virá automaticamente pré-selecionado para agilizar o atendimento.
              </p>

              <Link
                href={`/?servico=${encodeURIComponent(service.name)}#contacto`}
                className="w-full flex items-center justify-center gap-2 py-4 bg-secondary hover:bg-secondary/90 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-secondary/20 transition mb-4 rounded-lg"
              >
                <span>Solicitar este serviço</span>
                <ArrowRight className="h-4 w-4" />
              </Link>

              <a
                href="https://wa.me/244935208449"
                target="_blank"
                rel="noreferrer"
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-green-600 hover:bg-green-700 text-white font-bold text-xs uppercase tracking-wider transition rounded-lg"
              >
                <FaWhatsapp className="h-4 w-4" />
                <span>Atendimento via WhatsApp</span>
              </a>

              {/* Guarantees List */}
              <div className="mt-6 pt-6 border-t border-slate-800 space-y-3">
                <div className="flex items-center gap-2 text-xs text-slate-300 font-medium">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Proposta comercial em menos de 24h</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-300 font-medium">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>SLA contratual garantido</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-300 font-medium">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Técnicos certificados no terreno</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Serviços Relacionados */}
      <section className="py-16 bg-slate-100 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
            <div>
              <p className="text-xs font-bold text-secondary uppercase tracking-[0.2em]">
                — Continue a Navegar
              </p>
              <h2 className="text-2xl font-extrabold text-slate-900 mt-1">
                Serviços Relacionados
              </h2>
            </div>
            <Link
              href="/servicos"
              className="text-xs font-bold text-primary hover:underline uppercase tracking-wider flex items-center gap-1.5"
            >
              <span>Ver todos os serviços</span>
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {otherServices.map((otherSrv) => {
              const OtherIcon = serviceIcons[otherSrv.icon] || Cpu
              return (
                <Link
                  key={otherSrv.id}
                  href={`/servicos/${otherSrv.slug}`}
                  className="group bg-white p-6 border border-slate-200 hover:border-primary/50 rounded-xl shadow-2xs hover:shadow-md transition flex flex-col justify-between"
                >
                  <div>
                    <div className="p-3 w-fit bg-slate-900 text-white group-hover:bg-primary transition-colors rounded-lg mb-4">
                      <OtherIcon className="h-5 w-5" />
                    </div>
                    <h3 className="font-bold text-slate-900 text-base group-hover:text-primary transition-colors mb-2">
                      {otherSrv.name}
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                      {otherSrv.tagline || otherSrv.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-700 group-hover:text-primary">
                    <span>Ver detalhes</span>
                    <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
