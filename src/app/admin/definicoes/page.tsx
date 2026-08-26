'use client'

import React, { useState, useEffect, useRef } from 'react'
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
} from 'lucide-react'
import { dataStore, CompanySettings } from '@/lib/data-store'
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

  // Modais de Backup / Reset
  const [isResetModalOpen, setIsResetModalOpen] = useState(false)
  const fileImportRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const s = dataStore.getSettings()
    setSettings(s)
    setFormData(s)
    setPhone1(s.phones?.[0] || '+244 935 208 449')
    setPhone2(s.phones?.[1] || '')
    setEmail1(s.emails?.[0] || 'info@arknet.co.ao')
    setEmail2(s.emails?.[1] || 'negocios@arknet.co.ao')
  }, [])

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

  const handleExportBackup = () => {
    const json = dataStore.exportDatabaseJson()
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ARKNET_Backup_Completo_${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    success('Ficheiro de backup JSON descarregado com sucesso!')
  }

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target?.result as string
      if (content) {
        const ok = dataStore.importDatabaseJson(content)
        if (ok) {
          success('Base de dados restaurada com sucesso a partir do ficheiro!', 'Restauro Concluído')
          setTimeout(() => window.location.reload(), 800)
        } else {
          error('O ficheiro selecionado não tem um formato de base de dados válido.', 'Erro no Restauro')
        }
      }
    }
    reader.readAsText(file)
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
            <h1 className="text-2xl font-extrabold text-slate-900">Definições Gerais da Empresa</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Configure dados de contacto, redes sociais, textos institucionais e faça backup de toda a informação.
          </p>
        </div>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-8">
        {/* Contact Information Card */}
        <div className="bg-white border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
            <Phone className="h-5 w-5 text-primary" />
            <h3 className="text-base font-bold text-slate-900">Informações de Contacto & Localização</h3>
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
            <h3 className="text-base font-bold text-slate-900">Canal WhatsApp & Redes Sociais</h3>
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
            <h3 className="text-base font-bold text-slate-900">Textos Institucionais ("Sobre Nós")</h3>
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

      {/* Database Backup & Maintenance Card */}
      <div className="bg-white border border-slate-200 p-6 shadow-xs space-y-6">
        <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
          <Database className="h-5 w-5 text-secondary" />
          <h3 className="text-base font-bold text-slate-900">Backup & Manutenção da Base de Dados</h3>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          Pode exportar todo o conteúdo dinâmico do site (produtos, pedidos, leads, newsletter, cursos, vagas, etc.) para um ficheiro JSON de segurança ou restaurar um backup existente.
        </p>

        <div className="flex flex-wrap items-center gap-4 pt-2">
          {/* Export JSON */}
          <button
            type="button"
            onClick={handleExportBackup}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white text-xs font-bold uppercase hover:bg-slate-800 transition"
          >
            <Download className="h-4 w-4" />
            Exportar Backup Completo (JSON)
          </button>

          {/* Import JSON */}
          <input
            ref={fileImportRef}
            type="file"
            accept=".json"
            onChange={handleImportBackup}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileImportRef.current?.click()}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-300 text-slate-700 text-xs font-bold uppercase hover:bg-slate-50 transition"
          >
            <Upload className="h-4 w-4 text-primary" />
            Importar / Restaurar Ficheiro JSON
          </button>

          {/* Reset to Factory Defaults */}
          <button
            type="button"
            onClick={() => setIsResetModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold uppercase hover:bg-rose-100 transition"
          >
            <RefreshCw className="h-4 w-4 text-rose-600" />
            Restaurar Dados de Fábrica
          </button>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      <ConfirmModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onConfirm={handleResetConfirm}
        title="Restaurar Dados de Fábrica"
        message="ATENÇÃO: Esta ação irá repor todos os produtos, leads, vagas e dados da base de dados para o estado inicial da ARKNET. Deseja continuar?"
        confirmText="Sim, Restaurar"
        cancelText="Cancelar"
      />
    </div>
  )
}
