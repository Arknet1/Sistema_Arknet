'use client'

import { motion } from "framer-motion"

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const
import Image from "next/image"
import Link from "next/link"
import { ArrowRight, CheckCircle, Clock, ShieldCheck, TrendingUp } from "lucide-react"
import about from "@/assets/office.jpeg"
import { mockAboutUs } from "@/lib/mock-data"
import { CountUp } from "@/components/count-up"

const features = [
  { icon: ShieldCheck, text: "Empresa Certificada" },
  { icon: CheckCircle, text: "Suporte 24/7" },
  { icon: Clock, text: "Resposta em menos de 24h" },
  { icon: TrendingUp, text: "Resultados Comprovados" },
]

const metrics = [
  { to: 10,  suffix: "+",  label: "Anos no Mercado" },
  { to: 500, suffix: "+",  label: "Clientes Satisfeitos" },
  { to: 7,   suffix: "",   label: "Áreas de Serviço" },
  { to: 100, suffix: "%",  label: "Compromisso com a Qualidade" },
]

export default function Sobre() {
  return (
    <section className="py-28 bg-slate-50" id="sobre">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-12 gap-16 items-center">

          {/* Image column */}
          <div className="md:col-span-5 relative order-2 md:order-1">
            <motion.div
              initial={{ clipPath: "inset(0 100% 0 0)" }}
              whileInView={{ clipPath: "inset(0 0% 0 0)" }}
              transition={{ duration: 0.9, ease: EASE_OUT_EXPO }}
              viewport={{ once: true }}
              className="relative h-[420px] md:h-[520px] overflow-hidden"
            >
              <Image
                src={about}
                alt="Sobre a ARKNET"
                fill
                className="object-cover"
              />
            </motion.div>
            {/* Overlap card — slides in after image */}
            <motion.div
              initial={{ opacity: 0, x: 20, y: 20 }}
              whileInView={{ opacity: 1, x: 0, y: 0 }}
              transition={{ duration: 0.5, delay: 0.75 }}
              viewport={{ once: true }}
              className="absolute -bottom-6 -right-6 bg-primary text-white p-6 shadow-2xl"
            >
              <p className="text-4xl font-black">10+</p>
              <p className="text-xs font-medium text-white/70 uppercase tracking-wider mt-1">Anos de experiência</p>
            </motion.div>
          </div>

          {/* Text column */}
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={{
              hidden: {},
              show: { transition: { staggerChildren: 0.12 } },
            }}
            className="md:col-span-7 order-1 md:order-2"
          >
            <div className="overflow-hidden">
              <motion.h2
                variants={{
                  hidden: { y: "100%" },
                  show: { y: 0, transition: { duration: 0.7, ease: EASE_OUT_EXPO } },
                }}
                className="text-4xl md:text-5xl font-extrabold text-slate-900 leading-[1.1]"
              >
                Tecnologia e inovação<br />ao serviço do seu negócio
              </motion.h2>
            </div>

            <motion.p
              variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } }}
              className="mt-7 text-base text-slate-500 leading-relaxed"
            >
              {mockAboutUs.institutionalText}
            </motion.p>

            {/* Feature list — staggered */}
            <motion.div
              variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } } }}
              className="mt-10 grid grid-cols-2 gap-4"
            >
              {features.map((item, idx) => (
                <motion.div
                  key={idx}
                  variants={{ hidden: { opacity: 0, x: -16 }, show: { opacity: 1, x: 0, transition: { duration: 0.4 } } }}
                  className="flex items-center gap-3"
                >
                  <div className="shrink-0 p-2 bg-primary text-white">
                    <item.icon className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-semibold text-slate-700">{item.text}</span>
                </motion.div>
              ))}
            </motion.div>

            {/* CTA para página da Empresa */}
            <motion.div
              variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } }}
              className="mt-10"
            >
              <Link
                href="/empresa"
                className="inline-flex items-center gap-2.5 bg-primary hover:bg-primary/90 px-7 py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg transition"
              >
                Conhecer a ARKNET
                <ArrowRight className="h-4 w-4" />
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {/* Metrics Row */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mt-24 grid grid-cols-2 md:grid-cols-4 bg-white border border-slate-200 divide-x divide-slate-200 overflow-hidden shadow-sm"
        >
          {metrics.map((metric, idx) => (
            <div key={idx} className="p-8 text-center group hover:bg-primary transition-all duration-300 cursor-default">
              <p className="text-4xl font-black text-primary group-hover:text-white transition-colors duration-300">
                <CountUp to={metric.to} suffix={metric.suffix} duration={1.8 + idx * 0.15} />
              </p>
              <p className="mt-2 text-sm text-slate-500 group-hover:text-white/75 transition-colors duration-300 font-medium">
                {metric.label}
              </p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
