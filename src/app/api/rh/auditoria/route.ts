import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getHrServerSession } from '@/lib/hr/server-session'
import { assertCan } from '@/lib/hr/permissions'

export async function GET(request: NextRequest) {
  try {
    const session = await getHrServerSession(request)
    if (!session) {
      return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 })
    }

    assertCan(session, 'VER_AUDITORIA', 'AUDITORIA')

    const searchParams = request.nextUrl.searchParams
    const resource = searchParams.get('resource')?.trim() || ''
    const action = searchParams.get('action')?.trim() || ''
    const search = searchParams.get('search')?.trim() || ''
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '25', 10)))
    const skip = (page - 1) * limit

    const where: any = {}
    if (resource) where.resource = resource
    if (action) where.action = action
    if (search) {
      where.OR = [
        { userName: { contains: search } },
        { details: { contains: search } },
        { resourceId: { contains: search } },
      ]
    }

    const [total, logs] = await Promise.all([
      prisma.hrAuditLog.count({ where }),
      prisma.hrAuditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
    ])

    return NextResponse.json({
      success: true,
      logs,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao consultar auditoria.' }, { status: 403 })
  }
}
