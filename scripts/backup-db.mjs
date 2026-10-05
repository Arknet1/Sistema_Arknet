#!/usr/bin/env node
/**
 * Script de Backup Automático da Base de Dados ARKNET
 * Execução: node scripts/backup-db.mjs
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')

const backupsDir = path.join(rootDir, 'backups')
const dataDir = path.join(rootDir, 'data')
const dbFile = path.join(dataDir, 'arknet-db.json')
const sqliteFile = path.join(rootDir, 'prisma', 'dev.db')

if (!fs.existsSync(backupsDir)) {
  fs.mkdirSync(backupsDir, { recursive: true })
}

const dateStr = new Date().toISOString().replace(/[:.]/g, '-')

// 1. Backup do ficheiro JSON
if (fs.existsSync(dbFile)) {
  const destJson = path.join(backupsDir, `arknet-db-${dateStr}.json`)
  fs.copyFileSync(dbFile, destJson)
  console.log(`[OK] Backup JSON guardado em: ${destJson}`)
}

// 2. Backup do ficheiro SQLite (se existir)
if (fs.existsSync(sqliteFile)) {
  const destSqlite = path.join(backupsDir, `dev-${dateStr}.db`)
  fs.copyFileSync(sqliteFile, destSqlite)
  console.log(`[OK] Backup SQLite guardado em: ${destSqlite}`)
}

console.log(`[OK] Backup de seguranca concluido com sucesso as ${new Date().toLocaleString('pt-PT')}!`)
