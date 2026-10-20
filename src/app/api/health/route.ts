import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import fs from 'fs'
import path from 'path'

export const dynamic = 'force-dynamic'

export async function GET() {
  const startTime = Date.now()
  let databaseStatus = 'healthy'
  let databaseLatencyMs = 0
  let fallbackStorageStatus = 'healthy'

  // 1. Verificar ligação ao Prisma ORM
  try {
    const dbStart = Date.now()
    await prisma.companySetting.findFirst({ select: { id: true } })
    databaseLatencyMs = Date.now() - dbStart
  } catch (error) {
    databaseStatus = 'degraded'
  }

  // 2. Verificar integridade do armazenamento de backup local
  try {
    const dataDir = path.join(process.cwd(), 'data')
    const dbFile = path.join(dataDir, 'arknet-db.json')
    if (!fs.existsSync(dbFile)) {
      fallbackStorageStatus = 'missing_file'
    } else {
      const stats = fs.statSync(dbFile)
      if (stats.size === 0) fallbackStorageStatus = 'empty_file'
    }
  } catch {
    fallbackStorageStatus = 'error'
  }

  const isHealthy = databaseStatus === 'healthy' || fallbackStorageStatus === 'healthy'
  const responseTimeMs = Date.now() - startTime

  const healthData = {
    status: isHealthy ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    services: {
      prisma: {
        status: databaseStatus,
        latencyMs: databaseLatencyMs,
      },
      fallbackStorage: {
        status: fallbackStorageStatus,
      },
      auth: {
        hasSecretConfigured: Boolean(process.env.AUTH_SECRET && process.env.AUTH_SECRET.length >= 32),
      },
      smtp: {
        isConfigured: Boolean(process.env.SMTP_HOST && process.env.SMTP_USER),
      },
    },
    responseTimeMs,
  }

  return NextResponse.json(healthData, {
    status: isHealthy ? 200 : 503,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  })
}
