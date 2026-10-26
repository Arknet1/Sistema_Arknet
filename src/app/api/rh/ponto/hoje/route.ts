import { NextRequest, NextResponse } from 'next/server'
import { getHrServerSession } from '@/lib/hr/server-session'
import { assertCan } from '@/lib/hr/permissions'
import { getLuandaDateString } from '@/lib/hr/services/time-service'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getHrServerSession(request)
    assertCan(session, 'VER_PONTO_TODOS')

    const { searchParams } = new URL(request.url)
    const departmentId = searchParams.get('departmentId')
    const filterStatus = searchParams.get('status')
    const search = searchParams.get('search')?.toLowerCase()

    const todayStr = getLuandaDateString(new Date())
    const todayDate = new Date()
    todayDate.setHours(0, 0, 0, 0)

    // Obter todos os colaboradores activos
    const employees = await prisma.hrEmployee.findMany({
      where: {
        status: 'ACTIVO',
        ...(departmentId ? { departmentId } : {}),
        ...(search
          ? {
              OR: [
                { fullName: { contains: search } },
                { employeeNumber: { contains: search } },
              ],
            }
          : {}),
      },
      include: {
        department: true,
        position: true,
        contracts: { where: { status: 'ACTIVO' }, take: 1 },
        workDays: {
          where: { date: todayStr },
          include: {
            timeEntries: { orderBy: { serverTime: 'asc' } },
          },
        },
        leaveRequests: {
          where: {
            status: 'APROVADO',
            startDate: { lte: todayDate },
            endDate: { gte: todayDate },
          },
          include: { leaveType: true },
          take: 1,
        },
      },
      orderBy: { fullName: 'asc' },
    })

    // Classificar cada colaborador
    const list = employees.map((emp) => {
      const activeLeave = emp.leaveRequests[0]
      const workDay = emp.workDays[0]
      const entries = workDay?.timeEntries || []
      const lastEntry = entries[entries.length - 1]
      const hasOutOfArea = entries.some((e) => !e.isWithinRadius)

      let currentAttendance: 'PRESENTE' | 'EM_PAUSA' | 'SAIU' | 'AUSENTE' | 'DE_FERIAS' | 'SAIDA_EM_FALTA' = 'AUSENTE'

      if (activeLeave) {
        currentAttendance = 'DE_FERIAS'
      } else if (workDay?.status === 'SAIDA_EM_FALTA') {
        currentAttendance = 'SAIDA_EM_FALTA'
      } else if (entries.length > 0) {
        if (lastEntry.type === 'ENTRADA' || lastEntry.type === 'FIM_PAUSA') {
          currentAttendance = 'PRESENTE'
        } else if (lastEntry.type === 'INICIO_PAUSA') {
          currentAttendance = 'EM_PAUSA'
        } else if (lastEntry.type === 'SAIDA') {
          currentAttendance = 'SAIU'
        }
      }

      return {
        id: emp.id,
        employeeNumber: emp.employeeNumber,
        fullName: emp.fullName,
        department: emp.department.name,
        position: emp.position.title,
        attendanceStatus: currentAttendance,
        workDay,
        entriesCount: entries.length,
        hasOutOfArea,
        activeLeave: activeLeave ? activeLeave.leaveType.name : null,
      }
    })

    const filtered = filterStatus
      ? list.filter((item) => item.attendanceStatus === filterStatus)
      : list

    // Contadores para o resumo
    const counts = {
      total: list.length,
      presentes: list.filter((i) => i.attendanceStatus === 'PRESENTE').length,
      emPausa: list.filter((i) => i.attendanceStatus === 'EM_PAUSA').length,
      saiu: list.filter((i) => i.attendanceStatus === 'SAIU').length,
      ausentes: list.filter((i) => i.attendanceStatus === 'AUSENTE').length,
      deFerias: list.filter((i) => i.attendanceStatus === 'DE_FERIAS').length,
      saidaEmFalta: list.filter((i) => i.attendanceStatus === 'SAIDA_EM_FALTA').length,
      foraDaArea: list.filter((i) => i.hasOutOfArea).length,
    }

    return NextResponse.json({
      success: true,
      data: {
        date: todayStr,
        counts,
        employees: filtered,
      },
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao carregar presenças de hoje.' }, { status: 400 })
  }
}
