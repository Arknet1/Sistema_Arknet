import { NextRequest, NextResponse } from 'next/server'
import { getHrServerSession } from '@/lib/hr/server-session'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getHrServerSession(request)
    if (!session) {
      return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 })
    }

    const { id } = await params
    const notification = await prisma.hrNotification.findFirst({
      where: {
        id,
        OR: [
          { recipientUserId: session.id },
          ...(session.role === 'ADMINISTRADOR' || session.role === 'admin' || session.role === 'TECNICO_RH'
            ? [{ recipientUserId: null }]
            : []),
        ],
      },
      select: { id: true },
    })
    if (!notification) return NextResponse.json({ error: 'Notificação não encontrada.' }, { status: 404 })

    await prisma.hrNotification.update({
      where: { id: notification.id },
      data: { isRead: true },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro.' }, { status: 400 })
  }
}
