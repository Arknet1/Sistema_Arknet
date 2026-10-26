import { NextRequest, NextResponse } from 'next/server'
import { getHrServerSession } from '@/lib/hr/server-session'
import { assertCan } from '@/lib/hr/permissions'
import { logAudit } from '@/lib/hr/audit'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const holidays = await prisma.hrHoliday.findMany({
      orderBy: { date: 'asc' },
    })
    return NextResponse.json({ success: true, holidays })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getHrServerSession(request)
    assertCan(session, 'CONFIGURAR_PONTO_AUSENCIAS')

    const body = await request.json()
    const { id, date, name, isRecurring, status } = body

    if (!date || !name) {
      return NextResponse.json({ error: 'Data e nome do feriado são obrigatórios.' }, { status: 400 })
    }

    let holiday
    if (id) {
      holiday = await prisma.hrHoliday.update({
        where: { id },
        data: {
          date,
          name,
          isRecurring: isRecurring != null ? Boolean(isRecurring) : true,
          status: status || 'CONFIRMADO',
        },
      })
    } else {
      holiday = await prisma.hrHoliday.upsert({
        where: { date },
        update: { name, isRecurring: isRecurring != null ? Boolean(isRecurring) : true, status: status || 'A_CONFIRMAR' },
        create: {
          date,
          name,
          isRecurring: isRecurring != null ? Boolean(isRecurring) : true,
          status: status || 'A_CONFIRMAR',
        },
      })
    }

    await logAudit({
      userId: session?.id,
      userName: session?.name || session?.email || 'Sistema',
      userRole: session?.role || 'TECNICO_RH',
      action: id ? 'EDITAR' : 'CRIAR',
      resource: 'FERIADO',
      resourceId: holiday.id,
      details: `${id ? 'Edição' : 'Criação'} do feriado "${name}" (${date}).`,
      newValue: holiday,
    })

    return NextResponse.json({ success: true, data: holiday })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao gravar feriado.' }, { status: 400 })
  }
}
