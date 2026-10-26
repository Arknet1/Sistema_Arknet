import { NextRequest, NextResponse } from 'next/server'
import { getHrServerSession } from '@/lib/hr/server-session'
import { assertCan } from '@/lib/hr/permissions'
import { listPayrollPeriods, processPayrollPeriod } from '@/lib/hr/services/payroll-service'

/**
 * GET /api/rh/salarios — Lista os períodos salariais existentes
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getHrServerSession(request)
    assertCan(session, 'VER_SALARIOS_TODOS')

    const periods = await listPayrollPeriods()
    return NextResponse.json({ success: true, periods })
  } catch (error: any) {
    const status = error.message?.includes('Acesso negado') ? 403 : 500
    return NextResponse.json({ success: false, error: error.message }, { status })
  }
}

/**
 * POST /api/rh/salarios — Processa a folha de salários de um período
 * Body: { periodCode: string }
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getHrServerSession(request)
    assertCan(session, 'PROCESSAR_SALARIOS')

    const body = await request.json()
    const { periodCode } = body

    if (!periodCode) {
      return NextResponse.json(
        { success: false, error: 'O código do período (AAAA-MM) é obrigatório.' },
        { status: 400 }
      )
    }

    const result = await processPayrollPeriod(periodCode, session!)

    return NextResponse.json({
      success: true,
      payrollPeriod: result,
      message: `Folha salarial de ${periodCode} processada com sucesso.`,
    })
  } catch (error: any) {
    const status = error.message?.includes('Acesso negado') ? 403 : 400
    return NextResponse.json({ success: false, error: error.message }, { status })
  }
}
