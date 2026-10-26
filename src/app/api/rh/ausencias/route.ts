import { NextRequest, NextResponse } from 'next/server'
import { getHrServerSession } from '@/lib/hr/server-session'
import { assertCan } from '@/lib/hr/permissions'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getHrServerSession(request)
    assertCan(session, 'VER_AUSENCIAS_TODOS')

    const { searchParams } = new URL(request.url)
    const departmentId = searchParams.get('departmentId')
    const filterStatus = searchParams.get('status')
    const year = searchParams.get('year') ? parseInt(searchParams.get('year')!, 10) : new Date().getFullYear()

    // 1. Pedidos de Ausência
    const requests = await prisma.hrLeaveRequest.findMany({
      where: {
        ...(filterStatus ? { status: filterStatus } : {}),
        ...(departmentId ? { employee: { departmentId } } : {}),
      },
      include: {
        leaveType: true,
        employee: {
          select: {
            id: true,
            fullName: true,
            employeeNumber: true,
            userId: true,
            userRef: { select: { role: true } },
            department: { select: { id: true, name: true } },
            position: { select: { title: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // 2. Saldos do Ano por Funcionário
    const balances = await prisma.hrLeaveBalance.findMany({
      where: { year },
      include: {
        employee: {
          select: {
            id: true,
            fullName: true,
            employeeNumber: true,
            department: { select: { name: true } },
          },
        },
      },
      orderBy: { employee: { fullName: 'asc' } },
    })

    return NextResponse.json({
      success: true,
      data: {
        requests,
        balances,
        currentUserId: session?.id,
        currentUserEmployeeId: session?.employeeId,
      },
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao carregar ausências.' }, { status: 400 })
  }
}
