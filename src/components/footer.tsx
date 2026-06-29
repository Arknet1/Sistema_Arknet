"use client"

import { FormEvent } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Mail, MapPin, Phone, Send } from "lucide-react"
import {
  FaLinkedin,
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaYoutube,
  FaGithub,
  FaWhatsapp,
} from "react-icons/fa"
import Image from "next/image"
import { motion } from "framer-motion"
import icon from "@/assets/icon18.png"
import { mockContactInfo, mockSocialProfiles, mockServices } from "@/lib/mock-data"

const colHidden = { opacity: 0, y: 32 }
const colShow = { opacity: 1, y: 0 }

const socialIconMap: Record<string, React.ElementType> = {
  linkedin: FaLinkedin,
  facebook: FaFacebook,
  twitter: FaTwitter,
  instagram: FaInstagram,
  youtube: FaYoutube,
  github: FaGithub,
  whatsapp: FaWhatsapp,
}

export default function Footer() {
  const pathname = usePathname()
  const phones = mockContactInfo?.phones ?? []
  const emails = mockContactInfo?.emails ?? []
  const address = [mockContactInfo?.address, mockContactInfo?.city]
    .filter(Boolean)
    .join(", ")

  const resolveHref = (href: string) => {
    if (!href.startsWith('#')) {
      return href
    }
    return pathname === '/' ? href : `/${href}`
  }

  const handleNewsletter = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
  }

  return (
    <footer className="bg-slate-950 text-slate-400">
      {/* Newsletter Banner */}
      <div
        className="border-b border-white/5"
        style={{
          background:
            "linear-gradient(90deg, rgba(30,96,182,0.15) 0%, rgba(30,96,182,0.05) 100%)",
        }}
      >
        <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1 h-5 bg-secondary" />
              <p className="text-white font-extrabold text-lg">
                Subscreva a nossa newsletter
              </p>
            </div>
            <p className="text-slate-400 text-sm">
              Receba novidades, promoções e dicas tecnológicas directamente no seu email.
            </p>
          </div>

          <form className="flex gap-2 w-full sm:w-auto" onSubmit={handleNewsletter}>
            <input
              type="email"
              placeholder="O seu email"
              className="flex-1 sm:w-72 bg-white/5 border border-white/10 px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none focus:border-primary transition"
            />
            <button
              type="submit"
              className="bg-secondary px-5 py-3 text-sm font-semibold text-white hover:bg-secondary/90 transition flex items-center gap-2 shrink-0"
            >
              <Send className="h-4 w-4" />
              Subscrever
            </button>
          </form>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Column 1: Brand */}
          <motion.div
            initial={colHidden}
            whileInView={colShow}
            viewport={{ once: true }}
            transition={{ duration: 0.55, delay: 0, ease: "easeOut" }}
          >
            <Link href="#top" className="inline-flex items-center">
              <Image
                src={icon}
                alt="ARKNET Logo"
                width={200}
                height={200}
                className="h-16 w-auto"
              />
            </Link>

            <p className="mt-6 text-sm leading-relaxed">
              Soluções de telecomunicações e tecnologias de informação com excelência e compromisso em Angola.
            </p>

            {/* Socials */}
            {mockSocialProfiles.length > 0 && (
              <div className="mt-8 flex gap-3">
                {mockSocialProfiles.map((profile, i) => {
                  const Icon =
                    socialIconMap[profile.platform.toLowerCase()] || FaLinkedin

                  return (
                    <motion.a
                      key={profile.id}
                      href={profile.url}
                      target="_blank"
                      rel="noreferrer"
                      whileHover={{ y: -3, scale: 1.15 }}
                      whileTap={{ scale: 0.9 }}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 + i * 0.08, duration: 0.3 }}
                      viewport={{ once: true }}
                      className="p-2.5 bg-white/5 hover:bg-primary/20 text-slate-500 hover:text-white transition"
                    >
                      <Icon className="h-4 w-4" />
                    </motion.a>
                  )
                })}
              </div>
            )}
          </motion.div>

          {/* Column 2: Navigation */}
          <motion.div
            initial={colHidden}
            whileInView={colShow}
            viewport={{ once: true }}
            transition={{ duration: 0.55, delay: 0.1, ease: "easeOut" }}
          >
            <span className="text-xs font-semibold uppercase tracking-widest text-primary">
              Navegação
            </span>

            <ul className="mt-6 space-y-4 text-sm">
              {[
                { href: "/", label: "Início" },
                { href: "#sobre", label: "Empresa" },
                { href: "#servicos", label: "Serviços" },
                { href: "#porque-nos-escolher", label: "Por que escolher" },
                { href: "/loja", label: "Loja" },
                { href: "/academia", label: "Academia" },
                { href: "/eventos", label: "Eventos" },
                { href: "/carreiras", label: "Carreiras" },
                { href: "#contacto", label: "Contacto" },
              ].map((item) => (
                <li key={item.href}>
                  <Link
                    href={resolveHref(item.href)}
                    className="hover:text-white transition flex items-center gap-2 group"
                  >
                    <span className="text-primary group-hover:translate-x-1 transition-transform inline-block">
                      ›
                    </span>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Column 3: Services */}
          <motion.div
            initial={colHidden}
            whileInView={colShow}
            viewport={{ once: true }}
            transition={{ duration: 0.55, delay: 0.2, ease: "easeOut" }}
          >
            <span className="text-xs font-semibold uppercase tracking-widest text-primary">
              Serviços
            </span>

            <ul className="mt-6 space-y-4 text-sm">
              {mockServices.slice(0, 6).map((service) => (
                <li key={service.id}>
                  <Link
                    href={resolveHref("#servicos")}
                    className="hover:text-white transition flex items-center gap-2 group"
                  >
                    <span className="text-primary group-hover:translate-x-1 transition-transform inline-block">
                      ›
                    </span>
                    {service.name}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Column 4: Contact */}
          <motion.div
            initial={colHidden}
            whileInView={colShow}
            viewport={{ once: true }}
            transition={{ duration: 0.55, delay: 0.3, ease: "easeOut" }}
          >
            <span className="text-xs font-semibold uppercase tracking-widest text-primary">
              Contacto
            </span>

            <ul className="mt-6 space-y-5 text-sm">
              {/* Phones */}
              {phones.map((phone) => (
                <li key={phone} className="flex items-center gap-4">
                  <Phone className="h-4 w-4 text-primary shrink-0" />
                  <a
                    href={`tel:${phone.replace(/\s+/g, "")}`}
                    className="hover:text-white transition"
                  >
                    {phone}
                  </a>
                </li>
              ))}

              {/* Emails */}
              {emails.map((email) => (
                <li key={email} className="flex items-center gap-4">
                  <Mail className="h-4 w-4 text-primary shrink-0" />
                  <a
                    href={`mailto:${email}`}
                    className="hover:text-white transition"
                  >
                    {email}
                  </a>
                </li>
              ))}

              {/* Address */}
              <li className="flex items-start gap-4">
                <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span className="text-slate-400">{address}</span>
              </li>

              {/* WhatsApp Channel */}
              {mockContactInfo?.whatsappChannel && (
                <li className="flex items-center gap-4">
                  <FaWhatsapp className="h-4 w-4 text-green-500 shrink-0" />
                  <a
                    href={mockContactInfo.whatsappChannel.url}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-green-400 transition"
                  >
                    {mockContactInfo.whatsappChannel.title}
                  </a>
                </li>
              )}
            </ul>
          </motion.div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-slate-600">
            © {new Date().getFullYear()} ARKNET — Todos os direitos reservados.
          </p>

          <div className="flex gap-6 text-xs text-slate-600">
            <Link href="#" className="hover:text-slate-400 transition">
              Política de Privacidade
            </Link>
            <Link href="#" className="hover:text-slate-400 transition">
              Termos de Serviço
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
