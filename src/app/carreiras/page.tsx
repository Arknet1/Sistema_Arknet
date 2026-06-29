'use client'

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
} from 'lucide-react'

import arknetLogo from '@/assets/icon18.png'
import heroImage from '@/assets/office.jpeg'
import aboutImage from '@/assets/about2.jpg'

import {
  mockCareersInfo,
  mockCareersBenefits,
  mockSpontaneousApplication,
} from '@/lib/mock-data'

const benefitIcons: Record<string, React.ElementType> = {
  '1': TrendingUp,
  '2': Lightbulb,
  '3': Users,
  '4': Target,
}

export default function CarreirasPage() {
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
                    href="#candidatura"
                    className="bg-red-600 px-8 py-4 text-sm font-bold uppercase flex items-center gap-2 hover:bg-red-700 transition"
                  >
                    Candidatar-se
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

        {/* CANDIDATURA ESPONTÂNEA */}
        <section id="candidatura" className="py-24 bg-white scroll-mt-24">
          <div className="max-w-3xl mx-auto px-6">
            <p className="text-xs uppercase tracking-[0.2em] text-red-600 font-bold mb-5">
              03 · CANDIDATURA
            </p>

            <h2 className="text-4xl lg:text-5xl font-extrabold text-[#020817] leading-tight mb-8">
              {mockSpontaneousApplication.title}
            </h2>

            <p className="text-lg text-slate-600 leading-relaxed mb-10">
              {mockSpontaneousApplication.description}
            </p>

            <div className="border border-slate-200 p-8 space-y-6">
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
                  <p className="font-bold text-[#020817]">Para onde enviar</p>
                  <a
                    href={`mailto:${mockSpontaneousApplication.email}?subject=Candidatura%20Espont%C3%A2nea%20ARKNET`}
                    className="text-sm text-red-600 hover:underline mt-1 inline-block"
                  >
                    {mockSpontaneousApplication.email}
                  </a>
                </div>
              </div>
            </div>

            <div className="mt-10">
              <a
                href={`mailto:${mockSpontaneousApplication.email}?subject=Candidatura%20Espont%C3%A2nea%20ARKNET`}
                className="inline-flex bg-[#020817] text-white px-8 py-4 text-sm font-bold uppercase items-center gap-2 hover:bg-red-600 transition"
              >
                Enviar candidatura
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
