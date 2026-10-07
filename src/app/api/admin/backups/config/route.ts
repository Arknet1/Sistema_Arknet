import { NextRequest, NextResponse } from 'next/server'
import { getBackupConfig, saveBackupConfig } from '@/lib/backup-service'
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

// GET /api/admin/backups/config
export async function GET(request: NextRequest) {
  const admin = getAdminPayload(request)
  if (!admin) {
    return NextResponse.json({ success: false, message: 'Acesso restrito.' }, { status: 401 })
  }

  const config = getBackupConfig()
  return NextResponse.json({ success: true, config })
}

// POST /api/admin/backups/config
export async function POST(request: NextRequest) {
  const admin = getAdminPayload(request)
  if (!admin) {
    return NextResponse.json({ success: false, message: 'Acesso restrito.' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const updated = saveBackupConfig(body)
    return NextResponse.json({
      success: true,
      message: 'Configurações de backup automático guardadas com sucesso!',
      config: updated,
    })
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}
