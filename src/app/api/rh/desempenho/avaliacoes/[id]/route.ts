import { NextRequest, NextResponse } from 'next/server'
import { getHrServerSession } from '@/lib/hr/server-session'
import { submitSelfReview, submitManagerReview } from '@/lib/hr/services/performance-service'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getHrServerSession(request)
    if (!session) {
      return NextResponse.json({ success: false, error: 'Utilizador não autenticado.' }, { status: 401 })
    }
    const { id } = await params
    const body = await request.json()
    const { actionType } = body // "AUTO_AVALIACAO" | "AVALIACAO_GESTOR"

    if (actionType === 'AUTO_AVALIACAO') {
      const { rating, comments } = body
      if (typeof rating !== 'number' || !comments) {
        return NextResponse.json(
          { success: false, error: 'A nota (1 a 5) e os comentários são obrigatórios.' },
          { status: 400 }
        )
      }
      const updated = await submitSelfReview(id, { rating, comments }, session)
      return NextResponse.json({ success: true, review: updated })
    }

    if (actionType === 'AVALIACAO_GESTOR') {
      const {
        managerRating,
        managerComments,
        objectivesRating,
        competenciesRating,
        strengths,
        areasToImprove,
        developmentPlan,
      } = body

      if (
        typeof managerRating !== 'number' ||
        typeof objectivesRating !== 'number' ||
        typeof competenciesRating !== 'number' ||
        !managerComments
      ) {
        return NextResponse.json(
          { success: false, error: 'As notas de objectivos, competências e comentários são obrigatórios.' },
          { status: 400 }
        )
      }

      const updated = await submitManagerReview(
        id,
        {
          managerRating,
          managerComments,
          objectivesRating,
          competenciesRating,
          strengths,
          areasToImprove,
          developmentPlan,
        },
        session
      )
      return NextResponse.json({ success: true, review: updated })
    }

    return NextResponse.json(
      { success: false, error: 'Tipo de acção inválido. Use "AUTO_AVALIACAO" ou "AVALIACAO_GESTOR".' },
      { status: 400 }
    )
  } catch (error: any) {
    const status = error.message?.includes('Acesso negado') || error.message?.includes('Regra dos 4 Olhos') ? 403 : 500
    return NextResponse.json({ success: false, error: error.message }, { status })
  }
}
