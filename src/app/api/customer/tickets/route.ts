import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifySessionToken } from '@/lib/server-auth'

export async function GET(request: NextRequest) {
  const token = request.cookies.get('arknet_customer_token')?.value
  const session = token ? verifySessionToken(token) : null

  if (!session || session.role !== 'customer') {
    return NextResponse.json({ success: false, message: 'Sessão de cliente inválida.' }, { status: 401 })
  }

  try {
    const tickets = await (prisma as any).ticket.findMany({
      where: {
        OR: [
          { customerId: session.userId },
          { email: session.email.trim().toLowerCase() },
        ],
      },
      select: {
        id: true,
        protocol: true,
        type: true,
        category: true,
        subject: true,
        message: true,
        status: true,
        createdAt: true,
        replies: {
          orderBy: { sentAt: 'asc' },
          select: {
            id: true,
            adminName: true,
            content: true,
            sentAt: true,
            channel: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    })

    return NextResponse.json({ success: true, tickets }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    console.error('[API /api/customer/tickets GET Error]:', error)
    return NextResponse.json(
      { success: false, message: 'Não foi possível carregar as suas reclamações.' },
      { status: 500 }
    )
  }
}