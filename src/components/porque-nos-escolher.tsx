'use client'

import { motion } from "framer-motion"
import { Zap, ShieldCheck, Headphones, TrendingUp, Clock, Award, ArrowRight } from "lucide-react"
import Link from "next/link"
import { mockWhyChooseUs } from "@/lib/mock-data"

const icons = [Zap, ShieldCheck, Headphones, TrendingUp, Clock, Award]

const headerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
}

const cardContainerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09 } },
}

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const

const cardVariants = {
  hidden: { opacity: 0, y: 32, scale: 0.97 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: EASE_OUT_EXPO } },
}

export default function PorqueNosEscolher() {
  const diferenciais = mockWhyChooseUs.map((item, index) => ({
    icon: icons[index % icons.length],
    title: item.title,
    text: item.description,
    number: String(index + 1).padStart(2, '0'),
  }))

  return (
    <section id="porque-nos-escolher" className="py-28 bg-slate-950 text-white">
      <div className="max-w-7xl mx-auto px-6">

        {/* Header */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={headerVariants}
          className="mb-16 flex flex-col md:flex-row md:items-end md:justify-between gap-8"
        >
          <div>
            <motion.p
              variants={{ hidden: { opacity: 0, x: -20 }, show: { opacity: 1, x: 0, transition: { duration: 0.5 } } }}
              className="text-xs font-bold text-secondary uppercase tracking-[0.25em] mb-5"
            >
              — Por que escolher a ARKNET
            </motion.p>
            <div className="overflow-hidden">
              <motion.h2
                variants={{
                  hidden: { y: "100%" },
                  show: { y: 0, transition: { duration: 0.8, ease: EASE_OUT_EXPO } },
                }}
                className="text-4xl md:text-5xl font-extrabold text-white leading-[1.1] max-w-lg"
              >
                O seu parceiro<br />estratégico em<br />tecnologia
              </motion.h2>
            </div>
          </div>
          <motion.p
            variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } }}
            className="text-base text-slate-400 leading-relaxed max-w-sm md:text-right"
          >
            Combinamos expertise técnica e suporte especializado para impulsionar o seu negócio.
          </motion.p>
        </motion.div>

        {/* Cards — staggered entrance */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          variants={cardContainerVariants}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-white/10"
        >
          {diferenciais.map((item, index) => {
            const Icon = item.icon
            return (
              <motion.div
                key={index}
                variants={cardVariants}
                className="group bg-slate-950 p-8 hover:bg-slate-900 transition-colors duration-300 relative overflow-hidden"
              >
                {/* Ghost number — grows on hover */}
                <motion.span
                  className="absolute top-4 right-4 text-7xl font-black text-white/[0.04] leading-none select-none group-hover:text-white/[0.07] transition-colors duration-500"
                >
                  {item.number}
                </motion.span>

                <div className="relative z-10">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: -5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    className="mb-6 p-3 w-fit bg-primary/20 text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300"
                  >
                    <Icon className="h-6 w-6" />
                  </motion.div>

                  <h3 className="text-lg font-bold text-white mb-3">
                    {item.title}
                  </h3>

                  <p className="text-sm leading-relaxed text-slate-400">
                    {item.text}
                  </p>
                </div>
              </motion.div>
            )
          })}
        </motion.div>

        {/* CTA Strip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="mt-16 border border-white/10 p-10 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8"
        >
          <div>
            <p className="text-secondary text-xs font-bold uppercase tracking-[0.2em] mb-3">Pronto para começar?</p>
            <h3 className="text-2xl md:text-3xl font-extrabold text-white leading-snug max-w-md">
              Transforme a infraestrutura do seu negócio hoje
            </h3>
            <p className="mt-3 text-slate-400 text-sm leading-relaxed max-w-sm">
              A nossa equipa responde em menos de 24 horas com uma proposta personalizada.
            </p>
          </div>
          <div className="flex flex-wrap gap-4 shrink-0">
            <motion.div whileHover={{ y: -3 }} whileTap={{ scale: 0.96 }} className="inline-flex">
              <Link
                href="#contacto"
                className="inline-flex items-center gap-2 bg-secondary px-8 py-4 text-sm font-semibold text-white hover:bg-secondary/90 transition shadow-lg shadow-secondary/20"
              >
                Solicitar Proposta
                <ArrowRight className="h-4 w-4" />
              </Link>
            </motion.div>
            <motion.div whileHover={{ y: -3 }} whileTap={{ scale: 0.96 }} className="inline-flex">
              <Link
                href="/loja"
                className="inline-flex items-center gap-2 border border-white/15 px-8 py-4 text-sm font-semibold text-white hover:border-white/30 hover:bg-white/5 transition"
              >
                Ver Loja
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
