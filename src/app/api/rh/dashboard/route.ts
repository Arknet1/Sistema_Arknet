import { NextRequest, NextResponse } from 'next/server'
import { getHrServerSession } from '@/lib/hr/server-session'
import { assertCan } from '@/lib/hr/permissions'
import { prisma } from '@/lib/prisma'
import { getLuandaDateString } from '@/lib/hr/services/time-service'

export async function GET(request: NextRequest) {
  try {
    const session = await getHrServerSession(request)
    assertCan(session, 'ACEDER_PAINEL_RH')

    const now = new Date()
    const today = getLuandaDateString(now)
    const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1) - 60 * 60 * 1000)
    const monthEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1) - 60 * 60 * 1000)
    const expiryLimit = new Date(now)
    expiryLimit.setDate(expiryLimit.getDate() + 60)
    const documentExpiryLimit = new Date(now)
    documentExpiryLimit.setDate(documentExpiryLimit.getDate() + 30)

    const [activeEmployees, newHiresThisMonth, pendingLeaves, presentToday, absencesToday,
      contractsExpiring, docsExpiring, departmentGroups, departments, recentEmployees] = await Promise.all([
      prisma.hrEmployee.count({ where: { status: 'ACTIVO' } }),
      prisma.hrEmployee.count({ where: { admissionDate: { gte: monthStart, lt: monthEnd } } }),
      prisma.hrLeaveRequest.count({ where: { status: 'PENDENTE', leaveType: { is: { deductsFromBalance: true } } } }),
      prisma.hrWorkDay.count({ where: { date: today, status: { in: ['NORMAL', 'ATRASO'] } } }),
      prisma.hrTimesheetDayDetail.count({ where: { date: today, status: { in: ['FALTA_INJUSTIFICADA', 'FALTA_JUSTIFICADA'] } } }),
      prisma.hrContract.count({ where: { status: 'ACTIVO', endDate: { gte: now, lte: expiryLimit } } }),
      prisma.hrDocument.count({ where: { status: 'ACTIVO', expiresAt: { gte: now, lte: documentExpiryLimit } } }),
      prisma.hrEmployee.groupBy({ by: ['departmentId'], where: { status: 'ACTIVO' }, _count: { _all: true } }),
      prisma.hrDepartment.findMany({ select: { id: true, name: true }, orderBy: { name: 'asc' } }),
      prisma.hrEmployee.findMany({
        take: 6,
        orderBy: { admissionDate: 'desc' },
        include: {
          department: { select: { id: true, name: true, code: true } },
          position: { select: { title: true } },
          contracts: { where: { status: 'ACTIVO' }, take: 1, select: { id: true, contractNumber: true } },
        },
      }),
    ])

    const countsByDepartment = new Map(departmentGroups.map((group) => [group.departmentId, group._count._all]))
    const departmentStats = departments.map((department) => ({
      name: department.name,
      count: countsByDepartment.get(department.id) || 0,
    })).sort((a, b) => b.count - a.count)

    return NextResponse.json({
      success: true,
      stats: { activeEmployees, newHiresThisMonth, pendingLeaves, presentToday, absencesToday, contractsExpiring, docsExpiring },
      departmentStats,
      recentEmployees,
    })
  } catch (error: any) {
    const status = error.message?.includes('Acesso negado') ? 403 : 500
    return NextResponse.json({ success: false, error: error.message || 'Não foi possível carregar o painel.' }, { status })
  }
}
