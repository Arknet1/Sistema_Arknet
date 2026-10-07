import { NextRequest, NextResponse } from 'next/server'
import { getBackupFilePath } from '@/lib/backup-service'
import { verifySessionToken } from '@/lib/server-auth'
import fs from 'fs'

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

// GET /api/admin/backups/download/[filename]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  const admin = getAdminPayload(request)
  if (!admin) {
    return NextResponse.json({ success: false, message: 'Acesso restrito.' }, { status: 401 })
  }

  const { filename } = await params
  const filePath = getBackupFilePath(filename)

  if (!filePath || !fs.existsSync(filePath)) {
    return NextResponse.json({ success: false, message: 'Ficheiro de backup não encontrado.' }, { status: 404 })
  }

  try {
    const fileContent = fs.readFileSync(filePath, 'utf-8')
    return new NextResponse(fileContent, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}
