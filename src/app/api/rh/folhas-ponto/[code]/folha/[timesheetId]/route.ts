import { NextRequest, NextResponse } from 'next/server'
import { getHrServerSession } from '@/lib/hr/server-session'
import { assertCan } from '@/lib/hr/permissions'
import { approveTimesheet, justifyAbsence } from '@/lib/hr/services/timesheet-service'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/rh/folhas-ponto/[code]/folha/[timesheetId] — Detalhe de uma folha individual
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string; timesheetId: string }> }
) {
  try {
    const session = await getHrServerSession(request)
    assertCan(session, 'VER_FOLHAS_TODOS')

    const { timesheetId } = await params

    const timesheet = await prisma.hrTimesheet.findUnique({
      where: { id: timesheetId },
      include: {
        employee: {
          select: {
            id: true,
            fullName: true,
            employeeNumber: true,
            department: { select: { name: true } },
            position: { select: { title: true } },
          },
        },
        period: true,
        days: { orderBy: { date: 'asc' } },
      },
    })

    if (!timesheet) {
      return NextResponse.json(
        { success: false, error: 'Folha de ponto não encontrada.' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, timesheet })
  } catch (error: any) {
    const status = error.message?.includes('Acesso negado') ? 403 : 500
    return NextResponse.json({ success: false, error: error.message }, { status })
  }
}

/**
 * PATCH /api/rh/folhas-ponto/[code]/folha/[timesheetId] — Aprovar folha ou Justificar falta
 * Body: { action: "APROVAR" | "JUSTIFICAR_FALTA", note?: string, dayDetailId?: string, reason?: string }
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ code: string; timesheetId: string }> }
) {
  try {
    const session = await getHrServerSession(request)
    const { timesheetId } = await params
    const body = await request.json()
    const { action, note, dayDetailId, reason } = body

    if (action === 'APROVAR') {
      assertCan(session, 'APROVAR_FOLHA_PONTO')
      const result = await approveTimesheet(session!, timesheetId, note)
      return NextResponse.json({ success: true, timesheet: result })
    }

    if (action === 'JUSTIFICAR_FALTA') {
      assertCan(session, 'JUSTIFICAR_FALTA')
      if (!dayDetailId || !reason) {
        return NextResponse.json(
          { success: false, error: 'dayDetailId e reason são obrigatórios.' },
          { status: 400 }
        )
      }
      const result = await justifyAbsence(session!, dayDetailId, reason)
      return NextResponse.json({ success: true, dayDetail: result })
    }

    return NextResponse.json(
      { success: false, error: 'Acção inválida. Acções permitidas: APROVAR, JUSTIFICAR_FALTA.' },
      { status: 400 }
    )
  } catch (error: any) {
    const status = error.message?.includes('Acesso negado') ? 403 : 400
    return NextResponse.json({ success: false, error: error.message }, { status })
  }
}
