import { NextRequest, NextResponse } from 'next/server'
import { getHrServerSession } from '@/lib/hr/server-session'
import { assertCan } from '@/lib/hr/permissions'
import { reviewTimeCorrection } from '@/lib/hr/services/time-service'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getHrServerSession(request)
    assertCan(session, 'APROVAR_CORRECAO_PONTO')

    const { id } = await params
    const body = await request.json()
    const { decision, comment } = body

    if (!decision || !['APROVADO', 'REJEITADO'].includes(decision)) {
      return NextResponse.json({ error: 'Decisão inválida. Deve ser APROVADO ou REJEITADO.' }, { status: 400 })
    }

    const result = await reviewTimeCorrection(session!, id, decision, comment)

    return NextResponse.json({
      success: true,
      message: `Pedido de correcção ${decision.toLowerCase()} com sucesso.`,
      data: result,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao processar correcção.' }, { status: 400 })
  }
}
