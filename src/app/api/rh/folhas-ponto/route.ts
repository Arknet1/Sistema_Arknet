import { NextRequest, NextResponse } from 'next/server'
import { getHrServerSession } from '@/lib/hr/server-session'
import { assertCan } from '@/lib/hr/permissions'
import {
  listPeriods,
  generateTimesheets,
  getCurrentPeriodSummary,
} from '@/lib/hr/services/timesheet-service'

/**
 * GET /api/rh/folhas-ponto — Lista todos os períodos de folhas de ponto
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getHrServerSession(request)
    assertCan(session, 'VER_FOLHAS_TODOS')

    const periods = await listPeriods()
    const currentSummary = await getCurrentPeriodSummary()

    return NextResponse.json({
      success: true,
      periods,
      currentPeriod: currentSummary,
    })
  } catch (error: any) {
    const status = error.message?.includes('Acesso negado') ? 403 : 500
    return NextResponse.json({ success: false, error: error.message }, { status })
  }
}

/**
 * POST /api/rh/folhas-ponto — Gera/recalcula folhas de ponto para um período
 * Body: { periodCode: "2026-10" }
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getHrServerSession(request)
    assertCan(session, 'GERAR_FOLHAS_PONTO')

    const body = await request.json()
    const { periodCode } = body

    if (!periodCode || !/^\d{4}-\d{2}$/.test(periodCode)) {
      return NextResponse.json(
        { success: false, error: 'Código do período inválido. Formato esperado: "AAAA-MM".' },
        { status: 400 }
      )
    }

    const result = await generateTimesheets(session!, periodCode)

    return NextResponse.json({ success: true, ...result })
  } catch (error: any) {
    const status = error.message?.includes('Acesso negado') ? 403 : 400
    return NextResponse.json({ success: false, error: error.message }, { status })
  }
}
