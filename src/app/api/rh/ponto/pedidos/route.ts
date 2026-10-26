import { NextRequest, NextResponse } from 'next/server'
import { getHrServerSession } from '@/lib/hr/server-session'
import { assertCan } from '@/lib/hr/permissions'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getHrServerSession(request)
    assertCan(session, 'VER_PONTO_TODOS')

    // 1. Pedidos de Correcção de Ponto
    const corrections = await prisma.hrTimeCorrectionRequest.findMany({
      include: {
        employee: {
          select: {
            id: true,
            fullName: true,
            employeeNumber: true,
            userId: true,
            userRef: { select: { role: true } },
            department: { select: { name: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // 2. Horas Extras Pendentes
    const overtimes = await prisma.hrWorkDay.findMany({
      where: {
        overtimeMinutes: { gt: 0 },
      },
      include: {
        employee: {
          select: {
            id: true,
            fullName: true,
            employeeNumber: true,
            userId: true,
            userRef: { select: { role: true } },
            department: { select: { name: true } },
          },
        },
      },
      orderBy: { date: 'desc' },
    })

    return NextResponse.json({
      success: true,
      data: {
        corrections,
        overtimes,
        currentUserId: session?.id,
        currentUserEmployeeId: session?.employeeId,
      },
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao carregar pedidos.' }, { status: 400 })
  }
}
