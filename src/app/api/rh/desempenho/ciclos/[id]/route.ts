import { NextRequest, NextResponse } from 'next/server'
import { getHrServerSession } from '@/lib/hr/server-session'
import { assertCan } from '@/lib/hr/permissions'
import { getPerformanceCycle } from '@/lib/hr/services/performance-service'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getHrServerSession(request)
    assertCan(session, 'VER_DESEMPENHO_TODOS')

    const { id } = await params
    const cycle = await getPerformanceCycle(id)

    if (!cycle) {
      return NextResponse.json({ success: false, error: 'Ciclo não encontrado.' }, { status: 404 })
    }

    return NextResponse.json({ success: true, cycle })
  } catch (error: any) {
    const status = error.message?.includes('Acesso negado') ? 403 : 500
    return NextResponse.json({ success: false, error: error.message }, { status })
  }
}
