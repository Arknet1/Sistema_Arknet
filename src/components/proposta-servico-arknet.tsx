'use client'

import React, { useEffect } from 'react'
import Image from 'next/image'
import {
  Printer,
  X,
  Server,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Radio,
  Cpu,
  Mail,
  Phone,
  MapPin,
  Building2,
  FileText,
  BadgeCheck,
  MessageCircle,
} from 'lucide-react'
import arknetLogo from '@/assets/icon18.png'
import { ServiceLead } from '@/lib/data-store'
import { ARKNET_SERVICE_DETAILS } from '@/lib/fatura-config'

export { ARKNET_SERVICE_DETAILS }

interface PropostaServicoArknetProps {
  lead: ServiceLead
  onClose: () => void
}

export default function PropostaServicoArknet({ lead, onClose }: PropostaServicoArknetProps) {
  // Fechar com tecla Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  const emissionDate = new Date(lead.createdAt)
  const formattedEmissionDate = emissionDate.toLocaleDateString('pt-AO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })

  const validityDate = new Date(emissionDate.getTime() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-AO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })

  const leadShortId = lead.id.replace(/[^a-zA-Z0-9]/g, '').slice(-6).toUpperCase()
  const docNumber = `PR-ARK2024/${leadShortId}`

  // Determinar SLA e características técnicas com base no tipo de serviço
  const getServiceSpecs = (serviceName: string) => {
    const s = (serviceName || '').toLowerCase()
    if (s.includes('internet') || s.includes('fibra') || s.includes('dedicad')) {
      return {
        category: 'Conectividade & Telecomunicações Dedicadas',
        sla: '99.9% Uptime Contratual Garantido',
        bandwidth: 'Banda Larga Simétrica 1:1 sem contenção',
        latency: 'Latência Reduzida (< 15ms em Luanda, rota direta WACS/SACS)',
        monitoring: 'NOC Ativo 24/7/365 com alertas proativos',
      }
    }
    if (s.includes('ciber') || s.includes('segurança') || s.includes('firewall')) {
      return {
        category: 'Cibersegurança & Proteção Perimetral',
        sla: '99.95% Disponibilidade de Defesa Perimetral',
        bandwidth: 'Inspeção Profunda de Pacotes (DPI) & Mitigação DDoS',
        latency: 'Filtragem em tempo real sem degradação de throughput',
        monitoring: 'SOC (Security Operations Center) 24/7 com relatórios mensais',
      }
    }
    if (s.includes('cloud') || s.includes('servidor') || s.includes('datacenter')) {
      return {
        category: 'Infraestrutura Cloud & Datacenter Local',
        sla: '99.98% SLA de Compute e Armazenamento',
        bandwidth: 'Conexão direta ao IXP Angola (ANGONIX) a 10Gbps',
        latency: 'Backup diário automatizado com retenção de 30 dias',
        monitoring: 'Monitorização contínua de recursos (CPU, RAM, IOPS)',
      }
    }
    return {
      category: 'Engenharia de Redes, Infraestrutura & TI',
      sla: 'Tempo de Resposta Técnico < 2 horas',
      bandwidth: 'Dimensionamento à medida das necessidades operacionais',
      latency: 'Equipamentos certificados de padrão empresarial',
      monitoring: 'Acompanhamento por Engenheiro de Sistemas Sénior',
    }
  }

  const specs = getServiceSpecs(lead.service)

  // URL WhatsApp para continuação de conversa com o suporte técnico ARKNET
  const whatsappUrl = `https://wa.me/244935208449?text=${encodeURIComponent(
    `Olá equipa de suporte ARKNET! Gostaria de acompanhar a minha proposta de serviço:\n` +
    `• Serviço: ${lead.service}\n` +
    `• Referência: ${docNumber}\n` +
    `• Requisitante: ${lead.name}\n` +
    `Podem prestar-me mais esclarecimentos sobre prazos e detalhes técnicos?`
  )}`

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-sm p-3 sm:p-6 flex justify-center items-start print:p-0 print:bg-white print:static print:overflow-visible"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="relative w-full max-w-3xl bg-white border border-slate-300 shadow-2xl rounded-sm my-2 sm:my-6 print:my-0 print:border-none print:shadow-none print:w-full print:max-w-none text-slate-900 font-sans">
        
        {/* Botão de Fechar Discreto no Canto Superior (Oculto no print) */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 z-20 w-8 h-8 rounded-full bg-slate-100 hover:bg-rose-600 hover:text-white text-slate-500 flex items-center justify-center transition shadow-xs border border-slate-300 print:hidden"
          title="Fechar (Esc)"
        >
          <X className="h-4 w-4" />
        </button>

        {/* ========================================================================= */}
        {/* CORPO DA PROPOSTA DE SERVIÇO ARKNET (Identidade Telecom & Engenharia de TI) */}
        {/* ========================================================================= */}
        <div className="p-6 sm:p-8 print:p-6 bg-white text-slate-900 text-[10.5px] sm:text-[11px] leading-normal">
          
          {/* CABEÇALHO INSTITUCIONAL ARKNET */}
          <div className="flex flex-col sm:flex-row justify-between items-start border-b-2 border-[#00102b] pb-5 gap-4">
            
            {/* Lado Esquerdo: Identificação da ARKNET Telecomunicações */}
            <div className="space-y-1 sm:max-w-sm">
              <div className="mb-2">
                <Image
                  src={arknetLogo}
                  alt="ARKNET Angola"
                  width={150}
                  height={45}
                  className="h-9 w-auto object-contain"
                  priority
                />
              </div>

              <h1 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-900">
                ARKNET — Telecomunicações e Soluções de TI, Lda.
              </h1>
              <p className="text-slate-600 font-semibold">
                Operador e Integrador de Redes Corporativas
              </p>
              <p className="text-slate-600">
                <strong className="text-slate-900">NIF:</strong> 5412398760 · Licenciado pelo INACOM
              </p>
              <p className="text-slate-600">
                {ARKNET_SERVICE_DETAILS.address}
              </p>
              <p className="text-slate-600">
                Tel Geral: <strong className="text-slate-900 font-mono">{ARKNET_SERVICE_DETAILS.phone}</strong> · NOC 24/7: <span className="font-mono">{ARKNET_SERVICE_DETAILS.nocEmail}</span>
              </p>
            </div>

            {/* Lado Direito: Caixa Oficial da Proposta */}
            <div className="w-full sm:w-64 bg-[#00102b] text-white p-3.5 shrink-0 text-left">
              <div className="flex items-center justify-between pb-1.5 border-b border-blue-900">
                <span className="font-black uppercase text-[10px] tracking-wider text-blue-400">
                  PROPOSTA TÉCNICA
                </span>
                <span className="text-[9px] font-bold uppercase px-2 py-0.5 bg-blue-900/60 text-blue-200 border border-blue-700">
                  {lead.status.toUpperCase()}
                </span>
              </div>

              <div className="mt-2 space-y-1 font-mono text-[10.5px]">
                <div className="flex justify-between">
                  <span className="text-slate-400 font-sans text-[10px] uppercase">Referência:</span>
                  <span className="font-bold text-white">{docNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-sans text-[10px] uppercase">Data Registo:</span>
                  <span className="text-slate-200">{formattedEmissionDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-sans text-[10px] uppercase">Validade:</span>
                  <span className="text-slate-200">{validityDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-sans text-[10px] uppercase">Departamento:</span>
                  <span className="text-blue-300 font-sans text-[10px] font-bold">Engenharia NOC</span>
                </div>
              </div>
            </div>

          </div>

          {/* DADOS DO CLIENTE / INSTITUIÇÃO REQUISITANTE */}
          <div className="grid sm:grid-cols-2 gap-3.5 my-4">
            
            <div className="p-3.5 border border-slate-300 bg-slate-50/70">
              <div className="text-[10px] font-black uppercase tracking-wider text-[#0284c7] pb-1 mb-1.5 border-b border-slate-200 flex items-center justify-between">
                <span>Entidade / Cliente Requisitante</span>
                <Building2 className="h-3.5 w-3.5 text-slate-400" />
              </div>
              <p className="font-extrabold text-slate-900 text-[11px] uppercase">{lead.name}</p>
              <p className="text-slate-700 mt-0.5">
                <span className="text-slate-500">Contacto Telefónico:</span>{' '}
                <strong className="font-mono text-slate-900">{lead.phone || 'Sob confirmação'}</strong>
              </p>
              <p className="text-slate-700 mt-0.5">
                <span className="text-slate-500">Email Corporativo:</span>{' '}
                <span className="font-mono text-slate-900">{lead.email}</span>
              </p>
              <p className="text-slate-600 mt-0.5">
                <span className="text-slate-500">Canal de Origem:</span>{' '}
                <span className="text-slate-700">{lead.source || 'Portal Oficial ARKNET'}</span>
              </p>
            </div>

            <div className="p-3.5 border border-slate-300 bg-slate-50/70">
              <div className="text-[10px] font-black uppercase tracking-wider text-[#00102b] pb-1 mb-1.5 border-b border-slate-200 flex items-center justify-between">
                <span>Enquadramento do Projeto</span>
                <Server className="h-3.5 w-3.5 text-slate-400" />
              </div>
              <p className="text-slate-700">
                <span className="text-slate-500">Serviço Pretendido:</span>{' '}
                <strong className="text-slate-900">{lead.service}</strong>
              </p>
              <p className="text-slate-700 mt-0.5">
                <span className="text-slate-500">Segmento Técnico:</span>{' '}
                <span className="text-slate-900 font-semibold">{specs.category}</span>
              </p>
              <p className="text-slate-700 mt-0.5">
                <span className="text-slate-500">Local de Instalação:</span>{' '}
                <span className="text-slate-900">Luanda / Angola</span>
              </p>
              <p className="text-slate-500 text-[9.5px] mt-1.5 pt-1 border-t border-slate-200">
                Projeto analisado em conformidade com as normas ITU-T e ISO 27001.
              </p>
            </div>

          </div>

          {/* ========================================================================= */}
          {/* BANNER PROMINENTE: CONTINUAR NO WHATSAPP / CONTACTAR SUPORTE (Oculto no print) */}
          {/* ========================================================================= */}
          <div className="p-3.5 bg-emerald-50 border-2 border-emerald-400 rounded flex flex-col sm:flex-row items-center justify-between gap-3 my-4 print:hidden">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <MessageCircle className="h-5 w-5" />
              </div>
              <div>
                <p className="font-extrabold text-xs uppercase tracking-wide text-emerald-950">
                  Continuar no WhatsApp com o Suporte Técnico
                </p>
                <p className="text-[11px] text-emerald-800">
                  Tem dúvidas ou precisa de ajustar o âmbito técnico? Aceda ao canal direto da ARKNET no WhatsApp.
                </p>
              </div>
            </div>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider rounded transition shrink-0 flex items-center gap-1.5 shadow-sm"
            >
              <MessageCircle className="h-4 w-4" />
              <span>Abrir Conversa WhatsApp</span>
            </a>
          </div>

          {/* ESPECIFICAÇÕES TÉCNICAS E NÍVEIS DE SERVIÇO (SLA) */}
          <div className="my-4 border border-slate-300">
            <div className="bg-[#00102b] text-white p-2.5 flex items-center justify-between font-bold uppercase text-[9.5px] tracking-wider">
              <span>Especificação Técnica do Serviço & Acordo de Nível de Serviço (SLA)</span>
              <span className="text-blue-400 font-mono">ARKNET TELECOM</span>
            </div>

            <div className="p-3.5 bg-white space-y-2.5">
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="p-2.5 border border-slate-200 bg-slate-50/50">
                  <span className="text-[9.5px] font-bold uppercase text-slate-500 block mb-0.5">
                    Disponibilidade Contratual (SLA)
                  </span>
                  <p className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    <span>{specs.sla}</span>
                  </p>
                  <p className="text-[9.5px] text-slate-500 mt-0.5">
                    Compromisso contratual com penalidades compensatórias em caso de desvio.
                  </p>
                </div>

                <div className="p-2.5 border border-slate-200 bg-slate-50/50">
                  <span className="text-[9.5px] font-bold uppercase text-slate-500 block mb-0.5">
                    Capacidade & Débito Técnico
                  </span>
                  <p className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                    <Radio className="h-3.5 w-3.5 text-[#0284c7] shrink-0" />
                    <span>{specs.bandwidth}</span>
                  </p>
                  <p className="text-[9.5px] text-slate-500 mt-0.5">
                    Acesso sem contenção com rota prioritária para tráfego empresarial.
                  </p>
                </div>

                <div className="p-2.5 border border-slate-200 bg-slate-50/50">
                  <span className="text-[9.5px] font-bold uppercase text-slate-500 block mb-0.5">
                    Latência & Desempenho
                  </span>
                  <p className="text-xs font-bold text-slate-900">
                    {specs.latency}
                  </p>
                </div>

                <div className="p-2.5 border border-slate-200 bg-slate-50/50">
                  <span className="text-[9.5px] font-bold uppercase text-slate-500 block mb-0.5">
                    Centro de Gestão & Monitorização
                  </span>
                  <p className="text-xs font-bold text-slate-900">
                    {specs.monitoring}
                  </p>
                </div>
              </div>

              {/* Mensagem / Requisitos Declarados pelo Cliente */}
              <div className="pt-1">
                <span className="text-[9.5px] font-bold uppercase text-slate-500 block mb-1">
                  Âmbito & Mensagem do Requisitante:
                </span>
                <div className="p-3 bg-slate-100 border border-slate-200 text-slate-800 text-[10.5px] leading-relaxed whitespace-pre-wrap font-sans">
                  {lead.message || 'Sem especificações adicionais facultadas.'}
                </div>
              </div>

              {/* Notas de Acompanhamento Técnico (se preenchidas pelo admin) */}
              {lead.notes && (
                <div className="p-2.5 bg-blue-50 border border-blue-200">
                  <span className="text-[9.5px] font-bold uppercase text-blue-900 block mb-0.5">
                    Parecer da Engenharia Técnica ARKNET:
                  </span>
                  <p className="text-[10.5px] text-blue-950 font-medium whitespace-pre-wrap">
                    {lead.notes}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* ========================================================================= */}
          {/* CARIMBO DO NOC / ENGENHARIA ARKNET */}
          {/* ========================================================================= */}
          <div className="my-4 pt-3 border-t border-slate-300 grid sm:grid-cols-2 gap-4 items-center">
            
            {/* Carimbo Oficial da ARKNET */}
            <div className="p-2.5 border-2 border-double border-[#00102b] bg-slate-50 text-[#00102b] font-mono text-center max-w-xs mx-auto sm:mx-0">
              <p className="font-black text-[9.5px] uppercase tracking-widest">
                ARKNET TELECOMUNICAÇÕES, LDA.
              </p>
              <p className="text-[8.5px] font-bold">
                NOC & ENGENHARIA DE REDES · LUANDA
              </p>
              <p className="text-[8.5px] uppercase tracking-wider my-0.5 py-0.5 border-y border-[#00102b]/40 font-black text-[#0284c7]">
                PROPOSTA TÉCNICA HOMOLOGADA
              </p>
              <p className="text-[8px] text-slate-600">
                Registo: {docNumber} · Eng. Redes e TI
              </p>
            </div>

            {/* Assinatura do Responsável Técnico */}
            <div className="text-center sm:text-right space-y-0.5">
              <p className="text-[9.5px] text-slate-500 uppercase tracking-wider">
                Validação Técnica & Direção Comercial:
              </p>
              <div className="h-8 border-b border-slate-400 mx-auto sm:ml-auto sm:mr-0 w-48 pt-4">
                <span className="font-serif italic text-slate-600 text-xs">ARKNET Telecomunicações</span>
              </div>
              <p className="text-[8.5px] text-slate-400">
                Documento corporativo vinculativo durante a validade
              </p>
            </div>

          </div>

          {/* ========================================================================= */}
          {/* RODAPÉ INSTITUCIONAL ARKNET */}
          {/* ========================================================================= */}
          <div className="mt-4 pt-3 border-t border-slate-300 text-[8.5px] text-slate-500 leading-relaxed flex flex-col sm:flex-row justify-between items-start gap-1">
            <p>
              ARKNET Telecomunicações e Soluções Tecnológicas, Lda. · NIF: 5412398760 · Luanda.
            </p>
            <p className="font-mono text-slate-400">
              DOC-ID: {lead.id} · Ref: {docNumber}
            </p>
          </div>

          {/* ========================================================================= */}
          {/* BOTÕES DE FECHAR / IMPRIMIR NA BASE (Ocultos no print) */}
          {/* ========================================================================= */}
          <div className="mt-5 pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 print:hidden">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold text-xs uppercase tracking-wider rounded flex items-center gap-1.5 transition shadow-xs"
              >
                <Printer className="h-4 w-4" />
                <span>Imprimir / PDF A4</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-800 hover:bg-rose-600 text-white font-bold text-xs uppercase tracking-wider rounded flex items-center gap-1.5 transition shadow-xs"
              >
                <X className="h-4 w-4" />
                <span>Fechar Proposta</span>
              </button>
            </div>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-emerald-700 hover:text-emerald-800 font-bold inline-flex items-center gap-1.5 transition"
            >
              <MessageCircle className="h-4 w-4 text-emerald-600" />
              <span>Continuar Conversa no WhatsApp com Suporte</span>
            </a>
          </div>

        </div>

      </div>
    </div>
  )
}
