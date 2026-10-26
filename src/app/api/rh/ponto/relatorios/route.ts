import { NextRequest, NextResponse } from 'next/server'
import { getHrServerSession } from '@/lib/hr/server-session'
import { assertCan } from '@/lib/hr/permissions'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getHrServerSession(request)
    assertCan(session, 'EXPORTAR_RELATORIO_PONTO')

    const { searchParams } = new URL(request.url)
    const now = new Date()
    const month = searchParams.get('month') ? parseInt(searchParams.get('month')!, 10) : now.getMonth() + 1
    const year = searchParams.get('year') ? parseInt(searchParams.get('year')!, 10) : now.getFullYear()
    const employeeId = searchParams.get('employeeId')

    const monthPrefix = `${year}-${String(month).padStart(2, '0')}`

    const where: any = {
      date: { startsWith: monthPrefix },
    }
    if (employeeId) {
      where.employeeId = employeeId
    }

    const workDays = await prisma.hrWorkDay.findMany({
      where,
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
        timeEntries: { orderBy: { serverTime: 'asc' } },
      },
      orderBy: [{ date: 'asc' }, { employee: { fullName: 'asc' } }],
    })

    // Totais agregados
    let totalWorkedMinutes = 0
    let totalDelayMinutes = 0
    let totalOvertimeMinutes = 0

    for (const wd of workDays) {
      totalWorkedMinutes += wd.totalMinutesWorked
      totalDelayMinutes += wd.delayMinutes
      totalOvertimeMinutes += wd.overtimeApprovedMinutes
    }

    return NextResponse.json({
      success: true,
      data: {
        month,
        year,
        summary: {
          totalDaysRecorded: workDays.length,
          totalWorkedHours: (totalWorkedMinutes / 60).toFixed(1),
          totalDelayHours: (totalDelayMinutes / 60).toFixed(1),
          totalApprovedOvertimeHours: (totalOvertimeMinutes / 60).toFixed(1),
        },
        records: workDays,
      },
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao gerar relatório de presenças.' }, { status: 400 })
  }
}
