'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import Footer from '@/components/footer'
import {
  ArrowRight,
  CheckCircle2,
  TrendingUp,
  Lightbulb,
  Users,
  Target,
  Mail,
  FileText,
  Briefcase,
  MapPin,
  Clock,
  X,
  Send,
} from 'lucide-react'

import arknetLogo from '@/assets/icon18.png'
import heroImage from '@/assets/office.jpeg'
import aboutImage from '@/assets/about2.jpg'

import {
  mockCareersInfo,
  mockCareersBenefits,
  mockSpontaneousApplication,
} from '@/lib/mock-data'
import { dataStore, JobPosition } from '@/lib/data-store'

const benefitIcons: Record<string, React.ElementType> = {
  '1': TrendingUp,
  '2': Lightbulb,
  '3': Users,
  '4': Target,
}

export default function CarreirasPage() {
  const [jobs, setJobs] = useState<JobPosition[]>([])

  // Modal de Candidatura
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false)
  const [selectedJob, setSelectedJob] = useState<JobPosition | null>(null)
  const [candidateName, setCandidateName] = useState('')
  const [candidateEmail, setCandidateEmail] = useState('')
  const [candidatePhone, setCandidatePhone] = useState('')
  const [candidateMessage, setCandidateMessage] = useState('')
  const [cvFileName, setCvFileName] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)

  useEffect(() => {
    const sync = () => {
      const db = dataStore.getSnapshot()
      setJobs(db.jobs.filter((j) => j.status === 'aberta'))
    }
    sync()
    const unsub = dataStore.subscribe(sync)
    return () => unsub()
  }, [])

  const handleOpenApply = (job?: JobPosition) => {
    setSelectedJob(job || null)
    setIsSubmitted(false)
    setCandidateName('')
    setCandidateEmail('')
    setCandidatePhone('')
    setCandidateMessage('')
    setCvFileName('Curriculo_Vitae.pdf')
    setIsApplyModalOpen(true)
  }

  const handleSubmitApplication = (e: React.FormEvent) => {
    e.preventDefault()
    if (!candidateName.trim() || !candidateEmail.trim()) return

    dataStore.addApplication({
      jobId: selectedJob?.id,
      jobTitle: selectedJob ? selectedJob.title : 'Candidatura Espontânea',
      candidateName: candidateName.trim(),
      candidateEmail: candidateEmail.trim(),
      candidatePhone: candidatePhone.trim(),
      message: candidateMessage.trim(),
      cvFileName: cvFileName || 'Curriculo_Vitae.pdf',
    })

    setIsSubmitted(true)
  }

  return (
    <>
      <main className="bg-white pt-20">
        {/* HERO */}
        <section className="relative bg-[#020817] text-white overflow-hidden">
          <div className="grid lg:grid-cols-2 min-h-[600px]">
            <div className="flex items-center">
              <div className="px-6 lg:px-16 py-20 max-w-2xl">
                <p className="text-xs uppercase tracking-[0.2em] text-red-600 font-bold mb-6">
                  Oportunidades de Carreira
                </p>

                <Image
                  src={arknetLogo}
                  alt="Arknet"
                  width={200}
                  height={200}
                  className="mb-10"
                />

                <h1 className="text-5xl lg:text-7xl font-extrabold uppercase leading-tight">
                  {mockCareersInfo.heroTitle}
                </h1>

                <p className="mt-8 text-lg text-slate-300 leading-relaxed max-w-xl">
                  {mockCareersInfo.heroSubtitle}
                </p>

                <div className="flex flex-wrap gap-4 mt-10">
                  <a
                    href="#vagas"
                    className="bg-red-600 px-8 py-4 text-sm font-bold uppercase flex items-center gap-2 hover:bg-red-700 transition shadow-lg shadow-red-600/20"
                  >
                    Ver Vagas Abertas ({jobs.length})
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </div>
              </div>
            </div>

            <div className="relative hidden lg:block">
              <Image
                src={heroImage}
                alt="Carreiras ARKNET"
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
                  01 · TRABALHAR NA ARKNET
                </p>

                <h2 className="text-4xl lg:text-5xl font-extrabold text-[#020817] leading-tight">
                  {mockCareersInfo.aboutTitle}
                </h2>

                <p className="mt-8 text-base lg:text-lg text-slate-600 leading-relaxed">
                  {mockCareersInfo.aboutDescription}
                </p>

                <p className="mt-6 text-base lg:text-lg text-slate-600 leading-relaxed">
                  {mockCareersInfo.aboutDescription2}
                </p>
              </div>

              <div className="relative h-[350px]">
                <Image
                  src={aboutImage}
                  alt="Equipa Arknet"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        {/* BENEFÍCIOS */}
        <section className="bg-slate-50 border-y border-slate-200 py-24">
          <div className="max-w-7xl mx-auto px-6">
            <div className="max-w-3xl mb-16">
              <p className="text-xs uppercase tracking-[0.2em] text-red-600 font-bold mb-5">
                02 · PORQUÊ JUNTAR-SE A NÓS
              </p>
              <h2 className="text-4xl lg:text-5xl font-extrabold text-[#020817] leading-tight">
                O que oferecemos
              </h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 border border-slate-200">
              {mockCareersBenefits.map((item) => {
                const Icon = benefitIcons[item.id] || CheckCircle2
                return (
                  <div
                    key={item.id}
                    className="p-8 border-r border-b lg:border-b-0 border-slate-200 last:border-r-0 bg-white"
                  >
                    <Icon className="h-10 w-10 text-red-600 mb-6" />
                    <h3 className="text-lg font-bold text-[#020817] mb-3">
                      {item.title}
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* VAGAS DINÂMICAS */}
        <section id="vagas" className="py-24 bg-white scroll-mt-24">
          <div className="max-w-7xl mx-auto px-6">
            <div className="max-w-3xl mb-16">
              <p className="text-xs uppercase tracking-[0.2em] text-red-600 font-bold mb-5">
                03 · OPORTUNIDADES ABERTAS
              </p>
              <h2 className="text-4xl lg:text-5xl font-extrabold text-[#020817] leading-tight">
                Vagas Disponíveis
              </h2>
              <p className="text-slate-600 text-base mt-4">
                Explore as funções em aberto e candidate-se para fazer parte da nossa equipa.
              </p>
            </div>

            {jobs.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {jobs.map((job) => (
                  <div
                    key={job.id}
                    className="bg-white border border-slate-200 p-8 shadow-sm hover:shadow-md transition flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <span className="px-3 py-1 bg-red-50 text-red-600 text-xs font-bold uppercase rounded">
                          {job.department}
                        </span>
                        <span className="text-xs text-slate-500 font-semibold">{job.type}</span>
                      </div>

                      <h3 className="text-xl font-extrabold text-[#020817] mb-2 leading-snug">
                        {job.title}
                      </h3>

                      <p className="text-xs text-slate-500 flex items-center gap-1 mb-4">
                        <MapPin className="h-3.5 w-3.5 text-slate-400" />
                        {job.location}
                      </p>

                      <p className="text-slate-600 text-sm leading-relaxed mb-6">
                        {job.description}
                      </p>

                      {job.requirements && job.requirements.length > 0 && (
                        <div className="pt-4 border-t border-slate-100 mb-6">
                          <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Requisitos:</p>
                          <ul className="text-xs text-slate-600 space-y-1.5">
                            {job.requirements.slice(0, 3).map((req, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <span className="h-1.5 w-1.5 rounded-full bg-red-600 mt-1.5 shrink-0" />
                                <span>{req}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    <div className="pt-4 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => handleOpenApply(job)}
                        className="w-full inline-flex items-center justify-center gap-2 bg-[#020817] text-white py-3.5 text-xs font-bold uppercase hover:bg-red-600 transition"
                      >
                        Candidatar-se à Vaga
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 bg-slate-50 border border-slate-200 text-center max-w-xl mx-auto">
                <p className="text-slate-900 font-bold text-lg">Sem vagas abertas de momento</p>
                <p className="text-slate-500 text-sm mt-2">
                  Pode submeter uma candidatura espontânea abaixo e entraremos em contacto caso surja uma oportunidade.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* CANDIDATURA ESPONTÂNEA */}
        <section id="candidatura" className="py-24 bg-slate-50 border-t border-slate-200 scroll-mt-24">
          <div className="max-w-3xl mx-auto px-6">
            <p className="text-xs uppercase tracking-[0.2em] text-red-600 font-bold mb-5">
              04 · CANDIDATURA ESPONTÂNEA
            </p>

            <h2 className="text-4xl lg:text-5xl font-extrabold text-[#020817] leading-tight mb-8">
              {mockSpontaneousApplication.title}
            </h2>

            <p className="text-lg text-slate-600 leading-relaxed mb-10">
              {mockSpontaneousApplication.description}
            </p>

            <div className="border border-slate-200 bg-white p-8 space-y-6">
              <div className="flex items-start gap-4">
                <FileText className="h-6 w-6 text-red-600 shrink-0 mt-1" />
                <div>
                  <p className="font-bold text-[#020817]">O que enviar</p>
                  <p className="text-sm text-slate-600 mt-1">
                    CV actualizado e breve apresentação sobre a sua experiência e área de interesse.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Mail className="h-6 w-6 text-red-600 shrink-0 mt-1" />
                <div>
                  <p className="font-bold text-[#020817]">Canal de Recrutamento</p>
                  <p className="text-sm text-red-600 mt-1 font-mono">
                    {mockSpontaneousApplication.email}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-10">
              <button
                type="button"
                onClick={() => handleOpenApply(undefined)}
                className="inline-flex bg-[#020817] text-white px-8 py-4 text-sm font-bold uppercase items-center gap-2 hover:bg-red-600 transition shadow-lg"
              >
                Submeter Candidatura Online
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Modal de Submissão de Candidatura */}
      {isApplyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm"
            onClick={() => setIsApplyModalOpen(false)}
          />

          <div className="relative w-full max-w-lg bg-white border border-slate-200 shadow-2xl overflow-hidden z-10 p-6 sm:p-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="text-xs font-bold text-red-600 uppercase">Candidatura Online</span>
                <h3 className="text-lg font-extrabold text-slate-900 mt-1">
                  {selectedJob ? selectedJob.title : 'Candidatura Espontânea'}
                </h3>
              </div>
              <button
                onClick={() => setIsApplyModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {isSubmitted ? (
              <div className="py-10 text-center">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="h-10 w-10" />
                </div>
                <h4 className="text-xl font-bold text-slate-900 mb-2">Candidatura Submetida!</h4>
                <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                  O seu currículo e dados foram registados no nosso departamento de Recursos Humanos. Entraremos em contacto caso o seu perfil coincida com os requisitos.
                </p>
                <button
                  type="button"
                  onClick={() => setIsApplyModalOpen(false)}
                  className="mt-6 px-6 py-2.5 bg-[#020817] text-white text-xs font-bold uppercase hover:bg-red-600 transition"
                >
                  Concluir
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitApplication} className="space-y-4 pt-4 text-xs">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    required
                    value={candidateName}
                    onChange={(e) => setCandidateName(e.target.value)}
                    placeholder="Seu nome"
                    className="w-full px-4 py-2.5 text-sm border border-slate-300 focus:border-red-600 focus:outline-none"
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={candidateEmail}
                      onChange={(e) => setCandidateEmail(e.target.value)}
                      placeholder="seu@email.com"
                      className="w-full px-4 py-2.5 text-sm border border-slate-300 focus:border-red-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Telefone *
                    </label>
                    <input
                      type="tel"
                      required
                      value={candidatePhone}
                      onChange={(e) => setCandidatePhone(e.target.value)}
                      placeholder="+244 900 000 000"
                      className="w-full px-4 py-2.5 text-sm border border-slate-300 focus:border-red-600 focus:outline-none font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Ficheiro do Currículo (Nome ou Anexo)
                  </label>
                  <input
                    type="text"
                    value={cvFileName}
                    onChange={(e) => setCvFileName(e.target.value)}
                    placeholder="CV_Seu_Nome_2026.pdf"
                    className="w-full px-4 py-2.5 text-sm border border-slate-300 focus:border-red-600 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Carta de Apresentação / Mensagem
                  </label>
                  <textarea
                    rows={3}
                    value={candidateMessage}
                    onChange={(e) => setCandidateMessage(e.target.value)}
                    placeholder="Conte-nos brevemente sobre a sua experiência e motivação..."
                    className="w-full p-3 text-sm border border-slate-300 focus:border-red-600 focus:outline-none resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsApplyModalOpen(false)}
                    className="px-4 py-2.5 text-xs font-bold text-slate-700 uppercase"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 uppercase shadow-md flex items-center gap-2"
                  >
                    <Send className="h-3.5 w-3.5" />
                    Enviar Candidatura
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      <Footer />
    </>
  )
}
