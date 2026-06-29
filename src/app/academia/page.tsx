'use client'

import Image from 'next/image'
import Link from 'next/link'
import Footer from '@/components/footer'
import { useState } from "react"


import {
  ArrowRight,
  Shield,
  Laptop,
  Network,
  Cpu,
  Users,
  Calculator,
  GraduationCap,
  Building2,
  Award,
  CheckCircle2,
  BookOpen,
  Globe,
  Layers3,
} from 'lucide-react'

import arknetLogo from '@/assets/icon18.png'
import heroImage from '@/assets/formacao/hero.jpeg'
import aboutImage from '@/assets/formacao/about.jpeg'
import certificationImage from '@/assets/formacao/certification.jpeg'

import {
  mockTrainingInfo,
  mockTrainingHighlights,
  mockTrainingModalities,
  mockTrainingCourses,
  mockTrainingMethodology,
} from '@/lib/mock-data'

const iconMap: any = {
  GraduationCap,
  Globe,
  Layers3,
  BookOpen,
  Building2,
  Shield,
  Laptop,
  Network,
  Cpu,
  Users,
  Calculator,
}


export default function FormacaoPage() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  return (
    <>
      <main className="bg-white pt-20">

        {/* HERO */}
        <section className="relative bg-[#020817] text-white overflow-hidden">
          <div className="grid lg:grid-cols-2 min-h-[720px]">

            <div className="flex items-center">
              <div className="px-6 lg:px-16 py-20 max-w-2xl">

                <p className="text-xs uppercase tracking-[0.2em] text-red-600 font-bold mb-6">
                  Centro de Formação Profissional
                </p>

                <Image
                  src={arknetLogo}
                  alt="Arknet"
                  width={200}
                  height={200}
                  className="mb-10"
                />

                <h1 className="text-5xl lg:text-7xl font-extrabold uppercase leading-tight">
                  {mockTrainingInfo.heroTitle}
                </h1>

                <p className="mt-8 text-lg text-slate-300 leading-relaxed max-w-xl">
                  {mockTrainingInfo.heroSubtitle}
                </p>

                <div className="flex flex-wrap gap-4 mt-10">

                  <Link
                    href="/#contacto"
                    className="bg-red-600 px-8 py-4 text-sm font-bold uppercase flex items-center gap-2 hover:bg-red-700 transition"
                  >
                    Fazer Inscrição
                    <ArrowRight className="h-4 w-4" />
                  </Link>

                  <Link
                    href="/#contacto"
                    className="border border-white/20 px-8 py-4 text-sm font-bold uppercase hover:border-red-600 transition"
                  >
                    Pedir Informações
                  </Link>
                </div>

              </div>
            </div>

            <div className="relative hidden lg:block">
              <Image
                src={heroImage}
                alt="Centro de Formação"
                fill
                className="object-cover opacity-50"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-l from-transparent to-[#020817]" />
            </div>
          </div>
        </section>

        {/* QUEM SOMOS */}
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-6">

            <div className="grid lg:grid-cols-2 gap-14 items-start">

              <div>

                <p className="text-xs uppercase tracking-[0.2em] text-red-600 font-bold mb-5">
                  01 · QUEM SOMOS
                </p>

                <h2 className="text-4xl lg:text-5xl font-extrabold text-[#020817] leading-tight">
                  {mockTrainingInfo.aboutTitle}
                </h2>

                <p className="mt-8 text-base lg:text-lg text-slate-600 leading-relaxed">
                  {mockTrainingInfo.aboutDescription}
                </p>

                <p className="mt-6 text-base lg:text-lg text-slate-600 leading-relaxed">
                  {mockTrainingInfo.aboutDescription2}
                </p>

              </div>

              <div className="relative h-[350px]">
                <Image
                  src={aboutImage}
                  alt="Formação Arknet"
                  fill
                  className="object-cover"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 mt-16 border border-slate-200">

              {mockTrainingHighlights.map((item) => (
                <div
                  key={item.id}
                  className="p-8 border-r border-b lg:border-b-0 border-slate-200 last:border-r-0"
                >
                  <CheckCircle2 className="h-7 w-7 text-red-600 mb-5" />

                  <h3 className="text-lg font-bold text-[#020817]">
                    {item.title}
                  </h3>
                </div>
              ))}

            </div>

          </div>
        </section>
        {/* OBJETIVOS */}
        <section className="bg-slate-50 border-y border-slate-200 py-24">
          <div className="max-w-7xl mx-auto px-6">

            <div className="grid lg:grid-cols-3 gap-10">

              <div>

                <p className="text-xs uppercase tracking-[0.2em] text-red-600 font-bold mb-5">
                  02 · OBJETIVOS
                </p>

                <h2 className="text-4xl font-extrabold text-[#020817] leading-tight">
                  {mockTrainingInfo.objectivesTitle}
                </h2>

              </div>

              <div className="bg-[#020817] text-white p-10">

                <p className="text-xs uppercase tracking-[0.2em] text-red-600 font-bold mb-5">
                  Objetivo Geral
                </p>

                <h3 className="text-2xl font-extrabold mb-6">
                  Capacitar profissionais
                </h3>

                <p className="text-slate-300 leading-relaxed">
                  {mockTrainingInfo.objectiveGeneral}
                </p>

              </div>

              <div className="bg-white border border-slate-200 p-10">

                <p className="text-xs uppercase tracking-[0.2em] text-red-600 font-bold mb-5">
                  Objetivos Específicos
                </p>

                <div className="space-y-4">

                  {mockTrainingInfo.objectiveSpecifics.map((item) => (
                    <div key={item} className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-red-600 mt-0.5 shrink-0" />
                      <p className="text-slate-700">{item}</p>
                    </div>
                  ))}

                </div>

              </div>

            </div>

          </div>
        </section>

        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-6">

            <div className="max-w-3xl mb-16">
              <p className="text-xs uppercase tracking-[0.2em] text-red-600 font-bold mb-5">
                03 · MODALIDADE DE FORMAÇÃO
              </p>

              <h2 className="text-4xl lg:text-5xl font-extrabold text-[#020817] leading-tight">
                Cinco formas de aprender connosco
              </h2>
            </div>

            <div className="grid md:grid-cols-2 xl:grid-cols-5 border border-slate-200">
              {mockTrainingModalities.map((item, index) => {
                const Icon = iconMap[item.icon] || Globe
                const isHovered = hoveredIndex === index
                const isAnyHovered = hoveredIndex !== null

                return (
                  <div
                    key={item.id}
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    className={`p-8 border-r border-b min-h-[300px] flex flex-col transition-all duration-300 cursor-pointer ${isAnyHovered
                        ? isHovered
                          ? "bg-red-600 text-white"
                          : "bg-white text-[#020817]"
                        : "bg-white text-[#020817]"
                      }`}
                  >
                    <div className="text-4xl font-extrabold mb-6 opacity-40">
                      {item.id}
                    </div>

                    <Icon className="h-10 w-10 mb-6" />

                    <h3 className="text-xl font-bold mb-4">
                      {item.title}
                    </h3>

                    <p className="leading-relaxed text-sm opacity-90">
                      {item.description}
                    </p>
                  </div>
                )
              })}
            </div>

          </div>
        </section>

        {/* DURAÇÃO */}
        <section className="bg-slate-50 border-y border-slate-200 py-24">
          <div className="max-w-7xl mx-auto px-6">

            <div className="grid lg:grid-cols-3 gap-10 items-stretch">

              <div>

                <p className="text-xs uppercase tracking-[0.2em] text-red-600 font-bold mb-5">
                  04 · DURAÇÃO DOS CURSOS
                </p>

                <h2 className="text-4xl font-extrabold text-[#020817] leading-tight">
                  Um mês para transformar a sua carreira
                </h2>

              </div>

              <div className="bg-[#020817] text-white p-12 flex flex-col justify-center">

                <p className="text-xs uppercase tracking-[0.2em] text-red-600 font-bold mb-5">
                  Duração Padrão
                </p>

                <div className="text-6xl font-extrabold leading-none">
                  {mockTrainingInfo.durationDays}
                  <span className="text-red-600">.</span>
                </div>

                <p className="text-xl font-bold uppercase mt-4">
                  Dias de Formação Intensiva
                </p>

              </div>

              <div className="bg-white border border-slate-200 p-10">

                <p className="text-xs uppercase tracking-[0.2em] text-red-600 font-bold mb-6">
                  Regime de Formação
                </p>

                <div className="space-y-6">

                  {mockTrainingInfo.durationDetails.map((item, index) => (
                    <div key={item} className="flex gap-4">
                      <div className="text-red-600 font-bold text-2xl">
                        0{index + 1}
                      </div>
                      <p className="text-[#020817] font-medium">
                        {item}
                      </p>
                    </div>
                  ))}

                </div>

              </div>

            </div>

          </div>
        </section>
        {/* CURSOS */}
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-6">

            <div className="max-w-3xl mb-16">

              <p className="text-xs uppercase tracking-[0.2em] text-red-600 font-bold mb-5">
                05 · OFERTA FORMATIVA
              </p>

              <h2 className="text-4xl lg:text-5xl font-extrabold text-[#020817] leading-tight">
                Seis cursos.
                <span className="block text-red-600">Uma carreira inteira.</span>
              </h2>

            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 border border-slate-200">

              {mockTrainingCourses.map((course) => {
                const Icon = iconMap[course.icon] || Laptop

                return (
                  <div
                    key={course.id}
                    className="p-8 border-r border-b border-slate-200 min-h-[300px]"
                  >

                    <div className="text-red-600 text-xs font-bold uppercase mb-6">
                      Curso {course.id}
                    </div>

                    <Icon className="h-10 w-10 text-red-600 mb-6" />

                    <h3 className="text-xl font-bold text-[#020817] mb-4">
                      {course.title}
                    </h3>

                    <p className="text-slate-600 text-sm leading-relaxed">
                      {course.description}
                    </p>

                  </div>
                )
              })}

            </div>

          </div>
        </section>

        {/* METODOLOGIA */}
        <section className="py-24 bg-slate-50 border-y border-slate-200">
          <div className="max-w-7xl mx-auto px-6">

            <div className="max-w-3xl mb-16">

              <p className="text-xs uppercase tracking-[0.2em] text-red-600 font-bold mb-5">
                06 · METODOLOGIA
              </p>

              <h2 className="text-4xl lg:text-5xl font-extrabold text-[#020817] leading-tight">
                Como ensinamos
              </h2>

            </div>

            <div className="grid md:grid-cols-2 xl:grid-cols-6 border border-slate-200">

              {mockTrainingMethodology.map((item, index) => (
                <div
                  key={item.id}
                  className="bg-white p-8 border-r border-b border-slate-200 min-h-[200px]"
                >

                  <div className="text-red-600 text-3xl font-extrabold mb-6">
                    0{index + 1}
                  </div>

                  <h3 className="text-base font-bold text-[#020817] leading-snug">
                    {item.title}
                  </h3>

                </div>
              ))}

            </div>

          </div>
        </section>

        {/* CERTIFICAÇÃO */}
        <section className="bg-white py-24">
          <div className="max-w-7xl mx-auto px-6">

            <div className="grid lg:grid-cols-2 gap-16 items-center">

              <div>

                <p className="text-xs uppercase tracking-[0.2em] text-red-600 font-bold mb-5">
                  08 · CERTIFICAÇÃO
                </p>

                <h2 className="text-4xl lg:text-5xl font-extrabold text-[#020817] leading-tight">
                  Avaliar.<br />
                  Certificar.<br />
                  Validar.
                </h2>

                <div className="grid md:grid-cols-3 gap-5 mt-12">

                  {mockTrainingInfo.certifications.map((item, index) => (
                    <div
                      key={item}
                      className="border border-slate-200 p-6"
                    >

                      <div className="text-red-600 text-2xl font-extrabold mb-4">
                        0{index + 1}
                      </div>

                      <p className="font-bold text-[#020817] text-sm leading-snug">
                        {item}
                      </p>

                    </div>
                  ))}

                </div>

              </div>

              <div className="relative h-[500px]">

                <Image
                  src={certificationImage}
                  alt="Certificação"
                  fill
                  className="object-cover"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-[#020817] to-transparent" />

                <div className="absolute bottom-0 left-0 p-10 text-white">

                  <Award className="h-14 w-14 text-red-600 mb-6" />

                  <h3 className="text-3xl font-extrabold leading-tight">
                    Certificação profissional reconhecida.
                  </h3>

                </div>

              </div>

            </div>

          </div>
        </section>

      </main>

      <Footer />
    </>
  )
}