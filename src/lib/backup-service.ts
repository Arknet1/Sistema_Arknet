import fs from 'fs'
import path from 'path'
import { readServerDbFromPrisma, readServerDb, writeServerDb } from './server-db'

const DATA_DIR = path.join(process.cwd(), 'data')
const BACKUPS_DIR = path.join(DATA_DIR, 'backups')
const CONFIG_FILE = path.join(DATA_DIR, 'backup-config.json')

export type BackupFrequency = 'every_6h' | 'daily' | 'weekly' | 'monthly'

export interface BackupConfig {
  enabled: boolean
  frequency: BackupFrequency
  maxBackups: number
  lastBackupAt: string | null
  nextBackupAt: string | null
  autoClean: boolean
}

export interface BackupFileInfo {
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

const DEFAULT_CONFIG: BackupConfig = {
  enabled: true,
  frequency: 'daily',
  maxBackups: 15,
  lastBackupAt: null,
  nextBackupAt: null,
  autoClean: true,
}

function ensureBackupsDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }
  if (!fs.existsSync(BACKUPS_DIR)) {
    fs.mkdirSync(BACKUPS_DIR, { recursive: true })
  }
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

export function calculateNextBackupTime(frequency: BackupFrequency, fromDate: Date = new Date()): string {
  const next = new Date(fromDate.getTime())
  switch (frequency) {
    case 'every_6h':
      next.setHours(next.getHours() + 6)
      break
    case 'weekly':
      next.setDate(next.getDate() + 7)
      break
    case 'monthly':
      next.setMonth(next.getMonth() + 1)
      break
    case 'daily':
    default:
      next.setDate(next.getDate() + 1)
      break
  }
  return next.toISOString()
}

export function getBackupConfig(): BackupConfig {
  ensureBackupsDir()
  if (!fs.existsSync(CONFIG_FILE)) {
    const initialConfig: BackupConfig = {
      ...DEFAULT_CONFIG,
      nextBackupAt: calculateNextBackupTime('daily'),
    }
    try {
      fs.writeFileSync(CONFIG_FILE, JSON.stringify(initialConfig, null, 2), 'utf-8')
      return initialConfig
    } catch {
      return initialConfig
    }
  }

  try {
    const raw = fs.readFileSync(CONFIG_FILE, 'utf-8')
    const parsed = JSON.parse(raw)
    return {
      ...DEFAULT_CONFIG,
      ...parsed,
    }
  } catch {
    return DEFAULT_CONFIG
  }
}

export function saveBackupConfig(updates: Partial<BackupConfig>): BackupConfig {
  ensureBackupsDir()
  const current = getBackupConfig()
  const frequencyChanged = updates.frequency && updates.frequency !== current.frequency

  const updated: BackupConfig = {
    ...current,
    ...updates,
  }

  if (frequencyChanged || (!updated.nextBackupAt && updated.enabled)) {
    updated.nextBackupAt = calculateNextBackupTime(updated.frequency)
  }

  try {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(updated, null, 2), 'utf-8')
  } catch (e) {
    console.error('[BackupService] Erro ao guardar configuração de backup:', e)
  }

  return updated
}

export function listBackups(): BackupFileInfo[] {
  ensureBackupsDir()
  try {
    const files = fs.readdirSync(BACKUPS_DIR)
    const jsonFiles = files.filter((f) => f.endsWith('.json') && f.startsWith('arknet-backup-'))

    const backups: BackupFileInfo[] = []

    for (const filename of jsonFiles) {
      const filePath = path.join(BACKUPS_DIR, filename)
      try {
        const stat = fs.statSync(filePath)
        const raw = fs.readFileSync(filePath, 'utf-8')
        const parsed = JSON.parse(raw)
        const meta = parsed.meta || {}
        const data = parsed.data || {}

        const productsCount = Array.isArray(data.products) ? data.products.length : 0
        const categoriesCount = Array.isArray(data.categories) ? data.categories.length : 0
        const ordersCount = Array.isArray(data.orders) ? data.orders.length : 0
        const customersCount = Array.isArray(data.customers) ? data.customers.length : 0
        const leadsCount = Array.isArray(data.leads) ? data.leads.length : 0
        const eventsCount = Array.isArray(data.events) ? data.events.length : 0

        const totalRecords =
          productsCount +
          categoriesCount +
          ordersCount +
          customersCount +
          leadsCount +
          eventsCount +
          (Array.isArray(data.subscribers) ? data.subscribers.length : 0) +
          (Array.isArray(data.projects) ? data.projects.length : 0)

        const isAuto = filename.includes('-auto-') || meta.trigger === 'auto'

        backups.push({
          id: filename.replace('.json', ''),
          filename,
          sizeBytes: stat.size,
          sizeFormatted: formatBytes(stat.size),
          createdAt: meta.exportedAt || stat.birthtime.toISOString() || stat.mtime.toISOString(),
          trigger: isAuto ? 'auto' : 'manual',
          version: meta.version || 3,
          system: meta.system || 'ARKNET Portal & E-Commerce',
          stats: {
            products: productsCount,
            categories: categoriesCount,
            orders: ordersCount,
            customers: customersCount,
            leads: leadsCount,
            events: eventsCount,
            totalRecords,
          },
        })
      } catch (err) {
        console.warn(`[BackupService] Falha ao inspecionar ficheiro de backup ${filename}:`, err)
      }
    }

    // Ordenar do mais recente para o mais antigo
    return backups.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  } catch (error) {
    console.error('[BackupService] Erro ao listar backups:', error)
    return []
  }
}

function cleanOldBackups(maxToKeep: number) {
  try {
    const list = listBackups()
    if (list.length > maxToKeep) {
      const toDelete = list.slice(maxToKeep)
      for (const b of toDelete) {
        const filePath = path.join(BACKUPS_DIR, b.filename)
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath)
          console.log(`[BackupService] Backup antigo removido automaticamente: ${b.filename}`)
        }
      }
    }
  } catch (e) {
    console.warn('[BackupService] Erro ao limpar backups antigos:', e)
  }
}

export async function createBackup(
  trigger: 'auto' | 'manual' = 'manual',
  adminEmail: string = 'Sistema ARKNET'
): Promise<BackupFileInfo> {
  ensureBackupsDir()

  let dbData: any
  try {
    dbData = await readServerDbFromPrisma()
  } catch {
    dbData = readServerDb()
  }

  const now = new Date()
  const timestamp = now
    .toISOString()
    .replace(/:/g, '-')
    .replace(/\..+/, '')

  const typePrefix = trigger === 'auto' ? 'auto' : 'manual'
  const filename = `arknet-backup-${typePrefix}-${timestamp}.json`
  const filePath = path.join(BACKUPS_DIR, filename)

  const backupPayload = {
    meta: {
      exportedAt: now.toISOString(),
      exportedBy: adminEmail,
      trigger,
      version: dbData.version || 3,
      system: 'ARKNET Portal & E-Commerce',
    },
    data: dbData,
  }

  const jsonString = JSON.stringify(backupPayload, null, 2)
  fs.writeFileSync(filePath, jsonString, 'utf-8')

  const stat = fs.statSync(filePath)

  // Atualizar configurações com última e próxima execução
  const config = getBackupConfig()
  const nextTime = calculateNextBackupTime(config.frequency, now)
  saveBackupConfig({
    lastBackupAt: now.toISOString(),
    nextBackupAt: nextTime,
  })

  // Limpeza automática se configurado
  if (config.autoClean && config.maxBackups > 0) {
    cleanOldBackups(config.maxBackups)
  }

  const productsCount = Array.isArray(dbData.products) ? dbData.products.length : 0
  const categoriesCount = Array.isArray(dbData.categories) ? dbData.categories.length : 0
  const ordersCount = Array.isArray(dbData.orders) ? dbData.orders.length : 0
  const customersCount = Array.isArray(dbData.customers) ? dbData.customers.length : 0
  const leadsCount = Array.isArray(dbData.leads) ? dbData.leads.length : 0
  const eventsCount = Array.isArray(dbData.events) ? dbData.events.length : 0

  const totalRecords =
    productsCount +
    categoriesCount +
    ordersCount +
    customersCount +
    leadsCount +
    eventsCount +
    (Array.isArray(dbData.subscribers) ? dbData.subscribers.length : 0) +
    (Array.isArray(dbData.projects) ? dbData.projects.length : 0)

  return {
    id: filename.replace('.json', ''),
    filename,
    sizeBytes: stat.size,
    sizeFormatted: formatBytes(stat.size),
    createdAt: now.toISOString(),
    trigger,
    version: backupPayload.meta.version,
    system: backupPayload.meta.system,
    stats: {
      products: productsCount,
      categories: categoriesCount,
      orders: ordersCount,
      customers: customersCount,
      leads: leadsCount,
      events: eventsCount,
      totalRecords,
    },
  }
}

export async function restoreBackup(filename: string): Promise<{ success: boolean; message: string; stats?: any }> {
  ensureBackupsDir()
  const sanitized = path.basename(filename)
  const filePath = path.join(BACKUPS_DIR, sanitized)

  if (!fs.existsSync(filePath)) {
    return { success: false, message: 'Ficheiro de backup não encontrado no servidor.' }
  }

  try {
    const raw = fs.readFileSync(filePath, 'utf-8')
    const parsed = JSON.parse(raw)
    const dataToRestore = parsed.data || parsed

    if (!dataToRestore || typeof dataToRestore !== 'object') {
      return { success: false, message: 'Estrutura de ficheiro de backup inválida ou corrompida.' }
    }

    // Criar um backup de segurança pré-restauro antes de aplicar
    try {
      await createBackup('manual', 'Auto-Safety Antes do Restauro')
    } catch (e) {
      console.warn('[BackupService] Não foi possível criar backup de segurança pré-restauro:', e)
    }

    // Escrever dados na base de dados
    writeServerDb(dataToRestore)

    return {
      success: true,
      message: `Base de dados restaurada com sucesso a partir de ${sanitized}.`,
      stats: {
        products: Array.isArray(dataToRestore.products) ? dataToRestore.products.length : 0,
        orders: Array.isArray(dataToRestore.orders) ? dataToRestore.orders.length : 0,
        customers: Array.isArray(dataToRestore.customers) ? dataToRestore.customers.length : 0,
      },
    }
  } catch (error: any) {
    console.error('[BackupService] Erro ao restaurar backup:', error)
    return { success: false, message: `Erro ao restaurar backup: ${error.message || 'Erro desconhecido'}` }
  }
}

export function deleteBackup(filename: string): boolean {
  ensureBackupsDir()
  const sanitized = path.basename(filename)
  const filePath = path.join(BACKUPS_DIR, sanitized)

  if (!fs.existsSync(filePath)) {
    return false
  }

  try {
    fs.unlinkSync(filePath)
    return true
  } catch (error) {
    console.error(`[BackupService] Erro ao eliminar backup ${filename}:`, error)
    return false
  }
}

export function getBackupFilePath(filename: string): string | null {
  ensureBackupsDir()
  const sanitized = path.basename(filename)
  const filePath = path.join(BACKUPS_DIR, sanitized)
  return fs.existsSync(filePath) ? filePath : null
}

export async function checkAndRunScheduledBackup(): Promise<BackupFileInfo | null> {
  try {
    const config = getBackupConfig()
    if (!config.enabled) return null

    const now = new Date()

    if (!config.nextBackupAt) {
      const nextTime = calculateNextBackupTime(config.frequency, now)
      saveBackupConfig({ nextBackupAt: nextTime })
      return null
    }

    const nextDate = new Date(config.nextBackupAt)
    if (now >= nextDate) {
      console.log('[BackupService] Executando backup automático agendado...')
      const newBackup = await createBackup('auto', 'Rotina Automática ARKNET')
      console.log(`[BackupService] Backup automático criado com sucesso: ${newBackup.filename}`)
      return newBackup
    }
  } catch (e) {
    console.error('[BackupService] Erro ao verificar/executar backup agendado:', e)
  }
  return null
}
