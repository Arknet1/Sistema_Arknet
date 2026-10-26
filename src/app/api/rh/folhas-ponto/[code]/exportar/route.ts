import { NextRequest, NextResponse } from 'next/server'
import { getHrServerSession } from '@/lib/hr/server-session'
import { assertCan } from '@/lib/hr/permissions'
import { logAudit } from '@/lib/hr/audit'
import { prisma } from '@/lib/prisma'
import { formatMinutes } from '@/lib/hr/services/timesheet-service'

/**
 * GET /api/rh/folhas-ponto/[code]/exportar
 * Exporta as folhas de ponto consolidadas de um período para formato CSV (compatível com Excel Windows UTF-8)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const session = await getHrServerSession(request)
    assertCan(session, 'EXPORTAR_EXCEL_PERIODO')

    const { code } = await params

    const period = await (prisma as any).hrTimesheetPeriod.findUnique({
      where: { code },
      include: {
        timesheets: {
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
          },
          orderBy: { employee: { fullName: 'asc' } },
        },
      },
    })

    if (!period) {
      return NextResponse.json(
        { success: false, error: `Período ${code} não encontrado.` },
        { status: 404 }
      )
    }

    // Gravar auditoria
    await logAudit({
      userId: session?.id,
      userName: session?.email,
      userRole: session?.role,
      action: 'ACESSO_SENSIVEL',
      resource: 'PERIODO_PONTO',
      resourceId: period.id,
      details: `Exportação Excel/CSV das folhas de ponto do período ${code}`,
    })

    // Construir CSV compatível com Excel (separador ponto e vírgula, com BOM UTF-8)
    const headers = [
      'Nº Mecanográfico',
      'Nome Completo',
      'Departamento',
      'Cargo',
      'Estado da Folha',
      'Dias Esperados',
      'Dias Trabalhados',
      'Horas Trabalhadas',
      'Tempo Total (Formatado)',
      'Nº de Atrasos',
      'Minutos de Atraso',
      'Horas Extra Aprovadas',
      'Faltas Injustificadas (Dias)',
      'Faltas Justificadas (Dias)',
      'Dias de Férias',
      'Dias de Feriado',
      'Saídas em Falta',
      'Data de Submissão',
      'Aprovado Por',
      'Data de Aprovação',
    ]

    const rows = period.timesheets.map((ts: any) => {
      const hoursWorkedDec = (ts.totalMinutesWorked / 60).toFixed(2).replace('.', ',')
      const formattedTotal = formatMinutes(ts.totalMinutesWorked)
      const formattedExtra = formatMinutes(ts.approvedOvertimeMinutes)

      return [
        `"${ts.employee?.employeeNumber || ''}"`,
        `"${(ts.employee?.fullName || '').replace(/"/g, '""')}"`,
        `"${(ts.employee?.department?.name || '').replace(/"/g, '""')}"`,
        `"${(ts.employee?.position?.title || '').replace(/"/g, '""')}"`,
        `"${ts.status}"`,
        ts.expectedWorkDays,
        ts.workedDays,
        `"${hoursWorkedDec}"`,
        `"${formattedTotal}"`,
        ts.delayCount,
        ts.delayMinutes,
        `"${formattedExtra}"`,
        ts.unjustifiedAbsenceDays,
        ts.justifiedAbsenceDays,
        ts.paidLeaveDays,
        ts.holidayDays,
        ts.missingExitDays,
        ts.submittedAt ? `"${new Date(ts.submittedAt).toLocaleDateString('pt-AO')}"` : '""',
        ts.approvedBy ? `"${ts.approvedBy.replace(/"/g, '""')}"` : '""',
        ts.approvedAt ? `"${new Date(ts.approvedAt).toLocaleDateString('pt-AO')}"` : '""',
      ].join(';')
    })

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows].join('\r\n')

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="folhas-ponto-${code}.csv"`,
      },
    })
  } catch (error: any) {
    const status = error.message?.includes('Acesso negado') ? 403 : 500
    return NextResponse.json({ success: false, error: error.message }, { status })
  }
}
