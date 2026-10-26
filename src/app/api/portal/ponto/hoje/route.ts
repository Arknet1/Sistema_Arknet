import { NextRequest, NextResponse } from 'next/server'
import { getHrServerSession } from '@/lib/hr/server-session'
import { assertCan } from '@/lib/hr/permissions'
import { getEmployeeTodayStatus } from '@/lib/hr/services/time-service'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getHrServerSession(request)
    assertCan(session, 'MARCAR_PONTO_PROPRIO')

    if (!session?.employeeId) {
      return NextResponse.json({ error: 'Nenhuma ficha de funcionário associada a esta conta.' }, { status: 403 })
    }

    const employee = await prisma.hrEmployee.findUnique({
      where: { id: session.employeeId },
      select: {
        id: true,
        fullName: true,
        employeeNumber: true,
        status: true,
        locationConsentDate: true,
      },
    })

    if (!employee || employee.status === 'DESLIGADO' || employee.status === 'SUSPENSO') {
      return NextResponse.json({ error: `Acesso negado: Funcionário com estado "${employee?.status}".` }, { status: 403 })
    }

    const todayStatus = await getEmployeeTodayStatus(session.employeeId)

    return NextResponse.json({
      success: true,
      data: {
        employee,
        todayStatus,
      },
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao carregar estado do ponto.' }, { status: 400 })
  }
}
