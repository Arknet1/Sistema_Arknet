import { NextRequest, NextResponse } from 'next/server'
import { getHrServerSession } from '@/lib/hr/server-session'
import { assertCan } from '@/lib/hr/permissions'
import { getPeriodByCode, closePeriod, reopenPeriod } from '@/lib/hr/services/timesheet-service'

/**
 * GET /api/rh/folhas-ponto/[code] — Obtém o detalhe de um período
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const session = await getHrServerSession(request)
    assertCan(session, 'VER_FOLHAS_TODOS')

    const { code } = await params

    const period = await getPeriodByCode(code)
    if (!period) {
      return NextResponse.json(
        { success: false, error: 'Período não encontrado.' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, period })
  } catch (error: any) {
    const status = error.message?.includes('Acesso negado') ? 403 : 500
    return NextResponse.json({ success: false, error: error.message }, { status })
  }
}

/**
 * PATCH /api/rh/folhas-ponto/[code] — Fechar ou Reabrir período
 * Body: { action: "FECHAR" | "REABRIR", notes?: string, reason?: string }
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const session = await getHrServerSession(request)
    const { code } = await params
    const body = await request.json()
    const { action, notes, reason } = body

    if (action === 'FECHAR') {
      assertCan(session, 'FECHAR_PERIODO_PONTO')
      const result = await closePeriod(session!, code, notes)
      return NextResponse.json({ success: true, period: result })
    }

    if (action === 'REABRIR') {
      assertCan(session, 'REABRIR_PERIODO_PONTO')
      if (!reason) {
        return NextResponse.json(
          { success: false, error: 'É obrigatório indicar o motivo da reabertura.' },
          { status: 400 }
        )
      }
      const result = await reopenPeriod(session!, code, reason)
      return NextResponse.json({ success: true, period: result })
    }

    return NextResponse.json(
      { success: false, error: 'Acção inválida. Acções permitidas: FECHAR, REABRIR.' },
      { status: 400 }
    )
  } catch (error: any) {
    const status = error.message?.includes('Acesso negado') ? 403 : 400
    return NextResponse.json({ success: false, error: error.message }, { status })
  }
}
