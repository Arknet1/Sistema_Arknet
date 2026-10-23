import { NextRequest, NextResponse } from 'next/server'
import { processHrExpiryAlerts } from '@/lib/hr/alerts'

export async function POST(request: NextRequest) {
  try {
    // REGRA 2: Validação estrita de CRON_SECRET no servidor
    const expectedSecret = process.env.CRON_SECRET || 'arknet-cron-secret-key-super-secure-2026-ao'
    const authHeader = request.headers.get('authorization')
    const headerToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null
    const customHeaderToken = request.headers.get('x-cron-secret')
    const queryToken = request.nextUrl.searchParams.get('secret')

    const providedSecret = headerToken || customHeaderToken || queryToken

    if (!providedSecret || providedSecret !== expectedSecret) {
      return NextResponse.json(
        { error: 'Acesso não autorizado. CRON_SECRET inválido ou não fornecido.' },
        { status: 401 }
      )
    }

    const report = await processHrExpiryAlerts()

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      report,
    })
  } catch (error: any) {
    console.error('[CRON ALERTAS HR] Erro:', error)
    return NextResponse.json({ error: error.message || 'Erro ao processar alertas de RH.' }, { status: 500 })
  }
}

// Suportar também GET para testes manuais no browser se fornecido secret
export async function GET(request: NextRequest) {
  return POST(request)
}
