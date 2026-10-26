import { NextRequest, NextResponse } from 'next/server'
import { getHrServerSession } from '@/lib/hr/server-session'
import { assertCan } from '@/lib/hr/permissions'
import { logAudit } from '@/lib/hr/audit'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getHrServerSession(request)
    assertCan(session, 'CONFIGURAR_PONTO_AUSENCIAS')

    const locations = await prisma.hrWorkLocation.findMany({
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ success: true, data: locations })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao carregar locais.' }, { status: 400 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getHrServerSession(request)
    assertCan(session, 'CONFIGURAR_PONTO_AUSENCIAS')

    const body = await request.json()
    const { id, name, latitude, longitude, radiusMeters, verificationMode, active } = body

    if (!name || latitude == null || longitude == null) {
      return NextResponse.json({ error: 'Nome, latitude e longitude são de preenchimento obrigatório.' }, { status: 400 })
    }

    let location
    if (id) {
      location = await prisma.hrWorkLocation.update({
        where: { id },
        data: {
          name,
          latitude: Number(latitude),
          longitude: Number(longitude),
          radiusMeters: radiusMeters != null ? Number(radiusMeters) : 100,
          verificationMode: verificationMode || 'INFORMATIVO',
          active: active != null ? Boolean(active) : true,
        },
      })
    } else {
      location = await prisma.hrWorkLocation.create({
        data: {
          name,
          latitude: Number(latitude),
          longitude: Number(longitude),
          radiusMeters: radiusMeters != null ? Number(radiusMeters) : 100,
          verificationMode: verificationMode || 'INFORMATIVO',
          active: active != null ? Boolean(active) : true,
        },
      })
    }

    await logAudit({
      userId: session?.id,
      userName: session?.name || session?.email || 'Sistema',
      userRole: session?.role || 'TECNICO_RH',
      action: id ? 'EDITAR' : 'CRIAR',
      resource: 'LOCAL_TRABALHO',
      resourceId: location.id,
      details: `${id ? 'Edição' : 'Criação'} do local de trabalho "${name}" (Modo: ${location.verificationMode}).`,
      newValue: location,
    })

    return NextResponse.json({
      success: true,
      message: 'Local de trabalho guardado com sucesso.',
      data: location,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao gravar local de trabalho.' }, { status: 400 })
  }
}
