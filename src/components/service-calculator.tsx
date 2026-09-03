'use client'

import React, { useState, useMemo } from 'react'
import {
  Calculator,
  Wifi,
  Cable,
  Camera,
  ShieldCheck,
  CheckCircle2,
  PhoneCall,
  Send,
  Printer,
  Sparkles,
  Building2,
  User,
  Mail,
  Phone,
  FileText,
  HelpCircle,
  Clock,
  ArrowRight,
} from 'lucide-react'
import { FaWhatsapp } from 'react-icons/fa'
import { dataStore } from '@/lib/data-store'
import { formatProdutoPrice } from '@/lib/format-produto-price'
import { useToast } from '@/lib/toast-context'

type CalculatorModule = 'internet' | 'cablagem' | 'cftv' | 'cloud'

export function ServiceQuoteCalculator() {
  const { success, error, info } = useToast()

  const [activeModule, setActiveModule] = useState<CalculatorModule>('internet')

  // 1. Conectividade & Internet State
  const [internetBandwidth, setInternetBandwidth] = useState<number>(50) // Mbps
  const [internetType, setInternetType] = useState<'fibra' | 'radio' | 'redundante'>('fibra')
  const [hasDedicatedIp, setHasDedicatedIp] = useState<boolean>(true)

  // 2. Cablagem & Rede Local State
  const [networkPoints, setNetworkPoints] = useState<number>(24) // postos de rede
  const [cableType, setCableType] = useState<'cat6' | 'cat6a' | 'fibra_interna'>('cat6')
  const [includeRack, setIncludeRack] = useState<boolean>(true)
  const [wifiAccessPoints, setWifiAccessPoints] = useState<number>(3)

  // 3. CFTV & Segurança State
  const [cameraCount, setCameraCount] = useState<number>(8)
  const [cameraResolution, setCameraResolution] = useState<'1080p' | '4k' | 'colorvu'>('1080p')
  const [storageDays, setStorageDays] = useState<number>(30)
  const [accessControlDoors, setAccessControlDoors] = useState<number>(1)

  // 4. Cloud & Cibersegurança State
  const [userCount, setUserCount] = useState<number>(15)
  const [includeFirewall, setIncludeFirewall] = useState<boolean>(true)
  const [includeCloudBackup, setIncludeCloudBackup] = useState<boolean>(true)

  // Lead Submission Form
  const [clientName, setClientName] = useState('')
  const [clientCompany, setClientCompany] = useState('')
  const [clientEmail, setClientEmail] = useState('')
  const [clientPhone, setClientPhone] = useState('')
  const [clientCity, setClientCity] = useState('Luanda')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submittedLeadId, setSubmittedLeadId] = useState<string | null>(null)

  // Cálculo de Estimativa
  const calculation = useMemo(() => {
    let monthlyEstimate = 0
    let setupEstimate = 0
    let summaryList: string[] = []

    if (activeModule === 'internet') {
      // Base: 50 Mbps ~ 180.000 Kz
      const bandwidthRate = internetBandwidth <= 20 ? 95000 : internetBandwidth <= 50 ? 190000 : internetBandwidth <= 100 ? 320000 : internetBandwidth <= 300 ? 750000 : 1200000
      const typeMultiplier = internetType === 'redundante' ? 1.4 : internetType === 'radio' ? 1.0 : 1.15
      const ipFee = hasDedicatedIp ? 15000 : 0

      monthlyEstimate = Math.round(bandwidthRate * typeMultiplier + ipFee)
      setupEstimate = internetType === 'redundante' ? 150000 : 80000

      summaryList = [
        `Link de Internet Dedicada: ${internetBandwidth} Mbps`,
        `Tecnologia: ${internetType === 'fibra' ? 'Fibra Óptica Dedicada' : internetType === 'radio' ? 'Rádio Micro-ondas PTP' : 'Alta Disponibilidade (Fibra + Rádio Redundante)'}`,
        hasDedicatedIp ? 'Endereço IP Público Fixo Dedicado' : 'IP Dinâmico',
        'SLA 99.9% de Disponibilidade com Suporte 24/7',
      ]
    } else if (activeModule === 'cablagem') {
      const pricePerPoint = cableType === 'cat6' ? 22000 : cableType === 'cat6a' ? 32000 : 45000
      const rackFee = includeRack ? 280000 : 0
      const apFee = wifiAccessPoints * 115000

      setupEstimate = networkPoints * pricePerPoint + rackFee + apFee
      monthlyEstimate = 0 // Manutenção sob contrato

      summaryList = [
        `${networkPoints} Postos de Rede Estruturados (${cableType.toUpperCase()})`,
        includeRack ? 'Bastidor / Rack 19" Equipado com Patch Panels & Organizadores' : 'Sem bastidor adicional',
        `${wifiAccessPoints} Pontos de Acesso Wi-Fi Empresarial de Alta Densidade`,
        'Certificação e Rotulagem de Pontos com Fluke Networks',
      ]
    } else if (activeModule === 'cftv') {
      const pricePerCam = cameraResolution === '1080p' ? 45000 : cameraResolution === '4k' ? 95000 : 75000
      const nvrFee = cameraCount <= 8 ? 160000 : cameraCount <= 16 ? 320000 : 580000
      const storageFee = storageDays === 30 ? 75000 : 140000
      const accessControlFee = accessControlDoors * 185000

      setupEstimate = cameraCount * pricePerCam + nvrFee + storageFee + accessControlFee
      monthlyEstimate = 0

      summaryList = [
        `${cameraCount} Câmaras de Vigilância IP (${cameraResolution === '1080p' ? 'Full HD 1080p' : cameraResolution === '4k' ? 'Ultra HD 4K' : 'ColorVu Visão Noturna 24/7'})`,
        `Gravador NVR Profissional com ${storageDays} Dias de Histórico Contínuo`,
        accessControlDoors > 0 ? `${accessControlDoors} Terminal(is) de Controlo de Acessos Biométrico / RFID` : 'Sem controlo de acessos',
        'Acesso Remoto Seguro via Smartphone e Computador',
      ]
    } else if (activeModule === 'cloud') {
      const perUserRate = 8500
      const firewallRate = includeFirewall ? 120000 : 0
      const backupRate = includeCloudBackup ? 65000 : 0

      monthlyEstimate = userCount * perUserRate + firewallRate + backupRate
      setupEstimate = 75000

      summaryList = [
        `Ambiente Cloud Corporativo para ${userCount} Utilizadores`,
        includeFirewall ? 'Firewall UTM Gerido com Prevenção de Intrusões & Filtro Web' : 'Firewall Básico',
        includeCloudBackup ? 'Backup Cloud Automatizado Diário com Encriptação AES-256' : 'Sem backup cloud',
        'Gestão e Monitorização de Segurança Centralizada',
      ]
    }

    return { monthlyEstimate, setupEstimate, summaryList }
  }, [
    activeModule,
    internetBandwidth,
    internetType,
    hasDedicatedIp,
    networkPoints,
    cableType,
    includeRack,
    wifiAccessPoints,
    cameraCount,
    cameraResolution,
    storageDays,
    accessControlDoors,
    userCount,
    includeFirewall,
    includeCloudBackup,
  ])

  // Submeter Cotação para o DataStore / CRM de Leads
  const handleSubmitSimulation = (e: React.FormEvent) => {
    e.preventDefault()
    if (!clientName.trim() || !clientEmail.trim() || !clientPhone.trim()) {
      error('Por favor, preencha o seu nome, email e contacto telefónico.')
      return
    }

    setIsSubmitting(true)

    const moduleTitle =
      activeModule === 'internet'
        ? 'Internet Dedicada'
        : activeModule === 'cablagem'
        ? 'Cablagem & Rede Local'
        : activeModule === 'cftv'
        ? 'CFTV & Segurança Eletrónica'
        : 'Cloud & Cibersegurança'

    const fullMessage = [
      `SIMULAÇÃO DE COTAÇÃO INTERATIVA (${moduleTitle})`,
      `Estimativa Mensal: ${calculation.monthlyEstimate > 0 ? formatProdutoPrice(calculation.monthlyEstimate) + '/mês' : 'Sob proposta'}`,
      `Estimativa Implementação: ${calculation.setupEstimate > 0 ? formatProdutoPrice(calculation.setupEstimate) : 'Sob proposta'}`,
      '',
      'Especificações Selecionadas:',
      ...calculation.summaryList.map((item) => `• ${item}`),
      '',
      `Localidade: ${clientCity}`,
      clientCompany ? `Empresa: ${clientCompany}` : '',
    ].filter(Boolean).join('\n')

    try {
      const lead = dataStore.addLead({
        name: clientName.trim(),
        email: clientEmail.trim(),
        phone: clientPhone.trim(),
        service: `Simulação: ${moduleTitle}`,
        message: fullMessage,
        source: 'Website - Simulador Interativo',
      })

      setSubmittedLeadId(lead.id)
      success('A sua simulação foi registada com sucesso! Um engenheiro técnico entrará em contacto.', 'Proposta Solicitada')
    } catch (err) {
      error('Ocorreu um erro ao submeter a sua proposta.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Montar link direto para o WhatsApp com os dados da simulação
  const whatsappSimulationText = useMemo(() => {
    const lines = [
      `Olá ARKNET! Efetuei uma simulação no website para *${activeModule.toUpperCase()}*:`,
      '',
      ...calculation.summaryList.map((item) => `• ${item}`),
      '',
      calculation.monthlyEstimate > 0 ? `Valor Mensal Estimado: *${formatProdutoPrice(calculation.monthlyEstimate)}/mês*` : '',
      calculation.setupEstimate > 0 ? `Implementação Estimada: *${formatProdutoPrice(calculation.setupEstimate)}*` : '',
      '',
      clientName ? `Nome: ${clientName}` : '',
      clientCompany ? `Empresa: ${clientCompany}` : '',
      'Gostaria de agendar uma visita técnica / proposta formal.',
    ].filter(Boolean).join('\n')

    return encodeURIComponent(lines)
  }, [activeModule, calculation, clientName, clientCompany])

  return (
    <section id="simulador" className="py-20 bg-gradient-to-b from-slate-900 via-[#0a1226] to-slate-950 text-white relative overflow-hidden">
      
      {/* Background Decorative Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-primary/10 blur-3xl pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/20 border border-primary/40 text-primary text-xs font-black uppercase tracking-widest mb-3">
            <Calculator className="h-4 w-4" />
            Simulador de Custos Online
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Estime a Cotação da sua Infraestrutura de TI
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed">
            Selecione as necessidades tecnológicas da sua empresa e obtenha uma estimativa transparente em Kwanzas (Kz) em tempo real.
          </p>
        </div>

        {/* Module Switcher Tabs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          <button
            type="button"
            onClick={() => { setActiveModule('internet'); setSubmittedLeadId(null); }}
            className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${
              activeModule === 'internet'
                ? 'bg-primary text-white border-primary shadow-lg shadow-primary/25 scale-[1.02]'
                : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
            }`}
          >
            <Wifi className="h-6 w-6" />
            <span className="text-xs font-bold uppercase tracking-wider text-center">Internet Dedicada</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveModule('cablagem'); setSubmittedLeadId(null); }}
            className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${
              activeModule === 'cablagem'
                ? 'bg-primary text-white border-primary shadow-lg shadow-primary/25 scale-[1.02]'
                : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
            }`}
          >
            <Cable className="h-6 w-6" />
            <span className="text-xs font-bold uppercase tracking-wider text-center">Cablagem &amp; Redes</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveModule('cftv'); setSubmittedLeadId(null); }}
            className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${
              activeModule === 'cftv'
                ? 'bg-primary text-white border-primary shadow-lg shadow-primary/25 scale-[1.02]'
                : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
            }`}
          >
            <Camera className="h-6 w-6" />
            <span className="text-xs font-bold uppercase tracking-wider text-center">CFTV &amp; Segurança</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveModule('cloud'); setSubmittedLeadId(null); }}
            className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${
              activeModule === 'cloud'
                ? 'bg-primary text-white border-primary shadow-lg shadow-primary/25 scale-[1.02]'
                : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
            }`}
          >
            <ShieldCheck className="h-6 w-6" />
            <span className="text-xs font-bold uppercase tracking-wider text-center">Cloud &amp; Segurança</span>
          </button>
        </div>

        {/* Main Calculator Workspace (2 Columns) */}
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* Left: Interactive Configurator (7 cols) */}
          <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 p-6 sm:p-8 rounded-2xl shadow-xl space-y-6">
            
            {/* MODULE 1: INTERNET DEDICADA */}
            {activeModule === 'internet' && (
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                      Largura de Banda Dedicada:
                    </label>
                    <span className="px-3 py-1 bg-primary/20 border border-primary/40 text-primary font-mono font-black text-sm rounded">
                      {internetBandwidth} Mbps Simétricos
                    </span>
                  </div>

                  <input
                    type="range"
                    min="10"
                    max="500"
                    step="10"
                    value={internetBandwidth}
                    onChange={(e) => setInternetBandwidth(Number(e.target.value))}
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                    <span>10 Mbps (PME)</span>
                    <span>100 Mbps (Corporativo)</span>
                    <span>500 Mbps (Enterprise)</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                    Meio de Transmissão / Conectividade:
                  </label>
                  <div className="grid grid-cols-3 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setInternetType('fibra')}
                      className={`p-3 rounded-lg border text-xs font-bold transition text-center ${
                        internetType === 'fibra'
                          ? 'bg-primary/20 border-primary text-white'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      Fibra Óptica
                    </button>
                    <button
                      type="button"
                      onClick={() => setInternetType('radio')}
                      className={`p-3 rounded-lg border text-xs font-bold transition text-center ${
                        internetType === 'radio'
                          ? 'bg-primary/20 border-primary text-white'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      Rádio PTP
                    </button>
                    <button
                      type="button"
                      onClick={() => setInternetType('redundante')}
                      className={`p-3 rounded-lg border text-xs font-bold transition text-center ${
                        internetType === 'redundante'
                          ? 'bg-primary/20 border-primary text-white'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      Redundância (2 Links)
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-950 border border-slate-800 rounded-xl">
                  <div>
                    <p className="text-xs font-bold text-white">Endereço IP Fixo Público</p>
                    <p className="text-[11px] text-slate-400">Recomendado para servidores locais, VPN e CFTV remoto.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={hasDedicatedIp}
                    onChange={(e) => setHasDedicatedIp(e.target.checked)}
                    className="w-5 h-5 rounded accent-primary cursor-pointer"
                  />
                </div>
              </div>
            )}

            {/* MODULE 2: CABLAGEM & REDE LOCAL */}
            {activeModule === 'cablagem' && (
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                      Número de Postos de Rede / Utilizadores:
                    </label>
                    <span className="px-3 py-1 bg-primary/20 border border-primary/40 text-primary font-mono font-black text-sm rounded">
                      {networkPoints} Postos RJ45
                    </span>
                  </div>

                  <input
                    type="range"
                    min="4"
                    max="120"
                    step="2"
                    value={networkPoints}
                    onChange={(e) => setNetworkPoints(Number(e.target.value))}
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                    <span>4 Postos (Escritório Pequeno)</span>
                    <span>48 Postos (Andar Completo)</span>
                    <span>120+ Postos (Edifício)</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                    Categoria do Cabeamento Estruturado:
                  </label>
                  <div className="grid grid-cols-3 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setCableType('cat6')}
                      className={`p-3 rounded-lg border text-xs font-bold transition text-center ${
                        cableType === 'cat6'
                          ? 'bg-primary/20 border-primary text-white'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      Cat6 Gigabit
                    </button>
                    <button
                      type="button"
                      onClick={() => setCableType('cat6a')}
                      className={`p-3 rounded-lg border text-xs font-bold transition text-center ${
                        cableType === 'cat6a'
                          ? 'bg-primary/20 border-primary text-white'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      Cat6A 10G
                    </button>
                    <button
                      type="button"
                      onClick={() => setCableType('fibra_interna')}
                      className={`p-3 rounded-lg border text-xs font-bold transition text-center ${
                        cableType === 'fibra_interna'
                          ? 'bg-primary/20 border-primary text-white'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      Backbone Fibra
                    </button>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                      Pontos de Acesso Wi-Fi Empresarial:
                    </label>
                    <span className="font-mono text-sm font-bold text-primary">{wifiAccessPoints} AP(s)</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={wifiAccessPoints}
                    onChange={(e) => setWifiAccessPoints(Number(e.target.value))}
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-950 border border-slate-800 rounded-xl">
                  <div>
                    <p className="text-xs font-bold text-white">Incluir Bastidor / Rack 19" e Patch Panels</p>
                    <p className="text-[11px] text-slate-400">Organização profissional com ventilação e calhas técnicas.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={includeRack}
                    onChange={(e) => setIncludeRack(e.target.checked)}
                    className="w-5 h-5 rounded accent-primary cursor-pointer"
                  />
                </div>
              </div>
            )}

            {/* MODULE 3: CFTV & SEGURANÇA */}
            {activeModule === 'cftv' && (
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                      Número de Câmaras de Videovigilância:
                    </label>
                    <span className="px-3 py-1 bg-primary/20 border border-primary/40 text-primary font-mono font-black text-sm rounded">
                      {cameraCount} Câmaras IP
                    </span>
                  </div>

                  <input
                    type="range"
                    min="2"
                    max="32"
                    step="2"
                    value={cameraCount}
                    onChange={(e) => setCameraCount(Number(e.target.value))}
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                    Resolução &amp; Tecnologia de Lente:
                  </label>
                  <div className="grid grid-cols-3 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setCameraResolution('1080p')}
                      className={`p-3 rounded-lg border text-xs font-bold transition text-center ${
                        cameraResolution === '1080p'
                          ? 'bg-primary/20 border-primary text-white'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      Full HD 1080p
                    </button>
                    <button
                      type="button"
                      onClick={() => setCameraResolution('colorvu')}
                      className={`p-3 rounded-lg border text-xs font-bold transition text-center ${
                        cameraResolution === 'colorvu'
                          ? 'bg-primary/20 border-primary text-white'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      ColorVu (Noite a Cores)
                    </button>
                    <button
                      type="button"
                      onClick={() => setCameraResolution('4k')}
                      className={`p-3 rounded-lg border text-xs font-bold transition text-center ${
                        cameraResolution === '4k'
                          ? 'bg-primary/20 border-primary text-white'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      Ultra HD 4K
                    </button>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                      Dias de Gravação (Histórico):
                    </label>
                    <select
                      value={storageDays}
                      onChange={(e) => setStorageDays(Number(e.target.value))}
                      className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded text-xs text-white focus:border-primary focus:outline-none"
                    >
                      <option value="15">15 Dias de Armazenamento</option>
                      <option value="30">30 Dias (Padrão Recomendado)</option>
                      <option value="60">60 Dias de Alta Capacidade</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                      Portas com Controlo Biométrico:
                    </label>
                    <select
                      value={accessControlDoors}
                      onChange={(e) => setAccessControlDoors(Number(e.target.value))}
                      className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded text-xs text-white focus:border-primary focus:outline-none"
                    >
                      <option value="0">Nenhuma</option>
                      <option value="1">1 Porta Principal</option>
                      <option value="2">2 Portas / Acessos</option>
                      <option value="4">4 Portas (Data Center / Cofre)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* MODULE 4: CLOUD & CIBERSEGURANÇA */}
            {activeModule === 'cloud' && (
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                      Número de Contas / Utilizadores:
                    </label>
                    <span className="px-3 py-1 bg-primary/20 border border-primary/40 text-primary font-mono font-black text-sm rounded">
                      {userCount} Utilizadores
                    </span>
                  </div>

                  <input
                    type="range"
                    min="5"
                    max="100"
                    step="5"
                    value={userCount}
                    onChange={(e) => setUserCount(Number(e.target.value))}
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-950 border border-slate-800 rounded-xl">
                  <div>
                    <p className="text-xs font-bold text-white">Firewall UTM &amp; Proteção de Cibersegurança</p>
                    <p className="text-[11px] text-slate-400">Bloqueio de ataques, antivírus corporativo e VPN segura.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={includeFirewall}
                    onChange={(e) => setIncludeFirewall(e.target.checked)}
                    className="w-5 h-5 rounded accent-primary cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-950 border border-slate-800 rounded-xl">
                  <div>
                    <p className="text-xs font-bold text-white">Backup Cloud Diário Automatizado</p>
                    <p className="text-[11px] text-slate-400">Cópias encriptadas em data center para proteção contra Ransomware.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={includeCloudBackup}
                    onChange={(e) => setIncludeCloudBackup(e.target.checked)}
                    className="w-5 h-5 rounded accent-primary cursor-pointer"
                  />
                </div>
              </div>
            )}

          </div>

          {/* Right: Real-time Estimate Card & Instant Request Form (5 cols) */}
          <div className="lg:col-span-5 bg-white text-slate-900 p-6 sm:p-8 rounded-2xl shadow-2xl border border-slate-200 space-y-6">
            
            {/* Header & Price Breakdown */}
            <div className="border-b border-slate-200 pb-5">
              <span className="text-[10px] font-black uppercase tracking-wider text-primary bg-primary/10 px-2.5 py-1 rounded">
                Estimativa Orçamental ARKNET
              </span>

              <div className="mt-4 space-y-2">
                {calculation.monthlyEstimate > 0 && (
                  <div>
                    <p className="text-[11px] font-bold text-slate-500 uppercase">Mensalidade Estimada:</p>
                    <p className="text-3xl font-black text-slate-900 font-mono tracking-tight">
                      {formatProdutoPrice(calculation.monthlyEstimate)} <span className="text-sm font-normal text-slate-500">/ mês</span>
                    </p>
                  </div>
                )}

                {calculation.setupEstimate > 0 && (
                  <div className="pt-2">
                    <p className="text-[11px] font-bold text-slate-500 uppercase">
                      {calculation.monthlyEstimate > 0 ? 'Taxa de Instalação / Ativação:' : 'Investimento de Implementação:'}
                    </p>
                    <p className="text-2xl font-black text-slate-900 font-mono tracking-tight">
                      {formatProdutoPrice(calculation.setupEstimate)}
                    </p>
                  </div>
                )}
              </div>

              <p className="text-[10px] text-slate-500 mt-2 italic">
                * Valores orientativos em Kwanzas (Kz). Sujeitos a vistoria técnica gratuita no local.
              </p>
            </div>

            {/* Scope Summary Bullets */}
            <div>
              <p className="text-xs font-black uppercase text-slate-900 mb-2 flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                Âmbito da Solução Selecionada:
              </p>
              <ul className="space-y-1.5 text-xs text-slate-600">
                {calculation.summaryList.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-primary font-bold">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Request Form (Pre-submission) */}
            {submittedLeadId ? (
              <div className="p-5 bg-emerald-50 border border-emerald-300 rounded-xl text-center space-y-3">
                <div className="w-10 h-10 bg-emerald-600 text-white rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <h4 className="font-black text-emerald-950 text-sm">Simulação Submetida com Sucesso!</h4>
                <p className="text-xs text-emerald-800 leading-relaxed">
                  A nossa equipa de engenharia recebeu a sua especificação (Ref: <code>#{submittedLeadId}</code>) e apresentará a proposta técnica oficial.
                </p>
                <a
                  href={`https://wa.me/244935208449?text=${whatsappSimulationText}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase rounded shadow-xs transition"
                >
                  <FaWhatsapp className="h-4 w-4" />
                  <span>Acelerar no WhatsApp</span>
                </a>
              </div>
            ) : (
              <form onSubmit={handleSubmitSimulation} className="space-y-3 pt-2 border-t border-slate-100">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
                  Solicitar Proposta Formal com Esta Simulação:
                </p>

                <div className="space-y-2.5 text-xs">
                  <div className="grid sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      required
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder="O seu Nome *"
                      className="w-full px-3 py-2 border border-slate-300 rounded focus:border-primary focus:outline-none"
                    />
                    <input
                      type="text"
                      value={clientCompany}
                      onChange={(e) => setClientCompany(e.target.value)}
                      placeholder="Empresa / Organização"
                      className="w-full px-3 py-2 border border-slate-300 rounded focus:border-primary focus:outline-none"
                    />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-2">
                    <input
                      type="email"
                      required
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                      placeholder="Email de Contacto *"
                      className="w-full px-3 py-2 border border-slate-300 rounded focus:border-primary focus:outline-none"
                    />
                    <input
                      type="tel"
                      required
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      placeholder="Telefone / WhatsApp *"
                      className="w-full px-3 py-2 border border-slate-300 rounded focus:border-primary focus:outline-none font-mono"
                    />
                  </div>
                </div>

                {/* Submit and WhatsApp Buttons */}
                <div className="pt-2 space-y-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 px-4 bg-primary hover:bg-primary/90 text-white font-extrabold text-xs uppercase tracking-wider rounded-lg shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <Send className="h-4 w-4" />
                    <span>{isSubmitting ? 'A enviar...' : 'Solicitar Proposta Técnica Formal'}</span>
                  </button>

                  <a
                    href={`https://wa.me/244935208449?text=${whatsappSimulationText}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow-xs transition flex items-center justify-center gap-2 text-center"
                  >
                    <FaWhatsapp className="h-4 w-4 text-white" />
                    <span>Enviar Simulação via WhatsApp</span>
                  </a>
                </div>
              </form>
            )}

          </div>

        </div>

      </div>
    </section>
  )
}
