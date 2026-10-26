import { NextRequest, NextResponse } from 'next/server'
import { getHrServerSession } from '@/lib/hr/server-session'
import { assertCan } from '@/lib/hr/permissions'
import { registerTimeEntry } from '@/lib/hr/services/time-service'

export async function POST(request: NextRequest) {
  try {
    const session = await getHrServerSession(request)
    assertCan(session, 'MARCAR_PONTO_PROPRIO')

    if (!session?.employeeId) {
      return NextResponse.json({ error: 'Nenhuma ficha de funcionário associada a esta conta.' }, { status: 403 })
    }

    const body = await request.json()
    const { type, clientRequestId, latitude, longitude, accuracyMeters, notes } = body

    if (!type || !['ENTRADA', 'INICIO_PAUSA', 'FIM_PAUSA', 'SAIDA'].includes(type)) {
      return NextResponse.json({ error: 'Tipo de marcação de ponto inválido.' }, { status: 400 })
    }

    if (!clientRequestId) {
      return NextResponse.json({ error: 'Identificador único do pedido (clientRequestId) obrigatório.' }, { status: 400 })
    }

    const result = await registerTimeEntry(session, {
      employeeId: session.employeeId,
      type,
      clientRequestId,
      latitude: latitude != null ? Number(latitude) : null,
      longitude: longitude != null ? Number(longitude) : null,
      accuracyMeters: accuracyMeters != null ? Number(accuracyMeters) : null,
      notes,
      origin: 'PORTAL',
    })

    return NextResponse.json({
      success: true,
      message: result.isDuplicate ? 'Marcação já registada anteriormente.' : 'Ponto registado com sucesso.',
      data: result,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao picar ponto.' }, { status: 400 })
  }
}
