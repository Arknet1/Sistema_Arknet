import { NextRequest, NextResponse } from 'next/server'
import { getHrServerSession } from '@/lib/hr/server-session'
import { assertCan } from '@/lib/hr/permissions'
import { listCandidates, createCandidate, updateCandidateStatus } from '@/lib/hr/services/recruitment-service'

export async function GET(request: NextRequest) {
  try {
    const session = await getHrServerSession(request)
    assertCan(session, 'VER_RECRUTAMENTO')

    const jobOpeningId = request.nextUrl.searchParams.get('jobOpeningId') || undefined
    const candidates = await listCandidates(jobOpeningId)

    return NextResponse.json({ success: true, candidates })
  } catch (error: any) {
    const status = error.message?.includes('Acesso negado') ? 403 : 500
    return NextResponse.json({ success: false, error: error.message }, { status })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getHrServerSession(request)
    assertCan(session, 'GERIR_CANDIDATOS')

    const body = await request.json()
    const { jobOpeningId, fullName, email, phone, biNumber, experienceYears, resumeUrl, notes } = body

    if (!fullName || !email || !phone) {
      return NextResponse.json(
        { success: false, error: 'Nome completo, e-mail e telefone são obrigatórios.' },
        { status: 400 }
      )
    }

    const candidate = await createCandidate({
      jobOpeningId,
      fullName,
      email,
      phone,
      biNumber,
      experienceYears: Number(experienceYears) || 0,
      resumeUrl,
      notes,
    })

    return NextResponse.json({ success: true, candidate }, { status: 201 })
  } catch (error: any) {
    const status = error.message?.includes('Acesso negado') ? 403 : 500
    return NextResponse.json({ success: false, error: error.message }, { status })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getHrServerSession(request)
    assertCan(session, 'GERIR_CANDIDATOS')

    const body = await request.json()
    const { candidateId, status } = body

    if (!candidateId || !status) {
      return NextResponse.json(
        { success: false, error: 'ID do candidato e novo estado são obrigatórios.' },
        { status: 400 }
      )
    }

    const updated = await updateCandidateStatus(candidateId, status, session)
    return NextResponse.json({ success: true, candidate: updated })
  } catch (error: any) {
    const status = error.message?.includes('Acesso negado') ? 403 : 500
    return NextResponse.json({ success: false, error: error.message }, { status })
  }
}
