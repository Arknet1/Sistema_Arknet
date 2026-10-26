import { NextRequest, NextResponse } from 'next/server'
import { getHrServerSession } from '@/lib/hr/server-session'
import { assertCan } from '@/lib/hr/permissions'
import { registerTimeEntry } from '@/lib/hr/services/time-service'

export async function POST(request: NextRequest) {
  try {
    const session = await getHrServerSession(request)
    assertCan(session, 'REGISTAR_PONTO_MANUAL_RH')

    const body = await request.json()
    const { employeeId, type, time, date, notes } = body

    if (!employeeId || !type || !time || !date || !notes || notes.trim().length < 5) {
      return NextResponse.json({ error: 'Todos os campos, incluindo a justificação obrigatória (mín. 5 caracteres), são necessários.' }, { status: 400 })
    }

    // Montar a data/hora combinada no fuso de Luanda (UTC+1)
    const combinedIso = `${date}T${time}:00+01:00`
    const forcedServerTime = new Date(combinedIso)

    const result = await registerTimeEntry(session!, {
      employeeId,
      type,
      notes: `[Registo Manual RH] ${notes}`,
      origin: 'MANUAL_RH',
      forcedServerTime,
    })

    return NextResponse.json({
      success: true,
      message: 'Marcação manual registada com sucesso.',
      data: result,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao registar marcação manual.' }, { status: 400 })
  }
}
