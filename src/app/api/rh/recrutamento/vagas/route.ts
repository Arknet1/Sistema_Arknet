import { NextRequest, NextResponse } from 'next/server'
import { getHrServerSession } from '@/lib/hr/server-session'
import { assertCan } from '@/lib/hr/permissions'
import { listJobOpenings, createJobOpening } from '@/lib/hr/services/recruitment-service'

export async function GET(request: NextRequest) {
  try {
    const session = await getHrServerSession(request)
    assertCan(session, 'VER_RECRUTAMENTO')

    const openings = await listJobOpenings()
    return NextResponse.json({ success: true, openings })
  } catch (error: any) {
    const status = error.message?.includes('Acesso negado') ? 403 : 500
    return NextResponse.json({ success: false, error: error.message }, { status })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getHrServerSession(request)
    assertCan(session, 'GERIR_VAGAS')

    const body = await request.json()
    const {
      title,
      departmentId,
      positionId,
      type,
      location,
      openingsCount,
      requirements,
      salaryRangeMin,
      salaryRangeMax,
      closingDate,
    } = body

    if (!title) {
      return NextResponse.json(
        { success: false, error: 'O título da vaga é obrigatório.' },
        { status: 400 }
      )
    }

    const opening = await createJobOpening(
      {
        title,
        departmentId,
        positionId,
        type,
        location,
        openingsCount: Number(openingsCount) || 1,
        requirements,
        salaryRangeMin: salaryRangeMin ? Number(salaryRangeMin) : undefined,
        salaryRangeMax: salaryRangeMax ? Number(salaryRangeMax) : undefined,
        closingDate: closingDate ? new Date(closingDate) : undefined,
      },
      session
    )

    return NextResponse.json({ success: true, opening }, { status: 201 })
  } catch (error: any) {
    const status = error.message?.includes('Acesso negado') ? 403 : 500
    return NextResponse.json({ success: false, error: error.message }, { status })
  }
}
