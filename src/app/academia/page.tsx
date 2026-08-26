'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import Footer from '@/components/footer'
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
  Clock,
} from 'lucide-react'

import arknetLogo from '@/assets/icon18.png'
import heroImage from '@/assets/formacao/hero.jpeg'
import aboutImage from '@/assets/formacao/about.jpeg'
import certificationImage from '@/assets/formacao/certification.jpeg'

import {
  mockTrainingInfo,
  mockTrainingHighlights,
  mockTrainingModalities,
  mockTrainingMethodology,
} from '@/lib/mock-data'
import { dataStore, CourseItem } from '@/lib/data-store'

const iconMap: Record<string, React.ElementType> = {
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
  const [courses, setCourses] = useState<CourseItem[]>([])

  useEffect(() => {
    const sync = () => {
      const db = dataStore.getSnapshot()
      setCourses(db.courses.filter((c) => c.status === 'active'))
    }
    sync()
    const unsub = dataStore.subscribe(sync)
    return () => unsub()
  }, [])

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
                    className="bg-red-600 px-8 py-4 text-sm font-bold uppercase flex items-center gap-2 hover:bg-red-700 transition shadow-lg shadow-red-600/20"
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

        {/* SOBRE */}
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-14 items-start">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-red-600 font-bold mb-5">
                  01 · SOBRE A FORMAÇÃO
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
                  <h3 className="text-lg font-bold text-[#020817]">{item.title}</h3>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* MODALIDADES */}
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <div className="max-w-3xl mb-16">
              <p className="text-xs uppercase tracking-[0.2em] text-red-600 font-bold mb-5">
                03 · MODALIDADES DE FORMAÇÃO
              </p>
              <h2 className="text-4xl lg:text-5xl font-extrabold text-[#020817] leading-tight">
                Flexibilidade para o seu ritmo
              </h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-5 border border-slate-200">
              {mockTrainingModalities.map((item) => {
                const Icon = iconMap[item.icon] || GraduationCap
                return (
                  <div
                    key={item.id}
                    className="p-8 border-r border-b lg:border-b-0 border-slate-200 last:border-r-0"
                  >
                    <Icon className="h-10 w-10 text-red-600 mb-6" />
                    <h3 className="text-xl font-bold text-[#020817] mb-3">{item.title}</h3>
                    <p className="text-slate-600 text-sm leading-relaxed">{item.description}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* CURSOS DINÂMICOS */}
        <section id="cursos" className="py-24 bg-slate-50 border-y border-slate-200">
          <div className="max-w-7xl mx-auto px-6">
            <div className="max-w-3xl mb-16">
              <p className="text-xs uppercase tracking-[0.2em] text-red-600 font-bold mb-5">
                04 · OFERTA FORMATIVA
              </p>
              <h2 className="text-4xl lg:text-5xl font-extrabold text-[#020817] leading-tight">
                Cursos & Certificações ARKNET
              </h2>
              <p className="text-slate-600 text-base mt-4">
                Formações práticas e atualizadas para impulsionar a sua carreira tecnológica.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course, idx) => {
                const Icon = iconMap[course.icon || 'Laptop'] || Laptop

                return (
                  <div
                    key={course.id}
                    className="bg-white p-8 border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-bold text-red-600 uppercase tracking-wider">
                          {course.modality}
                        </span>
                        <span className="text-xs text-slate-500 flex items-center gap-1 font-semibold">
                          <Clock className="h-3.5 w-3.5 text-slate-400" />
                          {course.duration}
                        </span>
                      </div>

                      <Icon className="h-10 w-10 text-red-600 mb-5" />

                      <h3 className="text-xl font-bold text-[#020817] mb-3">
                        {course.title}
                      </h3>

                      <p className="text-slate-600 text-sm leading-relaxed mb-4">
                        {course.description}
                      </p>

                      {course.syllabus && course.syllabus.length > 0 && (
                        <div className="pt-3 border-t border-slate-100 mb-4">
                          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Módulos:</p>
                          <ul className="text-xs text-slate-600 space-y-1">
                            {course.syllabus.slice(0, 3).map((m, i) => (
                              <li key={i} className="truncate flex items-center gap-1.5">
                                <span className="h-1.5 w-1.5 rounded-full bg-red-600 shrink-0" />
                                {m}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    <div className="pt-4 border-t border-slate-100">
                      <Link
                        href="/#contacto"
                        className="w-full inline-flex items-center justify-center gap-2 bg-[#020817] text-white py-3 text-xs font-bold uppercase tracking-wider hover:bg-red-600 transition"
                      >
                        Inscrever-se no Curso
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* METODOLOGIA */}
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <div className="max-w-3xl mb-16">
              <p className="text-xs uppercase tracking-[0.2em] text-red-600 font-bold mb-5">
                05 · METODOLOGIA
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
        <section className="bg-slate-50 border-t border-slate-200 py-24">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-red-600 font-bold mb-5">
                  06 · CERTIFICAÇÃO RECONHECIDA
                </p>
                <h2 className="text-4xl lg:text-5xl font-extrabold text-[#020817] leading-tight">
                  Certificado ARKNET de Conclusão
                </h2>
                <p className="mt-8 text-base lg:text-lg text-slate-600 leading-relaxed">
                  Todos os nossos cursos conferem certificado oficial que valida as suas competências técnicas e práticas perante o mercado de trabalho angolano e internacional.
                </p>
                <div className="mt-8">
                  <Link
                    href="/#contacto"
                    className="inline-flex bg-red-600 text-white px-8 py-4 text-sm font-bold uppercase items-center gap-2 hover:bg-red-700 transition"
                  >
                    Fazer Inscrição Agora
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>

              <div className="relative h-[350px]">
                <Image
                  src={certificationImage}
                  alt="Certificação Arknet"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}