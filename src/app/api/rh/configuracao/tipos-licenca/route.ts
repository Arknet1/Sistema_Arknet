import { NextRequest, NextResponse } from 'next/server'
import { getHrServerSession } from '@/lib/hr/server-session'
import { assertCan } from '@/lib/hr/permissions'
import { logAudit } from '@/lib/hr/audit'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const leaveTypes = await prisma.hrLeaveType.findMany({
      orderBy: { order: 'asc' },
    })
    return NextResponse.json({ success: true, leaveTypes })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getHrServerSession(request)
    assertCan(session, 'CONFIGURAR_PONTO_AUSENCIAS')

    const body = await request.json()
    const { id, code, name, isPaid, deductsFromBalance, requiresDocument, maxDays, active, order } = body

    if (!code || !name) {
      return NextResponse.json({ error: 'Código e nome são obrigatórios.' }, { status: 400 })
    }

    let leaveType
    if (id) {
      leaveType = await prisma.hrLeaveType.update({
        where: { id },
        data: {
          name,
          isPaid: isPaid != null ? Boolean(isPaid) : true,
          deductsFromBalance: deductsFromBalance != null ? Boolean(deductsFromBalance) : false,
          requiresDocument: requiresDocument != null ? Boolean(requiresDocument) : false,
          maxDays: maxDays != null ? Number(maxDays) : null,
          active: active != null ? Boolean(active) : true,
          order: order != null ? Number(order) : 0,
        },
      })
    } else {
      leaveType = await prisma.hrLeaveType.upsert({
        where: { code },
        update: {
          name,
          isPaid: isPaid != null ? Boolean(isPaid) : true,
          deductsFromBalance: deductsFromBalance != null ? Boolean(deductsFromBalance) : false,
          requiresDocument: requiresDocument != null ? Boolean(requiresDocument) : false,
          maxDays: maxDays != null ? Number(maxDays) : null,
          active: active != null ? Boolean(active) : true,
          order: order != null ? Number(order) : 0,
        },
        create: {
          code,
          name,
          isPaid: isPaid != null ? Boolean(isPaid) : true,
          deductsFromBalance: deductsFromBalance != null ? Boolean(deductsFromBalance) : false,
          requiresDocument: requiresDocument != null ? Boolean(requiresDocument) : false,
          maxDays: maxDays != null ? Number(maxDays) : null,
          active: active != null ? Boolean(active) : true,
          order: order != null ? Number(order) : 0,
        },
      })
    }

    await logAudit({
      userId: session?.id,
      userName: session?.name || session?.email || 'Sistema',
      userRole: session?.role || 'TECNICO_RH',
      action: id ? 'EDITAR' : 'CRIAR',
      resource: 'TIPO_LICENCA',
      resourceId: leaveType.id,
      details: `${id ? 'Edição' : 'Criação'} do tipo de licença "${name}" (código: ${code}).`,
      newValue: leaveType,
    })

    return NextResponse.json({ success: true, data: leaveType })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao gravar tipo de licença.' }, { status: 400 })
  }
}
