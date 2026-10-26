import { NextRequest, NextResponse } from 'next/server'
import { getHrServerSession } from '@/lib/hr/server-session'
import { assertCan } from '@/lib/hr/permissions'
import { requestTimeCorrection } from '@/lib/hr/services/time-service'

export async function POST(request: NextRequest) {
  try {
    const session = await getHrServerSession(request)
    assertCan(session, 'PEDIR_CORRECAO_PONTO')

    if (!session?.employeeId) {
      return NextResponse.json({ error: 'Nenhuma ficha de funcionário associada a esta conta.' }, { status: 403 })
    }

    const body = await request.json()
    const { date, targetEntryType, requestedTime, reason } = body

    if (!date || !targetEntryType || !requestedTime || !reason) {
      return NextResponse.json({ error: 'Todos os campos são de preenchimento obrigatório.' }, { status: 400 })
    }

    const correction = await requestTimeCorrection(session, {
      employeeId: session.employeeId,
      date,
      targetEntryType,
      requestedTime: new Date(requestedTime),
      reason,
    })

    return NextResponse.json({
      success: true,
      message: 'Pedido de correcção submetido com sucesso. Aguarda análise do RH.',
      data: correction,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao submeter pedido de correcção.' }, { status: 400 })
  }
}
