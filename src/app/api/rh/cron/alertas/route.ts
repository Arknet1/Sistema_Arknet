import { NextRequest, NextResponse } from 'next/server'
import { processHrExpiryAlerts } from '@/lib/hr/alerts'
import { isAuthorizedCronRequest } from '@/lib/hr/cron-auth'

export async function POST(request: NextRequest) {
  try {
    if (!isAuthorizedCronRequest(request)) {
      return NextResponse.json(
        { error: process.env.CRON_SECRET ? 'Acesso não autorizado.' : 'CRON_SECRET não está configurado.' },
        { status: process.env.CRON_SECRET ? 401 : 503 }
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

// Compatibilidade com GET; o segredo tem de ser enviado num cabeçalho, nunca na URL.
export async function GET(request: NextRequest) {
  return POST(request)
}
