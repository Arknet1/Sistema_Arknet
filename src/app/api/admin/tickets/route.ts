import { NextRequest, NextResponse } from 'next/server'
import { requireAdminAuth } from '@/lib/tickets/admin-auth-guard'
import { getTickets } from '@/lib/tickets/ticket-service'

export async function GET(request: NextRequest) {
  const auth = requireAdminAuth(request)
  if (!auth.isAuthorized) {
    return auth.response!
  }

  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || undefined
    const status = searchParams.get('status') || undefined
    const category = searchParams.get('category') || undefined
    const priority = searchParams.get('priority') || undefined
    const q = searchParams.get('q') || undefined
    const startDate = searchParams.get('startDate') || undefined
    const endDate = searchParams.get('endDate') || undefined
    const page = searchParams.get('page') ? parseInt(searchParams.get('page')!, 10) : 1
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : 20

    const result = await getTickets({
      type,
      status,
      category,
      priority,
      q,
      startDate,
      endDate,
      page,
      limit,
    })

    return NextResponse.json({
      success: true,
      ...result,
    })
  } catch (error: any) {
    console.error('[API /api/admin/tickets GET Error]:', error)
    return NextResponse.json(
      { success: false, message: 'Erro ao carregar lista de tickets.' },
      { status: 500 }
    )
  }
}
