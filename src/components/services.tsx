'use client'

import { motion } from "framer-motion"
import { ArrowRight, Cable, Camera, Cpu, Laptop, ShieldCheck, Workflow, Wrench } from "lucide-react"
import Link from "next/link"
import { mockServices } from "@/lib/mock-data"

const icons = [Cpu, Wrench, Laptop, Cable, Camera, ShieldCheck, Workflow]

export default function Services() {
  const servicos = mockServices.slice(0, 3).map((item, index) => ({
    title: item.name,
    slug: item.slug,
    description: item.description,
    icon: icons[index % icons.length],
  }))

  return (
    <section id="servicos" className="py-28 bg-white">
      <div className="mx-auto max-w-7xl px-6">

        {/* Cabeçalho */}
        <div className="mb-16">
          <div>
            <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 leading-[1.1] max-w-lg">
              Soluções completas<br />para o seu negócio
            </h2>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {servicos.map((item, index) => {
            const Icon = item.icon
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: index * 0.08 }}
                viewport={{ once: true }}
                className="group p-8 bg-white border border-slate-200 hover:border-primary/60 hover:shadow-xl transition-all duration-300 relative overflow-hidden flex flex-col justify-between h-full hover:-translate-y-1"
              >
                {/* Top accent bar on hover */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />

                <div>
                  <div className="mb-6 p-3 w-fit bg-primary/10 text-primary border border-primary/20 group-hover:bg-primary group-hover:text-white transition-colors duration-300 rounded-lg">
                    <Icon className="h-6 w-6" />
                  </div>

                    <h3 className="text-lg font-bold text-slate-900 mb-3">
                      {item.title}
                    </h3>

                    <p className="text-sm leading-6 text-slate-500 line-clamp-3">
                      {item.description}
                    </p>
                  </div>

                  <div className="mt-6 pt-5 border-t border-slate-100">
                    <Link
                      href={`/servicos/${item.slug}`}
                      className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 group-hover:text-primary transition-colors"
                    >
                      Saiba mais
                      <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </motion.div>
              )
            })}
        </div>

        {/* Ver todos os serviços */}
        <div className="mt-14 text-center">
          <Link
            href="/servicos"
            className="inline-flex items-center gap-2.5 bg-slate-900 hover:bg-primary px-8 py-4 text-xs font-bold uppercase tracking-wider text-white shadow-lg transition"
          >
            Ver todos os serviços
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
