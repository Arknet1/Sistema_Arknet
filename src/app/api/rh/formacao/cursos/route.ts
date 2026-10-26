import { NextRequest, NextResponse } from 'next/server'
import { getHrServerSession } from '@/lib/hr/server-session'
import { assertCan } from '@/lib/hr/permissions'
import { listTrainingCourses, createTrainingCourse } from '@/lib/hr/services/performance-service'

export async function GET(request: NextRequest) {
  try {
    const session = await getHrServerSession(request)
    assertCan(session, 'VER_FORMACAO_TODOS')

    const courses = await listTrainingCourses()
    return NextResponse.json({ success: true, courses })
  } catch (error: any) {
    const status = error.message?.includes('Acesso negado') ? 403 : 500
    return NextResponse.json({ success: false, error: error.message }, { status })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getHrServerSession(request)
    assertCan(session, 'GERIR_CERTIFICACOES')

    const body = await request.json()
    const { title, provider, durationHours, category, startDate, endDate, participantsCount, location, notes } = body

    if (!title || !provider || !durationHours || !startDate) {
      return NextResponse.json(
        { success: false, error: 'Título, entidade formadora, carga horária e data de início são obrigatórios.' },
        { status: 400 }
      )
    }

    const course = await createTrainingCourse(
      {
        title,
        provider,
        durationHours: Number(durationHours),
        category: category || 'TECNICA',
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : undefined,
        participantsCount: Number(participantsCount) || 0,
        location,
        notes,
      },
      session
    )

    return NextResponse.json({ success: true, course }, { status: 201 })
  } catch (error: any) {
    const status = error.message?.includes('Acesso negado') ? 403 : 500
    return NextResponse.json({ success: false, error: error.message }, { status })
  }
}
