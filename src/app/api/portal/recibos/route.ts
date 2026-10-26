import { NextRequest, NextResponse } from 'next/server'
import { getHrServerSession } from '@/lib/hr/server-session'
import { assertCan } from '@/lib/hr/permissions'
import { getEmployeePayslips } from '@/lib/hr/services/payroll-service'

/**
 * GET /api/portal/recibos — Obtém a lista dos recibos de vencimento do colaborador autenticado
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getHrServerSession(request)
    assertCan(session, 'VER_RECIBO_PROPRIO')

    const payslips = await getEmployeePayslips(session!.employeeId!)
    return NextResponse.json({ success: true, payslips })
  } catch (error: any) {
    const status = error.message?.includes('Acesso negado') ? 403 : 500
    return NextResponse.json({ success: false, error: error.message }, { status })
  }
}
