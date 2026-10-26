import { NextRequest, NextResponse } from 'next/server'
import { getHrServerSession } from '@/lib/hr/server-session'
import { assertCan } from '@/lib/hr/permissions'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getHrServerSession(request)
    assertCan(session, 'VER_AUSENCIAS_TODOS')

    const { searchParams } = new URL(request.url)
    const now = new Date()
    const month = searchParams.get('month') ? parseInt(searchParams.get('month')!, 10) : now.getMonth() + 1
    const year = searchParams.get('year') ? parseInt(searchParams.get('year')!, 10) : now.getFullYear()
    const departmentId = searchParams.get('departmentId')

    const startOfMonth = new Date(year, month - 1, 1)
    const endOfMonth = new Date(year, month, 0, 23, 59, 59)

    const approvedLeaves = await prisma.hrLeaveRequest.findMany({
      where: {
        status: 'APROVADO',
        startDate: { lte: endOfMonth },
        endDate: { gte: startOfMonth },
        ...(departmentId ? { employee: { departmentId } } : {}),
      },
      include: {
        leaveType: true,
        employee: {
          select: {
            id: true,
            fullName: true,
            employeeNumber: true,
            department: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { startDate: 'asc' },
    })

    const holidays = await prisma.hrHoliday.findMany({
      where: {
        date: {
          gte: `${year}-${String(month).padStart(2, '0')}-01`,
          lte: `${year}-${String(month).padStart(2, '0')}-31`,
        },
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        month,
        year,
        leaves: approvedLeaves,
        holidays,
      },
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao carregar calendário.' }, { status: 400 })
  }
}
