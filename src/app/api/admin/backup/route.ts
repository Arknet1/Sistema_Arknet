import { NextRequest, NextResponse } from 'next/server'
import { readServerDbFromPrisma, readServerDb } from '@/lib/server-db'
import { verifySessionToken } from '@/lib/server-auth'

function getAdminPayload(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const adminCookie = request.cookies.get('arknet_admin_token')?.value
  const token = authHeader?.replace('Bearer ', '') || adminCookie
  if (!token) return null
  const payload = verifySessionToken(token)
  if (!payload || (payload.role !== 'admin' && payload.role !== 'editor')) {
    return null
  }
  return payload
}

/**
 * GET /api/admin/backup
 * Gera um backup completo da base de dados para descarregamento seguro pelo administrador
 */
export async function GET(request: NextRequest) {
  const admin = getAdminPayload(request)
  if (!admin) {
    return NextResponse.json({ success: false, message: 'Acesso restrito a administradores.' }, { status: 401 })
  }

  try {
    let dbData: any
    try {
      dbData = await readServerDbFromPrisma()
    } catch {
      dbData = readServerDb()
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const filename = `arknet-backup-${timestamp}.json`

    const backupPayload = {
      meta: {
        exportedAt: new Date().toISOString(),
        exportedBy: admin.email || 'Admin',
        version: dbData.version || 3,
        system: 'ARKNET Portal & E-Commerce',
      },
      data: dbData,
    }

    return new NextResponse(JSON.stringify(backupPayload, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (err: any) {
    console.error('[Admin Backup API] Erro:', err)
    return NextResponse.json({ success: false, message: `Erro ao gerar backup: ${err.message}` }, { status: 500 })
  }
}
