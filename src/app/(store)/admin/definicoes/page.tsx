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
  Trash2,
  Play,
  Server,
  Check,
  RotateCcw,
  CalendarClock,
  Shield,
  Zap,
  Loader2,
} from 'lucide-react'
import { dataStore, CompanySettings, ArknetDatabase } from '@/lib/data-store'
import { useToast } from '@/lib/toast-context'
import { ConfirmModal } from '@/components/admin/confirm-modal'
import { ImageUpload } from '@/components/admin/image-upload'

interface ServerBackupItem {
  id: string
  filename: string
  sizeBytes: number
  sizeFormatted: string
  createdAt: string
  trigger: 'auto' | 'manual'
  version: number
  system: string
  stats: {
    products: number
    categories: number
    orders: number
    customers: number
    leads: number
    events: number
    totalRecords: number
  }
}

interface BackupConfigState {
  enabled: boolean
  frequency: 'every_6h' | 'daily' | 'weekly' | 'monthly'
  maxBackups: number
  lastBackupAt: string | null
  nextBackupAt: string | null
  autoClean: boolean
}

export default function AdminDefinicoesPage() {
  const { success, error, info } = useToast()

  const [settings, setSettings] = useState<CompanySettings>(dataStore.getSettings())
  const [formData, setFormData] = useState<CompanySettings>(dataStore.getSettings())
  const [phone1, setPhone1] = useState('')
  const [phone2, setPhone2] = useState('')
  const [email1, setEmail1] = useState('')
  const [email2, setEmail2] = useState('')

  // Backups no Servidor & Configuração Automática
  const [serverBackups, setServerBackups] = useState<ServerBackupItem[]>([])
  const [backupConfig, setBackupConfig] = useState<BackupConfigState>({
    enabled: true,
    frequency: 'daily',
    maxBackups: 15,
    lastBackupAt: null,
    nextBackupAt: null,
    autoClean: true,
  })
  const [isLoadingBackups, setIsLoadingBackups] = useState(false)
  const [isCreatingServerBackup, setIsCreatingServerBackup] = useState(false)
  const [isSavingConfig, setIsSavingConfig] = useState(false)
  const [serverBackupToRestore, setServerBackupToRestore] = useState<ServerBackupItem | null>(null)
  const [isServerRestoreModalOpen, setIsServerRestoreModalOpen] = useState(false)
  const [isRestoringServerBackup, setIsRestoringServerBackup] = useState(false)
  const [serverBackupToDelete, setServerBackupToDelete] = useState<string | null>(null)
  const [isDeleteBackupModalOpen, setIsDeleteBackupModalOpen] = useState(false)

  // Snapshot da base de dados para estatísticas em tempo real
  const [dbSnapshot, setDbSnapshot] = useState<ArknetDatabase>(dataStore.getSnapshot())

  // Modal de Restauro Seguro & Inspeção Prévia
  const [isResetModalOpen, setIsResetModalOpen] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [pendingBackupContent, setPendingBackupContent] = useState<string | null>(null)
  const [pendingBackupData, setPendingBackupData] = useState<ArknetDatabase | null>(null)
  const [pendingBackupSizeKB, setPendingBackupSizeKB] = useState(0)
  const [isRestorePreviewOpen, setIsRestorePreviewOpen] = useState(false)
  const fileImportRef = useRef<HTMLInputElement>(null)

  const handleSyncServer = async () => {
    setIsSyncing(true)
    try {
      const ok = await dataStore.syncWithServer()
      if (ok) {
        success('Base de dados sincronizada com sucesso com o servidor!', 'Sincronização OK')
      } else {
        info('Sincronização concluída com os dados locais e do servidor.')
      }
    } catch (e) {
      error('Erro ao conectar com o servidor para sincronização.')
    } finally {
      setIsSyncing(false)
    }
  }

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
      setEmail2(s.emails?.[1] || '')
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

  // Métodos de Backup Automático & Gestão de Backups do Servidor
  const fetchServerBackups = async () => {
    setIsLoadingBackups(true)
    try {
      const res = await fetch('/api/admin/backups', { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        if (data.backups) setServerBackups(data.backups)
        if (data.config) setBackupConfig(data.config)
      }
    } catch (err) {
      console.warn('Erro ao carregar backups do servidor:', err)
    } finally {
      setIsLoadingBackups(false)
    }
  }

  useEffect(() => {
    fetchServerBackups()
  }, [])

  const handleCreateServerBackupNow = async () => {
    setIsCreatingServerBackup(true)
    try {
      const res = await fetch('/api/admin/backups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trigger: 'manual' }),
        credentials: 'include',
      })
      const data = await res.json()
      if (res.ok && data.success) {
        success('Novo backup do sistema gerado e armazenado com sucesso no servidor!', 'Backup Criado')
        if (data.backups) setServerBackups(data.backups)
        if (data.config) setBackupConfig(data.config)
      } else {
        error(data.message || 'Erro ao criar backup no servidor.')
      }
    } catch (err) {
      error('Erro de conexão ao criar backup no servidor.')
    } finally {
      setIsCreatingServerBackup(false)
    }
  }

  const handleSaveBackupConfig = async (newConfig: Partial<BackupConfigState>) => {
    setIsSavingConfig(true)
    const updated = { ...backupConfig, ...newConfig }
    setBackupConfig(updated)
    try {
      const res = await fetch('/api/admin/backups/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
        credentials: 'include',
      })
      const data = await res.json()
      if (res.ok && data.success) {
        success('Configurações de agendamento automático de backups atualizadas!', 'Automação Guardada')
        if (data.config) setBackupConfig(data.config)
      } else {
        error(data.message || 'Erro ao guardar configurações de backup.')
      }
    } catch (err) {
      error('Erro ao conectar com o servidor.')
    } finally {
      setIsSavingConfig(false)
    }
  }

  const handleOpenServerRestoreModal = (backup: ServerBackupItem) => {
    setServerBackupToRestore(backup)
    setIsServerRestoreModalOpen(true)
  }

  const handleConfirmServerRestore = async () => {
    if (!serverBackupToRestore) return
    setIsRestoringServerBackup(true)
    try {
      const res = await fetch('/api/admin/backups/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: serverBackupToRestore.filename }),
        credentials: 'include',
      })
      const data = await res.json()
      if (res.ok && data.success) {
        success('Base de dados restaurada com sucesso a partir do backup do servidor!', 'Restauro Concluído')
        setIsServerRestoreModalOpen(false)
        setServerBackupToRestore(null)
        setTimeout(() => window.location.reload(), 800)
      } else {
        error(data.message || 'Erro ao restaurar backup.')
      }
    } catch (err) {
      error('Erro de conexão ao restaurar backup.')
    } finally {
      setIsRestoringServerBackup(false)
    }
  }

  const handleOpenDeleteBackupModal = (filename: string) => {
    setServerBackupToDelete(filename)
    setIsDeleteBackupModalOpen(true)
  }

  const handleConfirmDeleteBackup = async () => {
    if (!serverBackupToDelete) return
    try {
      const res = await fetch(`/api/admin/backups?filename=${encodeURIComponent(serverBackupToDelete)}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      const data = await res.json()
      if (res.ok && data.success) {
        success(`Backup ${serverBackupToDelete} eliminado com sucesso.`, 'Backup Removido')
        if (data.backups) setServerBackups(data.backups)
        setIsDeleteBackupModalOpen(false)
        setServerBackupToDelete(null)
      } else {
        error(data.message || 'Erro ao eliminar backup.')
      }
    } catch (err) {
      error('Erro ao conectar com o servidor.')
    }
  }

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
      <div className="bg-white border border-slate-200 p-6 sm:p-8 shadow-sm space-y-8">
        {/* Header do Centro de Dados */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-secondary/15 text-secondary rounded-xl">
              <Database className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900">Centro de Backup &amp; Integridade de Dados</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Rotinas de backup automatizadas no servidor, histórico de snapshots e restauro seguro com 1 clique.
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

        {/* 1. PAINEL DE BACKUPS AUTOMÁTICOS & AGENDAMENTO */}
        <div className="p-5 bg-slate-900 text-white rounded-xl shadow-md border border-slate-800 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-primary/20 text-primary-foreground rounded-lg">
                <CalendarClock className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
                  Sistema de Backups Automáticos
                  {backupConfig.enabled ? (
                    <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold rounded-full">
                      ● Ativo
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 bg-slate-700 text-slate-300 text-[10px] font-bold rounded-full">
                      Pausado
                    </span>
                  )}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Gera cópias de segurança integrais da base de dados e armazena com segurança no servidor.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCreateServerBackupNow}
              disabled={isCreatingServerBackup}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider rounded transition shadow-sm disabled:opacity-60 cursor-pointer"
            >
              {isCreatingServerBackup ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>A Gerar Backup...</span>
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4" />
                  <span>Executar Backup Agora</span>
                </>
              )}
            </button>
          </div>

          <div className="grid sm:grid-cols-3 gap-4 text-xs">
            {/* Ativar/Desativar */}
            <div className="bg-slate-800/80 border border-slate-700 p-3.5 rounded-lg space-y-2">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="font-bold text-slate-200">Automação de Backups</span>
                <input
                  type="checkbox"
                  checked={backupConfig.enabled}
                  onChange={(e) => handleSaveBackupConfig({ enabled: e.target.checked })}
                  className="h-4 w-4 rounded border-slate-600 text-emerald-500 focus:ring-emerald-500"
                />
              </label>
              <p className="text-[11px] text-slate-400">
                {backupConfig.enabled
                  ? 'Rotina automática a executar segundo a frequência configurada.'
                  : 'Rotina em pausa. Apenas backups manuais serão criados.'}
              </p>
            </div>

            {/* Frequência */}
            <div className="bg-slate-800/80 border border-slate-700 p-3.5 rounded-lg space-y-2">
              <label className="block font-bold text-slate-200">Frequência de Execução</label>
              <select
                value={backupConfig.frequency}
                onChange={(e) => handleSaveBackupConfig({ frequency: e.target.value as any })}
                disabled={!backupConfig.enabled || isSavingConfig}
                className="w-full px-3 py-1.5 bg-slate-900 border border-slate-600 text-slate-200 rounded text-xs focus:outline-none focus:border-emerald-400 disabled:opacity-50"
              >
                <option value="every_6h">A cada 6 horas</option>
                <option value="daily">Diário (às 00:00)</option>
                <option value="weekly">Semanal (Domingos)</option>
                <option value="monthly">Mensal (dia 1)</option>
              </select>
            </div>

            {/* Retenção de Cópias */}
            <div className="bg-slate-800/80 border border-slate-700 p-3.5 rounded-lg space-y-2">
              <label className="block font-bold text-slate-200">Retenção de Cópias no Servidor</label>
              <select
                value={backupConfig.maxBackups}
                onChange={(e) => handleSaveBackupConfig({ maxBackups: parseInt(e.target.value) || 15 })}
                disabled={isSavingConfig}
                className="w-full px-3 py-1.5 bg-slate-900 border border-slate-600 text-slate-200 rounded text-xs focus:outline-none focus:border-emerald-400"
              >
                <option value={5}>Guardar os últimos 5 backups</option>
                <option value={10}>Guardar os últimos 10 backups</option>
                <option value={15}>Guardar os últimos 15 backups (Recomendado)</option>
                <option value={30}>Guardar os últimos 30 backups</option>
                <option value={50}>Guardar os últimos 50 backups</option>
              </select>
            </div>
          </div>

          {/* Timeline de Execução */}
          <div className="grid sm:grid-cols-2 gap-3 pt-2 text-xs border-t border-slate-800">
            <div className="flex items-center gap-2 text-slate-300">
              <Clock className="h-4 w-4 text-slate-400 shrink-0" />
              <span>
                Último backup realizado:{' '}
                <strong className="text-white font-mono">
                  {backupConfig.lastBackupAt
                    ? new Date(backupConfig.lastBackupAt).toLocaleString('pt-PT')
                    : serverBackups[0]?.createdAt
                    ? new Date(serverBackups[0].createdAt).toLocaleString('pt-PT')
                    : 'Nenhum ainda'}
                </strong>
              </span>
            </div>

            <div className="flex items-center gap-2 text-slate-300 sm:justify-end">
              <Calendar className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>
                Próximo backup agendado:{' '}
                <strong className="text-emerald-400 font-mono">
                  {backupConfig.enabled && backupConfig.nextBackupAt
                    ? new Date(backupConfig.nextBackupAt).toLocaleString('pt-PT')
                    : backupConfig.enabled
                    ? 'Previsto nas próximas horas'
                    : 'Desativado'}
                </strong>
              </span>
            </div>
          </div>
        </div>

        {/* 2. TABELA DE BACKUPS GUARDADOS NO SERVIDOR */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Server className="h-4 w-4 text-primary" />
                Backups Guardados no Servidor ({serverBackups.length})
              </h3>
              <p className="text-xs text-slate-500">
                Pode restaurar qualquer ponto de segurança com 1 clique ou descarregar o ficheiro JSON.
              </p>
            </div>

            <button
              type="button"
              onClick={fetchServerBackups}
              disabled={isLoadingBackups}
              className="text-xs font-bold text-slate-600 hover:text-primary flex items-center gap-1 p-1"
              title="Atualizar lista"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isLoadingBackups ? 'animate-spin' : ''}`} />
              <span>Atualizar</span>
            </button>
          </div>

          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-extrabold uppercase tracking-wider text-slate-700">
                  <tr>
                    <th className="py-3 px-4">Ficheiro &amp; Tipo</th>
                    <th className="py-3 px-4">Data de Criação</th>
                    <th className="py-3 px-4">Tamanho</th>
                    <th className="py-3 px-4">Conteúdo Incluído</th>
                    <th className="py-3 px-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {serverBackups.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400">
                        Nenhum backup encontrado no servidor. Clique em &quot;Executar Backup Agora&quot; acima para criar o primeiro.
                      </td>
                    </tr>
                  ) : (
                    serverBackups.map((b) => (
                      <tr key={b.filename} className="hover:bg-slate-50/80 transition">
                        <td className="py-3 px-4 font-mono font-bold text-slate-900">
                          <div className="flex items-center gap-2">
                            {b.trigger === 'auto' ? (
                              <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded text-[10px] font-sans font-bold">
                                Automático
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 bg-slate-100 text-slate-700 border border-slate-200 rounded text-[10px] font-sans font-bold">
                                Manual
                              </span>
                            )}
                            <span className="truncate max-w-xs" title={b.filename}>{b.filename}</span>
                          </div>
                        </td>

                        <td className="py-3 px-4 text-slate-700">
                          {new Date(b.createdAt).toLocaleString('pt-PT')}
                        </td>

                        <td className="py-3 px-4 font-mono font-bold text-slate-900">
                          {b.sizeFormatted}
                        </td>

                        <td className="py-3 px-4 text-slate-500">
                          <span className="text-[11px]">
                            {b.stats.products} produtos, {b.stats.orders} pedidos, {b.stats.customers} clientes
                          </span>
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Download */}
                            <a
                              href={`/api/admin/backups/download/${encodeURIComponent(b.filename)}`}
                              download={b.filename}
                              className="px-2.5 py-1 bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 rounded text-[11px] font-bold inline-flex items-center gap-1 transition"
                              title="Descarregar ficheiro JSON"
                            >
                              <Download className="h-3 w-3 text-slate-600" />
                              <span>Baixar</span>
                            </a>

                            {/* Restore */}
                            <button
                              type="button"
                              onClick={() => handleOpenServerRestoreModal(b)}
                              className="px-2.5 py-1 bg-emerald-50 border border-emerald-300 text-emerald-700 hover:bg-emerald-100 rounded text-[11px] font-bold inline-flex items-center gap-1 transition cursor-pointer"
                              title="Restaurar base de dados a partir deste backup"
                            >
                              <RotateCcw className="h-3 w-3" />
                              <span>Restaurar</span>
                            </button>

                            {/* Delete */}
                            <button
                              type="button"
                              onClick={() => handleOpenDeleteBackupModal(b.filename)}
                              className="p-1 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                              title="Eliminar este backup do servidor"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* 3. AÇÕES MANUAIS & EXPORTAÇÃO LOCAL */}
        <div className="pt-4 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* Sync with Server */}
            <button
              type="button"
              onClick={handleSyncServer}
              disabled={isSyncing}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/90 text-white text-xs font-bold uppercase tracking-wider rounded shadow-sm transition disabled:opacity-60 cursor-pointer"
            >
              <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'A sincronizar...' : 'Sincronizar com Servidor'}</span>
            </button>

            {/* Download Full Backup */}
            <button
              type="button"
              onClick={handleExportFullBackup}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider rounded shadow-sm transition cursor-pointer"
            >
              <Download className="h-4 w-4 text-emerald-400" />
              <span>Exportar Backup Local (JSON)</span>
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
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-bold uppercase tracking-wider rounded shadow-xs transition cursor-pointer"
            >
              <Upload className="h-4 w-4 text-primary" />
              <span>Restaurar Ficheiro Local JSON</span>
            </button>
          </div>

          {/* Reset Database to Defaults */}
          <button
            type="button"
            onClick={() => setIsResetModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 text-xs font-bold uppercase rounded transition cursor-pointer"
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
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded inline-flex items-center gap-1.5 transition cursor-pointer"
            >
              <FileJson className="h-3.5 w-3.5 text-primary" />
              <span>Produtos &amp; Categorias ({dbMetrics.productsCount})</span>
            </button>

            <button
              type="button"
              onClick={() => handleExportModuleJson('clientes')}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded inline-flex items-center gap-1.5 transition cursor-pointer"
            >
              <FileJson className="h-3.5 w-3.5 text-indigo-600" />
              <span>Base de Clientes ({dbMetrics.customersCount})</span>
            </button>

            <button
              type="button"
              onClick={() => handleExportModuleJson('pedidos')}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded inline-flex items-center gap-1.5 transition cursor-pointer"
            >
              <FileJson className="h-3.5 w-3.5 text-emerald-600" />
              <span>Histórico de Encomendas ({dbMetrics.ordersCount})</span>
            </button>

            <button
              type="button"
              onClick={() => handleExportModuleJson('eventos')}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded inline-flex items-center gap-1.5 transition cursor-pointer"
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
                Email Secundário (Opcional)
              </label>
              <input
                type="email"
                value={email2}
                onChange={(e) => setEmail2(e.target.value)}
                placeholder="exemplo@arknet.co.ao"
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

        {/* Corpo Executivo */}
        <div className="bg-white border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <div>
              <h3 className="text-base font-bold text-slate-900">Corpo Executivo</h3>
              <p className="text-xs text-slate-500 mt-1">Edite os cartões do corpo executivo apresentados na página Empresa.</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {(formData.executiveTeam || []).map((member, index) => (
              <div key={member.id} className="border border-slate-200 bg-slate-50 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Cartão 0{index + 1}</span>
                  <span className="text-[10px] font-mono text-slate-400">{member.id}</span>
                </div>
                <input
                  type="text"
                  value={member.title}
                  onChange={(e) => setFormData((prev) => ({
                    ...prev,
                    executiveTeam: prev.executiveTeam.map((item, itemIndex) => itemIndex === index ? { ...item, title: e.target.value } : item),
                  }))}
                  placeholder="Título da direcção"
                  className="w-full px-3 py-2.5 text-sm border border-slate-300 focus:border-primary focus:outline-none bg-white"
                />
                <textarea
                  rows={4}
                  value={member.description}
                  onChange={(e) => setFormData((prev) => ({
                    ...prev,
                    executiveTeam: prev.executiveTeam.map((item, itemIndex) => itemIndex === index ? { ...item, description: e.target.value } : item),
                  }))}
                  placeholder="Descrição da responsabilidade"
                  className="w-full px-3 py-2.5 text-sm border border-slate-300 focus:border-primary focus:outline-none bg-white leading-relaxed"
                />
                <ImageUpload
                  value={member.image}
                  onChange={(url) => setFormData((prev) => ({
                    ...prev,
                    executiveTeam: prev.executiveTeam.map((item, itemIndex) => itemIndex === index ? { ...item, image: url } : item),
                  }))}
                  label="Imagem do cartão"
                  helperText="Seleccione uma imagem da galeria ou introduza um endereço."
                  aspectRatio="video"
                />
              </div>
            ))}
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

      {/* Modal de Restauro Seguro a Partir do Servidor */}
      {isServerRestoreModalOpen && serverBackupToRestore && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm"
            onClick={() => !isRestoringServerBackup && setIsServerRestoreModalOpen(false)}
          />

          <div className="relative w-full max-w-lg bg-white border border-slate-200 shadow-2xl rounded-lg overflow-hidden z-10">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-100 text-emerald-700 rounded">
                  <RotateCcw className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">Restaurar Ponto de Backup do Servidor</h3>
                  <p className="text-[11px] text-slate-500 font-mono truncate max-w-xs">{serverBackupToRestore.filename}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsServerRestoreModalOpen(false)}
                disabled={isRestoringServerBackup}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded text-emerald-950 flex items-start gap-2.5">
                <Shield className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Ponto de Restauro Seguro e Automático</p>
                  <p className="text-[11px] text-emerald-800 mt-0.5 leading-relaxed">
                    Antes de restaurar, o sistema criará automaticamente um snapshot preventivo do estado atual.
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 p-4 rounded space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Informações deste Snapshot:
                </span>
                <div className="grid grid-cols-2 gap-2 text-slate-700 font-medium">
                  <div>• Data: <strong>{new Date(serverBackupToRestore.createdAt).toLocaleString('pt-PT')}</strong></div>
                  <div>• Tamanho: <strong>{serverBackupToRestore.sizeFormatted}</strong></div>
                  <div>• Tipo: <strong>{serverBackupToRestore.trigger === 'auto' ? 'Automático' : 'Manual'}</strong></div>
                  <div>• Total de Registos: <strong>{serverBackupToRestore.stats.totalRecords}</strong></div>
                  <div>• Produtos: <strong>{serverBackupToRestore.stats.products}</strong></div>
                  <div>• Encomendas: <strong>{serverBackupToRestore.stats.orders}</strong></div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsServerRestoreModalOpen(false)}
                  disabled={isRestoringServerBackup}
                  className="px-4 py-2 bg-white border border-slate-300 text-slate-700 font-bold uppercase text-xs rounded hover:bg-slate-50 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmServerRestore}
                  disabled={isRestoringServerBackup}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold uppercase text-xs rounded shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                >
                  {isRestoringServerBackup ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>A restaurar base...</span>
                    </>
                  ) : (
                    <>
                      <RotateCcw className="h-3.5 w-3.5" />
                      <span>Restaurar Base Agora</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Eliminar Backup do Servidor */}
      <ConfirmModal
        isOpen={isDeleteBackupModalOpen}
        onClose={() => setIsDeleteBackupModalOpen(false)}
        onConfirm={handleConfirmDeleteBackup}
        title="Eliminar Backup do Servidor"
        message={`Tem a certeza que deseja eliminar permanentemente o ficheiro de backup "${serverBackupToDelete}" do disco do servidor? Esta ação não pode ser desfeita.`}
        confirmText="Sim, Eliminar Backup"
        cancelText="Cancelar"
      />

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
