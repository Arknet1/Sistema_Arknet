import { NextRequest, NextResponse } from 'next/server'
import { getHrServerSession } from '@/lib/hr/server-session'
import { assertCan } from '@/lib/hr/permissions'
import { getTimesheetForEmployee, submitTimesheet } from '@/lib/hr/services/timesheet-service'
import { getLuandaDateString } from '@/lib/hr/services/time-service'

/**
 * GET /api/portal/folha-ponto — Obtém a folha de ponto do colaborador autenticado
 * Query: ?periodo=2026-10 (se omitido, usa o mês corrente)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getHrServerSession(request)
    assertCan(session, 'VER_FOLHA_PROPRIA')

    const { searchParams } = new URL(request.url)
    let periodCode = searchParams.get('periodo')

    if (!periodCode) {
      const now = getLuandaDateString(new Date())
      const [year, month] = now.split('-')
      periodCode = `${year}-${month}`
    }

    const timesheet = await getTimesheetForEmployee(periodCode, session!.employeeId!)

    if (!timesheet) {
      return NextResponse.json({
        success: true,
        timesheet: null,
        message: `Ainda não foram geradas folhas de ponto para o período ${periodCode}.`,
      })
    }

    return NextResponse.json({ success: true, timesheet })
  } catch (error: any) {
    const status = error.message?.includes('Acesso negado') ? 403 : 500
    return NextResponse.json({ success: false, error: error.message }, { status })
  }
}

/**
 * POST /api/portal/folha-ponto — Submeter a folha de ponto do colaborador autenticado
 * Body: { timesheetId: string }
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getHrServerSession(request)
    assertCan(session, 'SUBMETER_FOLHA_PROPRIA')

    const body = await request.json()
    const { timesheetId } = body

    if (!timesheetId) {
      return NextResponse.json(
        { success: false, error: 'timesheetId é obrigatório.' },
        { status: 400 }
      )
    }

    const result = await submitTimesheet(session!, timesheetId)

    return NextResponse.json({ success: true, timesheet: result })
  } catch (error: any) {
    const status = error.message?.includes('Acesso negado') ? 403 : 400
    return NextResponse.json({ success: false, error: error.message }, { status })
  }
}
