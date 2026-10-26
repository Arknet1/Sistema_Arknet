import { NextRequest, NextResponse } from 'next/server'
import { getHrServerSession } from '@/lib/hr/server-session'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getHrServerSession(request)
    if (!session) {
      return NextResponse.json({ notifications: [], unreadCount: 0 })
    }

    const notifications = await prisma.hrNotification.findMany({
      where: {
        OR: [
          { recipientUserId: session.id },
          // Notificações globais para RH (sem destinatário específico)
          ...(session.role === 'ADMINISTRADOR' || session.role === 'admin' || session.role === 'TECNICO_RH'
            ? [{ recipientUserId: null }]
            : []),
        ],
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    const unreadCount = notifications.filter((n) => !n.isRead).length

    return NextResponse.json({ success: true, notifications, unreadCount })
  } catch (error: any) {
    return NextResponse.json({ notifications: [], unreadCount: 0 })
  }
}
