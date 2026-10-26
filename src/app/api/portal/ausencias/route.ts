import { NextRequest, NextResponse } from 'next/server'
import { getHrServerSession } from '@/lib/hr/server-session'
import { assertCan } from '@/lib/hr/permissions'
import { getOrCreateLeaveBalance, submitLeaveRequest } from '@/lib/hr/services/leave-service'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getHrServerSession(request)
    assertCan(session, 'VER_AUSENCIAS_PROPRIAS')

    if (!session?.employeeId) {
      return NextResponse.json({ error: 'Nenhuma ficha de funcionário associada a esta conta.' }, { status: 403 })
    }

    const currentYear = new Date().getFullYear()

    // Obter ou criar saldo
    const balance = await getOrCreateLeaveBalance(session.employeeId, currentYear)

    // Obter tipos de licença activos
    const leaveTypes = await prisma.hrLeaveType.findMany({
      where: { active: true },
      orderBy: { order: 'asc' },
    })

    // Obter histórico de pedidos do colaborador
    const requests = await prisma.hrLeaveRequest.findMany({
      where: { employeeId: session.employeeId },
      include: { leaveType: true },
      orderBy: { createdAt: 'desc' },
    })

    // Obter feriados do ano
    const holidays = await prisma.hrHoliday.findMany({
      where: { date: { startsWith: String(currentYear) } },
      orderBy: { date: 'asc' },
    })

    return NextResponse.json({
      success: true,
      data: {
        balance,
        leaveTypes,
        requests,
        holidays,
      },
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao carregar dados de ausências.' }, { status: 400 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getHrServerSession(request)
    assertCan(session, 'PEDIR_AUSENCIA')

    if (!session?.employeeId) {
      return NextResponse.json({ error: 'Nenhuma ficha de funcionário associada a esta conta.' }, { status: 403 })
    }

    const body = await request.json()
    const { leaveTypeId, startDate, endDate, reason, attachmentPath, attachmentName } = body

    if (!leaveTypeId || !startDate || !endDate || !reason) {
      return NextResponse.json({ error: 'Tipo, datas e motivo são de preenchimento obrigatório.' }, { status: 400 })
    }

    const result = await submitLeaveRequest(session, {
      employeeId: session.employeeId,
      leaveTypeId,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      reason,
      attachmentPath,
      attachmentName,
    })

    return NextResponse.json({
      success: true,
      message: 'Pedido de ausência submetido com sucesso.',
      data: result.request,
      warning: result.colleaguesAbsentWarning,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao submeter pedido de ausência.' }, { status: 400 })
  }
}
