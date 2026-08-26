"use client"

import { FormEvent, useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Mail, MapPin, Phone, Send, CheckCircle2, Lock } from "lucide-react"
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
import { mockServices } from "@/lib/mock-data"
import { dataStore, CompanySettings } from "@/lib/data-store"

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
  const [settings, setSettings] = useState<CompanySettings>(dataStore.getSettings())
  const [newsletterEmail, setNewsletterEmail] = useState("")
  const [newsletterMsg, setNewsletterMsg] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [isSubscribing, setIsSubscribing] = useState(false)

  useEffect(() => {
    const update = () => setSettings(dataStore.getSettings())
    const unsub = dataStore.subscribe(update)
    return () => unsub()
  }, [])

  const phones = settings.phones?.length ? settings.phones : ["+244 935 208 449"]
  const emails = settings.emails?.length ? settings.emails : ["info@arknet.co.ao", "negocios@arknet.co.ao"]
  const address = [settings.address, settings.city].filter(Boolean).join(", ") || "Luanda, Angola"

  const resolveHref = (href: string) => {
    if (!href.startsWith("#")) {
      return href
    }
    return pathname === "/" ? href : `/${href}`
  }

  const handleNewsletter = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!newsletterEmail.trim()) return

    setIsSubscribing(true)
    const res = dataStore.addSubscriber(newsletterEmail.trim())
    setIsSubscribing(false)

    if (res.success) {
      setNewsletterMsg({ type: "success", text: res.message })
      setNewsletterEmail("")
    } else {
      setNewsletterMsg({ type: "error", text: res.message })
    }
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

          <div className="w-full sm:w-auto">
            {newsletterMsg ? (
              <div
                className={`p-3 text-xs font-semibold rounded flex items-center gap-2 ${
                  newsletterMsg.type === "success"
                    ? "bg-emerald-950/80 text-emerald-300 border border-emerald-800"
                    : "bg-rose-950/80 text-rose-300 border border-rose-800"
                }`}
              >
                {newsletterMsg.type === "success" && <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />}
                <span>{newsletterMsg.text}</span>
                <button
                  onClick={() => setNewsletterMsg(null)}
                  className="ml-2 text-white/60 hover:text-white text-xs underline"
                >
                  Ok
                </button>
              </div>
            ) : (
              <form className="flex gap-2 w-full sm:w-auto" onSubmit={handleNewsletter}>
                <input
                  type="email"
                  required
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="O seu email"
                  className="flex-1 sm:w-72 bg-white/5 border border-white/10 px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none focus:border-primary transition"
                />
                <button
                  type="submit"
                  disabled={isSubscribing}
                  className="bg-secondary px-5 py-3 text-sm font-semibold text-white hover:bg-secondary/90 transition flex items-center gap-2 shrink-0 disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                  Subscrever
                </button>
              </form>
            )}
          </div>
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
            <Link href="/" className="inline-flex items-center">
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
            <div className="mt-8 flex gap-3">
              {settings.socialLinks?.linkedin && (
                <a
                  href={settings.socialLinks.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2.5 bg-white/5 hover:bg-primary/20 text-slate-400 hover:text-white transition"
                  title="LinkedIn"
                >
                  <FaLinkedin className="h-4 w-4" />
                </a>
              )}
              {settings.socialLinks?.facebook && (
                <a
                  href={settings.socialLinks.facebook}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2.5 bg-white/5 hover:bg-primary/20 text-slate-400 hover:text-white transition"
                  title="Facebook"
                >
                  <FaFacebook className="h-4 w-4" />
                </a>
              )}
              {settings.socialLinks?.instagram && (
                <a
                  href={settings.socialLinks.instagram}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2.5 bg-white/5 hover:bg-primary/20 text-slate-400 hover:text-white transition"
                  title="Instagram"
                >
                  <FaInstagram className="h-4 w-4" />
                </a>
              )}
            </div>
          </motion.div>

          {/* Column 2: Navigation Links */}
          <motion.div
            initial={colHidden}
            whileInView={colShow}
            viewport={{ once: true }}
            transition={{ duration: 0.55, delay: 0.1, ease: "easeOut" }}
          >
            <span className="text-xs font-semibold uppercase tracking-widest text-primary">
              Empresa
            </span>

            <ul className="mt-6 space-y-3.5 text-sm">
              <li>
                <Link href={resolveHref("#sobre")} className="hover:text-white transition">
                  Sobre Nós
                </Link>
              </li>
              <li>
                <Link href="/loja" className="hover:text-white transition">
                  Loja Online
                </Link>
              </li>
              <li>
                <Link href="/academia" className="hover:text-white transition">
                  Academia & Cursos
                </Link>
              </li>
              <li>
                <Link href="/eventos" className="hover:text-white transition">
                  Eventos
                </Link>
              </li>
              <li>
                <Link href="/carreiras" className="hover:text-white transition">
                  Carreiras & Vagas
                </Link>
              </li>
              <li>
                <Link href={resolveHref("#contacto")} className="hover:text-white transition">
                  Solicitar Cotação
                </Link>
              </li>
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

            <ul className="mt-6 space-y-3.5 text-sm">
              {mockServices.slice(0, 5).map((service) => (
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
              {settings.whatsappChannelUrl && (
                <li className="flex items-center gap-4">
                  <FaWhatsapp className="h-4 w-4 text-green-500 shrink-0" />
                  <a
                    href={settings.whatsappChannelUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-green-400 transition"
                  >
                    Canal ARKNET Oficial no WhatsApp
                  </a>
                </li>
              )}
            </ul>
          </motion.div>
        </div>
      </div>

      {/* Copyright & Admin Link */}
      <div className="border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-slate-600">
            © {new Date().getFullYear()} ARKNET — Todos os direitos reservados.
          </p>

          <div className="flex items-center gap-6 text-xs text-slate-600">
            <Link href="/admin/login" className="hover:text-primary transition flex items-center gap-1.5 font-semibold">
              <Lock className="h-3 w-3" />
              Painel de Gestão (Admin)
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
