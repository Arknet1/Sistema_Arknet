'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import {
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  TrendingUp,
  Target,
  Eye,
  Award,
  Zap,
  Headphones,
  Building2,
  Quote,
  Sparkles,
  Handshake,
} from 'lucide-react'
import aboutOffice from '@/assets/office.jpeg'
import { mockAboutUs, mockWhyChooseUs, mockTestimonials } from '@/lib/mock-data'
import { CountUp } from '@/components/count-up'
import Footer from '@/components/footer'

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const

const whyIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  Zap: Zap,
  ShieldCheck: ShieldCheck,
  Headphones: Headphones,
  TrendingUp: TrendingUp,
  Clock: Clock,
  Award: Award,
}

export default function EmpresaClient() {
  const metrics = [
    { to: 10, suffix: '+', label: 'Anos no Mercado Angolano' },
    { to: 500, suffix: '+', label: 'Clientes & Projetos Satisfeitos' },
    { to: 7, suffix: '', label: 'Áreas de Especialização' },
    { to: 100, suffix: '%', label: 'Compromisso com a Qualidade' },
  ]

  return (
    <main className="min-h-screen bg-slate-50">
      {/* 1. Hero Header */}
      <section className="pt-32 pb-20 bg-slate-950 text-white relative overflow-hidden border-b border-slate-800">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-6 uppercase tracking-wider">
            <Link href="/" className="hover:text-white transition">
              Início
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-slate-600" />
            <span className="text-primary font-bold">Sobre a ARKNET</span>
          </div>

          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs font-bold uppercase tracking-widest mb-4">
              <Building2 className="h-3.5 w-3.5" />
              Institucional ARKNET
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-[1.1] tracking-tight">
              Inovação, conectividade e transformação digital
            </h1>
            <p className="mt-6 text-base sm:text-lg text-slate-300 leading-relaxed">
              Conheça a nossa trajetória, os valores que orientam as nossas soluções e o nosso compromisso com a modernização tecnológica de Angola.
            </p>
          </div>
        </div>
      </section>

      {/* 2. Institutional Overview & Image */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* Image Col */}
            <div className="md:col-span-5 relative order-2 md:order-1">
              <motion.div
                initial={{ clipPath: 'inset(0 100% 0 0)' }}
                whileInView={{ clipPath: 'inset(0 0% 0 0)' }}
                transition={{ duration: 0.9, ease: EASE_OUT_EXPO }}
                viewport={{ once: true }}
                className="relative h-[420px] md:h-[500px] overflow-hidden shadow-2xl border border-slate-200"
              >
                <Image
                  src={aboutOffice}
                  alt="Instalações e Equipa da ARKNET"
                  fill
                  className="object-cover"
                />
              </motion.div>

              <div className="absolute -bottom-6 -right-6 bg-primary text-white p-6 shadow-2xl hidden sm:block">
                <p className="text-4xl font-black">10+</p>
                <p className="text-xs font-medium text-white/80 uppercase tracking-wider mt-1">
                  Anos de experiência comprovada
                </p>
              </div>
            </div>

            {/* Text Col */}
            <div className="md:col-span-7 order-1 md:order-2 space-y-6">
              <p className="text-xs font-bold text-secondary uppercase tracking-[0.25em]">
                — A Nossa Essência
              </p>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 leading-[1.15]">
                Tecnologia de ponta pensada para a realidade do mercado angolano
              </h2>
              <p className="text-base text-slate-600 leading-relaxed">
                {mockAboutUs.institutionalText}
              </p>
              <p className="text-sm text-slate-500 leading-relaxed bg-slate-50 p-5 border-l-4 border-primary italic">
                "{mockAboutUs.presentationLetter}"
              </p>

              {/* Badges Grid */}
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 text-primary rounded">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-slate-800">
                    Certificação Internacional
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 text-primary rounded">
                    <Clock className="h-5 w-5" />
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-slate-800">
                    Suporte Técnico 24/7
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 text-primary rounded">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-slate-800">
                    Resposta em menos de 24h
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 text-primary rounded">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-slate-800">
                    Resultados Mensuráveis
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Metrics Counter Bar */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 bg-slate-900 text-white divide-y md:divide-y-0 md:divide-x divide-slate-800 overflow-hidden shadow-xl">
            {metrics.map((metric, idx) => (
              <div key={idx} className="p-8 text-center group hover:bg-primary transition-all duration-300">
                <p className="text-4xl sm:text-5xl font-black text-white">
                  <CountUp to={metric.to} suffix={metric.suffix} duration={1.8 + idx * 0.15} />
                </p>
                <p className="mt-2 text-xs sm:text-sm text-slate-400 group-hover:text-white/90 font-medium">
                  {metric.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Missão, Visão e Valores — Estrutura Clara com Valores Destacados */}
      <section className="py-20 bg-slate-50 text-slate-900 relative overflow-hidden border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          {/* Section Header */}
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest mb-3">
              <Sparkles className="h-3.5 w-3.5" />
              Propósito & Princípios
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
              Missão, Visão e Valores
            </h2>
            <p className="text-sm text-slate-500 mt-2">
              O alicerce que orienta cada projeto, intervenção técnica e parceria na ARKNET.
            </p>
          </div>

          {/* Top Block: Missão e Visão (2 Cards Principais) */}
          <div className="grid md:grid-cols-2 gap-8 mb-14">
            {/* Missão Card */}
            <div className="bg-white border border-slate-200 p-8 rounded-xl shadow-xs hover:shadow-md hover:border-primary/40 transition-all duration-300 flex flex-col justify-between relative overflow-hidden group">
              <div className="absolute top-0 left-0 right-0 h-1 bg-primary" />
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="p-3 bg-primary/10 text-primary rounded-lg border border-primary/20">
                    <Target className="h-6 w-6" />
                  </div>
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 bg-slate-100 text-slate-600 rounded-md border border-slate-200">
                    Propósito
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Nossa Missão</h3>
                <p className="text-sm text-slate-600 leading-relaxed font-normal">
                  {mockAboutUs.mission}
                </p>
              </div>
            </div>

            {/* Visão Card */}
            <div className="bg-white border border-slate-200 p-8 rounded-xl shadow-xs hover:shadow-md hover:border-secondary/40 transition-all duration-300 flex flex-col justify-between relative overflow-hidden group">
              <div className="absolute top-0 left-0 right-0 h-1 bg-secondary" />
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="p-3 bg-secondary/10 text-secondary rounded-lg border border-secondary/20">
                    <Eye className="h-6 w-6" />
                  </div>
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 bg-slate-100 text-slate-600 rounded-md border border-slate-200">
                    Horizonte 2030
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Nossa Visão</h3>
                <p className="text-sm text-slate-600 leading-relaxed font-normal">
                  {mockAboutUs.vision}
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Block: Estrutura dos 3 Valores */}
          <div className="border-t border-slate-200/80 pt-12">
            <div className="text-center max-w-xl mx-auto mb-10">
              <h3 className="text-2xl font-extrabold text-slate-900">
                Os Nossos Valores Fundamentais
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Princípios que sustentam o nosso compromisso diário com a qualidade e com os nossos clientes.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  title: 'Excelência Técnica',
                  desc: 'Compromisso intransigente com as melhores práticas de engenharia e padrões internacionais.',
                  icon: Award,
                  badgeColor: 'text-blue-600 bg-blue-50 border-blue-200',
                  accentColor: 'bg-blue-500',
                },
                {
                  title: 'Inovação & Futuro',
                  desc: 'Tecnologias de ponta preparadas para escalar e responder aos desafios digitais modernos.',
                  icon: Zap,
                  badgeColor: 'text-amber-600 bg-amber-50 border-amber-200',
                  accentColor: 'bg-amber-500',
                },
                {
                  title: 'Segurança & Fiabilidade',
                  desc: 'Proteção máxima de dados, estabilidade operacional e arquiteturas redundantes.',
                  icon: ShieldCheck,
                  badgeColor: 'text-emerald-600 bg-emerald-50 border-emerald-200',
                  accentColor: 'bg-emerald-500',
                },
              ].map((val, idx) => {
                const ValIcon = val.icon
                return (
                  <div
                    key={idx}
                    className="bg-white border border-slate-200 p-6 rounded-xl shadow-2xs hover:shadow-md hover:border-slate-300 transition-all duration-300 flex flex-col justify-between relative overflow-hidden group"
                  >
                    <div className={`absolute top-0 left-0 bottom-0 w-1 ${val.accentColor}`} />

                    <div className="pl-2">
                      <div className="flex items-center justify-between mb-4">
                        <div className={`p-2.5 rounded-lg border ${val.badgeColor}`}>
                          <ValIcon className="h-5 w-5" />
                        </div>
                        <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                          Pilar 0{idx + 1}
                        </span>
                      </div>

                      <h4 className="text-base font-bold text-slate-900 mb-2">
                        {val.title}
                      </h4>

                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                        {val.desc}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* 4. Por que Escolher a ARKNET */}
      <section className="py-24 bg-slate-950 text-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-16 flex flex-col md:flex-row md:items-end md:justify-between gap-8">
            <div>
              <p className="text-xs font-bold text-secondary uppercase tracking-[0.25em] mb-4">
                — Diferenciais Competitivos
              </p>
              <h2 className="text-3xl sm:text-5xl font-extrabold text-white leading-[1.1] max-w-lg">
                Por que as empresas escolhem a ARKNET
              </h2>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm md:text-right">
              Combinamos rigor técnico, equipamentos certificados e presença contínua para proteger e acelerar a sua operação.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockWhyChooseUs.map((item, index) => {
              const Icon = whyIcons[item.icon] || Zap
              const number = String(index + 1).padStart(2, '0')

              return (
                <div
                  key={item.id}
                  className="bg-slate-900/90 border border-slate-800 p-8 hover:border-primary/60 transition-all duration-300 relative overflow-hidden group"
                >
                  <span className="absolute top-4 right-4 text-7xl font-black text-white/[0.03] select-none group-hover:text-white/[0.07] transition-colors">
                    {number}
                  </span>

                  <div className="relative z-10">
                    <div className="mb-6 p-3 w-fit bg-primary/20 text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
                      <Icon className="h-6 w-6" />
                    </div>

                    <h3 className="text-lg font-bold text-white mb-3">
                      {item.title}
                    </h3>

                    <p className="text-sm leading-relaxed text-slate-400">
                      {item.description}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* 5. Testemunhos de Clientes */}
      <section className="py-24 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="text-xs font-bold text-secondary uppercase tracking-[0.25em] mb-3">
              — Reconhecimento do Mercado
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
              O que dizem os nossos clientes
            </h2>
            <p className="text-sm text-slate-500 mt-3">
              Depoimentos reais de instituições e empresas que confiam na infraestrutura da ARKNET.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {mockTestimonials.slice(0, 3).map((item) => (
              <div
                key={item.id}
                className="bg-slate-50 border border-slate-200 p-8 flex flex-col justify-between shadow-xs hover:shadow-md transition"
              >
                <div>
                  <Quote className="h-8 w-8 text-primary/30 mb-4" />
                  <p className="text-sm text-slate-700 italic leading-relaxed mb-6">
                    "{item.testimonial}"
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-200">
                  <p className="font-bold text-sm text-slate-900">{item.clientName}</p>
                  <p className="text-xs text-primary font-semibold">{item.type}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </main>
  )
}
