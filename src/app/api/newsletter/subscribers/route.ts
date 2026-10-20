import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifySessionToken } from '@/lib/server-auth'
import { sendNewsletterWelcomeEmail } from '@/lib/email-service'

import { appendServerSubscriber, appendServerSubscribersBatchAsync } from '@/lib/server-db'

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
 * Adiciona um subscritor ou importa múltiplos subscritores em lote
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

    const { email, emails, sendWelcome = false } = body

    // ==========================================
    // MODO EM LOTE (Múltiplos e-mails / Clientes da base)
    // ==========================================
    if (Array.isArray(emails)) {
      const rawList = emails
        .map((item: any) => {
          if (typeof item === 'string') return item.trim().toLowerCase()
          if (item && typeof item.email === 'string') return item.email.trim().toLowerCase()
          return ''
        })
        .filter((e: string) => e && e.includes('@') && e.includes('.'))

      const uniqueEmails = Array.from(new Set(rawList))

      if (uniqueEmails.length === 0) {
        return NextResponse.json(
          { success: false, message: 'Nenhum e-mail válido fornecido para importação.' },
          { status: 400 }
        )
      }

      // Inserir / Upsert em lote
      const batchList = uniqueEmails.map((e) => ({
        id: `sub-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        email: e,
        subscribedAt: new Date().toISOString(),
      }))

      await appendServerSubscribersBatchAsync(batchList)

      // Se solicitado envio de boas-vindas, envia com proteção
      if (sendWelcome) {
        const welcomeTargets = uniqueEmails.slice(0, 30) // limite de segurança para boas-vindas
        Promise.allSettled(
          welcomeTargets.map((e) =>
            sendNewsletterWelcomeEmail(e).catch((err) =>
              console.warn(`[Batch Welcome] Erro ao enviar para ${e}:`, err?.message)
            )
          )
        )
      }

      return NextResponse.json({
        success: true,
        message: `${uniqueEmails.length} subscritor(es) importado(s) com sucesso!`,
        count: uniqueEmails.length,
        importedEmails: uniqueEmails,
      })
    }

    // ==========================================
    // MODO INDIVIDUAL (Subscrição única)
    // ==========================================
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

    appendServerSubscriber({
      id: subscriber.id,
      email: subscriber.email,
      status: subscriber.status,
      subscribedAt: subscriber.subscribedAt.toISOString(),
    })

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
