import { NextRequest, NextResponse } from 'next/server'
import { getHrServerSession } from '@/lib/hr/server-session'
import { assertCan } from '@/lib/hr/permissions'
import { listPerformanceCycles, createPerformanceCycle } from '@/lib/hr/services/performance-service'

export async function GET(request: NextRequest) {
  try {
    const session = await getHrServerSession(request)
    assertCan(session, 'VER_DESEMPENHO_TODOS')

    const cycles = await listPerformanceCycles()
    return NextResponse.json({ success: true, cycles })
  } catch (error: any) {
    const status = error.message?.includes('Acesso negado') ? 403 : 500
    return NextResponse.json({ success: false, error: error.message }, { status })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getHrServerSession(request)
    assertCan(session, 'GERIR_CICLOS_DESEMPENHO')

    const body = await request.json()
    const { title, year, startDate, endDate, notes } = body

    if (!title || !year || !startDate || !endDate) {
      return NextResponse.json(
        { success: false, error: 'Título, ano, data de início e de fim são obrigatórios.' },
        { status: 400 }
      )
    }

    const cycle = await createPerformanceCycle(
      {
        title,
        year: Number(year),
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        notes,
      },
      session
    )

    return NextResponse.json({ success: true, cycle }, { status: 201 })
  } catch (error: any) {
    const status = error.message?.includes('Acesso negado') ? 403 : 500
    return NextResponse.json({ success: false, error: error.message }, { status })
  }
}
