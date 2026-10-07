import { NextRequest, NextResponse } from 'next/server'
import { restoreBackup } from '@/lib/backup-service'
import { verifySessionToken } from '@/lib/server-auth'

function getAdminPayload(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const adminCookie = request.cookies.get('arknet_admin_token')?.value
  const token = authHeader?.replace('Bearer ', '') || adminCookie
  if (!token) return null
  const payload = verifySessionToken(token)
  if (!payload || payload.role !== 'admin') {
    return null
  }
  return payload
}

// POST /api/admin/backups/restore
export async function POST(request: NextRequest) {
  const admin = getAdminPayload(request)
  if (!admin) {
    return NextResponse.json(
      { success: false, message: 'Apenas Administradores principais podem restaurar backups.' },
      { status: 403 }
    )
  }

  try {
    const body = await request.json()
    const { filename } = body

    if (!filename) {
      return NextResponse.json({ success: false, message: 'Nome do ficheiro de backup obrigatório.' }, { status: 400 })
    }

    const result = await restoreBackup(filename)

    if (!result.success) {
      return NextResponse.json({ success: false, message: result.message }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      stats: result.stats,
    })
  } catch (error: any) {
    console.error('[API /api/admin/backups/restore] Erro:', error)
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}
