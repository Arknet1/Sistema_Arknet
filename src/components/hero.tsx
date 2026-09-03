'use client'

import Image from "next/image"
import Link from "next/link"
import dynamic from "next/dynamic"
import { motion, useScroll, useTransform } from "framer-motion"
import { ArrowRight, Check, Users, Award, Clock, Wifi } from "lucide-react"
import hero from "@/assets/sessoes/5.jpeg"
import { CountUp } from "@/components/count-up"

const GlobeCanvas = dynamic(() => import("@/components/hero-globe"), {
  ssr: false,
  loading: () => (
    <div
      className="block h-[260px] w-[260px] sm:h-[320px] sm:w-[320px] md:h-[660px] md:w-[660px] mx-auto rounded-full bg-white/4"
      aria-hidden
    />
  ),
})

const stats = [
  { icon: Award, countTo: 10, suffix: "+", static: null, label: "Anos de Experiência" },
  { icon: Users, countTo: 500, suffix: "+", static: null, label: "Clientes Satisfeitos" },
  { icon: Wifi, countTo: null, suffix: null, static: "99.9%", label: "Uptime Garantido" },
  { icon: Clock, countTo: null, suffix: null, static: "24/7", label: "Suporte Técnico" },
]

const EASE_EXPO = [0.16, 1, 0.3, 1] as const

export default function Hero() {
  const { scrollY } = useScroll()
  const bgY = useTransform(scrollY, [0, 700], ["0%", "28%"])

  return (
    <section
      id="top"
      className="relative overflow-hidden"
      style={{
        background:
          "linear-gradient(150deg, #0c2348 0%, #091830 55%, #050c18 100%)",
      }}
    >
      <motion.div
        className="absolute inset-0 scale-[1.08] md:scale-[1.18] origin-top"
        style={{ y: bgY }}
      >
        <Image
          src={hero}
          alt="ARKNET — Infraestrutura de Telecomunicações e Conectividade Empresarial em Angola"
          fill
          priority
          quality={72}
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#091830]/95 via-[#091830]/70 to-[#050c18]/55 md:from-[#091830]/92 md:via-[#091830]/55 md:to-[#050c18]/35" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-[#050c18]/70" />
      </motion.div>

      <div className="pointer-events-none absolute right-[-25%] top-[8%] h-[45vh] w-[45vh] rounded-full border border-white/[0.025] md:right-[-8%] md:top-[5%] md:h-[90vh] md:w-[90vh]" />
      <div className="pointer-events-none absolute right-[-10%] top-[18%] h-[35vh] w-[35vh] rounded-full border border-white/[0.035] md:right-[-2%] md:top-[15%] md:h-[65vh] md:w-[65vh]" />
      <div className="pointer-events-none absolute right-[2%] top-[28%] h-[22vh] w-[22vh] rounded-full border border-primary/[0.06] md:right-[8%] md:top-[25%] md:h-[40vh] md:w-[40vh]" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 pt-24 sm:pt-28 md:pt-40 pb-10 md:pb-16">
        <div className="grid md:grid-cols-2 gap-10 md:gap-8 items-center">
          <div className="flex flex-col order-2 md:order-1">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-6 sm:mb-8 flex items-center gap-3"
            >
              <motion.span
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{
                  duration: 0.55,
                  delay: 0.1,
                  ease: EASE_EXPO,
                }}
                style={{ originX: 0 }}
                className="block h-px w-8 sm:w-10 bg-secondary"
              />
              <span className="text-[10px] sm:text-[11px] font-bold tracking-[0.22em] sm:tracking-[0.28em] text-secondary/80 uppercase">
                Telecomunicações · IT · Cloud
              </span>
            </motion.div>

            <div className="overflow-hidden leading-[0.86]">
              <motion.h1
                initial={{ y: "105%" }}
                animate={{ y: 0 }}
                transition={{
                  duration: 0.7,
                  delay: 0.2,
                  ease: EASE_EXPO,
                }}
                className="text-[clamp(3.4rem,18vw,8.5rem)] font-black tracking-tight leading-[0.86] flex items-baseline"
              >
                <span className="text-white">ARK</span>
                <span className="text-secondary animate-text-glow">NET</span>
                <span className="sr-only"> — Telecomunicações, Internet Empresarial e Soluções de TI em Angola</span>
              </motion.h1>
            </div>

            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{
                duration: 0.6,
                delay: 0.45,
                ease: EASE_EXPO,
              }}
              style={{ originX: 0 }}
              className="mt-5 sm:mt-7 h-px w-14 sm:w-16 bg-white/15"
            />

            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.5 }}
              className="mt-4 sm:mt-5 text-lg sm:text-xl md:text-2xl font-light text-white/80 tracking-tight"
            >
              Ligamos Angola ao mundo.
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.6 }}
              className="mt-3 sm:mt-4 max-w-full sm:max-w-[420px] md:max-w-[340px] text-[13px] sm:text-sm leading-[1.8] sm:leading-[1.9] text-white/50"
            >
              Infraestrutura de rede, suporte técnico e cloud para empresas que querem crescer em Angola e no mundo.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
              className="mt-7 sm:mt-9 flex flex-col sm:flex-row gap-3 w-full sm:w-auto"
            >
              <motion.div
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.96 }}
                className="flex w-full sm:w-auto"
              >
                <Link
                  href="#contacto"
                  className="w-full sm:w-auto justify-center inline-flex items-center gap-2 bg-secondary px-6 sm:px-8 py-4 text-sm font-bold text-white shadow-xl shadow-secondary/25 hover:bg-secondary/90 transition"
                >
                  Solicitar Serviço
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </motion.div>

              <motion.div
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.96 }}
                className="flex w-full sm:w-auto"
              >
                <Link
                  href="/servicos"
                  className="w-full sm:w-auto justify-center inline-flex items-center gap-2 border border-white/20 px-6 sm:px-8 py-4 text-sm font-semibold text-white hover:bg-white/[0.07] transition"
                >
                  Ver Serviços
                </Link>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.85 }}
              className="mt-7 sm:mt-9 flex flex-wrap gap-x-5 sm:gap-x-7 gap-y-3"
            >
              {["Suporte 24/7", "Empresa Certificada", "+500 Clientes"].map(
                (label, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <Check className="h-3 w-3 text-secondary shrink-0" />
                    <span className="text-[11px] sm:text-[12px] text-white/50 font-medium">
                      {label}
                    </span>
                  </div>
                )
              )}
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.1, delay: 0.35 }}
            className="flex items-center justify-center relative order-1 md:order-2"
          >
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="h-[220px] w-[220px] sm:h-[320px] sm:w-[320px] md:h-[460px] md:w-[460px] rounded-full bg-primary/[0.09] blur-3xl" />
            </div>

            <div className="relative z-10 w-full flex justify-center">
              <GlobeCanvas />

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.4, duration: 0.6 }}
                className="absolute bottom-4 sm:bottom-8 md:bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-2 border border-white/[0.1] bg-white/[0.05] backdrop-blur-sm px-3 py-1.5 sm:px-4 sm:py-2 whitespace-nowrap"
              >
                <motion.span
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [1, 0.5, 1],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="block h-1.5 w-1.5 rounded-full bg-secondary"
                />

                <span className="text-[8px] sm:text-[10px] font-bold uppercase tracking-[0.18em] sm:tracking-[0.22em] text-white/40">
                  Rede Global · Nacional
                </span>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 14 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.6, duration: 0.5 }}
                className="absolute top-2 right-0 sm:top-8 sm:right-2 md:top-16 md:-right-2 border border-white/[0.08] bg-slate-900/80 backdrop-blur-sm px-3 py-2 md:px-4 md:py-3"
              >
                <p className="text-[7px] sm:text-[8px] md:text-[9px] uppercase tracking-widest text-white/30 mb-0.5">
                  Conexões activas
                </p>

                <p className="text-lg sm:text-xl md:text-2xl font-black text-white leading-none">
                  +20{" "}
                  <span className="text-secondary text-[10px] sm:text-xs md:text-sm font-bold">
                    cidades
                  </span>
                </p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 1.0 }}
        className="relative z-10 mt-4 md:mt-6"
      >
        <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        <div className="bg-black/35 backdrop-blur-sm">
          <div className="mx-auto max-w-7xl px-2 sm:px-6">
            <div className="grid grid-cols-2 md:grid-cols-4">
              {stats.map((stat, idx) => {
                const Icon = stat.icon

                return (
                  <motion.div
                    key={idx}
                    whileHover={{
                      backgroundColor: "rgba(255,255,255,0.03)",
                    }}
                    className="group flex flex-col items-center py-5 sm:py-6 px-3 sm:px-4 text-center border-r border-b md:border-b-0 border-white/[0.05] even:border-r-0 md:even:border-r md:last:border-r-0 transition-colors duration-300"
                  >
                    <Icon className="h-4 w-4 text-secondary mb-3 group-hover:scale-110 transition-transform duration-300" />

                    <p className="text-[clamp(1.3rem,5vw,2.2rem)] font-black text-white leading-none">
                      {stat.countTo !== null ? (
                        <CountUp
                          to={stat.countTo}
                          suffix={stat.suffix ?? ""}
                          duration={2}
                        />
                      ) : (
                        stat.static
                      )}
                    </p>

                    <p className="mt-2 text-[9px] sm:text-[10px] text-white/30 uppercase tracking-[0.14em] sm:tracking-[0.2em]">
                      {stat.label}
                    </p>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  )
}