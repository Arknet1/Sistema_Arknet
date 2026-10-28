import { NextRequest, NextResponse } from 'next/server'
import { getHrServerSession } from '@/lib/hr/server-session'
import { assertCan } from '@/lib/hr/permissions'
import { processHrExpiryAlerts } from '@/lib/hr/alerts'

export async function POST(request: NextRequest) {
  try {
    const session = await getHrServerSession(request)
    assertCan(session, 'ACEDER_PAINEL_RH')
    const report = await processHrExpiryAlerts()
    return NextResponse.json({ success: true, report })
  } catch (error: any) {
    const status = error.message?.includes('Acesso negado') ? 403 : 500
    return NextResponse.json({ success: false, error: error.message || 'Não foi possível verificar alertas.' }, { status })
  }
}
