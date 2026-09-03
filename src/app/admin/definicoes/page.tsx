'use client'

import React, { useState, useEffect, useRef, useMemo } from 'react'
import {
  Settings,
  Save,
  Phone,
  Mail,
  MapPin,
  Globe,
  Share2,
  Database,
  Download,
  Upload,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Package,
  ShoppingCart,
  Users,
  Inbox,
  Calendar,
  Layers,
  ShieldCheck,
  HardDrive,
  FileJson,
  X,
  Clock,
  ArrowRight,
} from 'lucide-react'
import { dataStore, CompanySettings, ArknetDatabase } from '@/lib/data-store'
import { useToast } from '@/lib/toast-context'
import { ConfirmModal } from '@/components/admin/confirm-modal'

export default function AdminDefinicoesPage() {
  const { success, error, info } = useToast()

  const [settings, setSettings] = useState<CompanySettings>(dataStore.getSettings())
  const [formData, setFormData] = useState<CompanySettings>(dataStore.getSettings())
  const [phone1, setPhone1] = useState('')
  const [phone2, setPhone2] = useState('')
  const [email1, setEmail1] = useState('')
  const [email2, setEmail2] = useState('')

  // Snapshot da base de dados para estatísticas em tempo real
  const [dbSnapshot, setDbSnapshot] = useState<ArknetDatabase>(dataStore.getSnapshot())

  // Modal de Restauro Seguro & Inspeção Prévia
  const [isResetModalOpen, setIsResetModalOpen] = useState(false)
  const [pendingBackupContent, setPendingBackupContent] = useState<string | null>(null)
  const [pendingBackupData, setPendingBackupData] = useState<ArknetDatabase | null>(null)
  const [pendingBackupSizeKB, setPendingBackupSizeKB] = useState(0)
  const [isRestorePreviewOpen, setIsRestorePreviewOpen] = useState(false)
  const fileImportRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const sync = () => {
      const db = dataStore.getSnapshot()
      setDbSnapshot(db)
      const s = dataStore.getSettings()
      setSettings(s)
      setFormData(s)
      setPhone1(s.phones?.[0] || '+244 935 208 449')
      setPhone2(s.phones?.[1] || '')
      setEmail1(s.emails?.[0] || 'info@arknet.co.ao')
      setEmail2(s.emails?.[1] || 'negocios@arknet.co.ao')
    }
    sync()
    const unsub = dataStore.subscribe(sync)
    return () => unsub()
  }, [])

  // Cálculo de métricas da base de dados
  const dbMetrics = useMemo(() => {
    const rawJson = dataStore.exportDatabaseJson()
    const sizeKB = (new TextEncoder().encode(rawJson).length / 1024).toFixed(1)
    return {
      productsCount: dbSnapshot.products?.length || 0,
      categoriesCount: dbSnapshot.categories?.length || 0,
      ordersCount: dbSnapshot.orders?.length || 0,
      customersCount: dbSnapshot.customers?.length || 0,
      leadsCount: dbSnapshot.leads?.length || 0,
      eventsCount: dbSnapshot.events?.length || 0,
      eventRegistrationsCount: dbSnapshot.eventRegistrations?.length || 0,
      subscribersCount: dbSnapshot.subscribers?.length || 0,
      projectsCount: dbSnapshot.projects?.length || 0,
      testimonialsCount: dbSnapshot.testimonials?.length || 0,
      partnersCount: dbSnapshot.partners?.length || 0,
      usersCount: dbSnapshot.users?.length || 0,
      sizeKB,
    }
  }, [dbSnapshot])

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault()

    const phones = [phone1.trim(), phone2.trim()].filter(Boolean)
    const emails = [email1.trim(), email2.trim()].filter(Boolean)

    const updated = dataStore.updateSettings({
      ...formData,
      phones,
      emails,
    })

    setSettings(updated)
    success('Definições gerais da ARKNET atualizadas com sucesso!', 'Definições Guardadas')
  }

  // Exportar Backup Completo (JSON)
  const handleExportFullBackup = () => {
    const json = dataStore.exportDatabaseJson()
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    const now = new Date()
    const timestamp = `${now.toISOString().split('T')[0]}_${String(now.getHours()).padStart(2, '0')}h${String(now.getMinutes()).padStart(2, '0')}`
    a.download = `ARKNET_Backup_Completo_${timestamp}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    success('Ficheiro de backup JSON descarregado com sucesso!', 'Backup Concluído')
  }

  // Exportar Módulo Específico (JSON)
  const handleExportModuleJson = (moduleName: 'produtos' | 'clientes' | 'pedidos' | 'eventos') => {
    let payload: any = {}
    let filename = ''

    if (moduleName === 'produtos') {
      payload = { products: dbSnapshot.products, categories: dbSnapshot.categories, exportedAt: new Date().toISOString() }
      filename = `ARKNET_Produtos_Categorias_${new Date().toISOString().split('T')[0]}.json`
    } else if (moduleName === 'clientes') {
      payload = { customers: dbSnapshot.customers, exportedAt: new Date().toISOString() }
      filename = `ARKNET_Clientes_${new Date().toISOString().split('T')[0]}.json`
    } else if (moduleName === 'pedidos') {
      payload = { orders: dbSnapshot.orders, exportedAt: new Date().toISOString() }
      filename = `ARKNET_Pedidos_Loja_${new Date().toISOString().split('T')[0]}.json`
    } else if (moduleName === 'eventos') {
      payload = { events: dbSnapshot.events, eventRegistrations: dbSnapshot.eventRegistrations, exportedAt: new Date().toISOString() }
      filename = `ARKNET_Eventos_Inscricoes_${new Date().toISOString().split('T')[0]}.json`
    }

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    success(`Módulo de ${moduleName} exportado em formato JSON!`, 'Exportação JSON')
  }

  // Seleção e Pré-visualização de Ficheiro de Restauro
  const handleSelectFileForRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const sizeInKB = +(file.size / 1024).toFixed(1)
    setPendingBackupSizeKB(sizeInKB)

    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target?.result as string
      if (content) {
        try {
          const parsed = JSON.parse(content) as ArknetDatabase
          if (!parsed.products || !parsed.users) {
            error('O ficheiro selecionado não tem uma estrutura de base de dados ARKNET válida.')
            return
          }
          setPendingBackupContent(content)
          setPendingBackupData(parsed)
          setIsRestorePreviewOpen(true)
        } catch (err) {
          error('O ficheiro fornecido não é um JSON válido.')
        }
      }
    }
    reader.readAsText(file)
    // Limpar o input para permitir selecionar o mesmo ficheiro novamente se necessário
    e.target.value = ''
  }

  // Confirmar e aplicar o restauro
  const handleConfirmRestore = () => {
    if (!pendingBackupContent) return
    const ok = dataStore.importDatabaseJson(pendingBackupContent)
    if (ok) {
      setIsRestorePreviewOpen(false)
      success('Base de dados restaurada com sucesso a partir do ficheiro!', 'Restauro Concluído')
      setTimeout(() => window.location.reload(), 600)
    } else {
      error('Não foi possível restaurar os dados do ficheiro.', 'Erro no Restauro')
    }
  }

  const handleResetConfirm = () => {
    dataStore.resetToDefaults()
    success('Base de dados restaurada para as definições de fábrica da ARKNET.', 'Reset Efetuado')
    setIsResetModalOpen(false)
    setTimeout(() => window.location.reload(), 600)
  }

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Settings className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-extrabold text-slate-900">Definições Gerais &amp; Base de Dados</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Gestão de contactos institucionais, redes sociais, políticas da empresa e centro de backups do sistema.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportFullBackup}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase rounded shadow-xs transition"
          >
            <Download className="h-4 w-4 text-emerald-400" />
            <span>Descarregar Backup JSON</span>
          </button>
        </div>
      </div>

      {/* DATABASE & BACKUP CENTER (MÓDULO DE DESTAQUE) */}
      <div className="bg-white border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-secondary/15 text-secondary rounded-xl">
              <Database className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900">Centro de Backup &amp; Integridade de Dados</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Monitorização do armazenamento local, exportação de segurança e restauro de dados.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-50 px-3.5 py-2 border border-slate-200 rounded text-xs">
            <HardDrive className="h-4 w-4 text-primary" />
            <span className="text-slate-500">Tamanho da Base:</span>
            <strong className="font-mono text-slate-900">{dbMetrics.sizeKB} KB</strong>
          </div>
        </div>

        {/* Real-time Storage Grid */}
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-3">
            Tabelas &amp; Volume de Dados Atuais no Sistema:
          </span>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded text-center">
              <Package className="h-4 w-4 text-primary mx-auto mb-1" />
              <p className="text-lg font-black text-slate-900 font-mono">{dbMetrics.productsCount}</p>
              <p className="text-[10px] uppercase font-bold text-slate-500">Produtos</p>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded text-center">
              <ShoppingCart className="h-4 w-4 text-emerald-600 mx-auto mb-1" />
              <p className="text-lg font-black text-slate-900 font-mono">{dbMetrics.ordersCount}</p>
              <p className="text-[10px] uppercase font-bold text-slate-500">Encomendas</p>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded text-center">
              <Users className="h-4 w-4 text-indigo-600 mx-auto mb-1" />
              <p className="text-lg font-black text-slate-900 font-mono">{dbMetrics.customersCount}</p>
              <p className="text-[10px] uppercase font-bold text-slate-500">Clientes</p>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded text-center">
              <Inbox className="h-4 w-4 text-secondary mx-auto mb-1" />
              <p className="text-lg font-black text-slate-900 font-mono">{dbMetrics.leadsCount}</p>
              <p className="text-[10px] uppercase font-bold text-slate-500">Leads / Cotações</p>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded text-center">
              <Calendar className="h-4 w-4 text-amber-600 mx-auto mb-1" />
              <p className="text-lg font-black text-slate-900 font-mono">{dbMetrics.eventRegistrationsCount}</p>
              <p className="text-[10px] uppercase font-bold text-slate-500">Inscrições Eventos</p>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded text-center">
              <ShieldCheck className="h-4 w-4 text-slate-700 mx-auto mb-1" />
              <p className="text-lg font-black text-slate-900 font-mono">{dbMetrics.usersCount}</p>
              <p className="text-[10px] uppercase font-bold text-slate-500">Utilizadores</p>
            </div>
          </div>
        </div>

        {/* Action Buttons: Full Backup, Restore, Module Exports */}
        <div className="pt-4 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* Download Full Backup */}
            <button
              type="button"
              onClick={handleExportFullBackup}
              className="inline-flex items-center gap-2 px-5 py-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider rounded shadow-sm transition"
            >
              <Download className="h-4 w-4 text-emerald-400" />
              <span>Exportar Backup Completo (JSON)</span>
            </button>

            {/* Import Backup File */}
            <input
              ref={fileImportRef}
              type="file"
              accept=".json"
              onChange={handleSelectFileForRestore}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileImportRef.current?.click()}
              className="inline-flex items-center gap-2 px-5 py-3 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-bold uppercase tracking-wider rounded shadow-xs transition"
            >
              <Upload className="h-4 w-4 text-primary" />
              <span>Restaurar Ficheiro JSON</span>
            </button>
          </div>

          {/* Reset Database to Defaults */}
          <button
            type="button"
            onClick={() => setIsResetModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 text-xs font-bold uppercase rounded transition"
          >
            <RefreshCw className="h-4 w-4 text-rose-600" />
            <span>Repor Dados de Fábrica</span>
          </button>
        </div>

        {/* Module Specific Export Chips */}
        <div className="pt-4 border-t border-slate-100">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
            Exportações Segmentadas por Módulo (JSON):
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => handleExportModuleJson('produtos')}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded inline-flex items-center gap-1.5 transition"
            >
              <FileJson className="h-3.5 w-3.5 text-primary" />
              <span>Produtos &amp; Categorias ({dbMetrics.productsCount})</span>
            </button>

            <button
              type="button"
              onClick={() => handleExportModuleJson('clientes')}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded inline-flex items-center gap-1.5 transition"
            >
              <FileJson className="h-3.5 w-3.5 text-indigo-600" />
              <span>Base de Clientes ({dbMetrics.customersCount})</span>
            </button>

            <button
              type="button"
              onClick={() => handleExportModuleJson('pedidos')}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded inline-flex items-center gap-1.5 transition"
            >
              <FileJson className="h-3.5 w-3.5 text-emerald-600" />
              <span>Histórico de Encomendas ({dbMetrics.ordersCount})</span>
            </button>

            <button
              type="button"
              onClick={() => handleExportModuleJson('eventos')}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded inline-flex items-center gap-1.5 transition"
            >
              <FileJson className="h-3.5 w-3.5 text-amber-600" />
              <span>Eventos &amp; Inscrições ({dbMetrics.eventRegistrationsCount})</span>
            </button>
          </div>
        </div>
      </div>

      {/* FORMULÁRIO DE DEFINIÇÕES GERAIS */}
      <form onSubmit={handleSaveSettings} className="space-y-8">
        
        {/* Contact Information Card */}
        <div className="bg-white border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
            <Phone className="h-5 w-5 text-primary" />
            <h3 className="text-base font-bold text-slate-900">Informações de Contacto &amp; Localização</h3>
          </div>

          <div className="grid sm:grid-cols-2 gap-5 text-xs">
            <div>
              <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Telefone Principal
              </label>
              <input
                type="text"
                value={phone1}
                onChange={(e) => setPhone1(e.target.value)}
                placeholder="+244 935 208 449"
                className="w-full px-4 py-2.5 text-sm border border-slate-300 focus:border-primary focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Telefone Secundário (Opcional)
              </label>
              <input
                type="text"
                value={phone2}
                onChange={(e) => setPhone2(e.target.value)}
                placeholder="+244 923 000 000"
                className="w-full px-4 py-2.5 text-sm border border-slate-300 focus:border-primary focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Email Geral (Atendimento)
              </label>
              <input
                type="email"
                value={email1}
                onChange={(e) => setEmail1(e.target.value)}
                placeholder="info@arknet.co.ao"
                className="w-full px-4 py-2.5 text-sm border border-slate-300 focus:border-primary focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Email Comercial / Negócios
              </label>
              <input
                type="email"
                value={email2}
                onChange={(e) => setEmail2(e.target.value)}
                placeholder="negocios@arknet.co.ao"
                className="w-full px-4 py-2.5 text-sm border border-slate-300 focus:border-primary focus:outline-none font-mono"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Endereço Físico (Sede)
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
                placeholder="Rua Directa do Kero, Casa Nº32 R/C, Kilamba"
                className="w-full px-4 py-2.5 text-sm border border-slate-300 focus:border-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Cidade
              </label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData((prev) => ({ ...prev, city: e.target.value }))}
                placeholder="Luanda"
                className="w-full px-4 py-2.5 text-sm border border-slate-300 focus:border-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                País
              </label>
              <input
                type="text"
                value={formData.country}
                onChange={(e) => setFormData((prev) => ({ ...prev, country: e.target.value }))}
                placeholder="Angola"
                className="w-full px-4 py-2.5 text-sm border border-slate-300 focus:border-primary focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* WhatsApp & Social Media Card */}
        <div className="bg-white border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
            <Share2 className="h-5 w-5 text-primary" />
            <h3 className="text-base font-bold text-slate-900">Canal WhatsApp &amp; Redes Sociais</h3>
          </div>

          <div className="grid sm:grid-cols-2 gap-5 text-xs">
            <div className="sm:col-span-2">
              <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Link do Canal Oficial no WhatsApp
              </label>
              <input
                type="url"
                value={formData.whatsappChannelUrl}
                onChange={(e) => setFormData((prev) => ({ ...prev, whatsappChannelUrl: e.target.value }))}
                placeholder="https://whatsapp.com/channel/..."
                className="w-full px-4 py-2.5 text-sm border border-slate-300 focus:border-primary focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Página de LinkedIn
              </label>
              <input
                type="url"
                value={formData.socialLinks?.linkedin || ''}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    socialLinks: { ...prev.socialLinks, linkedin: e.target.value },
                  }))
                }
                placeholder="https://www.linkedin.com/company/arknet"
                className="w-full px-4 py-2.5 text-sm border border-slate-300 focus:border-primary focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Página de Facebook
              </label>
              <input
                type="url"
                value={formData.socialLinks?.facebook || ''}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    socialLinks: { ...prev.socialLinks, facebook: e.target.value },
                  }))
                }
                placeholder="https://www.facebook.com/arknet"
                className="w-full px-4 py-2.5 text-sm border border-slate-300 focus:border-primary focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Perfil de Instagram
              </label>
              <input
                type="url"
                value={formData.socialLinks?.instagram || ''}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    socialLinks: { ...prev.socialLinks, instagram: e.target.value },
                  }))
                }
                placeholder="https://www.instagram.com/arknet"
                className="w-full px-4 py-2.5 text-sm border border-slate-300 focus:border-primary focus:outline-none font-mono"
              />
            </div>
          </div>
        </div>

        {/* Institutional Content */}
        <div className="bg-white border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <h3 className="text-base font-bold text-slate-900">Textos Institucionais (&quot;Sobre Nós&quot;)</h3>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Texto Institucional Principal
              </label>
              <textarea
                rows={4}
                value={formData.institutionalText}
                onChange={(e) => setFormData((prev) => ({ ...prev, institutionalText: e.target.value }))}
                className="w-full p-3.5 text-sm border border-slate-300 focus:border-primary focus:outline-none leading-relaxed"
              />
            </div>

            <div>
              <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Carta de Compromisso / Apresentação
              </label>
              <textarea
                rows={3}
                value={formData.presentationLetter}
                onChange={(e) => setFormData((prev) => ({ ...prev, presentationLetter: e.target.value }))}
                className="w-full p-3.5 text-sm border border-slate-300 focus:border-primary focus:outline-none leading-relaxed"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-primary hover:bg-primary/90 text-white font-bold text-xs uppercase tracking-wider shadow-md transition"
          >
            <Save className="h-4 w-4" />
            Guardar Definições
          </button>
        </div>
      </form>

      {/* MODAL DE PRÉ-VISUALIZAÇÃO DE RESTAURO (INSPEÇÃO PRÉVIA SEGURA) */}
      {isRestorePreviewOpen && pendingBackupData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-white border border-slate-200 shadow-2xl overflow-hidden rounded-lg animate-in fade-in zoom-in-95">
            
            {/* Modal Header */}
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Database className="h-5 w-5 text-emerald-400" />
                <h3 className="font-extrabold text-sm uppercase tracking-wider">
                  Confirmar Restauro de Backup
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsRestorePreviewOpen(false)}
                className="p-1 text-slate-400 hover:text-white transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4 text-xs">
              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded text-amber-900 flex items-start gap-2.5">
                <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Aviso de Sobregravação de Dados</p>
                  <p className="text-[11px] text-amber-800 mt-0.5 leading-relaxed">
                    A importação deste ficheiro substituirá os dados atuais pelo conteúdo contido no backup.
                  </p>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                  Resumo do Ficheiro JSON Validado ({pendingBackupSizeKB} KB):
                </span>

                <div className="grid grid-cols-2 gap-2 text-slate-700 bg-slate-50 p-4 border border-slate-200 rounded font-medium">
                  <div>• Produtos: <strong>{pendingBackupData.products?.length || 0}</strong></div>
                  <div>• Categorias: <strong>{pendingBackupData.categories?.length || 0}</strong></div>
                  <div>• Encomendas: <strong>{pendingBackupData.orders?.length || 0}</strong></div>
                  <div>• Clientes: <strong>{pendingBackupData.customers?.length || 0}</strong></div>
                  <div>• Leads / Cotações: <strong>{pendingBackupData.leads?.length || 0}</strong></div>
                  <div>• Eventos: <strong>{pendingBackupData.events?.length || 0}</strong></div>
                  <div>• Inscrições: <strong>{pendingBackupData.eventRegistrations?.length || 0}</strong></div>
                  <div>• Utilizadores: <strong>{pendingBackupData.users?.length || 0}</strong></div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsRestorePreviewOpen(false)}
                  className="px-4 py-2.5 bg-white border border-slate-300 text-slate-700 font-bold uppercase text-xs rounded hover:bg-slate-50 transition"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmRestore}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold uppercase text-xs rounded shadow-sm transition flex items-center gap-1.5"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Confirmar &amp; Restaurar Base</span>
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Reset Confirmation Modal */}
      <ConfirmModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onConfirm={handleResetConfirm}
        title="Restaurar Dados de Fábrica"
        message="ATENÇÃO: Esta ação irá repor todos os produtos, encomendas, leads, eventos e definições para o estado inicial da ARKNET. Deseja continuar?"
        confirmText="Sim, Restaurar Dados de Fábrica"
        cancelText="Cancelar"
      />
    </div>
  )
}
