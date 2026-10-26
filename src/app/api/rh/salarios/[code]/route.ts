import { NextRequest, NextResponse } from 'next/server'
import { getHrServerSession } from '@/lib/hr/server-session'
import { assertCan } from '@/lib/hr/permissions'
import {
  getPayrollPeriod,
  approvePayrollPeriod,
  markPayrollPaid,
} from '@/lib/hr/services/payroll-service'

/**
 * GET /api/rh/salarios/[code] — Obtém detalhe do período salarial e recibos
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const session = await getHrServerSession(request)
    assertCan(session, 'VER_SALARIOS_TODOS')

    const { code } = await params
    const payroll = await getPayrollPeriod(code)

    if (!payroll) {
      return NextResponse.json(
        { success: false, error: `Processamento salarial do período ${code} não encontrado.` },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, payroll })
  } catch (error: any) {
    const status = error.message?.includes('Acesso negado') ? 403 : 500
    return NextResponse.json({ success: false, error: error.message }, { status })
  }
}

/**
 * PATCH /api/rh/salarios/[code] — Acções sobre o período: APROVAR ou PAGAR
 * Body: { action: 'APROVAR' | 'PAGAR', notes?: string, paymentDate?: string }
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const session = await getHrServerSession(request)
    const { code } = await params
    const body = await request.json()
    const { action, notes, paymentDate } = body

    if (action === 'APROVAR') {
      assertCan(session, 'APROVAR_SALARIOS')
      const updated = await approvePayrollPeriod(code, session!, notes)
      return NextResponse.json({ success: true, payroll: updated })
    }

    if (action === 'PAGAR') {
      assertCan(session, 'PAGAR_SALARIOS')
      const pDate = paymentDate ? new Date(paymentDate) : new Date()
      const updated = await markPayrollPaid(code, session!, pDate)
      return NextResponse.json({ success: true, payroll: updated })
    }

    return NextResponse.json(
      { success: false, error: `Acção "${action}" inválida. Use APROVAR ou PAGAR.` },
      { status: 400 }
    )
  } catch (error: any) {
    const status = error.message?.includes('Acesso negado') ? 403 : 400
    return NextResponse.json({ success: false, error: error.message }, { status })
  }
}
