import { NextRequest, NextResponse } from 'next/server'
import { getHrServerSession } from '@/lib/hr/server-session'
import { assertCan } from '@/lib/hr/permissions'
import { listCertifications, createCertification } from '@/lib/hr/services/performance-service'

export async function GET(request: NextRequest) {
  try {
    const session = await getHrServerSession(request)
    assertCan(session, 'VER_FORMACAO_TODOS')

    const employeeId = request.nextUrl.searchParams.get('employeeId') || undefined
    const certifications = await listCertifications(employeeId)

    return NextResponse.json({ success: true, certifications })
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
    const { employeeId, title, issuingEntity, licenseNumber, issueDate, expiryDate, attachmentUrl, notes } = body

    if (!employeeId || !title || !issuingEntity || !issueDate) {
      return NextResponse.json(
        { success: false, error: 'Colaborador, título, entidade emissora e data de emissão são obrigatórios.' },
        { status: 400 }
      )
    }

    const cert = await createCertification(
      {
        employeeId,
        title,
        issuingEntity,
        licenseNumber,
        issueDate: new Date(issueDate),
        expiryDate: expiryDate ? new Date(expiryDate) : undefined,
        attachmentUrl,
        notes,
      },
      session
    )

    return NextResponse.json({ success: true, certification: cert }, { status: 201 })
  } catch (error: any) {
    const status = error.message?.includes('Acesso negado') ? 403 : 500
    return NextResponse.json({ success: false, error: error.message }, { status })
  }
}
