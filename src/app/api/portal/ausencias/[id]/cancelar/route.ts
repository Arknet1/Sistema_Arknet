import { NextRequest, NextResponse } from 'next/server'
import { getHrServerSession } from '@/lib/hr/server-session'
import { assertCan } from '@/lib/hr/permissions'
import { cancelLeaveRequest } from '@/lib/hr/services/leave-service'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getHrServerSession(request)
    assertCan(session, 'CANCELAR_PEDIDO_PROPRIO')

    const { id } = await params
    const result = await cancelLeaveRequest(session!, id)

    return NextResponse.json({
      success: true,
      message: 'Pedido de ausência cancelado com sucesso. Os dias foram repostos no seu saldo.',
      data: result,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao cancelar pedido.' }, { status: 400 })
  }
}
