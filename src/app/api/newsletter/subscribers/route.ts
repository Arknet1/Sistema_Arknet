import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifySessionToken } from '@/lib/server-auth'
import { sendNewsletterWelcomeEmail } from '@/lib/email-service'

/**
 * Validar sessão de administrador/editor
 */
function getAdminPayload(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const adminCookie = request.cookies.get('arknet_admin_token')?.value
  const token = authHeader?.replace('Bearer ', '') || adminCookie
  if (!token) return null
  const payload = verifySessionToken(token)
  if (!payload || (payload.role !== 'admin' && payload.role !== 'editor')) {
    return null
  }
  return payload
}

/**
 * GET /api/newsletter/subscribers
 * Retorna todos os subscritores registados no Prisma
 */
export async function GET(request: NextRequest) {
  try {
    const subscribers = await prisma.newsletterSubscriber.findMany({
      orderBy: { subscribedAt: 'desc' },
    })

    const formatted = subscribers.map((s) => ({
      id: s.id,
      email: s.email,
      status: s.status,
      subscribedAt: s.subscribedAt.toISOString(),
    }))

    return NextResponse.json({ success: true, subscribers: formatted })
  } catch (err: any) {
    console.error('[Newsletter Subscribers GET] Erro:', err)
    return NextResponse.json(
      { success: false, message: 'Erro ao carregar subscritores.', error: err.message },
      { status: 500 }
    )
  }
}

/**
 * POST /api/newsletter/subscribers
 * Adiciona um subscritor e envia email de boas-vindas
 */
export async function POST(request: NextRequest) {
  try {
    let body: any = {}
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { success: false, message: 'Dados inválidos.' },
        { status: 400 }
      )
    }

    const { email, sendWelcome = true } = body
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json(
        { success: false, message: 'Email inválido.' },
        { status: 400 }
      )
    }

    const cleanEmail = email.trim().toLowerCase()

    const existing = await prisma.newsletterSubscriber.findUnique({
      where: { email: cleanEmail },
    })

    let subscriber
    if (existing) {
      subscriber = await prisma.newsletterSubscriber.update({
        where: { email: cleanEmail },
        data: { status: 'active' },
      })
    } else {
      subscriber = await prisma.newsletterSubscriber.create({
        data: {
          email: cleanEmail,
          status: 'active',
          subscribedAt: new Date(),
        },
      })
    }

    if (sendWelcome) {
      try {
        await sendNewsletterWelcomeEmail(cleanEmail)
      } catch (e: any) {
        console.error('[Newsletter Subscribe] Erro email de boas-vindas:', e.message)
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Subscritor adicionado com sucesso!',
      subscriber: {
        id: subscriber.id,
        email: subscriber.email,
        status: subscriber.status,
        subscribedAt: subscriber.subscribedAt.toISOString(),
      },
    })
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: 'Erro ao adicionar subscritor.', error: err.message },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/newsletter/subscribers
 * Altera o estado (ativo / inativo) de um subscritor
 */
export async function PATCH(request: NextRequest) {
  const admin = getAdminPayload(request)
  if (!admin) {
    return NextResponse.json(
      { success: false, message: 'Acesso restrito.' },
      { status: 401 }
    )
  }

  try {
    const { id, status } = await request.json()
    if (!id || !status || (status !== 'active' && status !== 'inactive')) {
      return NextResponse.json(
        { success: false, message: 'Parâmetros inválidos.' },
        { status: 400 }
      )
    }

    const updated = await prisma.newsletterSubscriber.update({
      where: { id },
      data: { status },
    })

    return NextResponse.json({
      success: true,
      message: `Estado alterado para ${status === 'active' ? 'Ativo' : 'Inativo'}.`,
      subscriber: {
        id: updated.id,
        email: updated.email,
        status: updated.status,
        subscribedAt: updated.subscribedAt.toISOString(),
      },
    })
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: 'Erro ao atualizar subscritor.', error: err.message },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/newsletter/subscribers
 * Remove um subscritor
 */
export async function DELETE(request: NextRequest) {
  const admin = getAdminPayload(request)
  if (!admin) {
    return NextResponse.json(
      { success: false, message: 'Acesso restrito.' },
      { status: 401 }
    )
  }

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) {
      return NextResponse.json(
        { success: false, message: 'ID de subscritor obrigatório.' },
        { status: 400 }
      )
    }

    await prisma.newsletterSubscriber.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
      message: 'Subscritor removido com sucesso.',
    })
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: 'Erro ao remover subscritor.', error: err.message },
      { status: 500 }
    )
  }
}
