import { NextRequest, NextResponse } from 'next/server'
import { runGpsCleanupTask } from '@/lib/hr/services/cron-service'
import { isAuthorizedCronRequest } from '@/lib/hr/cron-auth'

export async function POST(request: NextRequest) {
  try {
    if (!isAuthorizedCronRequest(request)) {
      return NextResponse.json(
        { error: process.env.CRON_SECRET ? 'Acesso não autorizado.' : 'CRON_SECRET não está configurado.' },
        { status: process.env.CRON_SECRET ? 401 : 503 }
      )
    }

    const result = await runGpsCleanupTask()
    return NextResponse.json(result)
  } catch (error: any) {
    console.error('[CRON] Erro na limpeza de GPS:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
