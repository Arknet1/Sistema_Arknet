'use client'

import { motion } from "framer-motion"
import { Database, Globe, LockKeyhole, MonitorSmartphone } from "lucide-react"
import { mockPortfolio } from "@/lib/mock-data"

export default function Portfolio() {
  const projetos = mockPortfolio.map((item, index) => ({
    title: item.title,
    category: "Projeto",
    description: item.description ?? "",
    icon: [Database, Globe, LockKeyhole, MonitorSmartphone][index % 4],
    image: item.image,
  }))

  return (
    <section id="portfolio" className="bg-slate-950 py-28 text-white">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold text-primary">
              Portfólio
            </p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight md:text-5xl">
              Alguns trabalhos recentes
            </h2>
            <p className="mt-6 text-base leading-8 text-slate-300 md:text-lg">
              Exemplos de implementações em ambiente empresarial, com foco em estabilidade, manutenção e suporte.
            </p>
          </div>

        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {projetos.map((projeto, index) => {
            const Icon = projeto.icon
            return (
              <motion.article
                key={projeto.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: index * 0.06 }}
                viewport={{ once: true }}
                className="overflow-hidden border border-white/10 bg-white/5"
              >
                {projeto.image ? (
                  <div className="relative h-64">
                    <img
                      src={projeto.image}
                      alt={projeto.title}
                      className="h-full w-full object-cover opacity-75"
                    />
                    <div className="absolute inset-0 bg-slate-950/35" />
                  </div>
                ) : null}

                <div className="p-7">
                  <div className="flex h-12 w-12 items-center justify-center bg-primary text-white">
                    <Icon className="h-6 w-6" />
                  </div>
                  <p className="mt-5 text-xs font-semibold text-primary/85">
                    {projeto.category}
                  </p>
                  <h3 className="mt-3 text-2xl font-black text-white">
                    {projeto.title}
                  </h3>
                  <p className="mt-4 text-sm leading-7 text-slate-300">
                    {projeto.description}
                  </p>
                  
                </div>
              </motion.article>
            )
          })}
        </div>
      </div>
    </section>
  )
}