import { NextRequest, NextResponse } from 'next/server'
import {
  listBackups,
  createBackup,
  deleteBackup,
  getBackupConfig,
  checkAndRunScheduledBackup,
} from '@/lib/backup-service'
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

// GET /api/admin/backups - Lista todos os backups e estado da configuração
export async function GET(request: NextRequest) {
  const admin = getAdminPayload(request)
  if (!admin) {
    return NextResponse.json({ success: false, message: 'Acesso restrito a administradores.' }, { status: 401 })
  }

  try {
    // Executa verificação de backup agendado caso tenha expirado
    await checkAndRunScheduledBackup()

    const backups = listBackups()
    const config = getBackupConfig()

    return NextResponse.json({
      success: true,
      backups,
      config,
    })
  } catch (error: any) {
    console.error('[API /api/admin/backups GET] Erro:', error)
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}

// POST /api/admin/backups - Cria um backup imediato
export async function POST(request: NextRequest) {
  const admin = getAdminPayload(request)
  if (!admin) {
    return NextResponse.json({ success: false, message: 'Acesso restrito a administradores.' }, { status: 401 })
  }

  try {
    const body = await request.json().catch(() => ({}))
    const trigger = body?.trigger === 'auto' ? 'auto' : 'manual'
    const newBackup = await createBackup(trigger, admin.email || 'Admin')
    const backups = listBackups()
    const config = getBackupConfig()

    return NextResponse.json({
      success: true,
      message: 'Backup gerado com sucesso no servidor!',
      backup: newBackup,
      backups,
      config,
    })
  } catch (error: any) {
    console.error('[API /api/admin/backups POST] Erro:', error)
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}

// DELETE /api/admin/backups?filename=... - Elimina um backup
export async function DELETE(request: NextRequest) {
  const admin = getAdminPayload(request)
  if (!admin) {
    return NextResponse.json({ success: false, message: 'Acesso restrito a administradores.' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const filename = searchParams.get('filename')

    if (!filename) {
      return NextResponse.json({ success: false, message: 'Nome do ficheiro não especificado.' }, { status: 400 })
    }

    const deleted = deleteBackup(filename)
    if (!deleted) {
      return NextResponse.json({ success: false, message: 'Ficheiro não encontrado ou erro ao eliminar.' }, { status: 404 })
    }

    const backups = listBackups()
    return NextResponse.json({
      success: true,
      message: `Backup ${filename} eliminado com sucesso.`,
      backups,
    })
  } catch (error: any) {
    console.error('[API /api/admin/backups DELETE] Erro:', error)
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}
