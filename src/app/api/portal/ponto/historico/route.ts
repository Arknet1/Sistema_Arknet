import { NextRequest, NextResponse } from 'next/server'
import { getHrServerSession } from '@/lib/hr/server-session'
import { assertCan } from '@/lib/hr/permissions'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getHrServerSession(request)
    assertCan(session, 'VER_PONTO_PROPRIO')

    if (!session?.employeeId) {
      return NextResponse.json({ error: 'Nenhuma ficha de funcionário associada a esta conta.' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const now = new Date()
    const month = searchParams.get('month') ? parseInt(searchParams.get('month')!, 10) : now.getMonth() + 1
    const year = searchParams.get('year') ? parseInt(searchParams.get('year')!, 10) : now.getFullYear()

    const monthPrefix = `${year}-${String(month).padStart(2, '0')}`

    const workDays = await prisma.hrWorkDay.findMany({
      where: {
        employeeId: session.employeeId,
        date: { startsWith: monthPrefix },
      },
      include: {
        timeEntries: { orderBy: { serverTime: 'asc' } },
        timeCorrections: { orderBy: { createdAt: 'desc' } },
      },
      orderBy: { date: 'desc' },
    })

    return NextResponse.json({
      success: true,
      data: {
        month,
        year,
        workDays,
      },
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao carregar histórico de ponto.' }, { status: 400 })
  }
}
