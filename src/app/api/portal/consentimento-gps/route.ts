import { NextRequest, NextResponse } from 'next/server'
import { getHrServerSession } from '@/lib/hr/server-session'
import { assertCan } from '@/lib/hr/permissions'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getHrServerSession(request)
    assertCan(session, 'MARCAR_PONTO_PROPRIO')

    if (!session?.employeeId) {
      return NextResponse.json({ error: 'Nenhuma ficha de funcionário associada a esta conta.' }, { status: 403 })
    }

    const updated = await prisma.hrEmployee.update({
      where: { id: session.employeeId },
      data: { locationConsentDate: new Date() },
      select: { id: true, locationConsentDate: true },
    })

    return NextResponse.json({
      success: true,
      message: 'Consentimento de localização registado com sucesso.',
      data: updated,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao registar consentimento.' }, { status: 400 })
  }
}
