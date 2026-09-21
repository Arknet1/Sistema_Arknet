'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from "framer-motion"
import { Database, Globe, LockKeyhole, MonitorSmartphone, ArrowRight } from "lucide-react"
import { dataStore, ProjectItem } from "@/lib/data-store"
import { mockPortfolio } from "@/lib/mock-data"

export default function Portfolio() {
  const [projects, setProjects] = useState<ProjectItem[]>([])

  useEffect(() => {
    const sync = () => {
      const db = dataStore.getSnapshot()
      const list = Array.isArray(db.projects) && db.projects.length > 0 ? db.projects : []
      setProjects(list)
    }
    sync()
    const unsub = dataStore.subscribe(sync)
    return () => unsub()
  }, [])

  const displayList = projects.length > 0
    ? projects.slice(0, 6).map((item, index) => ({
        title: item.title,
        slug: item.slug,
        category: item.category || "Projeto",
        description: item.description || item.tagline || "",
        icon: [Database, Globe, LockKeyhole, MonitorSmartphone][index % 4],
        image: item.image,
      }))
    : mockPortfolio.map((item, index) => ({
        title: item.title,
        slug: 'infraestrutura-rede-tribunal-supremo',
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
              Portfólio &amp; Casos de Sucesso
            </p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight md:text-5xl">
              Projetos e Implementações de Referência
            </h2>
            <p className="mt-6 text-base leading-8 text-slate-300 md:text-lg">
              Exemplos de implementações em ambiente empresarial, com foco em estabilidade, segurança e alta disponibilidade.
            </p>
          </div>

          <div>
            <Link
              href="/projetos"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/90 text-white font-bold text-xs uppercase tracking-wider rounded transition shadow-sm"
            >
              <span>Ver Todos os Projetos</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {displayList.map((projeto, index) => {
            const Icon = projeto.icon
            return (
              <motion.article
                key={projeto.title + index}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: index * 0.06 }}
                viewport={{ once: true }}
                className="overflow-hidden border border-white/10 bg-white/5 flex flex-col justify-between group hover:border-primary/50 transition duration-300"
              >
                {projeto.image ? (
                  <div className="relative h-64 overflow-hidden">
                    <img
                      src={projeto.image}
                      alt={projeto.title}
                      className="h-full w-full object-cover opacity-75 group-hover:scale-105 transition duration-500"
                    />
                    <div className="absolute inset-0 bg-slate-950/35" />
                  </div>
                ) : null}

                <div className="p-7 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex h-12 w-12 items-center justify-center bg-primary text-white">
                      <Icon className="h-6 w-6" />
                    </div>
                    <p className="mt-5 text-xs font-semibold text-primary/85">
                      {projeto.category}
                    </p>
                    <h3 className="mt-3 text-2xl font-black text-white group-hover:text-primary transition leading-snug">
                      {projeto.title}
                    </h3>
                    <p className="mt-4 text-sm leading-7 text-slate-300 line-clamp-3">
                      {projeto.description}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-white/10">
                    <Link
                      href={`/projetos/${projeto.slug}`}
                      className="text-xs font-bold text-primary hover:text-white inline-flex items-center gap-1.5 transition"
                    >
                      <span>Ver estudo de caso</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </motion.article>
            )
          })}
        </div>
      </div>
    </section>
  )
}