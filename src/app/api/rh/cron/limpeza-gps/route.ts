import { NextRequest, NextResponse } from 'next/server'
import { runGpsCleanupTask } from '@/lib/hr/services/cron-service'

export async function POST(request: NextRequest) {
  try {
    const expectedSecret = process.env.CRON_SECRET || 'arknet-cron-secret-key-super-secure-2026-ao'
    const authHeader = request.headers.get('authorization')
    const headerToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null
    const customHeaderToken = request.headers.get('x-cron-secret')

    const providedSecret = headerToken || customHeaderToken

    if (!providedSecret || providedSecret !== expectedSecret) {
      return NextResponse.json(
        { error: 'Acesso não autorizado. CRON_SECRET inválido ou não fornecido.' },
        { status: 401 }
      )
    }

    const result = await runGpsCleanupTask()
    return NextResponse.json(result)
  } catch (error: any) {
    console.error('[CRON] Erro na limpeza de GPS:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
