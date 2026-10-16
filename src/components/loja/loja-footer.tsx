'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
  RefreshCcw,
  FileText,
  Clock,
  ArrowUpRight,
  ExternalLink,
} from 'lucide-react'
import { FaWhatsapp, FaFacebook, FaLinkedin, FaInstagram } from 'react-icons/fa'
import { dataStore, CompanySettings } from '@/lib/data-store'
import { JMATOS_CONFIG, getLojaCompanyInfo } from '@/lib/empresas'

export default function LojaFooter() {
  const [settings, setSettings] = useState<CompanySettings>(() => dataStore.getSettings())

  useEffect(() => {
    const update = () => setSettings(dataStore.getSettings())
    const unsub = dataStore.subscribe(update)
    return () => unsub()
  }, [])

  const phones = settings.phones?.length ? settings.phones : ['+244 935 208 449']
  const emails = settings.emails?.length ? settings.emails : ['info@arknet.co.ao']
  const address = [settings.address, settings.city].filter(Boolean).join(', ') || 'Kilamba, Luanda, Angola'
  const nif = '5412398760'

  return (
    <footer className="bg-[#0b1329] text-slate-300 border-t border-white/10 mt-auto">
      {/* Faixa de Benefícios / Confiança da Loja */}
      <div className="border-b border-white/10 bg-white/2">
        <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20 text-primary shrink-0">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Garantia Oficial</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">Equipamentos originais com assistência técnica local.</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20 text-primary shrink-0">
              <RefreshCcw className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Trocas e Devoluções</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">Até 7 dias para devolução de artigos selados.</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20 text-primary shrink-0">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Faturação com NIF</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">Emissão de Proforma e Fatura com NIF oficial.</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20 text-primary shrink-0">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Levantamento ou Entrega</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">Recolha imediata em Luanda ou entrega rápida.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo Principal do Rodapé */}
      <div className="max-w-7xl mx-auto px-6 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Coluna 1: Marca J.Matos */}
          <div className="space-y-4">
            <div className="relative h-12 w-44">
              <Image
                src={JMATOS_CONFIG.logo}
                alt={`${JMATOS_CONFIG.nome} - ${JMATOS_CONFIG.slogan}`}
                fill
                sizes="176px"
                className="object-contain object-left"
              />
            </div>
            <p className="text-xs leading-relaxed text-slate-400">
              Loja online especializada em equipamentos de telecomunicações, redes cabeadas, Wi-Fi 6, servidores e acessórios de conectividade para empresas e particulares.
            </p>
            <div className="pt-2">
              <span className="inline-block px-2.5 py-1 bg-white/5 border border-white/10 rounded-md text-[10px] font-bold text-slate-300 uppercase tracking-wider">
                {JMATOS_CONFIG.subtitulo}
              </span>
            </div>
          </div>

          {/* Coluna 2: Navegação da Loja */}
          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-white mb-4 border-l-2 border-primary pl-2.5">
              Navegação na Loja
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/loja" className="hover:text-primary transition">
                  Todos os Produtos
                </Link>
              </li>
              <li>
                <Link href="/loja/favoritos" className="hover:text-primary transition">
                  Lista de Desejos / Favoritos
                </Link>
              </li>
              <li>
                <Link href="/loja/carrinho" className="hover:text-primary transition">
                  O Meu Carrinho
                </Link>
              </li>
              <li>
                <Link href="/cliente/pedidos" className="hover:text-primary transition">
                  Acompanhar Encomendas
                </Link>
              </li>
              <li>
                <Link href="/" className="inline-flex items-center gap-1 text-slate-400 hover:text-white transition mt-2 pt-2 border-t border-white/5">
                  <span>Ir para o Portal ARKNET</span>
                  <ExternalLink className="h-3 w-3 text-primary" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Coluna 3: Garantias e Suporte */}
          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-white mb-4 border-l-2 border-primary pl-2.5">
              Garantia e Apoio
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <span className="text-slate-300 font-semibold block">Garantia Técnica:</span>
                12 a 24 meses com suporte local em Luanda.
              </li>
              <li>
                <span className="text-slate-300 font-semibold block">Trocas e Devoluções:</span>
                Até 7 dias com embalagem original intacta.
              </li>
              <li>
                <span className="text-slate-300 font-semibold block">Cotações Proforma:</span>
                Disponíveis online em cada página de produto.
              </li>
              <li>
                <Link href="/privacidade" className="hover:text-white transition text-[11px] underline block mt-2">
                  Política de Privacidade
                </Link>
              </li>
            </ul>
          </div>

          {/* Coluna 4: Contactos, Morada e NIF Oficial */}
          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-white mb-4 border-l-2 border-primary pl-2.5">
              Contactos e Faturação
            </h4>
            <ul className="space-y-3 text-xs">
              {phones.map((phone) => (
                <li key={phone} className="flex items-center gap-2.5">
                  <Phone className="h-4 w-4 text-primary shrink-0" />
                  <a href={`tel:${phone.replace(/\s+/g, '')}`} className="hover:text-white transition font-mono">
                    {phone}
                  </a>
                </li>
              ))}

              {emails.map((email) => (
                <li key={email} className="flex items-center gap-2.5">
                  <Mail className="h-4 w-4 text-primary shrink-0" />
                  <a href={`mailto:${email}`} className="hover:text-white transition">
                    {email}
                  </a>
                </li>
              ))}

              <li className="flex items-start gap-2.5 text-slate-400">
                <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span>{address}</span>
              </li>

              <li className="pt-2 border-t border-white/10">
                <p className="text-[11px] text-slate-400">
                  <span className="font-bold text-white">NIF:</span>{' '}
                  <span className="font-mono text-slate-200">{nif}</span>
                </p>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Barra Inferior com a Frase Institucional Obrigatória */}
      <div className="border-t border-white/10 py-5 bg-black/40">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left text-xs text-slate-400">
          <p className="font-semibold text-slate-300">
            {JMATOS_CONFIG.subtitulo}
          </p>
          <p className="text-[11px] text-slate-500">
            © {new Date().getFullYear()} {JMATOS_CONFIG.nome}. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}
