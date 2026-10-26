import { NextRequest, NextResponse } from 'next/server'
import { getHrServerSession } from '@/lib/hr/server-session'
import { assertCan } from '@/lib/hr/permissions'
import { getPayslip } from '@/lib/hr/services/payroll-service'

/**
 * GET /api/portal/recibos/[id] — Obtém detalhe discriminado do recibo de vencimento do colaborador
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getHrServerSession(request)
    assertCan(session, 'VER_RECIBO_PROPRIO')

    const { id } = await params
    const payslip = await getPayslip(id, session!)

    if (!payslip) {
      return NextResponse.json(
        { success: false, error: 'Recibo de vencimento não encontrado.' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, payslip })
  } catch (error: any) {
    const status = error.message?.includes('Acesso negado') ? 403 : 500
    return NextResponse.json({ success: false, error: error.message }, { status })
  }
}
