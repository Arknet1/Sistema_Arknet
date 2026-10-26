import { NextRequest, NextResponse } from 'next/server'
import { getHrServerSession } from '@/lib/hr/server-session'
import { assertCan } from '@/lib/hr/permissions'
import { reviewOvertime } from '@/lib/hr/services/time-service'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getHrServerSession(request)
    assertCan(session, 'APROVAR_HORAS_EXTRA')

    const { id } = await params
    const body = await request.json()
    const { decision, approvedMinutes, comment } = body

    if (!decision || !['APROVADO', 'REJEITADO'].includes(decision)) {
      return NextResponse.json({ error: 'Decisão inválida. Deve ser APROVADO ou REJEITADO.' }, { status: 400 })
    }

    const result = await reviewOvertime(
      session!,
      id,
      decision,
      approvedMinutes != null ? Number(approvedMinutes) : undefined,
      comment
    )

    return NextResponse.json({
      success: true,
      message: `Horas extras ${decision.toLowerCase()}s com sucesso.`,
      data: result,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao processar horas extras.' }, { status: 400 })
  }
}
